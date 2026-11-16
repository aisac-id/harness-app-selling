# Template Email — {{product.name}}

> Dua email siap pakai: **launch** (ke daftar kontak) dan **delivery** (otomatis setelah bayar).
> Ganti `<GANTI: ...>` dan semua link `#`. Placeholder `{{verbatim:license_key}}` / `{{verbatim:download_link}}`
> di email pengiriman harus TETAP ada — itu variabel yang diisi sistem checkout Anda.

<<<SPLIT: emails/launch-email.md>>>

# Email Launch — {{product.name}}

**Untuk:** daftar kontak / pelanggan lama
**Kirim saat:** landing page + checkout sudah diuji beli end-to-end
**CTA:** satu, yaitu {{ctaEditionName}}

**Subjek (pilih satu):**
1. {{product.name}} sudah keluar — {{ctaPrice}}, sekali bayar
2. {{hookSubject}}
3. Buat {{sectorLead}}: pekerjaan berulang Anda bisa jalan sendiri

**Pratinjau:** {{oneLiner}}

---

Halo <GANTI: nama depan>,

{{product.name}} hari ini resmi tersedia.

**{{oneLiner}}**

Tiga hal yang berubah untuk Anda setelah memasang:
{{#each features}}**{{_num}}. {{title}}** — {{benefit}}
{{/each}}
**Cara memulainya ({{stepsCount}} langkah):**
{{#each steps}}- {{title}} — {{descFirst}}
{{/each}}
**Harga (sekali bayar, bukan langganan):**
{{#each editions}}- {{name}}: {{price}}{{#if priceNote}} ({{priceNote}}){{/if}}{{#if highlight}} ← paling banyak dipilih{{/if}}
{{/each}}
**[{{ctaLabel}} →]({{ctaCheckoutUrl}})**

Kalau Anda cuma mau lihat dulu: {{demoLine}}

Salam,
<GANTI: nama Anda> — {{product.supportEmail}}

*Anda menerima email ini karena pernah menghubungi/beli produk kami. Balas "BERHENTI" untuk keluar dari daftar.*
<<<SPLIT: emails/delivery-email.md>>>

# Email Pengiriman (otomatis setelah pembayaran)

**Pemicu:** webhook "pembayaran berhasil" dari {{product.checkoutNote}}
**Isi:** wajib menyertakan kode lisensi + tautan unduhan. Sistem checkout mengisi `{{verbatim:license_key}}` dan `{{verbatim:download_link}}`.

**Subjek:** Kode lisensi {{product.name}} Anda — siap diaktifkan
**Pratinjau:** Unduh, pasang, tempel kode. Selesai dalam 5 menit.

---

Hai <GANTI: nama pembeli>,

Pembayaran Anda untuk **{{purchasedEditionLine}}** sudah kami terima. Terima kasih!

## 1. Kode lisensi Anda

```
{{verbatim:license_key}}
```

Simpan kode ini baik-baik. Berlaku untuk {{licenseSeats}} perangkat{{licenseExpiryText}}. Aktivasi offline, tanpa akun, tanpa langganan.

## 2. Unduh paketnya

**[Buka halaman download & aktivasi →]({{verbatim:download_link}})**

Isi paket yang Anda terima di halaman itu:
{{#each bundleItems}}- **{{title}}**{{#if desc}} — {{descFirst}}{{/if}}
{{/each}}
## 3. Aktivasi ({{activationCount}} langkah)

{{#each activationSteps}}**{{_num}}.** {{desc}}
{{/each}}
Butuh penjelasan panjang? Bab 2–3 buku panduan (di dalam paket) membahas install dan {{stepTotal}} langkah tutorial bertahap dengan gambar.

## 4. Support

Balas email ini bila: kode ditolak, berkas tidak bisa diunduh, atau aktivasi gagal di perangkat kedua. Sebutkan 12 karakter pertama kode Anda — kami balas <GANTI: target waktu respon>.

Salam,
GANTI-NAMA-TOKO — {{product.supportEmail}} — {{product.brandRepoUrl}}

*Jangan bagikan kode lisensi Anda. Kode terdaftar atas nama pembelian ini dan bisa dicabut bila disebarluaskan.*
