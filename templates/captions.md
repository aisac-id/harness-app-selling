# Paket Caption Siap Pakai — {{product.name}}

> Dihasilkan otomatis dari `product.json`. Ganti semua `<GANTI: ...>` sebelum posting.
> Link checkout: {{#each editions}}[{{name}}]({{checkoutUrl}}){{#if _last }}.{{else}} · {{/if}}{{/each}}
> Harga: {{#each editions}}{{name}} {{price}}{{#if _last }}.{{else}} · {{/if}}{{/each}}

---

## 1. Instagram / TikTok — Postingan Launch

{{product.name}} akhirnya keluar. 🚀

{{copy.heroTitle}} {{copy.heroHighlight}}

{{descriptionFirst}}

Yang bisa langsung Anda lakukan hari ini:
{{#each features}}{{_num}}. {{title}} — {{descFirst}}
{{/each}}
Pilih sesuai kebutuhan: {{editionNames}}. Bayar sekali, pakai terus. Tanpa langganan wajib.

🎁 3 pembeli pertama hari ini dapat bonus: {{bonusLine}}

👉 Link di bio.
<GANTI: tagar niche + sebutkan sektor target di 3 kata pertama caption>

**Hashtag (10):**
{{hashtags}}

---

## 2. Deskripsi Marketplace (Tokopedia / Shopee / Lazada)

**Judul (maks 60 karakter):** {{product.name}} {{marketplaceTitleSuffix}}

**Deskripsi:**

{{product.name}} — {{product.taglineId}}

{{descriptionFirst}}

**ISI PAKET**
{{#each bundleItems}}- {{title}}{{#if desc}}: {{descFirst}}{{/if}}
{{/each}}
**EDITION & HARGA**
{{#each editions}}- {{name}} — {{price}}{{#if priceNote}} ({{priceNote}}){{/if}}
{{/each}}
**CARA PAKAI (3 LANGKAH)**
{{#each steps}}{{_num}}. {{title}}: {{descFirst}}
{{/each}}
**PENGIRIMAN**
File dikirim otomatis lewat pesan marketplace/email: kode lisensi, berkas produk, buku panduan PDF, dan video tutorial. Proses di bawah 5 menit setelah pembayaran.

**GARANSI**
Kalau produk tidak bisa diaktifkan di perangkat Anda dan kami tidak bisa memperbaiki, uang kembali.<GANTI: sesuaikan kebijakan refund Anda>

**KATA KUNCI**
{{keywords}}

---

## 3. Email Penawaran Bundle (hard-sell, 1 CTA)

**Subjek:** {{product.name}} + buku panduan — {{bundlePrice}} (hemat {{bundleSaving}})
**Pratinjau:** Semua fitur Pro plus panduan langkah demi langkah. Sekali bayar.

Halo <GANTI: nama>,

Kalau Anda selama ini menunda memakai otomasi karena "nanti ribet", paket ini dibuat justru untuk itu: {{product.name}} {{proName}} + buku panduan yang menuntun dari install sampai job pertama Anda jalan.

Anda dapat:
{{#each bundleItems}}• {{title}}{{#if desc}} — {{descFirst}}{{/if}}
{{/each}}
Harga normal terpisah: {{separatePrice}}. Paket bundle: **{{bundlePrice}}**.

Satu pembayaran, satu kode lisensi, aktivasi offline.

**[Ambil paket bundle {{bundlePrice}} →]({{bundleCheckoutUrl}})**

Kalau bukan waktunya, abaikan email ini — tidak ada penawaran berulang dari alamat ini.

---

## 4. WhatsApp Broadcast (pendek, tanpa terasa spam)

Halo Kak 👋

Saya {{product.name}} — {{oneLiner}}

Ringkasnya:
{{#each topThree}}{{_num}}. {{title}} — {{short}}
{{/each}}
Harga: {{#each editions}}{{name}} *{{price}}*{{#if _last }}{{else}}, {{/if}}{{/each}}

Mau saya kirim demo 60 detik + buku panduannya? Balas "MAU" ya 🙏

<GANTI: nama pengirim + nomor WA + link katalog bila ada>

---

## 5. Hook Video 15 Detik (Reels / Shorts / TikTok)

**Hook (0–3 dtk):** "{{hookLine}}"

{{#each videoScenes}}**{{time}}** — {{action}}
  Teks di layar: "{{onScreen}}"
{{/each}}
**Musik:** {{videoMusic}}
**CTA akhir:** "{{videoCta}}"

Caption pendek: {{oneLiner}} — link di bio.

---

## 6. Thread X (Twitter) — 6 tweet

**1/** {{#each threadOpening}}
{{this}}
{{/each}}
**2/** Fitur yang orang bayar untuk ini:
{{#each features}}{{tweetLine}}
{{/each}}
**3/** Cara kerja ({{stepsCount}} langkah, tanpa coding):
{{#each steps}}{{_num}}. {{title}} — {{descFirst}}
{{/each}}
**4/** Contoh nyata per bidang: {{sectorExamples}}

**5/** Harga: {{#each editions}}{{name}} {{price}}{{#if _last }}.{{else}} · {{/if}}{{/each}} Sekali bayar, tanpa langganan wajib.

**6/** Coba dulu free-nya, kalau cocok baru naik: {{checkoutLeadUrl}}
{{ctaUrlNote}}

---

## Catatan pakai

1. Ganti semua `<GANTI: ...>` dan link `#` sebelum posting.
2. Jangan menjanjikan hasil spesifik ("dijamin naik 10x") — tulis apa yang produk kerjakan.
3. Untuk sektor dengan data sensitif (keseuangan/kesehatan/hukum), tonjolkan jalur AI lokal & enkripsi.
4. Satu pesan = satu CTA. Untuk IG, arahkan ke link di bio; untuk email, satu tombol.
