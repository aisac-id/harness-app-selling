/**
 * GuidebookGenerator.js — komponen 4: guidebook/guidebook.html
 *
 * Buku panduan cetak-ready (@media print + page-break per bab):
 * 1 pengenalan, 2 install, 3 tutorial bernomor, 4 setup AI & .env,
 * 5 resep otomasi per sektor, 6 troubleshooting, 7 kode lisensi.
 */

import { BaseGenerator } from '../BaseGenerator.js';

/** Tutorial cadangan (pola 12 langkah Harness/UX_FLOW) bila produk tidak mengisi guideSteps. */
const FALLBACK_STEPS = [
  ['Selamat datang', 'Satu layar singkat: apa yang produk ini kerjakan dan apa yang tidak.'],
  ['Bahasa & tema', 'Pilih bahasa dan tampilan; perubahan langsung terlihat.'],
  ['Lisensi / trial', 'Masukkan kode lisensi dari email, coba trial, atau lanjut dengan Free.'],
  ['Kenali tampilan', 'Tur singkat menyorot navigasi, panel kerja, dan Settings.'],
  ['Buka di halaman nyata', 'Buka situs kerja Anda sehari-hari lalu tampilkan panel produk.'],
  ['Demo pertama', 'Jalankan job contoh sampai hasil nyata muncul di panel Data.'],
  ['Lihat & olah hasil', 'Coba filter, buka detail satu item, periksa dedupe.'],
  ['Export hasil', 'Unduh hasil sebagai JSON/CSV/ZIP dan buka di aplikasi lain.'],
  ['Sambungkan AI', 'Pilih provider, tempel kunci atau import .env, uji koneksi.'],
  ['Sambungkan platform', 'Isi URL platform + token, uji kirim, aktifkan konektor seperlunya.'],
  ['Job otomatis pertama', 'Pilih template resep, jalankan sekali, lalu jadwalkan.'],
  ['Selesai & peta bantuan', 'Ringkasan status + cara mengulang tutorial dan menghubungi support.'],
];

export class GuidebookGenerator extends BaseGenerator {
  build() {
    return { 'guidebook/guidebook.html': this.render('guidebook.html', this.context(), { escape: 'html' }) };
  }

  context() {
    const chapters = [
      { key: 'intro', title: `Pengenalan ${this.productName}` },
      { key: 'install', title: 'Install & halaman pertama' },
      { key: 'tutorial', title: 'Tutorial bernomor' },
      { key: 'ai', title: 'Setup AI multi-provider & file .env' },
      { key: 'recipes', title: 'Resep otomasi per sektor' },
      { key: 'trouble', title: 'Troubleshooting & FAQ' },
      { key: 'license', title: 'Kode lisensi & hak Anda' },
    ];
    const num = (key) => chapters.findIndex((c) => c.key === key) + 1;
    const steps = this.tutorialSteps();
    const providers = this.base().providers.map((p) => ({
      ...p,
      envCell: p.needsKey ? `${p.keyEnv}${p.model ? ` · ${p.name.toUpperCase()}_MODEL` : ''}` : 'tanpa kunci API',
      urlCell: [p.baseUrl, p.model].filter(Boolean).join(' · ') || '—',
    }));
    return {
      ...this.base(),
      chapters,
      aiChapter: num('ai'),
      recipeChapter: num('recipes'),
      troubleChapter: num('trouble'),
      licenseChapter: num('license'),
      stepTotal: String(steps.length),
      tutorialSteps: steps,
      installSteps: this.installSteps(),
      boundaries: this.boundaries(),
      providers,
      troubleshooting: this.troubleshooting(),
      editions: this.base().editions.map((e) => ({ ...e, itemsText: e.features.map((f) => f.label).join('; ') })),
      licenseSeats: this.licenseSeats,
      licenseExpiryText: this.licenseExpiryText,
    };
  }

  tutorialSteps() {
    const fromConfig = this.config.data.guideSteps;
    const source = fromConfig.length ? fromConfig : FALLBACK_STEPS.map(([title, desc]) => ({ title, desc }));
    return source.map((s) => ({ title: s.title, desc: s.desc }));
  }

  /** Batasan etis/teknis — penting agar janji di buku sama dengan produk. */
  boundaries() {
    return [
      'Tidak menembus login, CAPTCHA, paywall, atau DRM — yang dikerjakan hanya apa yang tampil di sesi Anda sendiri.',
      'Tidak menyimpan password situs; kunci API dan data tinggal terenkripsi di perangkat Anda.',
      'Tidak mengirim data ke mana pun tanpa aksi eksplisit Anda (tidak ada telemetry diam-diam).',
      'Otomasi tetap tunduk pada ketentuan situs target — jeda manusiawi dan auto-pause saat situs menolak.',
      'Konten berhak cipta hasil panen menjadi tanggung jawab pengguna saat dibagikan ulang.',
    ];
  }

  troubleshooting() {
    const name = this.productName;
    return [
      { symptom: 'Kode lisensi ditolak', fix: `Tempel ulang tanpa spasi; cek edition mana yang Anda beli; pastikan versi ${name} terbaru. Kode diverifikasi offline — kalau masih gagal, kirim 12 karakter pertama kode ke support.` },
      { symptom: 'Panel tidak muncul di halaman', fix: 'Klik ikon produk di toolbar lalu tekan shortcut panel. Bila tetap kosong, muat ulang halaman (panel diinjeksikan saat halaman siap).' },
      { symptom: 'Job berhenti di tengah jalan', fix: 'Buka log job: biasanya situs memberi batas akses atau struktur halaman berubah. Naikkan jeda antar langkah di Settings, perbaiki selector, lalu jalankan ulang dari langkah terakhir.' },
      { symptom: 'AI menjawab lambat / error', fix: 'Uji koneksi per provider di Settings; aktifkan fallback chain; untuk data sensitif pindahkan ke AI lokal.' },
      { symptom: 'Hasil panen duplikat atau kurang', fix: 'Periksa filter ukuran/ekstensi dan batas jumlah item per job di Settings, jalankan ulang dengan filter lebih longgar.' },
      { symptom: 'Ganti perangkat', fix: 'Lepas lisensi dari perangkat lama (transfer seat), lalu aktifkan kode yang sama di perangkat baru. Settings bisa di-export/import sebagai JSON.' },
    ];
  }
}
