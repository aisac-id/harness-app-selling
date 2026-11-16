/**
 * TemplateEngine.js — engine template ringan tanpa dependency.
 *
 * Sintaks yang didukung:
 *   {{nama}}              nilai dari context (di-escape sesuai mode)
 *   {{a.b.c}}             akses properti bertingkat
 *   {{this}}              item pada loop
 *   {{&nama}}             nilai MENTAH (tidak di-escape) — hanya untuk markup
 *                         yang dibangun generator, JANGAN untuk input user
 *   {{verbatim:nama}}     menghasilkan teks literal {{nama}} di output
 *   {{#each daftar}}...{{/each}}   loop array
 *   {{#if jalur}}...{{else}}...{{/if}}  kondisional
 *
 * Di dalam {{#each}} tersedia: {{this}} (jika item string), properti item,
 * {{_index}} (mulai 0), {{_num}} (mulai 1), {{_first}}, {{_last}},
 * dan {{@root.x}} untuk mengakses context terluar.
 *
 * Token yang tidak dikenal = error (menjamin tidak ada {{...}} tersisa di hasil).
 */

const BLOCK_START = /\{\{#(each|if)\s+([A-Za-z0-9_.$@-]+)\s*\}\}/g;
const BLOCK_ANY = /\{\{[#/](?:each|if)[^}]*\}\}|\{\{else[^}]*\}\}/g;
const VAR_TOKEN = /\{\{(&?)([A-Za-z0-9_@.$-]+)(?::([A-Za-z0-9_.$-]+))?\}\}/g;

export class TemplateEngine {
  /**
   * @param {{strict?: boolean}} [options] strict=true -> token tak dikenal melempar error
   */
  constructor(options = {}) {
    this.strict = options.strict !== false;
  }

  /**
   * Render satu string template.
   * @param {string} template
   * @param {object} context
   * @param {{escape?: 'html'|'none', name?: string}} [options]
   * @returns {string}
   */
  render(template, context, options = {}) {
    const opts = {
      escape: options.escape === 'none' ? 'none' : 'html',
      name: options.name || '(template)',
    };
    if (typeof template !== 'string') {
      throw new Error(`TemplateEngine: template "${opts.name}" bukan string.`);
    }
    return this.#process(template, context, opts);
  }

  /** Render beberapa template sekaligus (nama -> hasil). */
  renderAll(templates, context, options = {}) {
    const out = {};
    for (const [name, tpl] of Object.entries(templates)) {
      out[name] = this.render(tpl, context, { ...options, name });
    }
    return out;
  }

  // ---------------------------------------------------------------- blok

  #process(str, ctx, opts) {
    let out = '';
    let cursor = 0;
    BLOCK_START.lastIndex = 0;
    let m = BLOCK_START.exec(str);
    while (m !== null) {
      out += this.#vars(str.slice(cursor, m.index), ctx, opts);
      const bodyStart = m.index + m[0].length;
      const block = this.#matchBlock(str, bodyStart, m[1], opts);
      out += this.#runBlock(m[1], m[2], block.body, ctx, opts);
      cursor = block.end;
      BLOCK_START.lastIndex = block.end;
      m = BLOCK_START.exec(str);
    }
    out += this.#vars(str.slice(cursor), ctx, opts);
    return out;
  }

  #matchBlock(str, from, kind, opts) {
    let depth = 1;
    BLOCK_ANY.lastIndex = from;
    let m = BLOCK_ANY.exec(str);
    while (m !== null) {
      const token = m[0];
      if (token.startsWith('{{#')) depth += 1;
      else if (token.startsWith('{{/')) {
        depth -= 1;
        if (depth === 0) {
          const closeName = token.slice(3, -2).trim();
          if (closeName !== kind) {
            throw new Error(
              `TemplateEngine[${opts.name}]: penutup {{/${closeName}}} tidak cocok dengan {{#${kind}}}.`
            );
          }
          return { body: str.slice(from, m.index), end: m.index + token.length };
        }
      }
      BLOCK_ANY.lastIndex = m.index + token.length;
      m = BLOCK_ANY.exec(str);
    }
    throw new Error(
      `TemplateEngine[${opts.name}]: blok {{#${kind}}} tidak ditutup dengan {{/${kind}}}.`
    );
  }

  #runBlock(kind, path, body, ctx, opts) {
    const value = this.#resolve(path, ctx);
    if (kind === 'if') {
      const { concase, elsecase } = this.#splitElse(body, opts);
      const truthy = Array.isArray(value) ? value.length > 0 : Boolean(value);
      return this.#process(truthy ? concase : elsecase, ctx, opts);
    }
    // each
    if (value === undefined || value === null || value === '') return '';
    if (!Array.isArray(value)) {
      throw new Error(
        `TemplateEngine[${opts.name}]: {{#each ${path}}} membutuhkan array, dapat ${typeof value}.`
      );
    }
    let out = '';
    value.forEach((item, i) => {
      const scope = this.#childScope(item, ctx, i, value.length);
      out += this.#process(body, scope, opts);
    });
    return out;
  }

  #splitElse(body, opts) {
    let depth = 0;
    BLOCK_ANY.lastIndex = 0;
    let m = BLOCK_ANY.exec(body);
    while (m !== null) {
      const token = m[0];
      if (token.startsWith('{{#')) depth += 1;
      else if (token.startsWith('{{/')) depth -= 1;
      else if (depth === 0 && token.startsWith('{{else')) {
        return {
          concase: body.slice(0, m.index),
          elsecase: body.slice(m.index + token.length),
        };
      }
      BLOCK_ANY.lastIndex = m.index + token.length;
      m = BLOCK_ANY.exec(body);
    }
    return { concase: body, elsecase: '' };
  }

  #childScope(item, ctx, index, total) {
    const scope = Object.create(null);
    for (const [k, v] of Object.entries(this.#plain(ctx))) scope[k] = v;
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      for (const [k, v] of Object.entries(item)) scope[k] = v;
    } else {
      scope.this = item;
      scope.value = item;
    }
    scope._index = index;
    scope._num = index + 1;
    scope._first = index === 0;
    scope._last = index === total - 1;
    scope['@root'] = ctx;
    return scope;
  }

  #plain(value) {
    if (value === null || value === undefined) return {};
    if (typeof value === 'object') return value;
    return { this: value };
  }

  // ---------------------------------------------------------------- nilai

  #vars(str, ctx, opts) {
    VAR_TOKEN.lastIndex = 0;
    return str.replace(VAR_TOKEN, (full, raw, path, aux) => {
      if (aux !== undefined) {
        if (path !== 'verbatim') {
          throw new Error(
            `TemplateEngine[${opts.name}]: helper tak dikenal "{{${path}:${aux}}}".`
          );
        }
        return `{{${aux}}}`;
      }
      const found = this.#lookup(path, ctx);
      if (!found.found) {
        if (this.strict) {
          throw new Error(
            `TemplateEngine[${opts.name}]: token "{{${path}}}" tidak ada di context.`
          );
        }
        return full;
      }
      const text = this.#stringify(found.value);
      return raw === '&' ? text : this.#escape(text, opts.escape);
    });
  }

  #resolve(path, ctx) {
    const found = this.#lookup(path, ctx);
    return found.found ? found.value : undefined;
  }

  #lookup(path, ctx) {
    const parts = path.split('.');
    let cur = ctx;
    for (const key of parts) {
      if (cur === null || cur === undefined) return { found: false };
      if (typeof cur !== 'object') return { found: false };
      if (!(key in cur)) return { found: false };
      cur = cur[key];
    }
    return { found: true, value: cur };
  }

  #stringify(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : '';
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map((v) => this.#stringify(v)).join(', ');
    return String(value);
  }

  #escape(text, mode) {
    if (mode === 'none') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Escape HTML untuk pemakaian di luar engine (mis. nilai atribut dinamis). */
  static escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
