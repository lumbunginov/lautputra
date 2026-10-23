# Rancangan: bagian "Turun" sebagai adegan close-up canyoning

Tanggal: 2026-10-22, diperbarui 2026-10-23 (rig 11 potongan, dinding miring, tali pengaman, karabiner).
Situs: lautputra.com (Wisata Umbul Waru), sumber di `src/`.
Status: komposisi dan gerak disetujui pemilik lewat spike di visual companion; semua 11 potongan figur disetujui satu per satu pada 2026-10-23. Spike terakhir disalin ke `docs/superpowers/specs/2026-10-23-turun-spike-v16.html` sebagai acuan angka (bukan kode produksi; path `/files/...` di dalamnya menunjuk folder companion). Dokumen ini yang jadi acuan.

## Maksud

Bagian `#turun` ("Satu lokasi, satu perjalanan turun") sekarang memakai urutan foto yang dipin dengan tali dan karabiner kecil di pinggir. Pemilik menilainya buruk: gerakannya kaku, "zoom-out", dan tidak terasa seperti canyoning.

Yang diinginkan: saat pengunjung menggulir, yang terlihat adalah **seorang peserta perempuan dari dekat yang sedang menuruni dinding tebing Umbul Waru di samping air terjun**. Figur besar, tetap di tempat; dindingnya yang bergerak ke atas. Kaki kanan dan kiri melangkah bergantian seperti berjalan mundur menuruni dinding. Gaya gambarnya satu keluarga dengan ornamen situs (peta kontur dan emblem cukil, emas pasir di atas laut gelap), bukan ikon garis.

Empat stasiun cerita yang sudah ada (Atas tebing, Bibir air terjun, Di tali, Pantai) dan teksnya dipertahankan.

## Tujuan

- Pengunjung langsung menangkap "ini rappelling di samping air terjun, dari dekat".
- Gerak terasa hidup dan mengikuti tangan pengunjung: berhenti menggulir berarti figur diam menggantung; gulir cepat berarti langkah cepat dan badan berayun.
- Visual menyatu dengan sisa situs: palet token, font display yang sama, ornamen kontur.
- Ringan: tanpa library baru. GSAP + ScrollTrigger + Lenis yang sudah ada saja.

## Bukan tujuan

- Bukan ilustrasi fotorealistis atau 3D. Realisme datang dari gerak dan dari foto asli di latar, bukan dari menggambar ulang tebing.
- Bukan video atau urutan frame. Tidak ada Remotion, Lottie, Rive.
- Tidak mengubah bagian lain (hero, kondisi, rute, paket, galeri).

## Anti-tujuan (gagal walau "jalan")

- Figur kecil atau komposisi yang terasa zoom-out.
- Figur bergerak dalam loop sendiri tanpa peduli gulir.
- Kaki yang bergerak bersamaan, bukan bergantian.
- Potongan sendi yang terlihat sobek dari jarak normal.
- Teks stasiun menumpuk saat gulir cepat.
- Halaman jadi berat (aset bagian ini di atas ±600 KB total) atau patah-patah di laptop biasa.

## Kendala

- Situs statis, dibangun dengan `scripts/build.mjs` (minify, kompres foto, `?v=hash`). Aset baru harus lewat pipeline itu.
- Konvensi yang ada: `html.js` / `html.no-motion`, `prefers-reduced-motion` mematikan semua gerak; `gsap.matchMedia` untuk desktop (`min-width: 64rem`) dan ponsel; `refreshPriority` untuk bagian yang dipin; warna lewat token di `src/assets/css/tokens.css`; ornamen dipakai sebagai `mask-image` dengan `background: var(--color-ornamen)` supaya warnanya ikut tema (lihat `.hallmark/log.json` dan `README.md`).
- Bahasa antarmuka Indonesia. Komentar kode Indonesia, seperti kode yang ada.
- Tinggi lintasan canyoning: **30 m** (keputusan pemilik, 2026-10-22, dari informasi yang beredar di Google; liputan Kompas TV menyebut air terjun "lebih dari 80 m", tapi yang relevan untuk meteran adalah lintasan rappelling). Satu konstanta `TINGGI_M = 30` supaya mudah diganti. Catatan lama di `.hallmark/log.json` yang memilih persen karena sumber berbeda dengan ini diganti.

