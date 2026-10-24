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
4. **Cache:** browser Playwright menyimpan cache HTML/JS/CSS dari server ini, jadi setelah mengedit file halaman bisa tampil versi lama. Sebelum verifikasi, matikan cache:
   `const cdp = await page.context().newCDPSession(page); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });`
5. Menuju kedalaman tertentu di adegan Turun: gulir sampai `#turunPanel` top ≤ 1, lalu langkah kecil (`wheel(0, 30)`, jeda 120 ms) sambil membaca `parseInt(#turunMeter.textContent)`. Progres dihaluskan, jadi meteran bisa kebablasan beberapa meter; mundur dengan wheel negatif.
6. Efek sesaat (kilat, partikel): pantau atribut lewat `requestAnimationFrame` di `page.evaluate`, lalu `gsap.ticker.sleep()` untuk membekukan frame, ambil screenshot, dan `gsap.ticker.wake()`. Screenshot di mesin ini lambat (±12 dtk), jadi tidak bisa menangkap efek <1 dtk tanpa dibekukan.
7. Cek `pageerror` di setiap uji, di desktop dan ponsel. `?debug` di URL membuka `window.__turun` (state adegan).
8. Kalau animasi tampak macet atau meteran tidak bergerak, ukur fps dengan rAF. Jendela browser Playwright yang tertutup jendela lain bisa turun ke ±3 fps; perbaiki dengan `await page.bringToFront()` plus CDP `Emulation.setFocusEmulationEnabled({ enabled: true })`. Cek juga `window.__turun.vis`: loop berhenti menulis DOM begitu bagian Turun keluar layar, jadi gulir yang terlalu jauh melewati bagian ini membuat keadaan drone/figur tampak beku.

## Git

- Folder `referensi/` (gambar acuan milik pengguna) jangan pernah di-commit. `.gen/` (hasil generate) dan `.playwright-mcp/` sudah di-ignore.
- Alur yang dipakai pengguna:
  - "commit perubahannya": buat branch baru, lalu commit dengan pesan berbahasa Indonesia berawalan area (mis. `Turun: ...`).
  - "merge ke main": `git merge --ff-only`, lalu hapus branch.
  - "push": `git push origin main`.

## Adegan Turun (rappelling), `turunCloseup()` di `src/assets/js/main.js`

- Satu loop `gsap.ticker` membaca progres pin ScrollTrigger (`S.p`). Kedalaman `kd = max(0, (S.p - 1/3) / (2/3)) * 30` m, sama dengan meteran.
- Figur = SVG `#turunFigur` (viewBox `-230 -330 740 1760`). Potongan rig = gambar mask luminance (`.webp` putih di atas hitam) dalam `<mask>` + `<rect fill="currentColor">`; warnanya dari token `--color-ornamen`.
  - Sendi diatur atribut `data-j`/`data-p`/`data-s`, lalu `pose(el, sudut)`.
  - Kaki memakai IK dua tulang (`ik()`), berjalan menempel di garis dinding miring 9° (`langkah()`).
  - Postur mengikuti kecuraman virtual (`curam()`/`postur()`). Tebingnya tidak diputar; yang berubah posisi orangnya (keputusan pengguna).
- Pose ikonik (tergantung terbalik): bobot `w` naik di 12–15 m, bertahan sampai 18 m, turun di 18–21 m (`IKON`). Tali (`#turunTali`) dibaur antara jalur biasa dan jalur pose.
- Drone pemotret (`DRONE`, `droneTick()`):
  - masuk dari kiri di 12,5–15 m;
  - kilat 2× di detik 0,6 dan 1,1 setelah tiba (`nyalakan()`, lapisan `.turun__kilat`). Begitu tiba, drone menahan posisi sampai kilat selesai walau digulir cepat, lalu menyusul pergi (`DRONE.tahan`/`susul`). Pembatas kecepatan gulir sengaja tidak dipakai karena terasa macet;
  - pergi di 18–20,5 m.
  - Posisinya dihitung dalam px layar lalu dikonversi ke viewBox lewat `fig.getScreenCTM()`. Grup `#drone` ada di SVG sebelum tali/rig, jadi tampil di belakang orang.

## Generate aset gambar

- **Wajib:** tunjukkan setiap hasil generate ke pengguna (kandidat, gambar referensi, prompt) dan tunggu penilaiannya sebelum diproses. Buat lembar perbandingan (PIL) di `.gen/` berisi kandidat dan pratinjau mask emas di latar gelap.
- Gateway 9Router lokal: `http://localhost:20128/v1/images/generations?response_format=binary`.
  - Kunci diambil dari sqlite `C:/Users/wilda/AppData/Roaming/9router/db/data.sqlite` (`select key from apiKeys where isActive=1`), jangan ditampilkan.
  - Model pilihan pengguna: `openai/gpt-image-2.5-sunburst`. Body: `{"model","prompt","size":"1536x1024"|"1024x1536","quality":"low","images":[dataURL jpeg ≤1024 px,...]}`.
  - Satu gambar butuh ±60–90 dtk. Jalankan 2 kandidat paralel di background.
- Acuan gaya: `referensi/Figur berdiri (generate).png`. Kalimat gaya yang berhasil: "fine ink contour-line drawing, dark sepia ink on plain cream paper, every form built only from thin flowing parallel contour lines … like a topographic map, no solid fills". Tambahkan "uniform cream paper, no gradient, no glow, no text".
- Img2img "gambar ulang persis, ubah satu hal" **tidak** mempertahankan bentuk; model selalu menggambar ulang seluruh objek. Untuk membuang bagian (mis. baling-baling), edit pikselnya dengan skrip PIL (isi warna kertas, lindungi area penting).
- Mask emas dari gambar sepia: luminance v → `v > 225 ? 0 : v < 80 ? 255 : (225 - v) / 145 * 255`, crop ke bbox, simpan `.webp` RGB di `src/assets/img/`.
- Python: skrip yang memakai Pillow jalankan **tanpa** `-I` (Pillow ada di site-packages pengguna). Skrip Python panjang tulis ke file di scratchpad, jangan lewat heredoc Bash (sering "unexpected EOF").
