// Unduh subset latin + latin-ext dari Google Fonts ke src/assets/fonts agar situs jalan tanpa internet.
// Jalankan ulang hanya bila daftar font berubah: node scripts/fetch-fonts.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/fonts');
const url = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Plus+Jakarta+Sans:wght@400;600&family=Instrument+Serif:ital@1&display=swap';
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

await mkdir(out, { recursive: true });
const css = await (await fetch(url, { headers: { 'user-agent': ua } })).text();
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[^}]+\})/g)].filter(m => m[1] === 'latin' || m[1] === 'latin-ext');
const seen = new Map();
let result = '';
for (const [, subset, block] of blocks) {
  const family = block.match(/font-family: '([^']+)'/)[1];
  const remote = block.match(/url\(([^)]+)\)/)[1];
  if (!seen.has(remote)) {
    const name = `${family.toLowerCase().replace(/\s+/g, '-')}-${subset}-${seen.size}.woff2`;
    await writeFile(path.join(out, name), Buffer.from(await (await fetch(remote)).arrayBuffer()));
    seen.set(remote, name);
  }
  result += `/* ${subset} */\n` + block.replace(remote, `../fonts/${seen.get(remote)}`) + '\n';
}
await writeFile(path.join(out, '../css/fonts.css'), result);
console.log(`${blocks.length} @font-face, ${seen.size} file woff2`);
