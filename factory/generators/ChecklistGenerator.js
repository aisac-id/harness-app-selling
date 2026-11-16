/**
 * ChecklistGenerator.js — komponen 10: CHECKLIST.md
 *
 * Checklist launch bernomor 7 fase + tabel tugas "ganti placeholder" yang
 * dihitung dari config (edition, isi paket, berkas brand, kontak support).
 */

import { BaseGenerator } from '../BaseGenerator.js';

export class ChecklistGenerator extends BaseGenerator {
  build() {
    const d = this.config.data;
    return {
      'CHECKLIST.md': this.render('checklist.md', {
        ...this.base(),
        colorsSummary: `bg ${d.colors.bg}, aksen ${d.colors.accent} + ${d.colors.accent2}, teks ${d.colors.text}`,
        brandFilesLine: this.brandFiles().map((b) => `\`${b.file}\``).join(', '),
        linkTasks: this.linkTasks(),
      }, { escape: 'none' }),
    };
  }

  /** Daftar placeholder yang wajib diisi manual sebelum publikasi. */
  linkTasks() {
    const tasks = [];
    for (const e of this.config.data.editions) {
      tasks.push({
        where: 'landing/index.html + product.json',
        needle: `checkout ${e.name} (${e.price})`,
        fill: `URL produk ${e.name} di ${this.config.data.checkoutNote}`,
      });
    }
    for (const item of this.config.data.bundleItems) {
      tasks.push({
        where: 'landing/download.html',
        needle: `GANTI-URL-${BaseGenerator.slugToken(item.title)}`,
        fill: `tautan unduhan "${item.title}"`,
      });
    }
    tasks.push(
      { where: 'landing/index.html & guidebook', needle: '../brand/*.png', fill: 'letakkan hasil generate dari prompts/asset-prompts.md di brand/' },
      { where: 'landing/index.html', needle: '../brand/promo-video.mp4', fill: 'video 8 detik (VideoGen) atau ganti section video' },
      { where: 'landing/download.html', needle: 'GANTI-NOMOR-WA', fill: 'nomor WhatsApp/telepon support' },
      { where: 'guidebook/guidebook.html', needle: 'GANTI-LINK-WEB-STORE', fill: 'tautan resmi halaman toko produk' },
      { where: 'emails/*.md', needle: 'GANTI-NAMA-TOKO & <GANTI: ...>', fill: 'nama toko, nama pengirim, target respon' },
      { where: 'captions/captions.md', needle: '<GANTI: ...>', fill: 'tagar niche, kebijakan refund, nama pengirim WA' },
    );
    return tasks;
  }
}
