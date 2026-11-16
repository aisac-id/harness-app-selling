# AGENTS.md — Cara Agent Bekerja di Repo Ini

Repo ini adalah **pabrik selling kit**, bukan produk jualan. Tugas agent: mengubah
"informasi sebuah produk" menjadi **kit penjualan lengkap yang siap tayang**, tanpa menulis
berkas jualan secara manual.

## Aturan teknis (tidak boleh dilanggar)

1. **Node >= 18, hanya modul bawaan.** Dilarang `npm install` atau menambah dependensi.
   Yang boleh dipakai: `node:fs`, `node:path`, `node:crypto`, `node:readline`, `node:process`, `node:url`.
2. **Maksimal 300 baris per file `.js`.** Kalau lewat, pecah logika ke generator/bantuan baru
   atau pindahkan teks panjang ke `templates/`. Berkas template (`templates/*`) boleh lebih panjang.
3. **Gaya kode**: ES6 class, satu kelas satu tanggung jawab, nama file PascalCase sesuai nama kelas,
   folder `kebab-case`, komentar Bahasa Indonesia di kepala file menjelaskan "kenapa", bukan "apa".
4. **Bahasa dokumen & output: Indonesia.** Nama produk/istilah teknis (`.env`, `load unpacked`,
   Ed25519) tetap seperti aslinya.
5. **Jangan menulis di luar repo ini**, dan jangan mengubah kit produk yang sudah tayang
   (`out/<slug>/license/*`) tanpa perintah eksplisit — private key lama = kode lama mati.
6. HTML hasil kit harus tetap **tanpa JavaScript eksternal, tanpa `<script>`, CSP ketat**.
   Teks, harga, dan warna berasal dari `product.json`; jangan hardcode di template.

## Alur kerja standar (7 langkah)

### 1. Kumpulkan informasi produk

Minimal: nama, slug, satu kalimat tagline, 3–6 fitur, 3 langkah pemakaian, varian + harga,
isi bundel, target sektor, FAQ, provider/API yang dipakai, email support, 4 warna brand
(`bg`, `accent`, `accent2`, `text`), dan URL repo brand.

### 2. Susun `examples/<slug>/product.json`

Salin `examples/harness-extension/product.json` sebagai acuan struktur, lalu isi.
Jangan mulai menulis generator/template dulu kalau config belum lolos:

```bash
node factory/cli.js examples/<slug>/product.json out/<slug> --keys=5
```

`factory/ProductConfig.js` memvalidasi schema dan menyebutkan field bermasalah satu per satu
(kontrak: `features` >= 3, `steps` tepat 3, `editions` punya `name`/`price`/`checkoutUrl`,
`slug` huruf kecil dengan tanda hubung). Harga menerima "rb"/"jt" (`Rp 299rb` = 299000).

### 3. Jalankan factory dan baca ringkasannya

Factory mencetak daftar berkas + ukuran, hasil penerbitan lisensi
(`roundtrip verify: SEMUA VALID`), dan peringatan (checkout masih `GANTI`, folder `brand/`
belum ada, dsb.). Perbaiki config bila ada peringatan yang bukan keinginan Anda.

### 4. Periksa hasil render — wajib grep token sisa

```bash
grep -rn "{{" out/<slug> --include="*.html" --include="*.md" --include="*.json" | grep -v license_key | grep -v download_link
```

Harus kosong. Engine memakai **mode ketat**: token tak dikenal langsung error, jadi kalau
muncul token mentah berarti ada file lama — hapus `out/<slug>/landing` lalu jalankan ulang.
Dua placeholder yang memang boleh tersisa hanyalah `{{license_key}}` dan `{{download_link}}`
di `emails/delivery-email.md` (variabel sistem checkout).

### 5. Buat aset visual dengan AI

Buka `out/<slug>/prompts/asset-prompts.md`. Setiap prompt sudah memuat nama produk, palet warna,
dan gaya brand. Urutan kerja:

