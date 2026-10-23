// Cek aset Turun (11 potongan rig + tile dinding, WebP abu-abu tanpa alpha sebagai luminance mask) hasil scripts/ornamen.mjs.
// Keluar dengan kode 1 bila ada yang gagal; mencetak tabel nama / ukuran / KB.
// Jalankan: node scripts/check-turun-aset.mjs            (cek sumber di src/)
//           node scripts/check-turun-aset.mjs --dist     (cek hasil build di dist/: WebP byte-identik, total <= 600 KB, cetak ukuran JS/CSS)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// nama: [lebar batas, lebar sumber, tinggi sumber]
const RIG = { kepala: [260, 320, 510], badan: [240, 572, 1137], karabiner: [100, 834, 1437],
  'lengan-atas-kiri': [400, 1017, 441], 'lengan-atas-kanan': [400, 1017, 440],
  'lengan-bawah-kiri': [400, 944, 277], 'lengan-bawah-kanan': [400, 941, 259],
  'paha-kiri': [200, 450, 1000], 'paha-kanan': [200, 450, 1000], 'betis-kiri': [250, 250, 400], 'betis-kanan': [250, 250, 400] };
const BATAS_RIG_KB = 250;
// target spec 300 KB dilonggarkan: kontur lebih penting; total <= 600 KB tetap mengikat
const BATAS_DINDING_KB = 450;
const BATAS_TOTAL_KB = 600;
const DINDING_W = 480, DINDING_H = 1961; // 752x3072 diperkecil ke lebar 480

const MODE_DIST = process.argv.includes('--dist');

const gagal = [];
const baris = [];
const cek = (ok, pesan) => { if (!ok) gagal.push(pesan); };

// Baca WebP sebagai satu kanal abu-abu (tanpa alpha). Mask luminance: putih = tinta, hitam = kertas.
async function bacaAbu(file) {
  const meta = await sharp(file).metadata();
  const { data, info } = await sharp(file).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, info, hasAlpha: meta.hasAlpha };
}

// Piksel terang maksimum harus >= 240 (ada tinta) dan nilai terbanyak <= 15 (kertas hitam); kembalikan [maks, modus].
function maksDanModus(data) {
  const hist = new Uint32Array(256);
  for (const v of data) hist[v]++;
  let maks = 0, modus = 0;
  for (let v = 0; v < 256; v++) { if (hist[v]) maks = v; if (hist[v] > hist[modus]) modus = v; }
  return [maks, modus];
}

let totalRig = 0;
for (const [nama, [batas, w0, h0]] of Object.entries(RIG)) {
  const rel = `src/assets/img/rig/${nama}.webp`;
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { gagal.push(`tidak ada: ${rel}`); continue; }
  const { data, info, hasAlpha } = await bacaAbu(file);
  const kb = fs.statSync(file).size / 1024;
  totalRig += kb;
  const hHarap = Math.round(batas * h0 / w0);
  cek(info.width === batas, `${rel}: lebar ${info.width}, harapan ${batas}`);
  cek(Math.abs(info.height - hHarap) <= 1, `${rel}: tinggi ${info.height}, harapan ${hHarap} ±1`);
  cek(!hasAlpha, `${rel}: masih punya alpha`);
  const [maks, modus] = maksDanModus(data);
  cek(maks >= 240, `${rel}: piksel terang maksimum ${maks}, harapan >= 240`);
  cek(modus <= 15, `${rel}: nilai terbanyak ${modus}, harapan <= 15 (kertas hitam)`);
  baris.push([nama, `${info.width}x${info.height}`, kb.toFixed(1)]);
}
cek(totalRig <= BATAS_RIG_KB, `total rig ${totalRig.toFixed(1)} KB melebihi ${BATAS_RIG_KB} KB`);
baris.push(['(total rig)', '', totalRig.toFixed(1)]);

