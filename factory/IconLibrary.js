/**
 * IconLibrary.js — helper: kumpulan ikon SVG inline untuk landing page.
 *
 * Semua ikon pakai `stroke="currentColor"` dan viewBox 24x24, digayakan tipis
 * sesuai standar visual Harness (tanpa font icon, tanpa CDN).
 */

export class IconLibrary {
  static ICONS = {
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3.5 17.5l5-5 4 4 3.5-3.5 4.5 4.5"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    link: '<path d="M9.5 14.5l5-5"/><path d="M8 12l-2.5 2.5a3.5 3.5 0 005 5L13 17"/><path d="M16 12l2.5-2.5a3.5 3.5 0 00-5-5L11 7"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/><circle cx="12" cy="15.5" r="1.4"/>',
    shield: '<path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z"/>',
    bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    cursor: '<path d="M5.5 3.5l13 6.5-5.6 1.8L10.6 18z"/><path d="M13.5 13.5l5 5"/>',
    download: '<path d="M12 3.5v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    robot: '<rect x="4.5" y="8" width="15" height="11" rx="3"/><circle cx="9.5" cy="13" r="1.2"/><circle cx="14.5" cy="13" r="1.2"/><path d="M12 4.5V8M8.5 19.5h7"/>',
    book: '<path d="M4 5.5A2 2 0 016 3.5h5v17H6a2 2 0 01-2-2z"/><path d="M20 5.5a2 2 0 00-2-2h-5v17h5a2 2 0 002-2z"/>',
    play: '<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.8l5.4 3.2-5.4 3.2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
    cloud: '<path d="M7 18.5a4 4 0 010-8 5.5 5.5 0 0110.6 1.5A3.2 3.2 0 0117 18.5z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>',
  };

  static FALLBACK = 'spark';

  /** Ikon lengkap (svg + path) siap disisipkan ke template. */
  static svg(name) {
    const key = IconLibrary.ICONS[name] ? name : IconLibrary.FALLBACK;
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${IconLibrary.ICONS[key]}</svg>`;
  }

  /** Daftar nama ikon yang tersedia (untuk pesan error / dokumentasi). */
  static names() {
    return Object.keys(IconLibrary.ICONS);
  }
}
