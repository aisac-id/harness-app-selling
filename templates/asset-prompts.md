# Prompt Aset Visual — {{product.name}}

> Tempel langsung ke **ImageGen** (gambar) atau **VideoGen** (video).
> Nama produk, tagline, dan palet sudah disisipkan dari `product.json` — jangan diubah manual, ubah config-nya.
> Simpan hasil ke folder `brand/` dengan nama berkas di bawah, supaya landing page langsung membacanya.

**Palet resmi produk ini**

| Peran | Hex | Pakai untuk |
|---|---|---|
| Latar ({{palette.bgName}}) | `{{colors.bg}}` | latar utama, ruang kosong |
| Aksen 1 ({{palette.accentName}}) | `{{colors.accent}}` | garis cahaya, highlight, glow |
| Aksen 2 ({{palette.accent2Name}}) | `{{colors.accent2}}` | gradien, aksen sekunder |
| Teks | `{{colors.text}}` | tipografi di atas latar gelap |

**Gaya dasar (wajib disebut di semua prompt):** {{styleLine}}

---

## 1. Logo / monogram — `brand/logo.png` (ImageGen, 1024×1024)

```text
{{logoPrompt}}
```

Aturan: satu bentuk geometris, terbaca di 16 px, tanpa teks panjang, tanpa efek 3D. Kalau hasil terlalu ramai, tambahkan: "kurangi detail, satu bentuk saja, ruang kosong minimal 20%".

## 2. Mockup kotak produk — `brand/software-box.png` (ImageGen, 1024×1280)

```text
{{boxPrompt}}
```

Dipakai di: landing "Isi Paket", sampul marketplace, halaman bonus buku.

## 3. Hero banner — `brand/hero-banner.png` (ImageGen, 1792×1024 / 16:9)

```text
{{heroPrompt}}
```

Harus menyisakan ruang kosong di bagian kiri/atas untuk teks overlay kalau dipakai di README.

## 4. Poster vertikal — `brand/poster.png` (ImageGen, 1024×1536)

```text
{{posterPrompt}}
```

Cetak A4/A3 atau story. Kalau untuk cetak: minta margin aman 5% di semua sisi.

## 5. Sosial media persegi — `brand/social-square.png` (ImageGen, 1024×1024)

```text
{{socialPrompt}}
```

## 6. Video promosi 8 detik — `brand/promo-video.mp4` (VideoGen, 16:9, 8 detik, tanpa audio vokal)

```text
{{videoPrompt}}
```

Catatan VideoGen: pilih rasio **16:9**, durasi **8 detik**, tanpa narasi (musik/caption ditambahkan di editor). Untuk versi vertikal, ulangi prompt yang sama dengan rasio 9:16 dan teks "format story vertikal".

---

## 7. Ikon aplikasi — `brand/icons/` (ImageGen 1024×1024, lalu resize)

```text
{{iconPrompt}}
```

Setelah dapat master 1024, buat 16/32/48/128 px. Hanya folder `icons/` yang boleh masuk package produk (aturan ukuran bundle).

## 8. Prompt penolakan (negative prompt)

Tambahkan di akhir prompt gambar apa pun bila hasilnya ramai:

```text
{{negativePrompt}}
```

---

## Checklist aset

{{#each assetChecklist}}- [ ] `{{file}}` — {{use}}
{{/each}}
Setelah semua ada: jalankan ulang factory (atau deploy), lalu cek `landing/index.html` — tidak boleh ada gambar rusak.
