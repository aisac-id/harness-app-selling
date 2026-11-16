/**
 * MiscGenerator.js — komponen 7, 8, 11, 12:
 *   env/.env.example, products.json, README.md kit, dan .gitignore kit.
 *
 * Berkas-berkas ini dibangun langsung (bukan template HTML) karena isinya
 * sebagian besar tabel data hasil normalisasi product.json.
 */

import { BaseGenerator } from '../BaseGenerator.js';

export class MiscGenerator extends BaseGenerator {
  build() {
    return {
      'env/.env.example': this.envExample(),
      'products.json': this.productsJson(),
      'README.md': this.kitReadme(),
      '.gitignore': this.gitignore(),
    };
  }

  // ------------------------------------------------------------- .env.example

  envExample() {
    const d = this.config.data;
    const lines = [
      d.envHeader,
      `# Provider yang didukung ${d.name}: ${d.providers.map((p) => p.name).join(', ')}`,
      '',
      '# --- Provider AI ---',
      '# Isi hanya yang Anda pakai. Nilai boleh dikosongkan.',
    ];
    for (const p of d.providers) {
      lines.push('');
      if (p.note) lines.push(`# ${p.name} — ${p.note}`);
      else lines.push(`# ${p.name}`);
      if (p.needsKey) lines.push(`${p.keyEnv}=`);
      if (p.baseUrl) lines.push(`${this.envName(p, 'BASE_URL')}=${p.baseUrl}`);
      if (p.model) lines.push(`${this.envName(p, 'MODEL')}=${p.model}`);
      if (!p.needsKey && !p.baseUrl && !p.model) lines.push(`# ${p.name}: tidak butuh kunci (jalankan service-nya di mesin Anda)`);
    }
    lines.push('', '# --- Konfigurasi tambahan produk ---');
    const extras = d.extraEnv.length ? d.extraEnv : [];
    if (!extras.length) lines.push('# (tidak ada variabel tambahan di product.json -> extraEnv)');
    for (const e of extras) {
      lines.push('');
      if (e.comment) lines.push(`# ${e.comment}`);
      lines.push(`${e.key}=${e.value ?? ''}`);
    }
    lines.push('', '# JANGAN commit file .env yang sudah terisi. Cukup file .env.example ini.', '');
    return lines.join('\n');
  }

  envName(provider, suffix) {
    return `${provider.keyEnv.replace(/_API_KEY$/, '')}_${suffix}`;
  }

  // ------------------------------------------------------------- products.json

  productsJson() {
    const d = this.config.data;
    const payload = {
      $schemaNote: 'Daftar edition + harga + tautan checkout + isi bundle. Dipakai landing page/extension lain yang butuh data jual produk ini.',
      slug: d.slug,
      name: d.name,
      version: d.version,
      tagline: d.tagline,
      currency: d.currency || 'IDR',
      checkoutProvider: d.checkoutNote,
      generatedAt: new Date().toISOString(),
      support: { email: d.supportEmail, repo: d.brandRepoUrl },
      brand: { path: d.brandPath, repoUrl: d.brandRepoUrl, colors: d.colors },
      editions: d.editions.map((e) => ({
        id: BaseGenerator.slugToken(e.name).toLowerCase(),
        name: e.name,
        price: e.price,
        priceNumber: e.priceNumber,
        priceNote: e.priceNote || undefined,
        highlight: e.highlight || undefined,
        checkoutUrl: e.checkoutUrl,
        includes: e.bundleIncludes || this.includesFor(e),
        features: e.features.map((f) => (f.included === false ? `(tidak termasuk) ${f.label}` : f.label)),
      })),
      bundleItems: d.bundleItems,
      sectors: d.sectors.map((s) => s.name),
      providers: d.providers.map((p) => ({ name: p.name, keyEnv: p.keyEnv, baseUrl: p.baseUrl || undefined, model: p.model || undefined })),
      license: {
        algorithm: 'Ed25519',
        keyFormat: 'base64url(json payload).base64url(signature)',
        payloadFields: ['edition', 'bundleId', 'seats', 'expiry', 'issuedTo', 'issuedAt'],
        seats: d.license.seats,
        expiry: d.license.expiry,
        publicKeyFile: 'license/public_key.pem',
        secretFiles: ['license/private_key.pem', 'license/keys.csv', 'license/keys.json'],
      },
    };
    return `${JSON.stringify(payload, null, 2)}\n`;
  }

