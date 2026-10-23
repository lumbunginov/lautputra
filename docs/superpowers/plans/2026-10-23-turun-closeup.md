# Bagian "Turun" close-up: rencana implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti bagian `#turun` di lautputra.com dengan adegan close-up: figur boneka 11 potongan yang menuruni dinding miring di samping air terjun, mengikuti gulir.

**Architecture:** Aset dibuat oleh pipeline `scripts/ornamen.mjs` (PNG di `.gen/` → WebP mask di `src/assets/img/`). Markup bagian diganti: foto latar, tiga lapis dinding (CSS mask, digerakkan `transform`), SVG rig (potongan = `<rect fill="currentColor">` yang di-mask gambar WebP, sehingga warna ikut token), satu `<path>` tali, HUD, dan teks stasiun. Satu loop di `gsap.ticker` membaca progres ScrollTrigger dan memosekan semuanya; `gsap.matchMedia` memisahkan desktop dan ponsel; tanpa JS atau `prefers-reduced-motion` komposisi statis + stasiun ditumpuk lewat CSS saja.

**Tech Stack:** HTML/CSS/JS statis, GSAP 3.13 + ScrollTrigger + Lenis 1.3.4 (sudah ada di `src/assets/vendor/`), sharp (pipeline), esbuild/html-minifier (build). Tanpa dependensi baru.

**Spec:** `docs/superpowers/specs/2026-10-22-turun-closeup-design.md` (acuan angka: `docs/superpowers/specs/2026-10-23-turun-spike-v16.html`).

## Global Constraints

