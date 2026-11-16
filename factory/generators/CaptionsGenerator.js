/**
 * CaptionsGenerator.js — komponen 5: captions/captions.md
 *
 * Paket caption siap tempel untuk 6 kanal: IG/TikTok launch, deskripsi marketplace,
 * email penawaran bundle, WhatsApp broadcast, hook video 15 detik, thread X.
 * Semua angka/harga/fitur dihitung dari product.json.
 */

import { BaseGenerator } from '../BaseGenerator.js';

export class CaptionsGenerator extends BaseGenerator {
  build() {
    return { 'captions/captions.md': this.render('captions.md', this.context(), { escape: 'none' }) };
  }

  context() {
    const d = this.config.data;
    const features = this.richFeatures();
    const editions = d.editions;
    const bundle = this.bundleEdition(editions);
    const pro = this.proEdition(editions);
    return {
      ...this.base(),
      features,
      topThree: features.slice(0, 3),
      bundleItems: d.bundleItems.map((b) => ({ ...b, descFirst: BaseGenerator.firstSentence(b.desc, 120) })),
      steps: d.steps.map((s) => ({ ...s, descFirst: BaseGenerator.firstSentence(s.desc, 90) })),
      descriptionFirst: BaseGenerator.firstSentence(d.description, 200),
      oneLiner: d.tagline.id,
      editionNames: editions.map((e) => e.name).join(' / '),
      stepsCount: String(d.steps.length),
      hashtags: this.hashtags(),
      keywords: this.keywords(),
      sectorExamples: d.sectors.slice(0, 4).map((s) => s.name).join(' · ') + ' — dan lainnya',
      bonusLine: d.bundleItems.slice(0, 3).map((b) => b.title).join(', '),
      marketplaceTitleSuffix: `Lisensi ${pro.name} Resmi`,
      proName: pro.name,
      bundlePrice: bundle ? bundle.price : editions[editions.length - 1].price,
      bundleCheckoutUrl: bundle ? bundle.checkoutUrl : editions[editions.length - 1].checkoutUrl,
      separatePrice: this.separatePrice(editions, bundle),
      bundleSaving: this.bundleSaving(editions, bundle),
      hookLine: this.hookLine(),
      videoScenes: this.videoScenes(features, editions),
      videoMusic: 'ambient elektronik tipis, tempo naik pelan, tanpa vokal',
      videoCta: `${d.name} — link di bio`,
      threadOpening: this.threadOpening(),
      checkoutLeadUrl: (pro || editions[0]).checkoutUrl,
      ctaUrlNote: 'Ganti tautan di atas dengan link checkout Anda bila masih berisi "#".',
    };
  }

  richFeatures() {
    return this.config.data.features.map((f) => ({
      ...f,
      descFirst: BaseGenerator.firstSentence(f.desc, 110),
      short: BaseGenerator.clip(f.desc, 62),
      benefit: BaseGenerator.clip(f.desc, 120),
      tweetLine: `• ${f.title}: ${BaseGenerator.clip(f.desc, 70)}`,
    }));
  }

  bundleEdition(list) {
    return list.find((e) => /bundle|paket|buku/i.test(e.name)) || (list.length > 2 ? list[list.length - 1] : null);
  }

  proEdition(list) {
    return list.find((e) => e.highlight) || list.find((e) => /pro/i.test(e.name)) || list[list.length - 1];
  }

  separatePrice(list, bundle) {
    if (!bundle) return 'lihat daftar harga';
    const total = list.filter((e) => e !== bundle && e.priceNumber > 0).reduce((s, e) => s + e.priceNumber, 0);
    return total > 0 ? CaptionsGenerator.rupiah(total) : 'lihat daftar harga';
  }

  bundleSaving(list, bundle) {
    if (!bundle || !bundle.priceNumber) return 'belum dihitung';
    const total = list.filter((e) => e !== bundle && e.priceNumber > 0).reduce((s, e) => s + e.priceNumber, 0);
    const diff = total - bundle.priceNumber;
    return diff > 0 ? CaptionsGenerator.rupiah(diff) : 'harga paket';
  }

  static rupiah(n) {
    return `Rp ${Number(n).toLocaleString('id-ID')}`;
  }

  hookLine() {
    const first = this.config.data.features[0];
    return `Berhenti mengerjakan ${String(first.title).toLowerCase()} dengan tangan`;
  }

  videoScenes(features, editions) {
    const name = this.config.name;
    const hot = editions.filter((e) => e.highlight).map((e) => `${e.name} ${e.price}`).join(' · ');
    return [
      { time: '0–3 dtk', action: `Layar penuh copy-paste manual, lalu freeze. Teks muncul: "${this.hookLine()}"`, onScreen: this.hookLine() },
      { time: '3–6 dtk', action: `Panel ${name} terbuka di samping halaman, satu klik memulai job`, onScreen: `1 klik → ${String(features[0].title).toLowerCase()} jalan` },
      { time: '6–9 dtk', action: 'Hasil data/gambar masuk bertahap ke library + log langkah berjalan', onScreen: `${String(features[1] ? features[1].title : features[0].title)} — real-time` },
      { time: '9–12 dtk', action: 'Hasil di-export dan dibuka di spreadsheet/aplikasi lain', onScreen: 'Export JSON · CSV · ZIP' },
      { time: '12–15 dtk', action: `Kotak produk + logo di latar ${this.theme().bg}, harga muncul singkat`, onScreen: hot || `${name} — link di bio` },
    ];
  }

  threadOpening() {
    const d = this.config.data;
    return [
      `${d.name} — ${d.tagline.en}`,
      '',
      `Saya membuatnya untuk satu alasan: terlalu banyak pekerjaan digital yang bentuknya "buka halaman, salin, tempel, ulangi".`,
    ];
  }

  hashtags() {
    const base = ['#otomasi', '#produktifitas', '#RPA', '#AI', '#scraping', '#bisnisdigital', '#UMKM'];
    const fromName = this.config.name.toLowerCase().split(/\s+/).slice(0, 2).map((w) => `#${w.replace(/[^a-z0-9]/g, '')}`);
    const sector = `#${this.config.data.sectors[0].name.toLowerCase().split(/[^a-z0-9]+/)[0]}`;
    return [...fromName, ...base, sector].slice(0, 10).join(' ');
  }

  keywords() {
    const d = this.config.data;
    const words = [
      d.name,
      ...d.features.map((f) => f.title.toLowerCase()),
      ...d.sectors.slice(0, 6).map((s) => s.name.toLowerCase()),
      'otomasi browser', 'panen data', 'tanpa coding',
    ];
    return words.join(', ');
  }
}
