/**
 * PromptsGenerator.js — komponen 6: prompts/asset-prompts.md
 *
 * Prompt AI (ImageGen/VideoGen) yang sudah dikustomisasi nama produk, tagline,
 * dan palet warna config, mengikuti gaya brand Harness: gelap, glow halus, elegan.
 */

import { BaseGenerator } from '../BaseGenerator.js';

const HUES = [
  [12, 'merah'], [42, 'jingga'], [66, 'kuning'], [160, 'hijau toska'],
  [200, 'toska-cyan'], [250, 'biru'], [290, 'biru keunguan'], [340, 'ungu kemerahan'], [360, 'merah'],
];

export class PromptsGenerator extends BaseGenerator {
  build() {
    return { 'prompts/asset-prompts.md': this.render('asset-prompts.md', this.context(), { escape: 'none' }) };
  }

  context() {
    const palette = this.palette();
    const style = this.styleLine();
    return {
      ...this.base(),
      palette,
      styleLine: style,
      logoPrompt: this.logoPrompt(),
      boxPrompt: this.boxPrompt(style),
      heroPrompt: this.heroPrompt(style),
      posterPrompt: this.posterPrompt(style),
      socialPrompt: this.socialPrompt(style),
      videoPrompt: this.videoPrompt(),
      iconPrompt: this.iconPrompt(),
      negativePrompt: 'no photorealistic people, no clutter, no rainbow gradients, no drop shadows, no watermark, no gibberish text, no stock-photo look, low detail count',
      assetChecklist: this.brandFiles().map((b) => ({ file: `brand/${b.file}`, use: b.use })),
    };
  }

  static describe(hex) {
    const [r, g, b] = BaseGenerator.hexToRgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (max !== min) {
      if (max === r) h = 60 * (((g - b) / (max - min)) % 6);
      else if (max === g) h = 60 * ((b - r) / (max - min) + 2);
      else h = 60 * ((r - g) / (max - min) + 4);
    }
    if (h < 0) h += 360;
    const tone = l < 0.22 ? 'gelap pekat' : l < 0.42 ? 'gelap' : l < 0.62 ? 'sedang' : l < 0.82 ? 'terang' : 'sangat terang';
    if (s < 0.12) return `abu-netral ${tone}`;
    const name = (HUES.find(([edge]) => h <= edge) || HUES[HUES.length - 1])[1];
    return `${name} ${tone}`;
  }

  palette() {
    if (!this._palette) {
      const c = this.config.colors;
      this._palette = {
        bgName: PromptsGenerator.describe(c.bg),
        accentName: PromptsGenerator.describe(c.accent),
        accent2Name: PromptsGenerator.describe(c.accent2),
        textName: PromptsGenerator.describe(c.text),
      };
    }
    return this._palette;
  }

  styleLine() {
    const palette = this.palette();
    const d = this.config.data;
    return `latar ${palette.bgName} ${d.colors.bg}; aksen utama ${palette.accentName} ${d.colors.accent}; aksen kedua ${palette.accent2Name} ${d.colors.accent2}; `
      + `teks ${palette.textName} ${d.colors.text}; glow halus sewarna aksen, banyak ruang kosong, tipografi sans-serif tipis uppercase dengan letter-spacing lebar, `
      + 'garis rambut 1px, komposisi simetris, elegan dan minimalis, TANPA foto orang, TANPA teks panjang (maks 3 kata), TANPA efek 3D berlebihan';
  }

  logoPrompt() {
    const d = this.config.data;
    const initials = d.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return 'Buat logo/monogram produk digital, format 1024x1024, latar transparan atau satu warna gelap rata.\n'
      + `Konsep: ${d.logoConcept}\n`
      + `Inisial opsional bila perlu huruf: "${initials}" (nama produk: ${d.name}).\n`
      + `Gaya: ${this.styleLine()}\n`
      + 'Satu bentuk geometris kuat, terbaca jelas pada ukuran 16px, garis tebal konsisten, tanpa gradien pelangi, tanpa bayangan jatuh, tanpa teks kecil.';
  }

