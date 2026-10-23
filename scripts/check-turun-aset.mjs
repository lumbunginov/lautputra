// Cek aset Turun (11 potongan rig + tile dinding, WebP abu-abu tanpa alpha sebagai luminance mask) hasil scripts/ornamen.mjs.
// Keluar dengan kode 1 bila ada yang gagal; mencetak tabel nama / ukuran / KB.
// Jalankan: node scripts/check-turun-aset.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// nama: [lebar batas, lebar sumber, tinggi sumber]
const RIG = { kepala: [260, 320, 510], badan: [400, 572, 1137], karabiner: [160, 834, 1437],
  'lengan-atas-kiri': [640, 1017, 441], 'lengan-atas-kanan': [640, 1017, 440],
  'lengan-bawah-kiri': [640, 944, 277], 'lengan-bawah-kanan': [640, 941, 259],
  'paha-kiri': [320, 450, 1000], 'paha-kanan': [320, 450, 1000], 'betis-kiri': [200, 250, 400], 'betis-kanan': [200, 250, 400] };
const BATAS_RIG_KB = 250;
const BATAS_DINDING_KB = 300;

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
  cek(info.width === 640, `${dinding}: lebar ${info.width}, harapan 640`);
  cek(Math.abs(info.height - 2614) <= 1, `${dinding}: tinggi ${info.height}, harapan 2614 ±1`);
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
}

console.log('nama'.padEnd(22) + 'ukuran'.padEnd(12) + 'KB');
for (const [n, u, k] of baris) console.log(n.padEnd(22) + u.padEnd(12) + k);
if (gagal.length) {
  console.error('\nGAGAL:');
  for (const g of gagal) console.error('- ' + g);
  process.exit(1);
}
console.log('\nsemua cek lolos');
