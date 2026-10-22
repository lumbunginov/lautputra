// Build statis: src/ -> dist/. Hasil dist/ siap diunggah ke public_html di shared hosting.
import { rm, mkdir, cp, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { minify as minifyHtml } from 'html-minifier-terser';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });

// CSS dan JS: minify, lalu beri versi berdasarkan isi agar cache browser selalu benar
const versions = {};
const assets = [['assets/css/fonts.css', 'css'], ['assets/css/tokens.css', 'css'], ['assets/css/style.css', 'css'], ['assets/js/main.js', 'js']];
for (const [rel, loader] of assets) {
  const file = path.join(dist, rel);
  const input = await readFile(file, 'utf8');
  const { code } = await esbuild.transform(input, { loader, minify: true, ...(loader === 'js' ? { target: 'es2018' } : {}) });
  await writeFile(file, code);
  versions[rel] = hash(code);
  console.log(`${rel.padEnd(28)} ${kb(input.length)} -> ${kb(code.length)}`);
}

// Foto: kecilkan ukuran dan kompres ulang (mozjpeg)
const imgDir = path.join(dist, 'assets/img');
for (const name of await readdir(imgDir)) {
  if (!/\.jpe?g$/i.test(name)) continue;
  const file = path.join(imgDir, name);
  const input = await readFile(file);
  const out = await sharp(input).rotate().resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true, progressive: true }).toBuffer();
  await writeFile(file, out);
  console.log(`${('assets/img/' + name).padEnd(40)} ${kb(input.length)} -> ${kb(out.length)}`);
}

// Gambar pratinjau media sosial 1200x630 dari foto hero
await sharp(await readFile(path.join(src, 'assets/img/hero-canyoneering.jpg')))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(imgDir, 'og-image.jpg'));

// Library vendor sudah minified; cukup diberi versi
for (const rel of ['assets/vendor/gsap.min.js', 'assets/vendor/ScrollTrigger.min.js', 'assets/vendor/lenis.min.js']) versions[rel] = hash(await readFile(path.join(dist, rel)));

// HTML: pasang versi aset, lalu minify
const htmlFile = path.join(dist, 'index.html');
let html = await readFile(htmlFile, 'utf8');
for (const [rel, v] of Object.entries(versions)) html = html.replaceAll(`"${rel}"`, `"${rel}?v=${v}"`);
const before = html.length;
html = await minifyHtml(html, {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
  processScripts: ['application/ld+json'],
});
await writeFile(htmlFile, html);
console.log(`${'index.html'.padEnd(28)} ${kb(before)} -> ${kb(html.length)}`);
console.log('\nSelesai. Unggah seluruh isi folder dist/ (termasuk .htaccess) ke public_html.');
