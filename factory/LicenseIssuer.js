/**
 * LicenseIssuer.js — penerbit kunci lisensi Ed25519 (offline, tanpa dependency).
 *
 * Format kode:  base64url(JSON payload) + "." + base64url(signature)
 * Payload:      { edition, bundleId, seats, expiry, issuedTo, issuedAt }
 *
 * Verifikasi di sisi produk cukup memakai `public_key.pem` (embedded) —
 * private key TIDAK boleh ikut didistribusikan atau di-commit.
 */

import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ALGORITHM = 'ed25519';
const ALGORITHM_LABEL = 'Ed25519';
const PAYLOAD_FIELDS = ['edition', 'bundleId', 'seats', 'expiry', 'issuedTo', 'issuedAt'];

export class LicenseError extends Error {}

export class LicenseIssuer {
  /**
   * @param {{privateKey?: string|Buffer, publicKey: string|Buffer}} keys PEM
   *   privateKey opsional: tanpa itu objek hanya jadi verifier (mode pembeli).
   */
  constructor(keys) {
    this.privateKey = keys.privateKey ? createPrivateKey(keys.privateKey) : null;
    this.publicKey = createPublicKey(keys.publicKey);
  }

  /** Buat pasangan kunci baru (dipakai sekali per penerbit/brand). */
  static create() {
    const { publicKey, privateKey } = generateKeyPairSync(ALGORITHM, {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return new LicenseIssuer({ privateKey, publicKey });
  }

  static fromPem(privatePem, publicPem) {
    return new LicenseIssuer({ privateKey: privatePem, publicKey: publicPem });
  }

  /** Verifier saja — inilah yang boleh ikut dibagikan ke produk/pembeli. */
  static verifier(publicPem) {
    return new LicenseIssuer({ publicKey: publicPem });
  }

  get publicPem() { return this.publicKey.export({ type: 'spki', format: 'pem' }); }

  get privatePem() {
    if (!this.privateKey) throw new LicenseError('Objek ini verifier saja — tidak punya private key untuk diekspor.');
    return this.privateKey.export({ type: 'pkcs8', format: 'pem' });
  }

  // ------------------------------------------------------------- issue/verify

  /**
   * @param {{edition:string, bundleId?:string, seats?:number, expiry?:string|null, issuedTo?:string, issuedAt?:string}} payload
   * @returns {string} kode lisensi
   */
  issue(payload) {
    if (!this.privateKey) throw new LicenseError('issue(): perlu private key — gunakan LicenseIssuer.verifier() hanya untuk memeriksa kode.');
    if (!payload || typeof payload.edition !== 'string' || !payload.edition.trim()) {
      throw new LicenseError('issue(): payload.edition wajib berupa teks nama edition.');
    }
    const clean = {
      edition: payload.edition,
      bundleId: payload.bundleId ?? 'direct',
      seats: Number.isFinite(payload.seats) ? payload.seats : 1,
      expiry: payload.expiry ?? null,
      issuedTo: payload.issuedTo ?? '(unassigned)',
      issuedAt: payload.issuedAt ?? new Date().toISOString(),
    };
    const body = Buffer.from(JSON.stringify(clean), 'utf8').toString('base64url');
    const signature = sign(null, Buffer.from(body, 'utf8'), this.privateKey).toString('base64url');
    return `${body}.${signature}`;
  }

  /**
   * @returns {{valid: boolean, payload: object|null, reason: string}}
   */
  verify(code) {
    if (typeof code !== 'string' || code.split('.').length !== 2) {
      return { valid: false, payload: null, reason: 'format kode salah (harus payload.tandaTangan)' };
    }
    const [body, sig] = code.split('.');
    let payload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch (err) {
      return { valid: false, payload: null, reason: `payload bukan JSON: ${err.message}` };
    }
    const ok = verify(null, Buffer.from(body, 'utf8'), this.publicKey, Buffer.from(sig, 'base64url'));
    return { valid: ok, payload, reason: ok ? 'signature sah' : 'signature tidak cocok (kode diubah / bukan dari penerbit ini)' };
  }

  // ------------------------------------------------------------------ batch

  /**
   * Terbitkan N kode berurutan. Edition diisi bergiliran dari daftar edition
   * berbayar (edition tanpa spasi "free" di nama dianggap berbayar).
   */
  issueBatch(options) {
    const count = Number(options.count ?? 5);
    if (!Number.isInteger(count) || count < 1) throw new LicenseError(`Jumlah kode harus integer >= 1 (dapat ${options.count}).`);
    const paid = (options.editions || []).filter((e) => !/^free\b/i.test(e.name));
    const pool = (paid.length ? paid : options.editions || []).map((e) => e.name);
    if (!pool.length) throw new LicenseError('issueBatch(): tidak ada edition untuk diterbitkan.');
    const baseTime = Date.now();
    const rows = [];
    for (let i = 0; i < count; i += 1) {
      const payload = {
        edition: pool[i % pool.length],
        bundleId: options.bundleId ?? 'bundle-buku',
        seats: options.seats ?? 1,
        expiry: options.expiry ?? null,
        issuedTo: options.issuedTo ?? `PEMBELI-${String(i + 1).padStart(3, '0')} (GANTI NAMA/EMAIL)`,
        issuedAt: new Date(baseTime + i * 1000).toISOString(),
      };
      rows.push({ no: i + 1, key: this.issue(payload), payload });
    }
    return rows;
  }

  /**
   * Verifikasi roundtrip seluruh batch. Kegagalan = exception (jangan pernah
   * melepas kunci yang tidak bisa diverifikasi dengan public key sendiri).
   */
  verifyRoundtrip(rows) {
    const bad = rows.filter((r) => !this.verify(r.key).valid);
    if (bad.length) {
      throw new LicenseError(
        `Verifikasi roundtrip GAGAL untuk ${bad.length} kode (nomor ${bad.map((b) => b.no).join(', ')}). ` +
        'Periksa instalasi Node.js (didukung: Ed25519).'
      );
    }
    return true;
  }

  // -------------------------------------------------------------------- tulis

  /**
   * Tulis public_key.pem, private_key.pem, keys.csv, keys.json ke `dir`.
   * @returns {string[]} path file yang ditulis
   */
  writeKeys(dir, rows, meta = {}) {
    this.verifyRoundtrip(rows);
    mkdirSync(dir, { recursive: true });
    const paths = {
      publicPem: join(dir, 'public_key.pem'),
      privatePem: join(dir, 'private_key.pem'),
      csv: join(dir, 'keys.csv'),
      json: join(dir, 'keys.json'),
    };
    writeFileSync(paths.publicPem, this.publicPem, { mode: 0o644 });
    writeFileSync(paths.privatePem, this.privatePem, { mode: 0o600 });
    writeFileSync(paths.csv, this.toCsv(rows));
    writeFileSync(
      paths.json,
      `${JSON.stringify({
        algorithm: ALGORITHM_LABEL,
        product: meta.product ?? null,
        issuer: meta.issuer ?? null,
        generatedAt: meta.generatedAt ?? new Date().toISOString(),
        payloadFields: PAYLOAD_FIELDS,
        keyFormat: 'base64url(json payload).base64url(ed25519 signature)',
        publicKeyFile: 'public_key.pem',
        warning: 'private_key.pem dan keys.csv bersifat RAHASIA — jangan masuk repo public.',
        count: rows.length,
        keys: rows,
      }, null, 2)}\n`
    );
    return Object.values(paths);
  }

  toCsv(rows) {
    const header = ['no', 'license_key', ...PAYLOAD_FIELDS];
    const esc = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(',')];
    for (const row of rows) {
      lines.push([row.no, row.key, ...PAYLOAD_FIELDS.map((f) => row.payload[f])].map(esc).join(','));
    }
    return `${lines.join('\n')}\n`;
  }
}
