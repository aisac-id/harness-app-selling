#!/usr/bin/env node
/**
 * cli.js — entry tipis Harness Selling Kit Factory.
 *
 * Pemakaian:
 *   node factory/cli.js <product.json> <folder-output> [pilihan]
 *
 * Pilihan:
 *   --keys=N        jumlah kode lisensi yang diterbitkan (default dari config: 5)
 *   --seats=N       jumlah perangkat per kode
 *   --expiry=TANGGAL batas lisensi (YYYY-MM-DD); kosong = selamanya
 *   --new-keys      paksa keypair Ed25519 baru (default: pakai yang ada di output)
 *   --yes           jangan tanya konfirmasi saat menimpa private key
 *   --templates=DIR pakai folder template lain
 *   --quiet         cetak ringkasan minimal
 *   --debug         tampilkan stack trace error
 *   -h, --help      bantu
 *
 * Hanya memakai modul bawaan Node.js (fs, path, crypto, readline) >= 18.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin } from 'node:process';

import { KitGenerator } from './KitGenerator.js';
import { ConfigError } from './ProductConfig.js';

const USAGE = [
  'Harness Selling Kit Factory — satu product.json -> satu paket jualan lengkap.',
  '',
  'Pemakaian:',
  '  node factory/cli.js <product.json> <folder-output> [pilihan]',
  '',
  'Contoh:',
  '  node factory/cli.js examples/harness-extension/product.json out/harness-extension',
  '',
  'Pilihan: --keys=N --seats=N --expiry=YYYY-MM-DD --new-keys --yes --templates=DIR --quiet --debug',
  'Bantuan lengkap ada di README.md repo ini.',
].join('\n');

export class Cli {
  static parse(argv) {
    const args = { positional: [], options: {}, flags: new Set() };
    for (const token of argv) {
      if (token === '-h' || token === '--help') args.flags.add('help');
      else if (token === '--new-keys' || token === '--yes' || token === '--quiet' || token === '--debug') args.flags.add(token.slice(2));
      else if (token.startsWith('--')) {
        const eq = token.indexOf('=');
        if (eq < 0) args.flags.add(token.slice(2));
        else args.options[token.slice(2, eq)] = token.slice(eq + 1);
      } else args.positional.push(token);
    }
    return args;
  }

  static toRunOptions(args) {
    const num = (key) => (args.options[key] === undefined ? undefined : Number(args.options[key]));
    for (const key of ['keys', 'seats']) {
      const v = num(key);
      if (v !== undefined && (!Number.isInteger(v) || v < 1)) {
        throw new Error(`Pilihan --${key} harus angka bulat >= 1 (dapat "${args.options[key]}").`);
      }
    }
    if (args.options.expiry !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(args.options.expiry)) {
      throw new Error(`Pilihan --expiry harus tanggal format YYYY-MM-DD (dapat "${args.options.expiry}").`);
    }
    return {
      keys: num('keys'),
      seats: num('seats'),
      expiry: args.options.expiry,
      newKeys: args.flags.has('new-keys'),
      templatesDir: args.options.templates,
    };
  }

  /** Minta izin sebelum menimpa private key yang mungkin masih dipakai kode beredar. */
  static async confirmOverwriteKey(outDir, flags) {
    const priv = join(outDir, 'license', 'private_key.pem');
    if (!flags.has('new-keys') || !existsSync(priv) || flags.has('yes')) return;
    if (!stdin.isTTY) {
      throw new Error(`${priv} sudah ada. Tambahkan --yes bila Anda yakin ingin menimpanya dengan keypair baru.`);
    }
    const rl = createInterface({ input: stdin, output: process.stdout });
    const answer = await rl.question(
      `${priv} sudah ada.\n` +
      'Kunci baru membuat kode lama yang sudah beredar tidak lagi bisa diverifikasi.\n' +
      'Ketik YA untuk tetap lanjut: '
    );
    rl.close();
    if (answer.trim().toUpperCase() !== 'YA') throw new Error('Dibatalkan user — private key lama tidak jadi ditimpa.');
  }

  static async main(argv = process.argv.slice(2)) {
    const args = Cli.parse(argv);
    if (args.flags.has('help') || args.positional.length < 2) {
      console.log(USAGE);
      return args.flags.has('help') ? 0 : 2;
    }
    if (args.positional.length > 2) {
      throw new Error(`Argumen posisi berlebihan: ${args.positional.slice(2).join(' ')} (yang diterima: product.json dan folder output).`);
    }
    const options = Cli.toRunOptions(args);
    await Cli.confirmOverwriteKey(args.positional[1], args.flags);
    const gen = new KitGenerator({
      configPath: args.positional[0],
      outDir: args.positional[1],
      options,
      log: args.flags.has('quiet') ? (msg) => { if (/^(===|Output|Ukuran|Lisensi|  \d+ kode)/.test(msg)) console.log(msg); } : undefined,
    });
    await gen.run();
    return 0;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.js')) {
  Cli.main().then((code) => process.exit(code)).catch((err) => {
    const debug = process.argv.includes('--debug');
    const title = err instanceof ConfigError ? 'Konfigurasi produk tidak valid' : 'Factory berhenti karena error';
    console.error(`\n[${title}] ${err.message}`);
    if (debug) console.error(err.stack);
    else console.error('\nJalankan ulang dengan --debug untuk melihat stack trace.');
    process.exit(1);
  });
}
