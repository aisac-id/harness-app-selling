/**
 * ProductConfig.js — baca, validasi, dan normalisasi satu file product.json.
 *
 * Pesan error berbahasa Indonesia dan selalu menyebut PATH field,
 * supaya file produk bisa ditulis orang non-teknis.
 *
 * Akses data hasil normalisasi lewat `cfg.data` (beberapa getter praktis tersedia).
 */

import { readFileSync } from 'node:fs';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class ConfigError extends Error {}

export class ProductConfig {
  /** Teks default landing/guidebook — boleh ditimpa per produk lewat field `copy`. */
  static DEFAULT_COPY = {
    navCta: 'Dapatkan Pro',
    heroKicker: 'Browser Extension · RPA · AI',
    heroTitle: 'Satu engine.',
    heroHighlight: 'Semua bisnis.',
    heroSub: 'Otomasi klik, panen data & gambar, lalu olah dan analisis dengan AI — langsung di browser Anda. Tanpa API, tanpa MCP.',
    featuresKicker: 'Fitur',
    featuresTitle: 'Semua yang Anda butuhkan untuk memanen web',
    featuresSub: 'Satu produk, modul lengkap, tampilan tipis dan elegan.',
    stepsKicker: 'Cara Kerja',
    stepsTitle: 'Mulai dalam 5 menit',
    stepsSub: 'Tutorial bernomor memandu dari install sampai hasil pertama.',
    pricingKicker: 'Harga',
    pricingTitle: 'Sekali bayar. Milik Anda.',
    pricingSub: 'Tanpa langganan wajib. Update perbaikan dan hak export data selamanya.',
    pricingNote: 'Harga dapat berubah sewaktu-waktu. Pembayaran digital diproses otomatis oleh penyedia checkout.',
    bundleKicker: 'Isi Paket',
    bundleTitle: 'Yang Anda terima setelah membeli',
    bundleSub: 'Semua dikirim otomatis ke email Anda:',
    sectorsKicker: 'Untuk Siapa',
    sectorsTitle: 'Dipakai di banyak sektor bisnis',
    sectorsSub: 'Satu engine, resep otomasi berbeda untuk tiap bidang.',
    videoKicker: 'Lihat Aksinya',
    videoTitle: 'Elegan di layar Anda',
    videoSub: 'Dirancang ringan, tidak mengganggu halaman yang sedang Anda kerjakan.',
    faqKicker: 'FAQ',
    faqTitle: 'Pertanyaan yang sering muncul',
    faqSub: '',
    footerTagline: 'Otomasi. Panen. Analisis.',
    legalNote: 'Gunakan sesuai hukum dan ketentuan situs target. Konten berhak cipta adalah tanggung jawab pengguna.',
    downloadTitle: 'Terima kasih — paket Anda siap',
    downloadIntro: 'Ikuti langkah bernomor di bawah untuk memasang produk dan mengaktifkan kode lisensi Anda.',
    supportLine: 'Ada kendala? Balas email pembelian ini atau hubungi support di bawah.',
    guideIntro: 'Buku panduan resmi. Baca bab 1-3 untuk mulai, lalu pakai bab resep sesuai bidang Anda.',
  };

  constructor(data, sourcePath = '(memori)') {
    this.sourcePath = sourcePath;
    this.raw = data;
    this.errors = [];
    this.#validate();
    this.data = this.#normalize(data);
  }

  static load(filePath) {
    let text;
    try {
      text = readFileSync(filePath, 'utf8');
    } catch (err) {
      throw new ConfigError(`Tidak bisa membaca konfigurasi produk: ${filePath}\n  (${err.code === 'ENOENT' ? 'file tidak ditemukan' : err.message})`);
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new ConfigError(`File ${filePath} bukan JSON yang valid.\n  ${err.message}`);
    }
    return new ProductConfig(data, filePath);
  }

  // ------------------------------------------------------------------ akses

  get name() { return this.data.name; }
  get slug() { return this.data.slug; }
  get colors() { return this.data.colors; }
  get copy() { return this.data.copy; }
  get editions() { return this.data.editions; }
  get license() { return this.data.license; }
  get supportEmail() { return this.data.supportEmail; }

  /** true bila masih ada link checkout placeholder yang wajib diganti manual. */
  get placeholderCheckouts() {
    return this.data.editions.filter((e) => /GANTI|example\.(com|id)|^#$/i.test(e.checkoutUrl)).map((e) => e.name);
  }

  /** Daftar harga "Rp x" untuk caption/email. */
  get priceList() {
    return this.data.editions.map((e) => `${e.name}: ${e.price}${e.priceNote ? ` (${e.priceNote})` : ''}`);
  }

  // -------------------------------------------------------------- validasi

  #err(msg) { this.errors.push(msg); }

  #text(obj, key, where, { required = true } = {}) {
    const v = obj ? obj[key] : undefined;
    if (v === undefined || v === null || v === '') {
      if (required) this.#err(`${where}.${key} wajib diisi (teks).`);
      return;
    }
    if (typeof v !== 'string') this.#err(`${where}.${key} harus string, dapat ${typeof v}.`);
    else if (!v.trim()) this.#err(`${where}.${key} tidak boleh hanya spasi.`);
  }

