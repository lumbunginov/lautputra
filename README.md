# lautputra.com — Wisata Umbul Waru

Situs statis satu halaman (HTML/CSS/JS, tanpa database). Sumber desain: kanvas Claude Design "Umbul Waru".

## Struktur

```
src/        sumber yang diedit (index.html, assets/css, assets/js, assets/img, .htaccess, robots.txt, sitemap.xml)
scripts/    build.mjs
dist/       hasil build, ini yang diunggah ke hosting (jangan diedit manual)
```

## Pengembangan lokal (WAMP)

1. Nyalakan WAMP, lalu buka http://localhost/lautputra/ (otomatis diarahkan ke `src/`).
2. Edit file di `src/`, lalu refresh browser.

## Desain dan gerak

- Ide visual: halaman adalah satu perjalanan **turun** dari bayang tebing (babak gelap "laut") ke pasir terang (babak "pantai": rute, paket, pemesanan), lalu senja di laut (galeri sampai penutup). Nav dan rel samping ikut berganti warna saat babak pantai memenuhi layar.
- Arah desain: Hallmark (genre atmospheric, macrostructure Photographic) + build-awwwards-quality-sites. Token warna/font/spasi di `src/assets/css/tokens.css`; riwayat pilihan desain di `.hallmark/log.json`.
- Font: Bricolage Grotesque (display, memakai sumbu lebar 75–100 untuk judul condensed), Instrument Serif italic (aksen), Plus Jakarta Sans (teks). Disimpan lokal di `src/assets/fonts/`; untuk mengganti: ubah URL di `scripts/fetch-fonts.mjs`, lalu `node scripts/fetch-fonts.mjs`.
- Gerak: GSAP 3.13 + ScrollTrigger, Lenis 1.3.4 sebagai satu-satunya smooth scroll (library di `src/assets/vendor/`, tanpa CDN). Koreografi: intro hero, judul muncul per kata, bagian "Turun" sebagai adegan close-up (panel dipin satu layar penuh: figur boneka 11 potongan dari `gpt-image-2.5-sunburst` lewat 9Router menuruni dinding travertin miring −9°, air mengalir di dinding, satu tali dari atas lewat genggaman dan karabiner sampai keluar kotak, foto latar berganti per stasiun, meteran sampai 30 m yang baru naik setelah tengah stasiun 02, pose kaki dan lengan mengikuti kecepatan gulir; ponsel memakai komposisi sama dengan figur 62svh dan teks di bawah; tanpa JS atau saat `prefers-reduced-motion` dinding dan figur tampil statis lalu empat stasiun ditumpuk), galeri horizontal dipin dengan parallax per foto, parallax foto lipatan/penutup, tombol magnet, ticker, hitung-naik harga. Semua dilewati saat `prefers-reduced-motion`.
- Foto hero tanpa efek WebGL (dihapus supaya ringan); yang tersisa hanya intro GSAP dan geseran halus mengikuti kursor.
- Ornamen (`src/assets/img/ornamen-topo.webp`, `ornamen-emblem.webp`): gambar generatif (OpenAI gpt-image-1 lewat gateway lokal 9Router), diubah jadi mask transparan oleh `scripts/ornamen.mjs` dari `.gen/*.png`. Warna ornamen mengikuti token `--color-ornamen`. Bukan foto lokasi; hanya hiasan peta kontur dan emblem cukil. Rig figur Turun (11 WebP di `src/assets/img/rig/`) dan tile dinding (`src/assets/img/dinding-turun.webp`) dibuat dengan cara yang sama oleh `scripts/ornamen.mjs` dari `.gen/rig/` dan `.gen/dinding-turun-v2.png`, berupa WebP abu-abu tanpa alpha yang dipakai sebagai mask luminance; ukurannya (rig <= 250 KB, dinding <= 450 KB, total <= 600 KB) dan keidentikan byte hasil build diperiksa `node scripts/check-turun-aset.mjs` (tambahkan `--dist` setelah `npm run build`).

## Build

```
npm install      # sekali saja
npm run build
```

Build akan melakukan:
- minify CSS, JS, dan HTML (library vendor disalin apa adanya)
- kompres foto (lebar maks 1000 px, mozjpeg)
- membuat `og-image.jpg` 1200x630 untuk pratinjau media sosial
- menambahkan `?v=hash` pada CSS/JS agar cache browser selalu mengambil versi baru

Cek hasil build di http://localhost/lautputra/dist/.

## Unggah ke shared hosting

Unggah **seluruh isi** `dist/` ke `public_html/` lewat File Manager cPanel atau FTP, termasuk `.htaccess` (file tersembunyi).
Setelah SSL aktif, buka komentar blok "Paksa HTTPS" di `src/.htaccess`, lalu build dan unggah ulang.

## Data yang perlu dicek sebelum tayang

- Nomor WhatsApp operator: `WA` di `src/assets/js/main.js` dan teks di `src/index.html`.
- Harga canyoneering (Rp300.000) di `PRICES` pada `main.js` dan di kartu paket.
- Izin tayang foto: semua foto memperlihatkan wajah peserta.
- Klaim "Pernah diliput Kompas TV, JawaPos, Jatim TIMES, IDN Times" (ticker di bawah hero) berasal dari desain awal; pastikan liputannya ada.