  /** Isi paket default per edition: Free = produk saja, bundle = semua isi paket. */
  includesFor(e) {
    const all = this.config.data.bundleItems.map((b) => b.title);
    if (/bundle|paket/i.test(e.name)) return all;
    if (/free|gratis/i.test(e.name)) return all.filter((t) => /free|gratis|extension|aplikasi|produk/i.test(t)).slice(0, 2);
    return all.filter((t) => !/buku|video|bonus/i.test(t));
  }

  // ---------------------------------------------------------------- README kit

  kitReadme() {
    const d = this.config.data;
    const rows = [
      ['1', 'landing/index.html', 'Halaman jual (hero, strip angka, fitur, cara kerja, harga, isi paket, sektor, video, FAQ). Tanpa JS, CSP ketat.'],
      ['2', 'landing/download.html', 'Halaman pembeli: isi paket, aktivasi lisensi, install load unpacked, setup .env, support.'],
      ['3', 'license/', `public_key.pem, private_key.pem, keys.csv & keys.json — ${d.license.count} kode Ed25519 Sungguhan (payload edition/seats/expiry/issuedTo/issuedAt).`],
      ['4', 'guidebook/guidebook.html', 'Buku panduan cetak-ready (7 bab + tutorial bernomor + resep sektor + halaman kode lisensi). Cetak ke PDF dari browser.'],
      ['5', 'captions/captions.md', 'Caption 6 kanal: IG/TikTok, marketplace, email bundle, WhatsApp, hook video 15 dtk, thread X.'],
      ['6', 'prompts/asset-prompts.md', 'Prompt ImageGen/VideoGen sesuai nama produk + palet config (logo, box, hero, poster, social, video 8 dtk, ikon).'],
      ['7', 'env/.env.example', `Variabel kunci per provider (${d.providers.length} provider) + konfigurasi tambahan produk.`],
      ['8', 'products.json', 'Daftar edition, harga, tautan checkout, isi bundle — untuk dipakai landing/extension lain.'],
      ['9', 'emails/launch-email.md + emails/delivery-email.md', 'Email peluncuran dan email pengiriman otomatis (memuat placeholder license_key dan download_link untuk sistem checkout).'],
      ['10', 'CHECKLIST.md', 'Checklist launch 7 fase + tabel semua placeholder yang wajib diganti.'],
      ['11', 'README.md', 'Berkas ini.'],
      ['12', '.gitignore', 'Menjaga private_key.pem, keys.csv/keys.json, dan .env tidak ikut ter-commit.'],
    ];
    const tree = [
      'kit-ini/',
      '├── landing/          index.html + download.html   -> deploy ke Cloudflare Pages',
      '├── brand/            (ANDA isi: logo, hero-banner, software-box, poster, social-square, promo-video)',
      '├── guidebook/        guidebook.html               -> cetak ke PDF',
      '├── license/          public_key.pem (aman) + private_key.pem & keys.csv (RAHASIA)',
      '├── captions/ prompts/ emails/ env/',
      '├── products.json  CHECKLIST.md  README.md  .gitignore',
    ].join('\n');
    return `# Selling Kit — ${d.name}

Kit jualan lengkap, dihasilkan sekali jalan oleh **Harness Selling Kit Factory** dari satu berkas \`product.json\`.

- Produk: **${d.name}** (\`${d.slug}\`, v${d.version})
- Palet: \`${d.colors.bg}\` / \`${d.colors.accent}\` / \`${d.colors.accent2}\` / \`${d.colors.text}\`
- Edition: ${d.editions.map((e) => `${e.name} ${e.price}`).join(' · ')}
- Support: ${d.supportEmail} · Repo brand: ${d.brandRepoUrl}

## Isi kit (12 komponen)

| # | Berkas | Isi |
|---|---|---|
${rows.map((r) => `| ${r[0]} | \`${r[1]}\` | ${r[2]} |`).join('\n')}

