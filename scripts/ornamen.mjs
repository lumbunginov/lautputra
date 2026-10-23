// Ubah hasil generate (.gen/*.png, tinta gelap di atas kertas putih) menjadi mask WebP. Kekentalan tinta = alpha atau luminansi (lihat mode).
// Warna akhir ditentukan CSS/SVG lewat mask, jadi ikut tema. Jalankan: node scripts/ornamen.mjs
//  - mode 'alpha': tinta jadi hitam + alpha (ornamen lama; CSS-nya bergantung pada alpha).
//  - mode 'luminance': WebP abu-abu tanpa alpha, putih = tinta, hitam = kertas (rig, dinding); dipakai sebagai
//    luminance mask (SVG <mask>, CSS mask-mode: luminance). Jauh lebih kecil daripada kanal alpha untuk garis halus berlapis.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// `from` boleh path PNG (relatif root) atau buffer gambar. Kertas (terang) jadi 0, tinta (gelap) jadi pekat (255).
async function maskWebp(from, to, { width, mode = 'alpha', quality = 82 }) {
  const src = typeof from === 'string' ? path.join(root, from) : from;
  const { data, info } = await sharp(src).resize({ width }).greyscale().raw().toBuffer({ resolveWithObject: true });
  // Ambang lembut supaya tepi garis tetap halus.
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i++) {
    const v = data[i];
    alpha[i] = v > 225 ? 0 : v < 80 ? 255 : Math.round((225 - v) / 145 * 255);
  }
  const dest = path.join(root, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const pipeline = mode === 'luminance'
    ? sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    : sharp(Buffer.alloc(info.width * info.height * 3, 0), { raw: { width: info.width, height: info.height, channels: 3 } })
        .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } });
  const out = await pipeline.webp(mode === 'luminance' ? { quality, effort: 6 } : { quality: 82, alphaQuality: 90, effort: 6 }).toFile(dest);
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

// nama: lebar keluaran (px); tinggi mengikuti rasio sumber. Ruang koordinat rig = ukuran PNG sumber.
const rig = { kepala: 260, badan: 240, karabiner: 100,
  'lengan-atas-kiri': 400, 'lengan-atas-kanan': 400, 'lengan-bawah-kiri': 400, 'lengan-bawah-kanan': 400,
  'paha-kiri': 200, 'paha-kanan': 200, 'betis-kiri': 250, 'betis-kanan': 250 };

await maskWebp('.gen/topo.png', 'src/assets/img/ornamen-topo.webp', { width: 1400 });
await maskWebp('.gen/emblem.png', 'src/assets/img/ornamen-emblem.webp', { width: 900 });
for (const [nama, width] of Object.entries(rig)) {
  await maskWebp(`.gen/rig/${nama}.png`, `src/assets/img/rig/${nama}.webp`, { width, mode: 'luminance' });
}
// Dinding: quality 82; bila > 300 KB turunkan hanya untuk dinding (78 -> 74 -> 70), berhenti di nilai pertama yang muat.
const tile = await tileDinding('.gen/dinding-turun-v2.png', { width: 752, height: 1536 });
for (const quality of [82, 78, 74, 70]) {
  const size = await maskWebp(tile, 'src/assets/img/dinding-turun.webp', { width: 480, mode: 'luminance', quality });
  if (size <= 300 * 1024) break;
}
