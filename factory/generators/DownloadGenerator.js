/**
 * DownloadGenerator.js — komponen 2: landing/download.html
 *
 * Halaman pembeli setelah bayar: daftar isi paket + tautan unduhan (placeholder),
 * langkah aktivasi lisensi, cara install load unpacked, setup .env, dan support.
 */

import { BaseGenerator } from '../BaseGenerator.js';

export class DownloadGenerator extends BaseGenerator {
  build() {
    return { 'landing/download.html': this.render('download.html', this.context(), { escape: 'html' }) };
  }

  context() {
    const base = this.base();
    return {
      ...base,
      files: this.files(),
      editionRows: this.editionRows(base.editions),
      activationSteps: this.activationSteps(),
      installSteps: this.installSteps(),
      providerList: base.providers.map((p) => p.name).join(', '),
      licenseSeats: this.licenseSeats,
      licenseExpiryText: this.licenseExpiryText,
    };
  }

  /** Baris tabel "edisi lain" di halaman download — harga diambil mentah dari config. */
  editionRows(editions) {
    return editions.map((e) => ({
      name: e.name,
      price: e.price,
      priceNote: e.priceNote || '',
      badge: e.badge || '',
      summary: e.features.slice(0, 3).map((f) => f.label).join(' · '),
      checkoutUrl: e.checkoutUrl,
    }));
  }

  /** Isi paket jadi baris tabel unduhan; `file` dipakai sebagai penanda GANTI-URL. */
  files() {
    const list = this.config.data.bundleItems.map((item, i) => ({
      no: i + 1,
      title: item.title,
      desc: item.desc || 'Berkas digital — dikirim otomatis setelah pembayaran.',
      file: BaseGenerator.slugToken(item.title),
    }));
    const hasZip = list.some((f) => /zip|extension|aplikasi/i.test(f.title));
    if (!hasZip) list.unshift({ no: 0, title: 'Berkas produk (ZIP)', desc: 'Versi terbaru untuk install manual / load unpacked.', file: 'PRODUK-ZIP' });
    return list.map((f, i) => ({ ...f, no: i + 1 }));
  }
}