## Aset

Semua gambar sumber dihasilkan lewat gateway gambar lokal 9Router (http://localhost:20128, kunci aktif di basis data 9Router; skill `9router-image` keliru menyebut kunci ada di settings.json). Potongan figur dibuat dengan `openai/gpt-image-2.5-sunburst` (menerima beberapa gambar acuan), satu potongan per putaran, tiap putaran dinilai pemilik. PNG mentah ada di `.gen/` (di `.gitignore`); **jangan digenerate ulang kecuali diminta**.

1. **Potongan figur**, 11 file PNG tinta sepia di kertas krem, semua tampak samping menghadap kiri, di `.gen/rig/` (ukuran piksel):
   `kepala` 320×510 · `badan` 572×1137 (manekin tanpa lengan, kaos gelap rapat, kerah tanpa leher, sabuk harness, soket setengah lingkaran selebar badan di bawah) · `karabiner` 834×1437 · `lengan-atas-kiri` 1017×441 dan `lengan-atas-kanan` 1017×440 (kapsul lengan panjang gelap, bahu di kanan, siku di kiri) · `lengan-bawah-kiri` 944×277 dan `lengan-bawah-kanan` 941×259 (bantalan siku padat di kanan, lengan ramping, tangan bersarung menggenggam tali searah lengan di kiri; tali tidak digambar) · `paha-kiri` dan `paha-kanan` 450×1000 (tegak, kubah bulat selebar celana di atas, celana + loop harness, potongan rata di atas lutut; versi kanan tanpa gesper) · `betis-kiri` dan `betis-kanan` 250×400 (bantalan lutut di atas, sepatu ke kiri).
   Lembar gabungan untuk melihat semuanya: `.gen/potongan/_lembar-potongan-v2.png` (tanpa karabiner dan lengan terbaru).
2. **Strip dinding**: yang disetujui adalah **`.gen/dinding-turun-v2.png`** (1024×1536): garis-garis air dan gumpalan travertin selebar strip, kertas kosong di ±272 px paling kanan. Versi lama `.gen/dinding-turun.png` (dinding kontur + lembaran air di tepi) tidak dipakai lagi. Tile mulus yang sudah jadi dan dipakai spike: folder companion `dinding2-tile.png`, **752×3072** = strip v2 **dipotong** kertas kosongnya (kolom 0–752) lalu ditumpuk dengan cerminan vertikalnya, tanpa pengecilan. Semua angka komposisi (`--wall-w`, `--fig-x`, `mask-size 130%`, `mask-position 100% 0`, `clip-path inset(0 0 0 52%)`) disetel terhadap tile ini, yang tepi kanan kontennya tepat di tepi kanan kotak.

Pipeline (tambahkan ke `scripts/ornamen.mjs` atau skrip saudaranya):

- Tiap potongan → `src/assets/img/rig/<nama>.webp`: mask transparan, alpha = kepekatan tinta: nilai abu `v` > 225 → 0, `v` < 80 → 255, di antaranya `(225 − v) / 145 × 255` (rumus yang dipakai di semua spike, `gold.js`). Warna tidak penting (boleh dibakar `#f1d296` supaya pratinjau mudah). Lebar potongan boleh diperkecil sampai tinggi figur di layar 1080p masih tajam: badan ≤ 400 px lebar, paha ≤ 320, lengan ≤ 640, kepala ≤ 260, betis ≤ 200, karabiner ≤ 160. Target total 11 file ≤ 250 KB.
- Dinding → `src/assets/img/dinding-turun.webp`: mask transparan dari tile 752×3072 di atas (potong kertas kosong, lalu strip + cerminan vertikalnya). Boleh diperkecil proporsional (mis. 640×2614) asalkan tetap tajam di 1080p. Target ≤ 300 KB.

Warna semuanya diberikan lewat CSS (`background: var(--color-ornamen)` / `var(--color-accent)` di balik mask, atau `fill`/`filter` untuk `<image>` SVG), bukan dibakar ke gambar, supaya ikut tema seperti ornamen lain. Kalau rig memakai SVG `<image>`, warnanya ikut dari PNG/WebP yang sudah diwarnai emas; itu boleh asalkan nilai emasnya sama dengan token (`#f1d296` ≈ `--color-ornamen`).

## Komposisi (desktop, ≥ 64rem)

Bagian dipin satu layar penuh (`100svh`), panjang gulir `N × 120%` tinggi layar untuk N = 4 stasiun (seperti sekarang). Lapisan dari belakang ke depan:

1. **Foto asli** (4 foto stasiun yang sudah dipakai sekarang), `object-fit: cover`, crossfade per stasiun mengikuti progres, bergeser turun pelan (`object-position` 0→100% sepanjang bagian), opasitas maksimum ±0.6. Di atasnya gradien: gelap pekat di kiri (±0.97 → 0.9 sampai 42% lebar → 0.5 di kanan) dan dari bawah (0.92 → transparan di 50% tinggi). Foto adalah suasana, bukan subjek.
2. **Dinding jauh**: mask tile dinding, lebar ±0.85× dinding dekat, digeser ke kanan ±62% lebar dinding dekat, opasitas 0.2, `mask-size` 130% auto, **diputar −6°**. Bergerak 0.45× dinding dekat.
3. **Dinding dekat**: lebar dasar `--wall-w = calc(4vw + 26vh)`, opasitas 0.6, `mask-size` 130% auto dengan `mask-position` 100% 0 (tile sudah tanpa kertas kosong; 30% kelebihan lebar jatuh di luar tepi kiri kotak). **Miring −9°** seperti lempengan travertin di foto referensi (`referensi/Tebing*.jpg`): elemen diputar dari sudut kanan-atas (`transform-origin: 100% 0`), diperlebar 24vw ke kiri dan 12vh ke atas/bawah (tinggi 128vh) supaya tidak ada celah. Bergerak ke atas 3 tinggi layar sepanjang bagian (`y = -progres × 3 × tinggi`).
4. **Air**: salinan dinding dekat yang di-`clip-path` ke kolom air saja (`inset(0 0 0 52%)`), opasitas 0.95, ikut dinding **plus mengalir ke bawah** terus-menerus ±140 px/detik walau gulir berhenti (gravitasi; bukan ke atas).
5. **Tali pengaman diagonal** (khas Umbul Waru: tali dari tebing ke pantai): garis 2 px aksen, opasitas 0.35, lebar 160vw, mulai ±20 px di kiri tali utama pada 30% tinggi bagian, miring +17°.
6. **Figur**: SVG rig (bawah), kotak `aspect-ratio: 740 / 1760`, tinggi 80svh, atas 8svh, tepi kiri `--fig-x = calc(4vw + 26.5vh)` sehingga sepatu jatuh tepat di tepi kanan dinding dekat dan kaki terlihat menjejak dinding. `drop-shadow` lembut.
7. **Tali**: satu `<path>` di dalam SVG figur (4 px, aksen, opasitas 0.9), dihitung tiap frame: dari jauh di atas lurus ke genggaman tangan atas, lurus ke ujung bawah karabiner, lengkung ke genggaman tangan rem, lalu lengkung turun keluar kotak (lihat Gerak). Tidak ada lagi elemen tali DOM terpisah.
8. **Teks kanan bawah** bergaya hero: tag stasiun (eyebrow aksen), judul `Bricolage Grotesque` 800, stretch 78%, `clamp(52px, 7.6vw, 112px)`, line-height 0.88, satu frasa aksen `Instrument Serif` italic warna aksen, lead ≤ 42ch warna muted. Lebar `min(50%, 680px)`, kanan `clamp(24px,4vw,56px)`, bawah `clamp(28px,6vh,56px)`.
9. **Kanan atas**: "Kedalaman" + angka meter (tabular-nums), di bawahnya nomor stasiun `01 / 04`.

Judul tiap stasiun (baris 1 / baris 2 dengan em = aksen italic):
- 01 Atas tebing: "Kolam alami" / *tanpa tepi.*
- 02 Bibir air terjun: "Helm, harness," / *cek simpul.*
- 03 Di tali: "Menuruni" / *dinding kapur.*
- 04 Pantai: "Pasir putih" / "di kaki *air terjun.*"
Lead memakai paragraf yang sudah ada di `index.html` untuk tiap stasiun.

Intro bagian (eyebrow "Satu lokasi, satu perjalanan turun", h2, lede) tetap ada di atas panel yang dipin, seperti sekarang.

## Rig figur

Figur adalah boneka potong 11 bagian, tiap bagian satu gambar terpisah (bukan atlas). Dibangun sebagai SVG `<g>` bersarang dengan `<image>`, `viewBox="-230 -330 740 1760"`. Ruang rig = ruang piksel badan lama (280×502); **pinggul di (147, 500)** adalah akar semua kaki dan badan.

Setiap bagian punya tiga nilai: `j` = titik sendi di ruang induk, `p` = titik yang sama di ruang piksel gambar bagian itu sendiri, `s` = skala. Transform-nya selalu `translate(j) rotate(a) scale(s) translate(-p)`; `a` = sudut dasar + animasi. Urutan lapis dari belakang ke depan dan nilainya (sudut dasar = pose menggantung diam):

| Bagian | Induk | j (induk) | p (sendiri) | s | sudut dasar | catatan |
|---|---|---|---|---|---|---|
| paha kanan (jauh) | rig | 147,500 | 215,229 | .49 | 70 | grup kaki jauh opasitas .45 |
| betis kanan | paha kanan | 243,900 | 158,60 | 2.8 | −14 | |
| paha kiri (dekat) | rig | 147,500 | 215,229 | .49 | 62 | |
| betis kiri | paha kiri | 243,900 | 158,60 | 2.8 | −8 | |
| badan | rig | 147,500 | 286,1181 | .4 | 18 | p = pusat lingkaran soket; diameter soket = lebar kubah paha |
| lengan atas kanan (jauh) | badan | 392,256 | 880,220 | .67 | −100 | opasitas .7; sebelum gambar badan, jadi tersembunyi di belakangnya |
| lengan bawah kanan | lengan atas kanan | 100,236 | 845,129 | 1.4 | −40 | p = pusat bantalan siku |
| kepala | badan | 292,115 | 152,303 | 2.25 | −4 | **sebelum gambar badan**: leher masuk ke kerah, kepang di belakang punggung |
| (gambar badan) | badan | | | | | |
| karabiner | badan | 98,838 | 538,40 | .13 | 0 | p = puncak lengkung; menggantung di ujung depan sabuk |
| lengan atas kiri (dekat) | badan | 392,256 | 880,220 | .67 | 15 | |
| lengan bawah kiri | lengan atas kiri | 100,236 | 845,129 | 1.4 | 60 | |

Titik tali, di ruang piksel gambar masing-masing: genggaman tangan kiri (120, 160) pada `lengan-bawah-kiri`, genggaman tangan kanan (120, 130) pada `lengan-bawah-kanan`, ujung bawah karabiner (538, 1300) pada `karabiner`. Dipetakan ke ruang SVG tiap frame lewat `getScreenCTM()` lalu inverse CTM elemen SVG.

Prinsip penutup sambungan yang sudah terbukti (jangan diubah tanpa alasan): kubah paha masuk ke soket badan; bantalan lutut (betis) di atas ujung paha; bantalan siku (lengan bawah) di atas ujung lengan atas; kerah badan menutup leher kepala. Tidak perlu "penyambung" tambahan.

Pembangun boleh memindahkan rig ke div CSS `mask-image` kalau mau, asalkan urutan lapis, titik sendi, dan skala relatif di atas dipertahankan, dan titik tali tetap bisa dihitung dari transform.

## Gerak

Satu loop `requestAnimationFrame` (atau `gsap.ticker`) membaca progres ScrollTrigger (`S.raw`), lalu:

- **Progres halus** `p` mengejar `raw` (lerp, setara `scrub` ±0.6 s); **kecepatan** `v` = turunan `p` yang dihaluskan; `vn = min(1, |v| / 0.45)`; **amplitudo** `amp` mengejar `vn` lebih lambat (jadi langkah tidak langsung berhenti). `dir` = tanda `v` terakhir yang berarti.
- **Fase langkah** bertambah `(0.15 + 2.1·vn) × 2π` per detik: diam hampir berhenti, cepat ±2 langkah/detik.
- **Dua kaki berlawanan fase 180°**: `pushA = amp·(1+sin φ)/2`, `pushB = amp·(1+sin(φ+π))/2`. Paha berputar `-3 + 14·push` (plus goyang diam 0.5×), betis `6 − 30·push` (negatif = sepatu ke dinding, lutut membuka). Kaki jauh memakai nilai B dengan ofset kecil.
- **Badan**: rotasi di pinggul = dasar 18 + goyang diam `idle = 0.8·sin(1.1t)` + condong `lean` yang mengejar `dir·5·amp + 10·v`. Seluruh rig naik-turun `6·amp·sin(2φ)` satuan rig.
- **Kepala**: dasar −4 − 0.5·lean + `1.2·sin(0.9t)`. **Karabiner**: `3·sin(1.3t) − 0.3·lean`.
- **Lengan dekat** (atas): dasar 15 − `6·amp·sin(φ+1)` − 0.6·idle; lengan bawah dekat: 60 + `4·amp·sin(φ+1)`. **Lengan jauh**: −100 + `8·amp·sin(φ+1)` + `1.5·sin(1.7t)`; lengan bawah jauh: −40 − `5·amp·sin(φ+1)`.
- **Pantulan stasiun**: saat `round(p·3)` berubah, tween `bounce` dari `±22` ke 0 dengan `elastic.out(1, 0.35)` 1.1 s, dipakai sebagai translasi vertikal rig.
- **Dinding**: posisi lapisan dekat `y = −p·3·H`; jauh `0.45·y`; air `y + 140·t` (mengalir ke bawah).
- **Tali**: `M hA.x −2000 L hA L kr C (kr+40,+60) (hB−30,−40) hB C (hB.x+10, hB.y+200) (hB.x+14, 1300) (hB.x+14, 1430)` dengan hA = genggaman tangan atas, kr = ujung karabiner, hB = genggaman tangan rem, semua dalam satuan viewBox.
- **Teks stasiun**: saat stasiun berganti, blok lama: baris judul meluncur keluar (`yPercent` ±110, 0.4 s, `power3.in`) dan opasitas blok ke 0 (0.35 s), lalu `is-on` dilepas; blok baru: `is-on`, baris meluncur masuk dari arah gulir (0.9 s, `expo.out`, stagger 0.08), tag dan lead fade (0.7 s). Semua tween blok dibunuh dulu (`killTweensOf`) supaya gulir cepat tidak menumpuk.
- **Meteran** (keputusan penulis rancangan, bukan dari pemilik): secara cerita stasiun 01 (kolam) dan 02 (bibir air terjun) sama-sama masih di puncak, jadi angka **menunggu di 0 m sampai tengah stasiun 02** (`p ≤ 1/3`), lalu naik rata sampai `TINGGI_M` di akhir: `kedalaman = round(max(0, (p − 1/3) / (2/3)) × TINGGI_M)` m, `TINGGI_M = 30`. Dinding dan langkah kaki tetap bergerak sepanjang bagian sejak awal; hanya angkanya yang menunggu. Nomor stasiun `0(i+1)`.
- Gulir ke atas: semua berbalik sendiri (dinding turun, condong berbalik, teks meluncur dari arah sebaliknya).

Nilai-nilai di atas adalah yang disetujui di spike; boleh disetel ±20% kalau terasa perlu setelah dipasang di halaman sungguhan dengan Lenis.

## Ponsel (< 64rem)

Keputusan saya (pemilik belum menyebut): **tetap dipin layar penuh** dengan komposisi sama, disesuaikan:
- figur 62svh, tepi kiri 4vw, atas 6svh; dinding dekat `calc(4vw + 14svh)`;
- teks pindah ke bawah, lebar penuh dengan gutter, judul `clamp(40px, 11vw, 60px)`, lead 13px, maksimal 3 baris;
- "Kedalaman" dan nomor stasiun di kanan atas, lebih kecil;
- panjang gulir `N × 100%`.
Kalau pengujian di ponsel nyata menunjukkan pin patah-patah, cadangannya: tanpa pin, figur tetap di atas (sticky) selama empat stasiun ditumpuk vertikal, dengan dinding dan langkah tetap mengikuti gulir. Pembangun memilih setelah mencoba di perangkat.

## Tanpa gerak, tanpa JS

`prefers-reduced-motion` atau tanpa JS: tidak dipin. Tampilkan komposisi statis satu kali (dinding, figur diam, tali) sebagai pembuka, lalu empat stasiun ditumpuk: foto + tag + judul + lead, seperti tumpukan ponsel yang ada sekarang. Tidak ada meteran yang berubah.

## Yang dibongkar

- Markup tali/simpul/karabiner (`.turun__rope`, `.rope__*`), `.turun__bar`, `.turun__num`, dan JS-nya di `main.js` bagian "Turun" (desktop dan ponsel).
- CSS `.turun__*` terkait pin lama. Intro bagian dan teks stasiun dipertahankan isinya.
- Rail samping (`RAIL`) tetap menunjuk `#turun`.

## Keputusan dari pemeriksaan pembangun (sudah diputuskan, tidak perlu ditanya lagi)

- Rail samping disembunyikan saat bagian ini dipin, seperti galeri (`is-pinned`).
- Dinding digerakkan lewat `transform` pada elemen tinggi (tile diulang dalam elemen 2× tinggi layar atau lebih), bukan `mask-position` per frame, demi komposit GPU.
- Empat foto latar `loading="eager"` (bagian ini dekat hero), yang lain tetap lazy.
- `--turun-depth` dan latar "makin biru" lama dibuang.
- Satu loop di `gsap.ticker`, dipasang di dalam `gsap.matchMedia` dan dicabut saat media berbalik.
- WebP mask aman untuk `scripts/build.mjs` (hanya `.jpe?g` yang dikompres ulang).

## Diserahkan ke pembangun

- Struktur markup dan nama kelas baru; rig SVG `<image>` (terbukti) atau CSS mask.
- Penempatan tepat kotak dinding dan figur supaya sepatu "menjejak" tepi dinding di berbagai rasio layar (uji 1280×800, 1536×864, 1920×1080, 390×844); nilai `--wall-w` dan `--fig-x` di atas adalah titik awal yang terbukti di 1440×900.
- Tile dinding dibuat persis seperti di bagian Aset (potong 752 px, cermin vertikal); cara lain hanya kalau hasilnya identik secara visual.
- Penyetelan `refreshPriority`, `anticipatePin`, dan interaksi dengan Lenis seperti bagian lain.
- Ukuran WebP tiap potongan (batas di bagian Aset) dan apakah warna dibakar atau lewat CSS.
- Pembaruan `README.md` (bagian "Desain dan gerak") dan `.hallmark/log.json` sesuai kebiasaan repo.

## Verifikasi sebelum selesai

- Screenshot pada tiga momen (diam, gulir cepat, berhenti di stasiun 3) di 1280×800 dan 390×844, dibandingkan dengan spike.
- Tidak ada blok teks ganda setelah menggulir cepat dari stasiun 1 ke 4 dan kembali.
- `prefers-reduced-motion`: tidak ada pin, tidak ada gerak.
- Build (`npm run build`) lolos, total aset baru bagian ini ≤ 600 KB.
- Verifikasi tampilan **lewat screenshot browser sungguhan** (Playwright), bukan render offline: pada 2026-10-23 sebuah bagian yang lupa diposekan tampil raksasa di browser tetapi benar di render offline.