- Tanpa library baru; hanya GSAP + ScrollTrigger + Lenis yang ada.
- Konvensi: `html.js` / `html.no-motion`; `prefers-reduced-motion` mematikan semua gerak; `gsap.matchMedia` desktop `(min-width: 64rem)` / ponsel `(max-width: 63.99rem)`; `refreshPriority` untuk bagian yang dipin; satu loop di `gsap.ticker`, dipasang di dalam `matchMedia` dan dicabut saat media berbalik.
- Warna hanya lewat token `src/assets/css/tokens.css` (`--color-ornamen`, `--color-accent`); tidak ada warna dibakar ke gambar yang tampil.
- Bahasa antarmuka dan komentar kode: Indonesia.
- `TINGGI_M = 30`; meteran `round(max(0, (p − 1/3) / (2/3)) × TINGGI_M)` m.
- Empat stasiun dan teksnya dipertahankan (judul dua baris persis seperti spec).
- Total aset baru bagian ini ≤ 600 KB; 11 WebP rig ≤ 250 KB; dinding ≤ 300 KB.
- Aset lewat pipeline (`scripts/ornamen.mjs`, `scripts/build.mjs`); PNG sumber di `.gen/rig/` dan `.gen/dinding-turun-v2.png` tidak digenerate ulang.
- Verifikasi tampilan lewat screenshot browser sungguhan (Playwright MCP ke http://localhost:8005/src/ — server `php -S localhost:8005 -t .` sudah berjalan di root proyek), bukan render offline.

## Review Focus

- **Ubah ukuran jendela saat bagian dipin** (mis. 1280→1920): kotak figur dan dinding dihitung dari vh/vw, tali dari CTM; yang diharapkan sepatu tetap menjejak tepi dinding dan tali tetap di genggaman. Tes di Task 4.
- **Gulir sangat cepat 1→4 lalu kembali**: hanya satu `.turun__big.is-on` setiap saat, tidak ada dua judul bertumpuk. Tes di Task 3.
- **Muat ulang halaman di tengah bagian** (browser memulihkan posisi gulir): progres halus `p` harus langsung = `raw` saat init, bukan mengejar dari 0 selama ±2 detik dengan pantulan stasiun beruntun. Tes di Task 3.
- **Tab disembunyikan lama lalu dibuka**: `dt` dibatasi ≤ 0,05 s dan waktu air diambil modulo periode tile, sehingga tidak ada lompatan atau presisi float rusak. Tes di Task 3.
- **Browser tanpa `mask-type: alpha`** (Safari lama): WebP rig disimpan **putih + alpha**, sehingga mask luminance pun menghasilkan bentuk yang sama; figur tidak boleh hilang. Tes di Task 1 (pipeline) dan Task 2 (render).

---

### Task 1: Pipeline aset rig dan tile dinding

**Files:**
- Modify: `scripts/ornamen.mjs` (seluruh file; sekarang 25 baris)
- Create: `scripts/check-turun-aset.mjs`
- Create (hasil): `src/assets/img/rig/*.webp` (11 file), `src/assets/img/dinding-turun.webp`
- Commit baseline dulu: `docs/`, `.gitignore`, `.hallmark/log.json`, `README.md`, `src/` yang sudah berubah (pekerjaan sebelumnya yang belum di-commit).

**Interfaces:**
- Produces: `src/assets/img/rig/{kepala,badan,karabiner,lengan-atas-kiri,lengan-atas-kanan,lengan-bawah-kiri,lengan-bawah-kanan,paha-kiri,paha-kanan,betis-kiri,betis-kanan}.webp` dengan rasio piksel sama dengan sumbernya (Task 2 memakai lebar×tinggi sumber sebagai ruang koordinat). `src/assets/img/dinding-turun.webp` tile 640×2614, mulus vertikal.
- Fungsi `maskWebp(fromPng, toWebp, { width, ink })` di `ornamen.mjs`: `ink: 'black'` (ornamen lama, dinding) atau `'white'` (rig). Alpha = `v > 225 → 0; v < 80 → 255; else (225 − v) / 145 × 255`.

- [ ] **Step 1: Commit baseline**

```bash
git add docs .gitignore .hallmark/log.json README.md src
git commit -m "Turun: rancangan close-up dan spike v16; simpan versi strip foto sebelum diganti"
```

- [ ] **Step 2: Tulis tes aset yang gagal** di `scripts/check-turun-aset.mjs` (node + sharp, keluar dengan kode 1 bila ada yang gagal, cetak tabel nama/ukuran/KB):

```js
// Harapan (dari spec, bagian Aset):
const RIG = { kepala: [260, 320, 510], badan: [400, 572, 1137], karabiner: [160, 834, 1437],
  'lengan-atas-kiri': [640, 1017, 441], 'lengan-atas-kanan': [640, 1017, 440],
  'lengan-bawah-kiri': [640, 944, 277], 'lengan-bawah-kanan': [640, 941, 259],
  'paha-kiri': [320, 450, 1000], 'paha-kanan': [320, 450, 1000], 'betis-kiri': [200, 250, 400], 'betis-kanan': [200, 250, 400] };
// tiap rig: ada; lebar == batas; tinggi == round(batas * h0 / w0) ±1; channels 4; piksel tinta berwarna putih (sampel: piksel dengan alpha > 200 punya r,g,b > 240)
// total rig ≤ 250 * 1024 byte
// dinding-turun.webp: 640 x 2614 ±1, channels 4, ≤ 300 * 1024 byte, baris 0 dan baris terakhir identik (cerminan mulus: bandingkan alpha baris 0 vs baris 2613, selisih rata-rata < 2)
```

- [ ] **Step 3: Jalankan tes, pastikan gagal**

Run: `node scripts/check-turun-aset.mjs`
Expected: keluar kode 1, pesan "tidak ada: src/assets/img/rig/kepala.webp" (dan seterusnya).

- [ ] **Step 4: Ubah `scripts/ornamen.mjs`**: bungkus logika lama jadi `async function maskWebp(from, to, { width, ink = 'black' })` (RGB = 0 atau 255 sesuai `ink`, alpha rumus di atas, `webp({ quality: 82, alphaQuality: 90, effort: 6 })`). Tambah job: dua ornamen lama (`ink: 'black'`), 11 rig dari `.gen/rig/<nama>.png` ke `src/assets/img/rig/<nama>.webp` dengan lebar dari tabel RIG (`ink: 'white'`), dan dinding: `.gen/dinding-turun-v2.png` → `extract({ left: 0, top: 0, width: 752, height: 1536 })` → gabung dengan `flip()`-nya jadi 752×3072 (`sharp` `composite` atau `joinChannel` manual) → `resize({ width: 640 })` → `maskWebp` (`ink: 'black'`). Buat folder `src/assets/img/rig/` bila belum ada.

- [ ] **Step 5: Jalankan pipeline dan tes**

Run: `node scripts/ornamen.mjs && node scripts/check-turun-aset.mjs`
Expected: 13 baris ukuran dari pipeline; tes keluar kode 0 dengan total rig ≤ 250 KB dan dinding ≤ 300 KB. Kalau ada yang melebihi, turunkan `quality` ke 76 untuk file itu saja dan ulangi.

- [ ] **Step 6: Commit**

```bash
git add scripts/ornamen.mjs scripts/check-turun-aset.mjs src/assets/img/rig src/assets/img/dinding-turun.webp
git commit -m "Turun: pipeline mask WebP untuk 11 potongan rig dan tile dinding"
```

---

### Task 2: Markup dan CSS komposisi statis (tanpa JS, reduced-motion, desktop)

**Files:**
- Modify: `src/index.html:147-198` (ganti seluruh `<section class="turun">`)
- Modify: `src/assets/css/style.css:278-345` (ganti seluruh blok "Turun" sampai sebelum `/* ---------- Kapan datang`)

**Interfaces:**
- Produces (dipakai Task 3–5), semua di dalam `<section class="turun" id="turun">`:
  - `.turun__intro` (eyebrow, h2 `#turun-title`, lede) tetap seperti sekarang.
  - `<div class="turun__panel" id="turunPanel">` berisi, urut: `<div class="turun__foto">` dengan 4 `<img>` stasiun (urutan foto sama, `loading="eager"`, `alt` sama) + `<i class="turun__grad">`; `<div class="turun__dinding turun__dinding--jauh" id="turunJauh"><i></i></div>`, `... --dekat" id="turunDekat"><i></i>`, `... --air" id="turunAir"><i></i>`; `<i class="turun__aman" id="turunAman">`; `<svg class="turun__figur" id="turunFigur" viewBox="-230 -330 740 1760" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`; `<div class="turun__hud"><small>Kedalaman</small><b id="turunMeter">0 m</b><span><b id="turunNomor">01</b>/ 04</span></div>`; `<div class="turun__teks">` dengan 4 `<div class="turun__big" data-stasiun="0..3">` (`<p class="turun__tag">01 · Atas tebing</p><h3><span class="ln"><span>Kolam alami</span></span><span class="ln"><span><em>tanpa tepi.</em></span></span></h3><p>…lead…</p>`; judul dan tag per stasiun persis dari spec bagian Komposisi; lead = paragraf yang ada sekarang). Blok pertama `is-on`.
  - Di dalam SVG: `<defs>` dengan 11 `<mask id="mk-<nama>" maskUnits="userSpaceOnUse" x="0" y="0" width="W" height="H" style="mask-type:alpha"><image href="assets/img/rig/<nama>.webp" width="W" height="H"/></mask>` (W×H = ukuran **sumber** PNG dari tabel spec, bukan ukuran WebP; `<image>` diskalakan ke sana), lalu `<path class="turun__tali" id="turunTali" d="M0 0"/>` dan `<g id="rig">` dengan struktur dan `id` **persis** tabel spec: `kakiJauh` (opacity .45) › `pahaB` › `betisB`; `kakiDekat` › `pahaA` › `betisA`; `badan` › `lenganB` (opacity .7) › `lenganB2`; `kepala`; rect badan; `karabiner`; `lenganA` › `lenganA2`. Tiap potongan = `<g id data-j="x,y" data-p="x,y" data-s="s" transform="…"><rect width="W" height="H" fill="currentColor" mask="url(#mk-<nama>)"/>…anak…</g>`. Atribut `transform` **dibakar** di markup dengan sudut dasar spec: `translate(jx jy) rotate(a) scale(s) translate(-px -py)`.
  - CSS: `.turun__figur { color: var(--color-ornamen) }`; dinding `background: var(--color-accent)` + `mask-image: url(assets/img/dinding-turun.webp)`, `mask-size: 130% auto`, `mask-repeat: repeat-y`, `mask-position: 100% 0` pada `<i>` dalamnya; `.turun__tali { stroke: var(--color-accent); stroke-width: 4; fill: none; opacity: .9 }`.
  - Variabel CSS pada `.turun__panel`: `--wall-w: calc(4vw + 26vh)`, `--fig-x: calc(4vw + 26.5vh)`.

- [ ] **Step 1: Tulis tes markup yang gagal** sebagai skrip Playwright (dijalankan lewat MCP `browser_run_code_unsafe`, buka `http://localhost:8005/src/index.html`):

```js
// assert: ada #turunPanel, #turunFigur[viewBox="-230 -330 740 1760"], #turunTali, 11 <mask> dengan id mk-*, 11 <rect fill="currentColor"> di #rig,
// #turunFoto img.length === 4 dan semua loading="eager", .turun__big.length === 4, satu .is-on,
// urutan anak #badan: ['lenganB','kepala','RECT','karabiner','lenganA'] (RECT = tagName rect)
// getAttribute('transform') di #kepala === 'translate(292 115) rotate(-4) scale(2.25) translate(-152 -303)'
```

- [ ] **Step 2: Jalankan tes, pastikan gagal** (elemen belum ada).

- [ ] **Step 3: Ganti markup `src/index.html:147-198`** sesuai Interfaces. Hapus `.turun__pin`, `.turun__num`, `.turun__rope`, `.turun__steps`, `.turun__bar`. Pertahankan `.turun__intro`.

- [ ] **Step 4: Ganti CSS `src/assets/css/style.css:278-345`** dengan blok baru:
  - Dasar (semua mode): `.turun__panel { position: relative; height: 100svh; overflow: hidden; background: var(--color-paper) }`; lapis sesuai spec Komposisi (foto `object-fit: cover; object-position: 60% 0; opacity: 0` kecuali `img:first-child { opacity: .6 }`; gradien; dinding dekat `left: -24vw; top: -12vh; height: 128vh; width: calc(var(--wall-w) + 24vw); transform-origin: 100% 0; transform: rotate(-9deg); opacity: .6`; jauh `opacity: .2; width: calc(var(--wall-w) * .85 + 24vw); left: calc(-24vw + var(--wall-w) * .62); transform: rotate(-6deg)`; air `opacity: .95; clip-path: inset(0 0 0 52%)`; `<i>` dalam dinding: `position: absolute; inset: 0 0 auto 0; height: 300vh; background: var(--color-accent); mask: …`; `.turun__aman { position: absolute; left: calc(var(--fig-x) + (60 + 230) / 740 * (80svh * 740 / 1760) - 20px); top: 30%; width: 160vw; height: 2px; background: var(--color-accent); opacity: .35; transform-origin: 0 0; transform: rotate(17deg) }` (JS Task 3 menimpanya dengan nilai terukur); figur `position: absolute; left: var(--fig-x); top: 8svh; height: 80svh; aspect-ratio: 740 / 1760; overflow: visible; filter: drop-shadow(0 8px 18px rgba(0 0 0 / .55))`; HUD kanan atas dan teks kanan bawah dengan ukuran font persis spec (judul `clamp(52px, 7.6vw, 112px)`, `.ln { display: block; overflow: hidden; padding-bottom: .06em; margin-bottom: -.06em }`, `.ln > span { display: inline-block }`, `em` = `var(--font-accent)` italic warna aksen).
  - **Tanpa JS / no-motion** (`html:not(.js) .turun, html.no-motion .turun`): `.turun__panel` tetap satu layar statis sebagai pembuka (tali `d` statis dari markup: lihat Step 5; HUD disembunyikan), lalu `.turun__teks` **bukan** absolut tetapi grid di bawah panel: keempat `.turun__big` tampil semua (`position: static; opacity: 1; visibility: visible`), ditumpuk dengan `padding-inline: var(--gutter)`, judul `clamp(40px, 6vw, 72px)`. Foto tiap stasiun ikut ditampilkan di blok lewat `::before { content: ""; display: block; aspect-ratio: 4 / 5; max-height: 60svh; border-radius: var(--radius-md); background: var(--foto) center / cover }` dengan `--foto: url(assets/img/<foto stasiun>.jpg)` sebagai atribut `style` di tiap `.turun__big` (URL sama dengan `<img>` di panel, jadi tidak ada unduhan ganda). Di mode JS `::before` disembunyikan.
  - Pembatas: `html.js:not(.no-motion) .turun__big { position: absolute; inset: auto 0 0 0; opacity: 0; visibility: hidden } … .is-on { opacity: 1; visibility: visible }`.

- [ ] **Step 5: Hapus JS Turun lama** `src/assets/js/main.js:227-325` (variabel `steps`, `rope()`, dua `mm.add` Turun lama); pertahankan `var mm = gsap.matchMedia();` karena galeri di bawahnya memakainya. Tanpa ini, `rope(0)` melempar `TypeError` begitu markup lama hilang dan mematikan sisa `main.js`.

- [ ] **Step 6: Bakar tali statis sementara**: `d` awal `#turunTali` = `M146 -2000 L146 -223 L227 578 C 267 638, 389 567, 419 607 C 429 807, 433 1300, 433 1430` (nilai pose diam spike v15; Task 4 Step 5 menggantinya dengan nilai dari rig yang sudah hidup).

- [ ] **Step 7: Jalankan tes Step 1, pastikan lolos.** Lalu screenshot statis: Playwright `page.emulateMedia({ reducedMotion: 'reduce' })`, muat ulang, scroll ke `#turun`, screenshot 1440×900. Expected: panel satu layar dengan dinding miring, figur emas lengkap (11 potongan terlihat, kepala di kerah, kubah paha di soket), tali lewat genggaman atas → karabiner → tangan rem; di bawahnya empat blok teks ditumpuk, masing-masing dengan fotonya. Tidak ada `pageerror`; galeri dan bagian lain masih berjalan (tanpa reduced-motion: galeri masih dipin).

- [ ] **Step 8: Uji mask luminance**: di konsol Playwright, `document.querySelectorAll('#turunFigur mask').forEach(m => m.style.maskType = 'luminance')`, screenshot lagi. Expected: figur tetap tampak sama (karena tinta putih + alpha).

- [ ] **Step 9: Commit**

```bash
git add src/index.html src/assets/css/style.css src/assets/js/main.js
git commit -m "Turun: markup dan CSS komposisi close-up (statis, tanpa JS, reduced-motion); JS lama dilepas"
```

---

### Task 3: JS desktop: pin, progres, dinding, air, foto, HUD, teks stasiun

**Files:**
- Modify: `src/assets/js/main.js:227-325` (ganti blok "Turun" desktop + ponsel lama; blok galeri di baris 327+ tidak disentuh)
- Modify: `src/assets/css/style.css` (tambah `html.turun-pinned .rail { opacity: 0; pointer-events: none; transition: opacity .3s }`)

**Interfaces:**
- Produces: di dalam `if (motion) { var mm = gsap.matchMedia(); … }` yang sudah ada, `mm.add('(min-width: 64rem)', turunDesktop)` di mana `function turunDesktop() { … return cleanup; }`. Di dalamnya: konstanta `N = 4, TINGGI_M = 30, TRAVEL = 3`; `var S = { raw, p, v, amp, phase, bounce, station, dir, lean }`; `function tick(time, dtMs)` dipasang `gsap.ticker.add(tick)`; `function showStation(i, dir)`; `function pose(el, a)` (membaca `data-j/p/s`, menulis `transform` persis format Task 2); `var J = { … }` peta id potongan → elemen (Task 4 mengisi pemakaiannya). ScrollTrigger pin: `trigger: '#turunPanel', start: 'top top', end: '+=' + (N * 120) + '%', pin: true, anticipatePin: 1, refreshPriority: 2, onUpdate: t => S.raw = t.progress, onToggle: t => root.classList.toggle('turun-pinned', t.isActive)`.
- Konvensi dinding: tiap `<i>` dinding digerakkan `transform: translate3d(0, y px, 0)` dengan `y = -(((d % periode) + periode) % periode)`, `periode = lebar_elemen × 1.3 × 2614 / 640` px; `d_dekat = p·TRAVEL·H`, `d_jauh = .45·d_dekat`, `d_air = d_dekat − 140·t` (t detik; air ke **bawah** berarti mask bergerak turun, tanda sesuai spike: `ya = y + 140·t`).

- [ ] **Step 1: Tulis tes perilaku yang gagal** (Playwright lewat MCP, viewport 1440×900, tanpa reduced-motion):

```js
// (a) pin: scroll ke #turun lalu +200 px; assert #turunPanel.getBoundingClientRect().top === 0 dan html.classList.contains('turun-pinned')
// (b) meteran: set scroll ke progres p≈0.5 (= start + 0.5 * 4.8 * innerHeight), tunggu 2.5 s; assert #turunMeter.textContent === '8 m'  (round((0.5-1/3)/(2/3)*30) = 8)
// (c) teks: progres 0.95 lalu segera 0.05 lalu 0.95 dalam 300 ms, tunggu 1.5 s; assert document.querySelectorAll('.turun__big.is-on').length === 1 dan .is-on.dataset.stasiun === '3'
// (d) muat ulang di tengah: reload dengan scroll tersimpan di p≈0.5, 100 ms setelah load assert |S.p − S.raw| < 0.01 (ekspos window.__turun = S untuk tes)
// (e) dinding: baca transform #turunDekat i pada p=0.2 dan p=0.4; assert translateY berbeda dan keduanya dalam [−periode, 0]
// (f) tab tersembunyi: panggil window.__turunTick(1e9) (tick dengan dt raksasa); assert tidak ada NaN di transform dan S.phase bertambah ≤ 0.05·(0.15+2.1)·2π
```

- [ ] **Step 2: Jalankan tes, pastikan gagal** (tidak ada pin, elemen tidak bergerak).

- [ ] **Step 3: Implementasi `turunDesktop()`** (JS lama sudah dilepas di Task 2 Step 5; `var mm = gsap.matchMedia();` masih ada) sesuai Interfaces dan spec bagian Gerak:
  - progres halus `S.p = lerp(S.p, S.raw, 1 − 0.0005^dt)`, **saat init `S.p = S.raw`**; `v` = turunan `p` dihaluskan `1 − 0.001^dt`; `vn = min(1, |v| / 0.45)`; `amp` mengejar `vn` dengan `1 − 0.002^dt`; `dir` dari tanda `v` bila `|v| > .02`; `phase += dt·(0.15 + 2.1·vn)·2π`; `dt = min(.05, dtMs / 1000)`.
  - stasiun: `st = round(p·(N−1))`; saat berubah → `showStation(st, dir)` + tween `S.bounce` dari `±22` ke 0 `elastic.out(1, .35)` 1.1 s (`killTweensOf(S, 'bounce')` dulu).
  - `showStation`: persis spec (killTweensOf blok+baris+rest; masuk `yPercent` ±110→0 .9 s `expo.out` stagger .08, tag+lead fade .7 s; keluar .4 s `power3.in`, opacity .35 s, lalu lepas `is-on`); `#turunNomor = '0' + (st+1)`.
  - dinding/air/foto/meteran sesuai Interfaces dan spec (foto: `opacity = min(1, 1.6·max(0, 1 − |p − c| / (w·.9)))·.6`, geser `translateY(p·−10%)` lewat transform, bukan `object-position`).
  - tali pengaman: `#turunAman.style.left = x_tali − 20 px` dengan `x_tali` = x layar titik `(60, 0)` ruang viewBox lewat `#turunFigur.getScreenCTM()`; `top = .3·H`; dihitung saat init dan `resize`.
  - cleanup: `gsap.ticker.remove(tick)`, `ST` pin `.kill()`, `root.classList.remove('turun-pinned')`, `gsap.set` semua yang diubah `clearProps: 'all'`.
  - ekspos `window.__turun = S; window.__turunTick = tick;` hanya bila `location.search.indexOf('debug') > -1`.

- [ ] **Step 4: Tambah CSS `html.turun-pinned .rail`** (lihat Files).

- [ ] **Step 5: Jalankan tes Step 1 dengan `?debug`**, pastikan semua lolos. Screenshot 1440×900 pada p=0 (diam), saat gulir cepat, dan berhenti di stasiun 3. Expected: dinding bergerak ke atas saat gulir turun, air mengalir ke bawah saat diam, foto stasiun 3 ("Di tali") samar di latar, teks "Menuruni / dinding kapur." tampil satu-satunya.

- [ ] **Step 6: Commit**

```bash
git add src/assets/js/main.js src/assets/css/style.css
git commit -m "Turun: pin, progres halus, dinding dan air bergerak, foto, meteran, teks stasiun"
```

---

### Task 4: JS desktop: pose rig dan tali

**Files:**
- Modify: `src/assets/js/main.js` (di dalam `turunDesktop()` dari Task 3)

**Interfaces:**
- Consumes: `S`, `tick`, `pose(el, a)`, `J` dari Task 3; elemen `#rig`, id potongan, `#turunTali`, `#turunFigur` dari Task 2.
- Produces: `var BASE = { badan: 18, kepala: -4, lenganA: 15, lenganA2: 60, lenganB: -100, lenganB2: -40, pahaA: 62, betisA: -8, pahaB: 70, betisB: -14 }`; `window.__turunBase = BASE` hanya saat `?debug`.

- [ ] **Step 1: Tulis tes yang gagal** (Playwright, `?debug`, viewport 1440×900, 1280×800, 1920×1080):

```js
// (a) semua 11 <g data-j> punya transform yang cocok /^translate\([-\d.]+ [-\d.]+\) rotate\([-\d.]+\) scale\([\d.]+\) translate\([-\d.]+ [-\d.]+\)$/ setelah 500 ms
// (b) tali: parse d #turunTali; titik ke-2 (genggaman atas) harus berjarak < 12 unit viewBox dari titik (120,160) lengan-bawah-kiri yang dipetakan lewat getScreenCTM → inverse CTM svg; titik ke-3 dari (538,1300) karabiner
// (c) kaki: di p=0 diam, sudut pahaA − pahaB ≈ 62−3 − (70−1) ± 2 (dua kaki tidak sama); saat gulir cepat 400 ms, sudut pahaA dan pahaB berubah berlawanan fase (korelasi tanda perubahan negatif pada ≥ 3 sampel)
// (d) resize: pada 1280×800 dan 1920×1080, x layar sepatu (titik (125,380) betis-kiri lewat CTM) berada dalam ±12 px dari tepi kanan dinding dekat pada y sepatu; tepi kanan dinding = garis dari sudut kanan-atas elemen #turunDekat (transform-origin, sebelum rotasi: left + width, top) yang miring −9°, yaitu x_edge(y) = x_kananAtas − tan(9°)·(y − y_atas)
// (e) karabiner: transform #karabiner berubah antara dua frame (ada ayunan), skala tetap .13
```

- [ ] **Step 2: Jalankan tes, pastikan gagal** (`transform` masih nilai statis, `d` statis).

- [ ] **Step 3: Implementasi di `tick`** persis spec bagian Gerak (badan, kepala, karabiner, lengan dekat/jauh, paha/betis A/B, `#rig` translate `bounce + 6·amp·sin(2φ)`), lalu tali: `inv = turunFigur.getScreenCTM().inverse()`; `hA = DOMPoint(120,160) × CTM(lenganA2) × inv`, `hB = DOMPoint(120,130) × CTM(lenganB2) × inv`, `kr = DOMPoint(538,1300) × CTM(karabiner) × inv`; `d` = rumus spec (`M hA.x −2000 L hA L kr C (kr.x+40, kr.y+60) (hB.x−30, hB.y−40) hB C (hB.x+10, hB.y+200) (hB.x+14, 1300) (hB.x+14, 1430)`), `toFixed(1)`.

- [ ] **Step 4: Jalankan tes Step 1, pastikan lolos** di ketiga viewport. Bila (d) gagal, setel `--fig-x` / `--wall-w` di CSS (bukan di JS) sampai lolos di ketiganya; catat nilai akhirnya di komentar CSS.

- [ ] **Step 5: Bakar ulang tali statis**: dengan `?debug`, di p=0 setelah 3 detik diam baca `#turunTali.getAttribute('d')`, bulatkan ke bilangan bulat, dan tulis sebagai `d` awal di `src/index.html` (menggantikan nilai sementara Task 2 Step 6), supaya mode tanpa JS memakai jalur yang sama dengan rig hidup.

- [ ] **Step 6: Ukur frame**: Playwright, gulir cepat 3 detik sambil mencatat `performance.now()` antar rAF; Expected: p95 Δt ≤ 20 ms di 1920×1080. Bila gagal: hapus `filter: drop-shadow` pada `.turun__figur` dulu; bila masih gagal, ganti `<mask>` dengan `<image>` langsung + `filter: url(#tint)` (`feFlood flood-color="currentColor"` + `feComposite in`) dan ukur lagi; catat pilihan di komentar.

- [ ] **Step 7: Commit**

```bash
git add src/assets/js/main.js src/assets/css/style.css
git commit -m "Turun: pose rig 11 potongan mengikuti gulir, tali lewat genggaman dan karabiner"
```

---

### Task 5: Ponsel (< 64rem)

**Files:**
- Modify: `src/assets/js/main.js` (tambah `mm.add('(max-width: 63.99rem)', turunPonsel)` yang memakai fungsi inti yang sama dengan parameter berbeda; refactor `turunDesktop` jadi `turunCloseup(opts)` bila perlu)
- Modify: `src/assets/css/style.css` (blok `@media (max-width: 63.99rem)` untuk `.turun__*`)

**Interfaces:**
- Consumes: `turunDesktop` (Task 3–4) → diubah jadi `turunCloseup({ figH, figTop, figX, wallW, endPct })` dengan desktop `{ '80svh', '8svh', 'calc(4vw + 26.5vh)', 'calc(4vw + 26vh)', 120 }` dan ponsel `{ '62svh', '6svh', 'calc(4vw + 14.5svh)', 'calc(4vw + 14svh)', 100 }`. Angka ponsel dari spec, kecuali `figX`: spec menulis "tepi kiri 4vw", tetapi sejak rig 11 potongan sepatu berada di tepi kiri kotak figur sehingga `figX` harus = tepi dinding + 0,5svh seperti desktop (keputusan penulis rencana). Nilai ponsel adalah titik awal, disetel di Step 4 sampai tes (b) lolos. Nilai-nilai ini dipasang sebagai variabel CSS `--fig-h`, `--fig-top`, `--fig-x`, `--wall-w` pada `.turun__panel` (desktop di CSS dasar, ponsel di `@media`), bukan ditulis JS; JS hanya membaca `endPct`.
- CSS ponsel: teks di bawah lebar penuh dengan gutter, judul `clamp(40px, 11vw, 60px)`, lead 13 px maks 3 baris (`-webkit-line-clamp: 3`), HUD kanan atas lebih kecil.

- [ ] **Step 1: Tulis tes yang gagal** (Playwright, viewport 390×844, `?debug`):

```js
// (a) #turunPanel dipin (top === 0 setelah scroll +100), end = 4 * 100% innerHeight (ST.end − ST.start ≈ 4·844 ±2)
// (b) figur tinggi ≈ 0.62·844 ±2 px; sepatu menjejak tepi dinding (uji seperti Task 4 (d))
// (c) .turun__big.is-on berada di bawah figur: getBoundingClientRect().top > figur.bottom − 40
// (d) tidak ada overflow horizontal: document.documentElement.scrollWidth === 390
```

- [ ] **Step 2: Jalankan tes, pastikan gagal.**

- [ ] **Step 3: Implementasi** sesuai Interfaces; cleanup kedua media simetris.

- [ ] **Step 4: Jalankan tes, pastikan lolos**; screenshot 390×844 diam dan saat gulir. Bila pin terasa patah-patah di perangkat nyata (uji di ponsel Android lewat jaringan lokal bila tersedia; kalau tidak, Chrome DevTools throttling CPU 4×, p95 Δt ≤ 33 ms), terapkan cadangan spec: tanpa pin, `.turun__figur` dan dinding `position: sticky; top: 0` selama empat stasiun ditumpuk, progres dari ScrollTrigger tanpa `pin`. Catat pilihan di komentar JS.

- [ ] **Step 5: Commit**

```bash
git add src/assets/js/main.js src/assets/css/style.css
git commit -m "Turun: versi ponsel (dipin, figur 62svh, teks di bawah)"
```

---

### Task 6: Pembersihan, dokumentasi, anggaran aset, verifikasi akhir

**Files:**
- Modify: `src/assets/css/style.css` (hapus sisa `.rope__*`, `.turun__num`, `.turun__bar`, `--turun-depth` bila masih ada), `src/assets/js/main.js` (hapus komentar/variabel usang), `README.md:23,25` (bagian "Desain dan gerak"), `.hallmark/log.json` (tambah entri ke-4), `scripts/build.mjs` (tidak perlu diubah: WebP tidak dikompres ulang; **verifikasi** saja)
- Create: `scripts/check-turun-anggaran.mjs` (atau perluas `check-turun-aset.mjs`)

- [ ] **Step 1: Tulis tes anggaran yang gagal**: perluas `scripts/check-turun-aset.mjs` dengan mode `--dist`: menjumlahkan ukuran `dist/assets/img/rig/*.webp` + `dist/assets/img/dinding-turun.webp` (harus ≤ 600 KB dan byte-identik dengan versi `src/`, bukti build tidak mengompres ulang WebP), dan mencetak ukuran `dist/assets/js/main.js` + `dist/assets/css/style.css` sebagai informasi. Expected gagal dulu karena `dist/` belum dibangun.

- [ ] **Step 2: `npm run build`, lalu `node scripts/check-turun-aset.mjs --dist`**; Expected: lolos, total ≤ 600 KB; cetak angkanya.

- [ ] **Step 3: Bersihkan** CSS/JS usang; `grep -n "rope__\|turun__num\|turun__bar\|turun-depth\|turunSteps" src/` harus kosong.

- [ ] **Step 4: README dan hallmark**: ganti kalimat bagian "Turun" di `README.md:23` dengan deskripsi close-up (figur boneka 11 potongan dari `gpt-image-2.5-sunburst` lewat 9Router, dinding miring, meteran 30 m, tanpa JS statis), tambah di baris 25 bahwa rig dan dinding dibuat `scripts/ornamen.mjs` dari `.gen/rig/` dan `.gen/dinding-turun-v2.png`; tambah entri `.hallmark/log.json` tanggal 2026-10-23 dengan field yang sama (macrostructure "Photographic (bagian Turun jadi adegan close-up: figur boneka 11 potongan menuruni dinding miring)", enrichment "rig SVG mask WebP, warna token; dinding CSS mask miring −9°, air mengalir; tali satu path", brief ringkas termasuk "tinggi lintasan 30 m, meteran menunggu sampai tengah stasiun 02").

- [ ] **Step 5: Verifikasi akhir** (spec bagian Verifikasi): screenshot 1280×800 dan 390×844 pada diam / gulir cepat / berhenti di stasiun 3; reduced-motion: tidak ada pin (`#turunPanel` top berubah saat scroll) dan `#turunTali` `d` tetap statis; gulir 1→4→1 cepat: satu `.is-on`; `npm run build` lolos; `node scripts/check-turun-aset.mjs` lolos. Semua lewat browser sungguhan.

- [ ] **Step 6: Commit**

```bash
git add -A src scripts README.md .hallmark/log.json
git commit -m "Turun: bersihkan sisa versi lama, dokumentasi, anggaran aset"
```
