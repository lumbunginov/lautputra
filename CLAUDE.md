# CLAUDE.md

## Server lokal

Situs dilayani server statis dari `src/` di port 8010 (jangan nyalakan WAMP):

```
python -I -m http.server 8010 --directory src --bind 127.0.0.1
```

## Screenshot browser: buka `http://127.0.0.1:8010/`, JANGAN `http://localhost:8010/`

Browser Playwright MCP menyimpan zoom 200% khusus untuk host `localhost` (zoom per-host tersimpan di profil browser, ikut ke context baru). Akibatnya di `localhost:8010`:

- `devicePixelRatio` = 2 dan `innerWidth` hanya setengah lebar jendela, jadi halaman jatuh ke mode ponsel (<64rem) walau jendelanya 1440 px.
- Setelah halaman digulir (sekitar >1000 px), `page.screenshot()` selalu menghasilkan warna latar polos (oklch 0.15, gelap). Isi halaman tidak ikut terekam, bahkan elemen `position:fixed` ber-z-index maksimum pun tidak.

Ini **bukan bug kode situs**. Halaman HTML paling sederhana yang dilayani dari `localhost:8010` mengalami hal yang sama, sedangkan `127.0.0.1:8010`, data URL, dan `setContent` normal (dpr 1, screenshot setelah gulir benar). Jangan menghabiskan waktu men-debug CSS/JS kalau screenshot hasil gulir kosong. Cek dulu `location.host` dan `devicePixelRatio`.

Cara mengambil screenshot bagian bawah halaman (Lenis + ScrollTrigger aktif):

1. `browser_navigate` ke `http://127.0.0.1:8010/`, lalu `page.setViewportSize({ width: 1440, height: 900 })` (ponsel: 390×844).
2. Gulir dengan `page.mouse.wheel(0, 200)` berulang, jeda ~40 ms, lalu tunggu ~1,5 s sebelum `page.screenshot()`. `window.scrollTo` saja tidak menggerakkan pin/scrub GSAP dengan wajar.
3. Simpan file di `.playwright-mcp/` (folder lain, termasuk scratchpad, ditolak MCP), lalu buka dengan Read untuk melihat gambarnya.
