# Checklist Launch — {{product.name}}

> Urut dari atas. Jangan mulai dari media sosial — mulai dari produk yang bisa dibeli.
> Semua teks `GANTI` di kit ini harus hilang sebelum publikasi (cari: `grep -rn "GANTI" .`).

## Fase 1 — Produk & lisensi (hari 1)

1. [ ] Bangun/perbarui produk sampai lolos acceptance (versi {{product.version}}).
2. [ ] Publish ke Chrome Web Store / Edge Add-ons sebagai **unlisted** dulu → simpan ID & tautan resminya.
3. [ ] Simpan berkas `license/public_key.pem` ke dalam repo produk (untuk verifikasi offline) — **jangan** `private_key.pem`.
4. [ ] Uji 1 kode dari `license/keys.csv` di produk: aktivasi diterima, badge edition muncul.
5. [ ] Uji kode palsu / kode yang diubah 1 karakter: produk harus menolak.
6. [ ] Cadangkan `private_key.pem` ke penyimpanan aman (password manager / brankas offline). Setelah hilang, semua kode tidak bisa di-terbitkan ulang.
7. [ ] Pastikan `private_key.pem`, `keys.csv`, dan `.env` tidak masuk repo publik (cek `git status` + file `.gitignore` di kit ini).

## Fase 2 — Ganti semua placeholder tautan (hari 1–2)

Tautan yang wajib diisi:

| # | Komponen | Cari teks | Ganti dengan |
|---|---|---|---|
{{#each linkTasks}}| {{_num}} | {{where}} | `{{needle}}` | {{fill}} |
{{/each}}
- [ ] `grep -rn "GANTI" landing guidebook emails captions | wc -l` → hasilnya **0** (kecuali yang memang disengaja).

## Fase 3 — Aset visual (hari 2)

1. [ ] Generate aset memakai `prompts/asset-prompts.md` (logo, box, hero, poster, social square, video 8 dtk).
2. [ ] Letakkan di `brand/` dengan nama berkas: {{brandFilesLine}}.
3. [ ] Cek `landing/index.html` lokal: tidak ada gambar/video rusak, palet sudah {{colorsSummary}}.
4. [ ] Kompres: target total `brand/` < 6 MB agar halaman ringan (gambar WebP/PNG optimized, video H.264 ≤ 8 Mbps).

## Fase 4 — Checkout & pengiriman otomatis (hari 2–3)

1. [ ] Buat produk di {{product.checkoutNote}} — satu produk per edition:
{{#each editions}}   - [ ] **{{name}}** — harga {{price}}{{#if priceNote}} ({{priceNote}}){{/if}} → tempel URL ke `editions[].checkoutUrl` di `product.json`
{{/each}}2. [ ] Aktifkan webhook "pembayaran berhasil" → pengirim email otomatis (`emails/delivery-email.md`).
3. [ ] Konfirmasi sistem checkout mengirim variabel `license_key` dan `download_link` seperti di template.
4. [ ] Uji beli Rp 0 / produk termurah dengan metode pembayaran asli. Cek: email masuk, tautan hidup, kode bisa dipakai.

## Fase 5 — Hosting (hari 3)

1. [ ] Deploy `landing/` + `brand/` ke Cloudflare Pages (project: `{{product.slug}}-sell`).
2. [ ] Pasang domain / subdomain sendiri → cek HTTPS aktif.
3. [ ] Pastikan `landing/download.html` **tidak** ter-index (sudah ada `<meta name="robots" content="noindex">`).
4. [ ] Uji di HP: tipografi, tombol, kecepatan (target LCP < 2 s, tanpa JS).

## Fase 6 — Materi jualan (hari 3–4)

1. [ ] Upload buku panduan PDF (cetak `guidebook/guidebook.html` → Save as PDF) ke penyimpanan unduhan.
2. [ ] Upload ZIP produk + video tutorial; tempel tautannya di `landing/download.html`.
3. [ ] Salin 1 caption dari `captions/captions.md` per kanal: Instagram, marketplace, X, WhatsApp.
4. [ ] Jadwalkan `emails/launch-email.md` ke daftar kontak.
5. [ ] Posting hari peluncuran: IG feed + story, X thread, marketplace, grup WA/Telegram sesuai sektor.

## Fase 7 — Penutup (hari 4)

1. [ ] Beli sekali lagi dari tautan publik (mode penyamaran) — semuanya harus jalan tanpa bantuan Anda.
2. [ ] Pasang cara kontak support di landing & download (`{{product.supportEmail}}`).
3. [ ] Catat tanggal rilis + tautan di CHANGELOG repo produk.
4. [ ] Regenerasi kit bila ada perubahan config: `node factory/cli.js examples/{{product.slug}}/product.json out/{{product.slug}}` (keypair baru → kode lama tetap sah, tetapi simpan `private_key.pem` yang lama juga).

**Status siap launch:** Fase 1–7 tercentang semua. Kalau ada satu saja yang belum di Fase 1–4, jangan posting ke media sosial dulu.