  #list(obj, key, where, { min = 1 } = {}) {
    const v = obj ? obj[key] : undefined;
    if (v === undefined) { this.#err(`${where}.${key} wajib diisi (array).`); return null; }
    if (!Array.isArray(v)) { this.#err(`${where}.${key} harus array, dapat ${typeof v}.`); return null; }
    if (v.length < min) this.#err(`${where}.${key} minimal ${min} butir, sekarang ${v.length}.`);
    return v;
  }

  /**
   * Validasi array of object: semua `keys` wajib terisi teks, `optional` bila ada harus teks.
   * Item boleh string bila `allowString` true.
   */
  #items(list, where, keys, optional = [], allowString = false) {
    if (!Array.isArray(list)) return;
    list.forEach((item, i) => {
      const at = `${where}[${i}]`;
      if (typeof item === 'string') {
        if (!allowString) this.#err(`${at} harus object, dapat string (butuh: ${keys.join(', ')}).`);
        else if (!item.trim()) this.#err(`${at} tidak boleh kosong.`);
        return;
      }
      if (!item || typeof item !== 'object') {
        this.#err(`${at} harus object (${keys.join(', ')})${allowString ? ' atau string' : ''}, dapat ${item === null ? 'null' : typeof item}.`);
        return;
      }
      keys.forEach((k) => this.#text(item, k, at));
      optional.forEach((k) => this.#text(item, k, at, { required: false }));
    });
  }

  #validate() {
    const d = this.raw;
    if (!d || typeof d !== 'object' || Array.isArray(d)) {
      this.#err('product.json harus berisi satu object (bukan array atau teks).');
      this.#throw();
    }
    ['name', 'description', 'brandRepoUrl', 'supportEmail'].forEach((k) => this.#text(d, k, 'product'));
    this.#text(d, 'slug', 'product');
    if (typeof d.slug === 'string' && d.slug && !SLUG_RE.test(d.slug)) {
      this.#err('product.slug hanya boleh huruf kecil, angka, dan tanda hubung (contoh: harness-extension).');
    }
    if (typeof d.supportEmail === 'string' && d.supportEmail && !EMAIL_RE.test(d.supportEmail)) {
      this.#err(`product.supportEmail bukan email sah: "${d.supportEmail}".`);
    }
    if (!d.tagline || typeof d.tagline !== 'object') this.#err('product.tagline wajib object {id, en}.');
    else { this.#text(d.tagline, 'id', 'product.tagline'); this.#text(d.tagline, 'en', 'product.tagline'); }

    if (!d.colors || typeof d.colors !== 'object') this.#err('product.colors wajib object {bg, accent, accent2, text}.');
    else {
      for (const key of ['bg', 'accent', 'accent2', 'text']) {
        const v = d.colors[key];
        if (!v) this.#err(`product.colors.${key} wajib diisi (contoh #22D3EE).`);
        else if (typeof v !== 'string' || !HEX_COLOR.test(v)) this.#err(`product.colors.${key} harus warna hex, contoh #22D3EE (dapat "${v}").`);
      }
    }

    this.#items(this.#list(d, 'features', 'product'), 'product.features', ['title', 'desc'], ['icon']);
    const steps = this.#list(d, 'steps', 'product');
    if (Array.isArray(steps) && steps.length !== 3) this.#err(`product.steps harus tepat 3 langkah cara kerja, sekarang ${steps.length}.`);
    this.#items(steps, 'product.steps', ['title', 'desc']);
    this.#items(this.#list(d, 'bundleItems', 'product'), 'product.bundleItems', ['title'], ['desc'], true);
    this.#items(this.#list(d, 'sectors', 'product'), 'product.sectors', [], [], true);
    this.#items(this.#list(d, 'faq', 'product'), 'product.faq', ['q', 'a']);
    this.#items(this.#list(d, 'providers', 'product'), 'product.providers', ['name'], ['keyEnv', 'baseUrl', 'model', 'note']);
    const gs = this.#list(d, 'guideSectors', 'product');
    this.#items(gs, 'product.guideSectors', ['sector', 'summary']);
    if (Array.isArray(gs)) gs.forEach((g, i) => { this.#list(g, 'jobs', `product.guideSectors[${i}]`); this.#items(g && g.jobs, `product.guideSectors[${i}].jobs`, ['title'], ['desc'], true); });

    const ed = this.#list(d, 'editions', 'product');
    this.#items(ed, 'product.editions', ['name', 'checkoutUrl'], ['priceNote', 'badge']);
    if (Array.isArray(ed)) {
      ed.forEach((e, i) => {
        const at = `product.editions[${i}]`;
        if (e && (e.price === undefined || e.price === null || e.price === '')) this.#err(`${at}.price wajib diisi (teks harga, mis. "Rp 299rb" atau "Rp 0").`);
        this.#items(e && e.features, `${at}.features`, ['label'], [], true);
        if (!e || !Array.isArray(e.features)) this.#err(`${at}.features wajib diisi (array).`);
      });
    }

    if (d.stats !== undefined) this.#items(this.#list(d, 'stats', 'product'), 'product.stats', ['value', 'label']);
    if (d.guideSteps !== undefined) this.#items(this.#list(d, 'guideSteps', 'product'), 'product.guideSteps', ['title', 'desc']);
    if (d.license !== undefined && (typeof d.license !== 'object' || Array.isArray(d.license))) this.#err('product.license harus object {count, seats, expiry, bundleId}.');
    if (d.license?.count !== undefined && (!Number.isInteger(d.license.count) || d.license.count < 1)) this.#err('product.license.count harus integer >= 1.');
    this.#throw();
  }

  #throw() {
    if (!this.errors.length) return;
    throw new ConfigError(
      `Konfigurasi ${this.sourcePath} belum valid (${this.errors.length} masalah):\n` +
      this.errors.map((e) => `  - ${e}`).join('\n')
    );
  }

  // ----------------------------------------------------------- normalisasi

  /** Teks harga -> angka: "Rp 299rb" = 299000, "Rp 1,5jt" = 1500000, "Rp 1.500.000" = 1500000. */
  static parsePrice(text) {
    const s = String(text || '').toLowerCase();
    const m = s.match(/\d[\d.,]*/);
    if (!m) return 0;
    const value = Number(m[0].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
    if (!Number.isFinite(value)) return 0;
    if (/jt|juta/.test(s)) return Math.round(value * 1_000_000);
    if (/rb|ribu/.test(s)) return Math.round(value * 1_000);
    return Math.round(value);
  }

  #edition(e) {
    return {
      name: e.name,
      price: String(e.price),
      priceNumber: Number(e.priceNumber ?? ProductConfig.parsePrice(e.price)) || 0,
      priceNote: e.priceNote || '',
      checkoutUrl: e.checkoutUrl,
      highlight: Boolean(e.highlight),
      badge: e.badge || (e.highlight ? 'Paling Laris' : ''),
      features: (e.features || []).map((f) =>
        typeof f === 'string' ? { label: f, included: true } : { label: f.label, included: f.included !== false }),
    };
  }

  #normalize(d) {
    const providers = d.providers
      .map((p) => ({
        name: p.name,
        keyEnv: p.keyEnv || `${p.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_API_KEY`,
        baseUrl: p.baseUrl || '',
        model: p.model || '',
        note: p.note || '',
        needsKey: p.needsKey !== false,
        order: p.order ?? 90,
      }))
      .sort((a, b) => a.order - b.order);
    return {
      ...d,
      version: d.version || '1.0.0',
      copy: { ...ProductConfig.DEFAULT_COPY, ...(d.copy || {}) },
      brandPath: d.brandPath || '../brand',
      logoConcept: d.logoConcept || `monogram huruf awal nama produk "${d.name}", digayakan sebagai abstraksi fungsi utama produk`,
      productKind: d.productKind || 'browser extension',
      uiHint: d.uiHint || '(jendela aplikasi ramping, panel data, log langkah berjalan)',
      checkoutNote: d.checkoutNote || 'Mayar / Lynk.id / Gumroad',
      envHeader: d.envHeader || `# .env.example — ${d.name}\n# Salin menjadi .env, isi hanya di mesin Anda. JANGAN commit .env.`,
      extraEnv: d.extraEnv || [],
      stats: d.stats || [],
      guideSteps: d.guideSteps || [],
      features: d.features.map((f) => ({ icon: f.icon || 'spark', title: f.title, desc: f.desc })),
      editions: d.editions.map((e) => this.#edition(e)),
      bundleItems: d.bundleItems.map((b) => (typeof b === 'string' ? { title: b, desc: '' } : { title: b.title, desc: b.desc || '' })),
      sectors: d.sectors.map((s) => (typeof s === 'string' ? { name: s } : { name: s.name })),
      providers,
      guideSectors: d.guideSectors.map((g) => ({
        sector: g.sector,
        summary: g.summary,
        jobs: (g.jobs || []).map((j) => (typeof j === 'string' ? { title: j, desc: '' } : { title: j.title, desc: j.desc || '' })),
      })),
      license: { count: 5, seats: 1, expiry: null, bundleId: 'bundle-buku', issuer: d.name, ...(d.license || {}) },
    };
  }
}
