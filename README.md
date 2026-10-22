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

## Build

```
npm install      # sekali saja
npm run build
```

Build akan melakukan:
- minify CSS, JS, dan HTML
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
