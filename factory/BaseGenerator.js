/**
 * BaseGenerator.js — induk class untuk semua generator komponen kit.
 *
 * Menyediakan: baca template (dengan cache), context dasar (produk + copy),
 * dan `theme` — palet turunan dari 4 warna config supaya template tidak
 * perlu menghitung warna.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IconLibrary } from './IconLibrary.js';
import { TemplateEngine } from './TemplateEngine.js';

export class BaseGenerator {
  static cache = new Map();

  /**
   * @param {{config: import('./ProductConfig.js').ProductConfig, engine: import('./TemplateEngine.js').TemplateEngine, templatesDir: string}} deps
   */
  constructor(deps) {
    this.config = deps.config;
    this.engine = deps.engine;
    this.templatesDir = deps.templatesDir;
  }

  /** componentId dipakai di pesan error & ringkasan. */
  get id() { return this.constructor.name.replace(/Generator$/, '').toLowerCase(); }

  template(file) {
    const key = join(this.templatesDir, file);
    if (!BaseGenerator.cache.has(key)) {
      let text;
      try {
        text = readFileSync(key, 'utf8');
      } catch (err) {
        throw new Error(`Generator "${this.id}" tidak bisa membaca template ${key}\n  ${err.message}`);
      }
      BaseGenerator.cache.set(key, text);
    }
    return BaseGenerator.cache.get(key);
  }

  render(file, context, options = {}) {
    return this.engine.render(this.template(file), context, { name: file, ...options });
  }

  // ------------------------------------------------------------------ warna

  static hexToRgb(hex) {
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = Number.parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  static rgbToHex(rgb) {
    return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
  }

  static mix(a, b, t) {
    const x = BaseGenerator.hexToRgb(a);
    const y = BaseGenerator.hexToRgb(b);
    return BaseGenerator.rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
  }

  static rgba(hex, alpha) {
    const [r, g, b] = BaseGenerator.hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /** Palet turunan: permukaan gelap, garis, teks sekunder, warna tinta tombol. */
  theme() {
    const c = this.config.colors;
    const dark = BaseGenerator.hexToRgb(c.bg).reduce((s, v) => s + v, 0) / 765 < 0.55;
    const surface = (t) => BaseGenerator.mix(c.bg, dark ? '#FFFFFF' : '#000000', t);
    return {
      bg: c.bg,
      bg2: surface(0.035),
      card: surface(0.055),
      line: surface(0.11),
      accent: c.accent,
      accent2: c.accent2,
      text: c.text,
      muted: BaseGenerator.mix(c.text, c.bg, 0.42),
      dim: BaseGenerator.mix(c.text, c.bg, 0.62),
      ink: dark ? BaseGenerator.mix(c.bg, '#000000', 0.28) : '#FFFFFF',
      glowSoft: BaseGenerator.rgba(c.accent, 0.1),
      glowLine: BaseGenerator.rgba(c.accent, 0.28),
      glowMid: BaseGenerator.rgba(c.accent, 0.16),
      glowStrong: BaseGenerator.rgba(c.accent, 0.4),
      navBg: BaseGenerator.rgba(c.bg, 0.86),
      gradient: `linear-gradient(120deg,${c.accent2},${c.accent})`,
    };
  }

  // --------------------------------------------------------------- context

  /** Context standar untuk semua template (tanpa section spesifik komponen). */
  base() {
    const d = this.config.data;
    const withIcon = (f) => ({ ...f, svg: IconLibrary.svg(f.icon) });
    return {
      product: {
        name: d.name,
        slug: d.slug,
        version: d.version,
        taglineId: d.tagline.id,
        taglineEn: d.tagline.en,
        description: d.description,
        supportEmail: d.supportEmail,
        brandRepoUrl: d.brandRepoUrl,
        brand: d.brandPath,
        checkoutNote: d.checkoutNote,
      },
      theme: this.theme(),
      colors: this.config.colors,
      copy: d.copy,
      features: d.features.map(withIcon),
      stats: d.stats,
      steps: d.steps,
      bundleItems: d.bundleItems,
      sectors: d.sectors,
      faq: d.faq,
      providers: d.providers,
      guideSectors: d.guideSectors,
      guideSteps: d.guideSteps,
      editions: d.editions.map((e) => this.plan(e)),
      year: String(new Date().getFullYear()),
    };
  }

  /** Bentuk satu edition jadi data siap render (markup harga & baris fitur). */
  plan(e) {
    return {
      ...e,
      isFree: /free|gratis/i.test(e.name) || e.priceNumber === 0,
      priceHtml: `${this.engine.constructor.escapeHtml(e.price)}${
        e.priceNote ? `<small>${this.engine.constructor.escapeHtml(` · ${e.priceNote}`)}</small>` : ''}`,
      planClass: e.highlight ? 'plan hot' : 'plan',
      items: e.features.map((f) => ({
        label: f.label,
        liClass: f.included ? '' : ' class="no"',
      })),
    };
  }

  /**
   * Titik masuk standar: kembalikan object { relPath: isiFile }.
   * Tiap subclass WAJIB menimpa method ini.
   */
  build() {
    throw new Error(`${this.constructor.name} belum mengimplementasikan build().`);
  }

  // ------------------------------------------------------------ util umum

  /** Kalimat pertama sebuah teks, dipotong lembut di `max` karakter. */
  static firstSentence(text, max = 180) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    const m = clean.match(/^(.*?[.!?])(?:\s|$)/);
    const first = (m ? m[1] : clean).trim();
    return BaseGenerator.clip(first, max);
  }

  static clip(text, max = 180) {
    const t = String(text || '').trim();
    if (t.length <= max) return t;
    const cut = t.slice(0, max);
    const sp = cut.lastIndexOf(' ');
    return `${(sp > 40 ? cut.slice(0, sp) : cut).replace(/[,;:.\-]+$/, '')}…`;
  }

  static slugToken(text) {
    return String(text)
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '-')
      .slice(0, 26) || 'BERKAS';
  }

  get productName() { return this.config.name; }

  get licenseSeats() {
    const n = Number(this.config.license.seats) || 1;
    return String(n);
  }

  get licenseExpiryText() {
    const exp = this.config.license.expiry;
    if (!exp) return ' — berlaku selamanya untuk versi yang dibeli';
    return ` sampai ${exp}`;
  }

  /** Langkah aktivasi lisensi (string HTML: markup tetap + nama produk di-escape). */
  activationSteps() {
    const esc = TemplateEngine.escapeHtml(this.productName);
    return [
      `Buka <b>${esc}</b> lalu masuk ke <b>Settings &rarr; Lisensi</b> (atau ikuti langkah 3 tutorial saat pertama kali membuka).`,
      'Tempel kode lisensi dari email pembelian — tanpa spasi ekstra di awal/akhir.',
      'Klik <b>Aktifkan</b>. Verifikasi berjalan <b>offline</b> memakai kunci publik penerbit, jadi tidak butuh internet maupun akun.',
      'Pastikan badge edition muncul di header produk. Kalau belum, lihat bagian support di bawah.',
      'Bila pindah perangkat: lepas lisensi dari perangkat lama lebih dulu (transfer seat), lalu aktifkan ulang.',
    ];
  }

  /** Langkah install manual (load unpacked) sebagai {title, desc}. */
  installSteps() {
    const esc = TemplateEngine.escapeHtml(this.productName);
    return [
      { title: 'Unduh & ekstrak ZIP', desc: `Simpan <code>${this.config.slug}-v${this.config.data.version}.zip</code> lalu ekstrak ke folder yang tidak dipindah-pindah.` },
      { title: 'Buka halaman perluasan', desc: 'Ketik <code>chrome://extensions</code> di address bar (Chrome / Edge / Brave).' },
      { title: 'Aktifkan Mode Developer', desc: 'Tombol di pojok kanan atas halaman perluasan.' },
      { title: 'Muat tanpa-pengemasan', desc: `Klik <b>Load unpacked</b> lalu pilih folder hasil ekstrak. Ikon ${esc} muncul di toolbar.` },
      { title: 'Buka panel produk', desc: 'Klik ikon lalu tekan shortcut panel (baku: <code>Alt+Shift+S</code>). Ikuti tutorial bernomor sampai job pertama Anda jalan.' },
    ];
  }

  /** Berkas brand yang diharapkan ada di folder brand/. */
  brandFiles() {
    return [
      { file: 'logo.png', use: 'logo di nav, hero, footer, sampul buku' },
      { file: 'hero-banner.png', use: 'banner utama landing (16:9)' },
      { file: 'software-box.png', use: 'mockup box di section Isi Paket' },
      { file: 'poster.png', use: 'poster promosi vertikal / cetak' },
      { file: 'social-square.png', use: 'postingan launch media sosial' },
      { file: 'promo-video.mp4', use: 'video 8 detik di landing & iklan' },
      { file: 'icons/ (16/32/48/128)', use: 'ikon manifest produk — satu-satunya yang boleh masuk package' },
    ];
  }
}