- **ImageGen** → `logo.png` (1024x1024), `software-box.png`, `hero-banner.png` (1792x1024 / 16:9),
  `poster.png` (1024x1536), `social-square.png` (1024x1024), dan ikon `icons/16|32|48|128`.
- **VideoGen** → `promo-video.mp4` (8–10 detik, tanpa teks, hanya gerak halus pada glow & grid).
- Simpan semuanya di **`out/<slug>/brand/`** dengan nama persis seperti di daftar aset
  (`logo.png`, `hero-banner.png`, `software-box.png`, `poster.png`, `social-square.png`,
  `promo-video.mp4`, `icons/`). Nama-nama itu sudah dirujuk landing/download/guidebook.
- Render ulang halaman setelah menaruh gambar bila Anda mengganti rasio; cek `alt` text dan
  kontras teks di atas banner.
- Ulangi prompt sampai estetikanya sesuai: latar navy gelap, aksen cyan/teal, bersih, minim
  teks pada gambar. Jangan menaruh wajah orang atau logo platform pihak ketiga.

### 6. Isi semua placeholder `GANTI`

`out/<slug>/CHECKLIST.md` mendaftar satu per satu: URL checkout per varian (Web Store, Mayar,
Lynk.id, Gumroad), tautan unduhan per item bundel (`GANTI-URL-...`), nomor WhatsApp
(`GANTI-NOMOR-WA`), link Web Store, dan alamat email. Setelah diisi, grep ulang:

```bash
grep -rn "GANTI" out/<slug> | wc -l    # target: 0 sebelum tayang
```

### 7. Publikasi ke repo brand `<slug>-sell`

Repo tujuan sudah dideklarasikan di `product.json` → `brandRepoUrl`
(contoh: `https://github.com/aisac-id/harness-extension-sell`).

```bash
cp -R out/<slug>/. /data/<slug>-sell/
cd /data/<slug>-sell
git add -A            # .gitignore kit menolak private_key.pem, keys.csv, keys.json, .env
git status --short    # PASTIKAN tidak ada baris license/private_key.pem atau license/keys.csv
git commit -m "feat: selling kit <nama produk> dari factory"
git push -u origin main
```

## Garis merah keamanan

- `license/private_key.pem`, `license/keys.csv`, `license/keys.json`, dan `.env*` **tidak boleh**
  masuk repo publik, ZIP produk, Google Drive publik, atau pun ditempel ke chat/email.
  Yang boleh beredar: `license/public_key.pem` dan kode lisensi milik pembeli masing-masing.
- Kode lisensi hanya diterbitkan factory (`node:crypto` Ed25519) — jangan dikarang manual,
  jangan diedit di CSV. Kalau perlu batch tambahan, jalankan factory dengan `--keys=N`;
  kode lama tetap valid karena keypair lama dipakai ulang.
- Jangan menghapus `--new-keys` konfirmasi dengan `--yes` kecuali Anda yakin belum ada satu pun
  kode yang dikirim ke pembeli.
- Sebelum push, jalankan cek mandiri:

  ```bash
  grep -rIn "PRIVATE KEY" out/<slug> --include="*" | grep -v private_key.pem   # harus kosong
  git ls-files | grep -E "private_key|keys\.(csv|json)|^\.env$"                # harus kosong
  ```

## Definisi selesai (definition of done)

- [ ] `node --check factory/**/*.js` bersih dan semua `.js` <= 300 baris (`wc -l`).
- [ ] Factory jalan tanpa error dari config baru di `examples/<slug>/product.json`.
- [ ] 12 komponen ada di `out/<slug>/`, tidak ada `{{token}}` tersisa selain dua placeholder email.
- [ ] Landing, download, dan guidebook memuat nama + harga yang sama dengan config.
- [ ] `license/keys.csv` terisi dan setiap kode lolos verifikasi roundtrip.
- [ ] Aset visual ada di `out/<slug>/brand/` dan tampil di halaman.
- [ ] `CHECKLIST.md` tidak menyisakan `GANTI`.
- [ ] Repo `<slug>-sell` ter-push **tanpa** berkas rahasia.
