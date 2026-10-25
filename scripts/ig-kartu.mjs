// Susun ulang markup kartu IG di adegan Turun (<ul id="igRel"> di src/index.html) dari src/assets/img/ig/meta.json.
// Jalankan: node scripts/ig-kartu.mjs
// meta.json: [{ id, st: "Atas"|"Tengah"|"Bawah", type: "img"|"vid", cap, w, h, user?, url? }]
//   user = username IG pengunggah (tanpa @); url = tautan post. Tanpa user: pil tampil "@username" bergaris putus (ig__akun--tbd).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metaFile = path.join(root, 'src/assets/img/ig/meta.json');
const htmlFile = path.join(root, 'src/index.html');
const ST = { Atas: 0, Tengah: 1, Bawah: 2 };
const IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Caption dari nama file: buang penanda duplikat "(1)", SEMUA hashtag (permintaan pengguna), dan nama acak; perbaiki emoji ZWJ yang rusak
function caption(c) {
  c = c.replace(/\s*\(\d\)$/, '');
  if (/^AQO85/.test(c)) return '';
  c = c.replace('_♀', '‍♀');
  return c.replace(/#\S*/g, '').replace(/\s{2,}/g, ' ').trim();
}

const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
const kartu = meta.map((m) => {
  const cap = caption(m.cap);
  const akun = m.user
    ? `<a class="ig__akun" href="${esc(m.url || 'https://www.instagram.com/' + m.user + '/')}" target="_blank" rel="noopener" aria-label="Buka unggahan @${esc(m.user)} di Instagram">${IG}@${esc(m.user)}</a>`
    : `<span class="ig__akun ig__akun--tbd">${IG}@username</span>`;
  const media = m.type === 'img'
    ? `<img src="assets/img/ig/${m.id}.webp" alt="" width="${m.w}" height="${m.h}" loading="lazy" decoding="async">`
    : `<video src="assets/img/ig/${m.id}.mp4" poster="assets/img/ig/${m.id}.webp" width="${m.w}" height="${m.h}" muted loop playsinline preload="none" controls></video><span class="ig__vid">Video</span>`;
  return `      <li class="ig__kartu" data-st="${ST[m.st]}">${media}${akun}${cap ? `<p class="ig__cap">${esc(cap)}</p>` : ''}</li>`;
});

const html = fs.readFileSync(htmlFile, 'utf8');
const awal = html.indexOf('<ul class="ig__rel" id="igRel">') + '<ul class="ig__rel" id="igRel">'.length;
const akhir = html.indexOf('      </ul>', awal);
if (awal < 40 || akhir < 0) throw new Error('penanda #igRel tidak ditemukan di index.html');
fs.writeFileSync(htmlFile, html.slice(0, awal) + '\n' + kartu.join('\n') + '\n' + html.slice(akhir));
const ada = meta.filter((m) => m.user).length;
console.log(`${kartu.length} kartu ditulis, ${ada} dengan username, ${kartu.length - ada} masih placeholder`);