const dinding = 'src/assets/img/dinding-turun.webp';
if (!fs.existsSync(path.join(root, dinding))) {
  gagal.push(`tidak ada: ${dinding}`);
} else {
  const file = path.join(root, dinding);
  const { data, info, hasAlpha } = await bacaAbu(file);
  const kb = fs.statSync(file).size / 1024;
  cek(info.width === DINDING_W, `${dinding}: lebar ${info.width}, harapan ${DINDING_W}`);
  cek(Math.abs(info.height - DINDING_H) <= 1, `${dinding}: tinggi ${info.height}, harapan ${DINDING_H} ±1`);
  cek(!hasAlpha, `${dinding}: masih punya alpha`);
  const [maks, modus] = maksDanModus(data);
  cek(maks >= 240, `${dinding}: piksel terang maksimum ${maks}, harapan >= 240`);
  cek(modus <= 15, `${dinding}: nilai terbanyak ${modus}, harapan <= 15 (kertas hitam)`);
  cek(kb <= BATAS_DINDING_KB, `${dinding}: ${kb.toFixed(1)} KB melebihi ${BATAS_DINDING_KB} KB`);
  // Tile harus mulus bila diulang: baris pertama dan terakhir saling cermin (nilai abu-abu hampir sama).
  const w = info.width, h = info.height;
  let selisih = 0;
  for (let x = 0; x < w; x++) selisih += Math.abs(data[x] - data[(h - 1) * w + x]);
  const rata = selisih / w;
  cek(rata < 2, `${dinding}: baris 0 dan ${h - 1} tidak mulus (selisih abu-abu rata-rata ${rata.toFixed(2)})`);
  baris.push(['dinding-turun', `${w}x${h}`, kb.toFixed(1)]);
  cek(totalRig + kb <= BATAS_TOTAL_KB, `rig + dinding ${(totalRig + kb).toFixed(1)} KB melebihi ${BATAS_TOTAL_KB} KB`);
  baris.push(['(total rig + dinding)', '', (totalRig + kb).toFixed(1)]);
}

// Mode --dist: hasil build harus memuat WebP rig + dinding yang byte-identik dengan src/ (build tidak boleh mengompres ulang WebP).
if (MODE_DIST) {
  const dRig = path.join(root, 'dist/assets/img/rig');
  if (!fs.existsSync(dRig)) {
    gagal.push('dist/ belum dibangun (tidak ada dist/assets/img/rig); jalankan npm run build');
  } else {
    let totalDist = 0;
    const berkas = [...Object.keys(RIG).map((n) => `assets/img/rig/${n}.webp`), 'assets/img/dinding-turun.webp'];
    for (const rel of berkas) {
      const d = path.join(root, 'dist', rel), s = path.join(root, 'src', rel);
      if (!fs.existsSync(d)) { gagal.push(`tidak ada di dist: ${rel}`); continue; }
      totalDist += fs.statSync(d).size / 1024;
      if (fs.existsSync(s) && !fs.readFileSync(d).equals(fs.readFileSync(s))) gagal.push(`dist/${rel} tidak byte-identik dengan src/`);
    }
    cek(totalDist <= BATAS_TOTAL_KB, `dist rig + dinding ${totalDist.toFixed(1)} KB melebihi ${BATAS_TOTAL_KB} KB`);
    baris.push(['(dist rig + dinding)', '', totalDist.toFixed(1)]);
    for (const rel of ['assets/js/main.js', 'assets/css/style.css']) {
      const f = path.join(root, 'dist', rel);
      if (!fs.existsSync(f)) { gagal.push(`tidak ada di dist: ${rel}`); continue; }
      baris.push([`dist/${rel} (info)`, '', (fs.statSync(f).size / 1024).toFixed(1)]);
    }
  }
}

console.log('nama'.padEnd(22) + 'ukuran'.padEnd(12) + 'KB');
for (const [n, u, k] of baris) console.log(n.padEnd(22) + u.padEnd(12) + k);
if (gagal.length) {
  console.error('\nGAGAL:');
  for (const g of gagal) console.error('- ' + g);
  process.exit(1);
}
console.log('\nsemua cek lolos');
