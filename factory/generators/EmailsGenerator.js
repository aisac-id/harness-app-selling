/**
 * EmailsGenerator.js — komponen 9: emails/launch-email.md + emails/delivery-email.md
 *
 * Satu template (templates/emails.md) dipecah per penanda `<<<SPLIT: nama-file>>>`
 * SEBELUM dirender, supaya tiap bagian tetap bisa memakai context yang sama.
 * Placeholder sistem checkout ditulis lewat {{verbatim:nama}} agar tetap muncul
 * sebagai teks "{{license_key}}" / "{{download_link}}" di hasil.
 */

import { BaseGenerator } from '../BaseGenerator.js';

const SPLIT_LINE = /^<<<SPLIT:\s*(\S.*?)\s*>>>$/;

export class EmailsGenerator extends BaseGenerator {
  build() {
    const ctx = this.context();
    const files = {};
    for (const part of this.splitParts(this.template('emails.md'))) {
      const opts = { escape: 'none', name: `emails.md#${part.path}` };
      const body = this.engine.render(part.text, ctx, opts);
      const title = this.engine.render(part.title, ctx, opts);
      files[part.path] = this.envelope(title, body);
    }
    return files;
  }

  splitParts(raw) {
    const parts = [];
    let current = null;
    for (const line of String(raw).split(/\r?\n/)) {
      const m = line.match(SPLIT_LINE);
      if (m) {
        current = { path: m[1].startsWith('emails/') ? m[1] : `emails/${m[1]}`, lines: [] };
        parts.push(current);
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (!parts.length) throw new Error('templates/emails.md tidak punya penanda <<<SPLIT: ...>>> — minimal 2 bagian.');
    return parts.map((p) => {
      const text = p.lines.join('\n');
      const title = (text.match(/^#\s+(.+)$/m) || [, p.path])[1].trim();
      return { ...p, title, text };
    });
  }

  envelope(title, body) {
    return `<!--\n  ${title}\n  Dihasilkan dari product.json oleh Harness Selling Kit Factory.\n`
      + '  Sebelum kirim: ganti semua <GANTI: ...>, cek panjang subjek, uji kirim ke diri sendiri.\n-->\n\n'
      + `${body.trim()}\n`;
  }

  context() {
    const d = this.config.data;
    const editions = this.base().editions;
    const cta = editions.find((e) => e.highlight) || editions.find((e) => /pro/i.test(e.name)) || editions[0];
    return {
      ...this.base(),
      features: d.features.map((f) => ({ ...f, benefit: BaseGenerator.clip(f.desc, 120) })),
      steps: d.steps.map((s) => ({ ...s, descFirst: BaseGenerator.firstSentence(s.desc, 90) })),
      bundleItems: d.bundleItems.map((b) => ({ ...b, descFirst: BaseGenerator.firstSentence(b.desc, 110) })),
      ctaEditionName: cta.name,
      ctaPrice: cta.price,
      ctaLabel: `Ambil ${cta.name} — ${cta.price}`,
      ctaCheckoutUrl: cta.checkoutUrl,
      hookSubject: `${d.tagline.id}, sekarang bisa Anda otomasi`,
      sectorLead: d.sectors[0].name,
      oneLiner: BaseGenerator.firstSentence(d.description, 140),
      stepsCount: String(d.steps.length),
      stepTotal: String(d.guideSteps.length || 12),
      demoLine: `coba edition Free ${d.name} lebih dulu, lalu aktifkan kode Pro kapan saja tanpa install ulang`,
      purchasedEditionLine: `${cta.name} — ${cta.price}`,
      licenseSeats: this.licenseSeats,
      licenseExpiryText: d.license.expiry ? ` sampai ${d.license.expiry}` : ' dan berlaku selamanya untuk versi yang dibeli',
      activationCount: String(this.activationSteps().length),
      activationSteps: this.activationSteps().map((s) => ({ desc: EmailsGenerator.toPlainText(s) })),
    };
  }

  /** Buang markup dari teks generator agar layak dipakai di email teks polos. */
  static toPlainText(html) {
    return String(html)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/&rarr;/g, '->')
      .replace(/&larr;/g, '<-')
      .replace(/&amp;/g, '&')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
