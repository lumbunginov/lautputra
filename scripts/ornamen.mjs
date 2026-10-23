// Ubah hasil generate (.gen/*.png) menjadi WebP transparan: warna piksel = satu warna tinta, alpha = kepekatan tinta.
// Di CSS/JS dipakai sebagai mask-image, jadi warnanya ikut tema. Jalankan: node scripts/ornamen.mjs
//  - ink 'black': tinta gelap di atas kertas putih (ornamen, dinding); piksel keluaran hitam.
//  - ink 'white': potongan rig boneka; piksel keluaran putih, supaya bisa diwarnai lewat mask/filter.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// `from` boleh path PNG (relatif root) atau buffer gambar. Kertas (terang) jadi transparan, tinta (gelap) jadi pekat.
async function maskWebp(from, to, { width, ink = 'black', quality = 82, alphaQuality = 90 }) {
  const src = typeof from === 'string' ? path.join(root, from) : from;
  const { data, info } = await sharp(src).resize({ width }).greyscale().raw().toBuffer({ resolveWithObject: true });
  // Ambang lembut supaya tepi garis tetap halus.
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i++) {
    const v = data[i];
    alpha[i] = v > 225 ? 0 : v < 80 ? 255 : Math.round((225 - v) / 145 * 255);
  }
  const rgb = Buffer.alloc(info.width * info.height * 3, ink === 'white' ? 255 : 0);
  const dest = path.join(root, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const out = await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .webp({ quality, alphaQuality, effort: 6 })
    .toFile(dest);
  console.log(`${to}  ${info.width}x${info.height}  ${(out.size / 1024).toFixed(1)} KB`);
}

// Tile dinding: ambil bagian kiri strip, tempel cerminan vertikalnya di bawah, jadi bisa diulang tanpa sambungan terlihat.
async function tileDinding(from, { width, height }) {
  const atas = await sharp(path.join(root, from)).extract({ left: 0, top: 0, width, height }).png().toBuffer();
  const bawah = await sharp(atas).flip().png().toBuffer();
  return sharp({ create: { width, height: height * 2, channels: 3, background: '#ffffff' } })
    .composite([{ input: atas, top: 0, left: 0 }, { input: bawah, top: height, left: 0 }])
    .png().toBuffer();
}

// Anggaran ukuran (rig <= 250 KB, dinding <= 300 KB) hanya tercapai dengan alphaQuality rendah: RGB-nya konstan,
// jadi berat file hampir seluruhnya dari kanal alpha (garis halus berlapis), dan 'quality' tidak berpengaruh.
// nama: lebar keluaran (px); tinggi mengikuti rasio sumber. Ruang koordinat rig = ukuran PNG sumber.
const rig = { kepala: 260, badan: 400, karabiner: 160,
  'lengan-atas-kiri': 640, 'lengan-atas-kanan': 640, 'lengan-bawah-kiri': 640, 'lengan-bawah-kanan': 640,
  'paha-kiri': 320, 'paha-kanan': 320, 'betis-kiri': 200, 'betis-kanan': 200 };

await maskWebp('.gen/topo.png', 'src/assets/img/ornamen-topo.webp', { width: 1400, ink: 'black' });
await maskWebp('.gen/emblem.png', 'src/assets/img/ornamen-emblem.webp', { width: 900, ink: 'black' });
for (const [nama, width] of Object.entries(rig)) {
  await maskWebp(`.gen/rig/${nama}.png`, `src/assets/img/rig/${nama}.webp`, { width, ink: 'white', alphaQuality: 40 });
}
await maskWebp(await tileDinding('.gen/dinding-turun-v2.png', { width: 752, height: 1536 }), 'src/assets/img/dinding-turun.webp', { width: 640, ink: 'black', alphaQuality: 12 });
