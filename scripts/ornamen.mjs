// Ubah hasil generate (.gen/*.png, tinta gelap di atas kertas putih) menjadi WebP transparan:
// warna piksel = hitam, alpha = kepekatan tinta. Di CSS dipakai sebagai mask-image, jadi warnanya ikut tema.
// Jalankan: node scripts/ornamen.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jobs = [
  ['.gen/topo.png', 'src/assets/img/ornamen-topo.webp', 1400],
  ['.gen/emblem.png', 'src/assets/img/ornamen-emblem.webp', 900]
];

for (const [from, to, width] of jobs) {
  const { data, info } = await sharp(path.join(root, from)).resize({ width }).greyscale().raw().toBuffer({ resolveWithObject: true });
  // Kertas (terang) jadi transparan; tinta (gelap) jadi pekat. Ambang lembut supaya tepi garis tetap halus.
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i++) {
    const v = data[i];
    const a = v > 225 ? 0 : v < 80 ? 255 : Math.round((225 - v) / 145 * 255);
    alpha[i] = a;
  }
  const out = await sharp(Buffer.alloc(info.width * info.height * 3, 0), { raw: { width: info.width, height: info.height, channels: 3 } })
    .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(path.join(root, to));
  console.log(`${to}  ${info.width}x${info.height}  ${(out.size / 1024).toFixed(1)} KB`);
}
