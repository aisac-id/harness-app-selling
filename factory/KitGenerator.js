/**
 * KitGenerator.js — orkestrasi seluruh kit.
 *
 * Alur: baca + validasi product.json -> jalankan semua generator kumpulkan
 * peta { relPath: isi } -> tulis ke out/ -> terbitkan lisensi Ed25519 ->
 * cetak ringkasan (dan kembalikan object ringkasan ke CLI).
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ProductConfig } from './ProductConfig.js';
import { TemplateEngine } from './TemplateEngine.js';
import { LicenseIssuer } from './LicenseIssuer.js';

import { LandingGenerator } from './generators/LandingGenerator.js';
import { DownloadGenerator } from './generators/DownloadGenerator.js';
import { GuidebookGenerator } from './generators/GuidebookGenerator.js';
import { CaptionsGenerator } from './generators/CaptionsGenerator.js';
import { PromptsGenerator } from './generators/PromptsGenerator.js';
import { EmailsGenerator } from './generators/EmailsGenerator.js';
import { ChecklistGenerator } from './generators/ChecklistGenerator.js';
import { MiscGenerator } from './generators/MiscGenerator.js';

const FACTORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export class KitGenerator {
  static GENERATORS = [
    ['landing', LandingGenerator],
    ['download', DownloadGenerator],
    ['guidebook', GuidebookGenerator],
    ['captions', CaptionsGenerator],
    ['prompts', PromptsGenerator],
    ['emails', EmailsGenerator],
    ['checklist', ChecklistGenerator],
    ['misc', MiscGenerator],
  ];

  /**
   * @param {{configPath:string, outDir:string, options?:object, log?:(msg:string)=>void}} args
   */
  constructor(args) {
    this.configPath = resolve(args.configPath);
    this.outDir = resolve(args.outDir);
    this.options = args.options || {};
    this.templatesDir = resolve(this.options.templatesDir || join(FACTORY_ROOT, 'templates'));
    this.log = args.log || ((msg) => console.log(msg));
  }

  async run() {
    const config = ProductConfig.load(this.configPath);
    const engine = new TemplateEngine({ strict: true });
    const deps = { config, engine, templatesDir: this.templatesDir };

    mkdirSync(this.outDir, { recursive: true });
    const files = {};
    for (const [name, Gen] of KitGenerator.GENERATORS) {
      const produced = new Gen(deps).build();
      for (const [rel, content] of Object.entries(produced)) {
        if (typeof content !== 'string' || !content.trim()) throw new Error(`Generator "${name}" menghasilkan konten kosong untuk ${rel}.`);
        if (files[rel]) throw new Error(`Bentrok: ${rel} dihasilkan lebih dari satu generator.`);
        files[rel] = content;
      }
    }

    const written = this.writeAll(files);
    const license = this.issueLicenses(config);
    const placeholderCount = Object.values(files).reduce((n, c) => n + (c.match(/GANTI/g) || []).length, 0);
    const summary = this.summarize(config, written, license, placeholderCount);
    this.print(summary);
    return summary;
  }

  writeAll(files) {
    const written = [];
    for (const [rel, content] of Object.entries(files)) {
      const target = join(this.outDir, rel);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
      written.push({ rel, bytes: statSync(target).size });
    }
    return written;
  }

  /**
   * Lisensi: pakai keypair yang sudah ada (aman untuk kode yang sudah beredar)
   * kecuali --new-keys. Public key ikut ditulis; private key HANYA ke out/.
   */
  issueLicenses(config) {
    const lic = config.license;
    const dir = join(this.outDir, 'license');
    const privPath = join(dir, 'private_key.pem');
    const pubPath = join(dir, 'public_key.pem');
    let issuer;
    let reused = false;
    if (!this.options.newKeys && existsSync(privPath) && existsSync(pubPath)) {
      issuer = LicenseIssuer.fromPem(readFileSync(privPath, 'utf8'), readFileSync(pubPath, 'utf8'));
      reused = true;
    } else {
      issuer = LicenseIssuer.create();
    }
    const rows = issuer.issueBatch({
      count: this.options.keys ?? lic.count,
      seats: this.options.seats ?? lic.seats,
      expiry: this.options.expiry ?? lic.expiry,
      bundleId: lic.bundleId,
      editions: config.data.editions,
    });
    issuer.writeKeys(dir, rows, { product: config.name, issuer: lic.issuer });
    const roundtrip = rows.map((r) => issuer.verify(r.key).valid);
    return {
      dir,
      reused,
      count: rows.length,
      seats: rows[0].payload.seats,
      expiry: rows[0].payload.expiry,
      algorithm: 'Ed25519',
      sample: rows[0].key,
      sampleEdition: rows[0].payload.edition,
      roundtripOk: roundtrip.every(Boolean),
      files: ['license/public_key.pem', 'license/private_key.pem', 'license/keys.csv', 'license/keys.json'],
    };
  }

  summarize(config, written, license, placeholderCount = 0) {
    const bytes = written.reduce((s, f) => s + f.bytes, 0);
    return {
      product: config.name,
      slug: config.slug,
      outDir: this.outDir,
      components: [
        ...written.map((f) => f.rel),
        ...license.files,
      ],
      files: written,
      bytes,
      license,
      placeholderCount,
      warnings: this.warnings(config, written, license, placeholderCount),
    };
  }

  warnings(config, written, license, placeholderCount = 0) {
    const list = [];
    const pending = config.placeholderCheckouts;
    if (pending.length) list.push(`Link checkout masih placeholder (${pending.join(', ')}) — isi URL asli di product.json lalu regenerasi.`);
    if (!written.some((f) => f.rel.startsWith('brand/'))) {
      list.push('brand/ tidak ikut dihasilkan — generate aset dengan prompts/asset-prompts.md, letakkan di samping folder landing/.');
    }
    if (license.reused) list.push('Keypair lama dipakai kembali (private_key.pem sudah ada di out/). Pakai --new-keys untuk kunci baru.');
    list.push(`${placeholderCount} teks "GANTI" masih ada di isi kit — habiskan sebelum publikasi (CHECKLIST.md Fase 2).`);
    list.push('RAHASIA: license/private_key.pem dan license/keys.csv jangan pernah masuk repo publik.');
    return list;
  }

  print(s) {
    const kb = (s.bytes / 1024).toFixed(1);
    this.log(`\n=== Selling Kit — ${s.product} (${s.slug}) ===`);
    this.log(`Output : ${s.outDir}`);
    this.log(`Ukuran : ${s.files.length} berkas, ${kb} KB (belum termasuk brand/)`);
    this.log('\nBerkas yang ditulis:');
    for (const f of s.files) this.log(`  ${String((f.bytes / 1024).toFixed(1)).padStart(7)} KB  ${f.rel}`);
    this.log('\nLisensi Ed25519:');
    this.log(`  ${s.license.count} kode diterbitkan · seats=${s.license.seats} · expiry=${s.license.expiry ?? 'selamanya'} · ${s.license.reused ? 'keypair DIPAKAI ULANG' : 'keypair BARU'}`);
    this.log(`  roundtrip verify: ${s.license.roundtripOk ? 'SEMUA VALID' : 'GAGAL'}`);
    this.log(`  contoh (edition "${s.license.sampleEdition}"): ${s.license.sample.slice(0, 44)}…${s.license.sample.slice(-12)}`);
    this.log('\nPeringatan:');
    for (const w of s.warnings) this.log(`  ! ${w}`);
    this.log('\n12 komponen kit selesai. Langkah berikutnya: buka README.md lalu CHECKLIST.md di folder output.\n');
  }
}
