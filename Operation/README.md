# Operation — Harness App Selling

Knowledge base komersial dan operasional untuk **Harness App Selling** (nama komersial untuk
`harness-selling-kit-factory` v1.0.0 di repo [`aisac-id/harness-app-selling`](https://github.com/aisac-id/harness-app-selling)),
diterbitkan oleh [PT. Sainskerta Solusi Nusantara](https://sainskerta.net) — software house & AI
partner berbasis di Gedung Graha Mampang Lt. 3, Jakarta Selatan, beroperasi sejak 2013.

Harness App Selling **bukan layanan daring dan bukan SaaS**. Repo ini adalah perkakas CLI Node.js
(`kit-factory`) tanpa dependensi npm yang mengubah satu berkas `product.json` menjadi satu paket
jualan lengkap berisi dua belas komponen: landing page, halaman download pembeli, kunci lisensi
Ed25519 asli, buku panduan siap cetak, pack caption enam kanal, prompt aset AI, contoh `.env`,
`products.json`, dua email, checklist tujuh fase, README kit, dan `.gitignore` penjaga rahasia.
Karena itu posisi komersial yang dipakai di seluruh suite ini adalah **alat kerja bagi penjual
extension dan produk digital**, dengan dua jalur: B2B ke penerbit/studio yang merilis banyak
produk, dan B2C ke developer solo yang menjual produk pertamanya.

Seluruh dokumen disusun dari isi repo yang terbaca (`README.md`, `AGENTS.md`, `package.json`,
`factory/*.js`, `factory/generators/*.js`, `templates/*`, `examples/harness-extension/product.json`,
`promo/`, `.gitignore`) dan dari riset kompetitor nyata yang URL-nya dicantumkan di tiap dokumen.

> **Catatan penting.** Harga, paket, target pasar, porsi pipeline, proyeksi pendapatan, nilai
> RTO/RPO, ambang SLA, dan perkiraan ROI dalam dokumen ini berstatus **usulan — perlu validasi
> manajemen**. Batas produk dinyatakan jujur di dokumen terkait: factory tidak memiliki test suite,
> tidak punya pencatatan (ledger) atau penarikan lisensi yang sudah diterbitkan, `keys.csv` dan
> `keys.json` ditimpa setiap kali factory dijalankan, muatan lisensi hanya ditandatangani (bukan
> dienkripsi) sehingga `issuedTo` terbaca, dan auto-delivery `{{license_key}}` /
> `{{download_link}}` masih menjadi placeholder yang harus diisi pelanggan di platform pembayaran.

## 01-Business-Strategy

| Dokumen | Isi Singkat |
|---|---|
| [01-Business-Model-Canvas](01-Business-Strategy/01-Business-Model-Canvas.docx) | Sembilan blok untuk alat penerbit selling kit, bukan untuk produk contoh |
| [02-ICP-dan-Segmentasi-Pasar](01-Business-Strategy/02-ICP-dan-Segmentasi-Pasar.docx) | Profil pembeli ideal, dua segmen prioritas, dan anti-ICP |
| [03-Analisis-Kompetitor](01-Business-Strategy/03-Analisis-Kompetitor.docx) | Platform lisensi, merchant of record, dan builder halaman jual — dengan URL nyata |
| [04-Analisis-SWOT](01-Business-Strategy/04-Analisis-SWOT.docx) | Kekuatan satu-perintah dan nol-dependensi, kelemahan nirsertifikasi dan niruji |

## 02-Sales

| Dokumen | Isi Singkat |
|---|---|
| [05-Proposal-Penjualan-B2B-Publisher-Digital](02-Sales/05-Proposal-Penjualan-B2B-Publisher-Digital.docx) | Proposal penerbit/studio: lisensi tahunan multi-produk + tata kelola kunci |
| [05-Proposal-Penjualan-B2C-Solo-Developer](02-Sales/05-Proposal-Penjualan-B2C-Solo-Developer.docx) | Proposal developer solo: paket sekali beli dan layanan "Jadi Tayang" |
| [06-Statement-of-Work](02-Sales/06-Statement-of-Work.docx) | Lingkup tujuh fase, kriteria terima, termin pembayaran, dan tarif |
| [07-Pricing-dan-Packaging](02-Sales/07-Pricing-dan-Packaging.docx) | Struktur paket, harga usulan, dan ekonomi unit per produk |
| [08-Sales-Playbook-dan-Battlecard](02-Sales/08-Sales-Playbook-dan-Battlecard.docx) | Pemicu beli, alur kualifikasi, kartu tempur, dan penanganan keberatan |
| [09-Product-Datasheet](02-Sales/09-Product-Datasheet.docx) | Spesifikasi factory, dua belas komponen keluaran, dan batas yang diakui |

## 03-Pre-Sales

| Dokumen | Isi Singkat |
|---|---|
| [10-Discovery-Questionnaire](03-Pre-Sales/10-Discovery-Questionnaire.docx) | Kuesioner kebutuhan selling kit, lisensi, dan kanal pembayaran |
| [11-Demo-Script-dan-PoC-Plan](03-Pre-Sales/11-Demo-Script-dan-PoC-Plan.docx) | Naskah demo 20 menit dan PoC lima hari kerja dengan kriteria lulus |
| [12-Technical-Proposal](03-Pre-Sales/12-Technical-Proposal.docx) | Integrasi selling kit, alur rilis, dan tata kelola kunci Ed25519 |
| [13-ROI-dan-Business-Case](03-Pre-Sales/13-ROI-dan-Business-Case.docx) | Manfaat waktu rilis, titik impas, dan sensitivitas volume penjualan |

## 04-IT-Communication

| Dokumen | Isi Singkat |
|---|---|
| [14-Arsitektur-Solusi](04-IT-Communication/14-Arsitektur-Solusi.docx) | Aliran `product.json` → generator → keluaran statis dan titik integrasi |
| [15-Arsitektur-Keamanan-dan-Threat-Model](04-IT-Communication/15-Arsitektur-Keamanan-dan-Threat-Model.docx) | Kunci privat penerbit, keluaran tanpa skrip + CSP, dan ancaman yang diakui |
| [16-Privasi-Data-dan-Kepatuhan](04-IT-Communication/16-Privasi-Data-dan-Kepatuhan.docx) | Pemetaan pemrosesan ke UU PDP 27/2022, GDPR, dan perlindungan konsumen |

## 05-Resilience-Operations

| Dokumen | Isi Singkat |
|---|---|
| [17-Business-Continuity-Plan](05-Resilience-Operations/17-Business-Continuity-Plan.docx) | Kontinuitas penerbitan lisensi, hosting statis, dan kanal pembayaran |
| [18-Disaster-Recovery-Plan](05-Resilience-Operations/18-Disaster-Recovery-Plan.docx) | Inventaris aset, RPO/RTO, dan prosedur pemulihan kunci serta batch kode |
| [19-SOP-Insiden-dan-Breach-Response](05-Resilience-Operations/19-SOP-Insiden-dan-Breach-Response.docx) | Deteksi sampai notifikasi, dengan skenario kebocoran kunci privat |
| [20-SLA-dan-Model-Dukungan](05-Resilience-Operations/20-SLA-dan-Model-Dukungan.docx) | Tingkatan dukungan, waktu respons, pengecualian, dan eskalasi |

## Cara Membaca Suite Ini

1. Mulai dari `01-Business-Strategy` untuk memahami bentuk produk: yang dijual adalah **perangkat
   penerbit selling kit**, bukan extension contoh di `examples/harness-extension/`.
2. Lanjut ke `02-Sales` untuk materi yang dipakai langsung di depan calon pembeli, termasuk `09`
   sebagai lampiran teknis dan `07` sebagai acuan harga resmi.
3. Gunakan `03-Pre-Sales` saat menyiapkan discovery, demo, PoC, dan usulan teknis.
4. Baca `04-IT-Communication` bersama tim keamanan dan peninjau kepatuhan pelanggan, terutama `15`
   untuk custody kunci privat Ed25519.
5. Tutup dengan `05-Resilience-Operations` untuk kontrak dukungan dan kesiapan insiden.

Empat keputusan yang berulang di seluruh dokumen dan perlu diambil manajemen sebelum
komersialisasi: (1) menetapkan dan mendokumentasikan pemegang kunci privat penerbit beserta
prosedur rotasi, (2) mendanai pencatatan (ledger) lisensi dan kemampuan penarikan kode sebelum
penjualan volume, (3) menyahkan daftar harga resmi menggantikan angka usulan di `07`, dan
(4) memastikan dasar hukum white-label serta penggunaan aset merek dagang pihak ketiga di
bawah status `UNLICENSED`/`private: true`.

## Penerbit

PT. Sainskerta Solusi Nusantara — Gedung Graha Mampang Lt. 3, Jakarta Selatan
hello@sainskerta.id · +62 813-5988-3131 · sainskerta.net

Dokumen bersifat rahasia dan hanya untuk pemakaian internal serta prospek bisnis yang
telah menandatangani perjanjian kerahasiaan.

© 2026 PT. Sainskerta Solusi Nusantara · hello@sainskerta.id · sainskerta.net
