/**
 * LandingGenerator.js — komponen 1: landing/index.html
 *
 * Halaman jual statis (tanpa JavaScript, CSP ketat): hero, strip angka, fitur,
 * cara kerja, pricing per edition, isi paket, sektor chips, video, FAQ, footer.
 * Seluruh teks, harga, dan warna diambil dari product.json.
 */

import { BaseGenerator } from '../BaseGenerator.js';

export class LandingGenerator extends BaseGenerator {
  build() {
    return { 'landing/index.html': this.render('landing.html', this.base(), { escape: 'html' }) };
  }
}