  boxPrompt(style) {
    const d = this.config.data;
    return `Mockup kotak software/produk fisik 3 dimensi, sudut tiga per empat, orientasi potret 1024x1280, di atas permukaan gelap ${d.colors.bg} dengan pantulan samar.\n`
      + `Sampul depan bertuliskan besar "${d.name}" (tipografi sans-serif tipis, letter-spacing lebar) dan tagline singkat "${d.tagline.id}" memakai warna teks ${d.colors.text}.\n`
      + `Aksen garis cahaya melengkung warna ${d.colors.accent} dan ${d.colors.accent2} menyapu sisi kotak; stiker kecil bertuliskan "PRO" di pojok.\n`
      + `Gaya keseluruhan: ${style}`;
  }

  heroPrompt(style) {
    const d = this.config.data;
    return `Banner lebar 16:9 (1792x1024) untuk halaman jual "${d.name}" — produk jenis ${d.productKind}.\n`
      + `Komposisi: sisi kanan antarmuka produk mengambang ${d.uiHint}, sisi kiri ruang kosong untuk teks overlay.\n`
      + `Elemen visual: garis aliran data halus dari sekeliling ke panel produk, beberapa thumbnail gambar dan tabel mini, kursor otomatis.\n`
      + `Warna & gaya: ${style}`;
  }

  posterPrompt(style) {
    const d = this.config.data;
    return `Poster promosi vertikal 2:3 (1024x1536) untuk "${d.name}".\n`
      + `Struktur: judul besar "${d.name}" di sepertiga atas, satu kalimat "${d.tagline.id}" di bawahnya, visual panel otomasi abstrak di tengah, tiga titik fitur ikon garis tipis di bawah, dan ruang kosong di dasar poster.\n`
      + `Gaya: ${style}. Cocok dicetak A4, jaga margin aman 5% dan kontras teks tinggi.`;
  }

  socialPrompt(style) {
    const d = this.config.data;
    return `Postingan sosial media persegi 1:1 (1024x1024) untuk peluncuran "${d.name}".\n`
      + `Fokus tunggal: tulisan "${d.copy.heroHighlight}" (atau "${d.tagline.id}") dengan glow halus, satu monogram produk, dan satu garis cahaya gradien.\n`
      + `Gaya: ${style}. Teks minimal agar terbaca di layar HP.`;
  }

  videoPrompt() {
    const d = this.config.data;
    return `Video promo sinematik 8 detik, 16:9, tanpa dialog dan tanpa teks bergerak panjang.\n`
      + `Gerakan kamera: dimulai close-up pada kursor di halaman web gelap, pull-back halus memperlihatkan sidebar produk "${d.name}" di pinggir kanan, lalu orbit pelan ke arah panel data yang terisi baris demi baris, diakhiri monogram produk bercahaya di tengah layar.\n`
      + `Pencahayaan: latar ${PromptsGenerator.describe(d.colors.bg)} ${d.colors.bg}, pancaran aksen ${d.colors.accent} dan ${d.colors.accent2}, partikel debu cahaya halus, glow tipis.\n`
      + `Nuansa: presisi, tenang, mahal. Tanpa orang, tanpa logo pihak ketiga, tanpa teks acak.`;
  }

  iconPrompt() {
    const d = this.config.data;
    return `Ikon aplikasi/extension tunggal, format 1024x1024, untuk diunduh lalu di-resize ke 16, 32, 48, dan 128 px.\n`
      + `Ambil bentuk dari logo "${d.name}" (${d.logoConcept}); pertahankan siluet kuat pada ukuran kecil.\n`
      + `Latar membulat warna ${d.colors.bg}, bentuk utama warna ${d.colors.accent} dengan aksen ${d.colors.accent2}. Tanpa teks, tanpa detail halus.`;
  }
}