## Struktur folder

\`\`\`
${tree}
\`\`\`

## Pakai 30 menit pertama

1. Buka \`CHECKLIST.md\` — itu urutan kerja resminya.
2. Generate aset visual dengan \`prompts/asset-prompts.md\`, letakkan di \`brand/\` (nama berkas sudah ditentukan).
3. Buat produk di ${d.checkoutNote} per edition, tempel URL-nya ke \`product.json\` (field \`editions[].checkoutUrl\`), lalu **regenerasi** kit.
4. Cari sisa placeholder: \`grep -rn "GANTI" .\` — habiskan satu per satu.
5. Cetak \`guidebook/guidebook.html\` ke PDF (A4, "Background graphics" ON) dan upload bersama ZIP produk + video.
6. Deploy folder \`landing/\` ke Cloudflare Pages, uji beli end-to-end, lalu posting dari \`captions/captions.md\`.

## Regenerasi

Dari repo factory:

\`\`\`bash
node factory/cli.js examples/${d.slug}/product.json out/${d.slug}
node factory/cli.js examples/${d.slug}/product.json out/${d.slug} --keys=25 --seats=3 --expiry=2027-12-31
\`\`\`

Setiap jalan membuat **keypair Ed25519 baru**. Bila Anda sudah menerbitkan kode untuk pelanggan,
JANGAN regenerasi ke private key baru — pakai \`license/private_key.pem\` yang lama (simpan cadangannya),
karena semua kode lama diverifikasi dengan pasangan kunci tersebut.

## PERINGATAN

- \`license/private_key.pem\` = **kunci penerbit**. Siapa pun yang pegang bisa membuat lisensi palsu.
  Jangan pernah commit ke repo publik, jangan kirim lewat chat, jangan masukkan ke package produk.
- \`license/keys.csv\` dan \`license/keys.json\` berisi kode lisensi jadi — juga rahasia.
  Keduanya sudah ada di \`.gitignore\` kit ini; pindahkan aturan itu ke repo produk Anda.
- Yang boleh didistribusikan hanya \`license/public_key.pem\` (ditanam di produk untuk verifikasi offline).
- Isi kit ini mengandung placeholder (\`GANTI\`) yang wajib diisi — jangan dipublikasikan apa adanya.
- Tautan checkout, unduhan, dan nomor WA adalah placeholder: produk ini tidak menahan uang siapa pun
  sampai Anda sendiri menguji beli end-to-end (Fase 4 & 7 di CHECKLIST.md).

---

*Dibuat oleh factory; jangan sunting file hasil secara massal — ubah \`product.json\` lalu regenerasi,
supaya kit tetap bisa dibuat ulang untuk produk berikutnya.*
`;
  }

  // ---------------------------------------------------------------- .gitignore

  gitignore() {
    return [
      '# RAHASIA LISSENSI — jangan pernah masuk repo publik',
      'license/private_key.pem',
      'license/*.pem',
      '!license/public_key.pem',
      'license/keys.csv',
      'license/keys.json',
      '',
      '# RAHASIA KUNCI API',
      '.env',
      '.env.*',
      '!.env.example',
      'env/.env',
      'env/.env.*',
      '!env/.env.example',
      '',
      '# Artefak lokal',
      'node_modules/',
      '*.log',
      '.DS_Store',
      'Thumbs.db',
      '',
      '# Berkas besar (aset brand lebih baik di-LFS / storage sendiri)',
      'brand/*.mp4',
      '',
    ].join('\n');
  }
}
