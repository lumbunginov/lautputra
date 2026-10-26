// Interaksi halaman Umbul Waru: Lenis + GSAP (intro hero, adegan close-up "Turun", galeri, parallax, tombol magnet),
// babak warna, menu, kondisi laut, rute, dan pemesanan WhatsApp. Reduced-motion: semua gerak dilewati.
document.addEventListener('DOMContentLoaded', function () {
  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var motion = !!(gsap && ST) && !reduce;
  var WA = '6285655647066';
  // Harga canyoneering dari publikasi operator (Okt 2026): titik kumpul basecamp, atau jemput Stasiun/Terminal Blitar (termasuk antar jemput PP)
  var PRICES = { canyoneering: 375000 }, PRICES_JEMPUT = { canyoneering: 525000 };
  var LABELS = { canyoneering: 'Canyoneering Umbul Waru', homestay: 'Basecamp / homestay', tenda: 'Sewa tenda camping', ojek: 'Ojek / jemput lokasi', kunjungan: 'Kunjungan dengan pemandu' };
  var rupiah = function (n) { return 'Rp' + n.toLocaleString('id-ID'); };
  var cleanups = [];

  if (!motion) root.classList.add('no-motion');
  if (gsap && ST) gsap.registerPlugin(ST);

  // ---------- Smooth scroll: Lenis sebagai satu-satunya mesin, disambungkan ke ScrollTrigger ----------
  var lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(el, offset) {
    if (lenis) lenis.scrollTo(el, { offset: offset || 0, duration: 1.4 });
    else { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  }

  // ---------- Pill: sembunyi saat gulir turun, muncul saat gulir naik ----------
  var pill = $('#pill'), lastY = window.scrollY, pillTick = false;
  function onScrollPill() {
    var y = window.scrollY;
    if (y > 160 && y > lastY + 4) pill.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 160) pill.classList.remove('is-hidden');
    lastY = y; pillTick = false;
  }
  window.addEventListener('scroll', function () { if (!pillTick) { pillTick = true; requestAnimationFrame(onScrollPill); } }, { passive: true });

  // ---------- Babak warna: nav dan rel ikut pasir saat bagian pantai memenuhi layar ----------
  var act = $('#pantai');
  if (ST) {
    ST.create({ trigger: act, start: 'top 4.5rem', end: 'bottom 4.5rem', onToggle: function (s) { if (s.isActive) root.setAttribute('data-act', 'pantai'); else root.removeAttribute('data-act'); } });
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) root.setAttribute('data-act', 'pantai'); else root.removeAttribute('data-act'); }, { rootMargin: '-72px 0px -92% 0px' }).observe(act);
  }

  // ---------- Rel samping: nama bagian + titik kemajuan ----------
  var railLabel = $('#railLabel'), railDot = $('#railDot');
  var RAIL = { top: 'Umbul Waru', turun: 'Turun', kondisi: 'Kapan datang', rute: 'Rute', paket: 'Paket', booking: 'Pesan', galeri: 'Galeri', sekitar: 'Sekitar', faq: 'Tanya jawab', akhir: 'Laut' };
  if (ST) {
    $$('section[id], footer[id]').forEach(function (s) {
      if (!RAIL[s.id]) return;
      ST.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: function (t) { if (t.isActive) railLabel.textContent = RAIL[s.id]; } });
    });
    ST.create({ trigger: doc.body, start: 'top top', end: 'bottom bottom', onUpdate: function (t) { railDot.style.top = (t.progress * 100) + '%'; } });
  }

  // ---------- Menu seluler ----------
  var sheet = $('#sheet'), menuOpen = $('#menuOpen'), menuClose = $('#menuClose');
  function openSheet() {
    sheet.hidden = false;
    menuOpen.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    doc.body.style.overflow = 'hidden';
    if (motion) gsap.from($$('nav a, .btn', sheet), { y: 22, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
    $('nav a', sheet).focus();
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.hidden = true;
    menuOpen.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    doc.body.style.overflow = '';
  }
  menuOpen.addEventListener('click', openSheet);
  menuClose.addEventListener('click', function () { closeSheet(); menuOpen.focus(); });
  sheet.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSheet(); menuOpen.focus(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a, button', sheet), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ---------- Tautan jangkar ----------
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeSheet();
      scrollToEl(target);
      if (a.classList.contains('skip')) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    });
  });

  // ---------- Penanda menu aktif ----------
  var navLinks = $$('.pill__links a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { navIO.observe(s); });
  }

  // ---------- Ticker: gandakan isi supaya berputar mulus ----------
  var track = $('#tickerTrack');
  if (track) {
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    Array.prototype.slice.call(clone.children).forEach(function (li) { track.appendChild(li); });
  }

  // ---------- Judul dipecah per kata (teks utuh tetap dibaca pembaca layar) ----------
  function splitWords(el) {
    var full = el.textContent.replace(/\s+/g, ' ').trim();
    var visual = doc.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    var inners = [];
    function addWord(node) {
      var w = doc.createElement('span'); w.className = 'w';
      var i = doc.createElement('span'); i.appendChild(node);
      w.appendChild(i); visual.appendChild(w); visual.appendChild(doc.createTextNode(' '));
      inners.push(i);
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach(function (t) { addWord(doc.createTextNode(t)); });
      else if (n.nodeType === 1) addWord(n.cloneNode(true));
    });
    var sr = doc.createElement('span'); sr.className = 'sr-only'; sr.textContent = full;
    el.textContent = '';
    el.appendChild(sr); el.appendChild(visual);
    return inners;
  }

  var heroPhoto = $('#heroPhoto');

  // ---------- Intro hero ----------
  if (motion) {
    var lines = $$('.hero__title .ln > span');
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    // Skala dan geser dipasang pada <figure> supaya satu elemen saja yang bergerak
    tl.from(heroPhoto, { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo(heroPhoto, { scale: 1.18 }, { scale: finePointer ? 1.06 : 1, duration: 2.2 }, 0)
      .from('.hero__grad', { opacity: 0, duration: 1.4 }, 0.2)
      .from('.pill', { y: -24, opacity: 0, duration: 0.9 }, 0.3)
      .from('.hero__top > *', { opacity: 0, y: 10, duration: 0.8, stagger: 0.08 }, 0.4)
      .from(lines, { yPercent: 108, rotate: 2, transformOrigin: 'left top', duration: 1.2, stagger: 0.1 }, 0.45)
      .from('.hero__lead, .hero__acts', { opacity: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.95)
      .from('.hero__cue, .rail', { opacity: 0, duration: 0.8 }, 1.2);

    // Foto hero bergeser halus mengikuti kursor (hanya pointer presisi)
    if (finePointer) {
      var hero = $('.hero');
      var px = gsap.quickTo(heroPhoto, 'xPercent', { duration: 1.2, ease: 'power3.out' });
      var py = gsap.quickTo(heroPhoto, 'yPercent', { duration: 1.2, ease: 'power3.out' });
      var onHeroMove = function (e) {
        var r = hero.getBoundingClientRect();
        px(((e.clientX - r.left) / r.width - 0.5) * -2.2);
        py(((e.clientY - r.top) / r.height - 0.5) * -2.2);
      };
      var resetHero = function () { px(0); py(0); };
      hero.addEventListener('pointermove', onHeroMove, { passive: true });
      hero.addEventListener('pointerleave', resetHero);
      window.addEventListener('blur', resetHero);
      cleanups.push(function () { hero.removeEventListener('pointermove', onHeroMove); window.removeEventListener('blur', resetHero); });
    }

    // Judul bagian muncul per kata, lalu teks pendukung menyusul
    $$('h2.split, .fold__line.split, .akhir__line.split').forEach(function (h) {
      var words = splitWords(h);
      gsap.from(words, { yPercent: 110, duration: 1, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    $$('.eyebrow, .lede, .alur, .kondisi__tool, .lokasi, .rute__steps, .lain li, .index li, .faq details, .fold__cap, .akhir__acts, .akhir__note, .utama__body > *').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 26, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    // Foto muncul dari bawah lewat clip, isi foto sedikit membesar
    $$('.utama__photo, .g figure').forEach(function (fig) {
      var img = fig.querySelector('img');
      gsap.from(fig, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 90%', once: true } });
      gsap.from(img, { scale: 1.2, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 90%', once: true } });
    });
    // Parallax foto lipatan dan penutup
    ['.fold__img', '.akhir__bg'].forEach(function (s) {
      var el = $(s); if (!el) return;
      gsap.fromTo(el, { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Ornamen peta bergeser pelan berlawanan arah gulir
    var topo = $('.rute__topo');
    if (topo) gsap.fromTo(topo, { yPercent: 10 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.rute', start: 'top bottom', end: 'bottom top', scrub: true } });
    // Harga menghitung naik saat terlihat
    var amt = $('#priceAmt');
    if (amt) {
      var target = parseInt(amt.dataset.count, 10), o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.6, ease: 'expo.out', snap: { v: 1000 }, onUpdate: function () { amt.textContent = rupiah(o.v); }, scrollTrigger: { trigger: amt, start: 'top 88%', once: true } });
    }

    // Tombol magnet: tombol utama menarik ke arah kursor (pointer presisi saja)
    if (finePointer) {
      $$('.magnet').forEach(function (b) {
        var mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
        var my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
        var area = b.parentElement;
        var move = function (e) {
          var r = b.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          var d = Math.hypot(dx, dy), reach = r.width * 0.9;
          if (d < reach) { mx(dx * 0.28); my(dy * 0.28); } else { mx(0); my(0); }
        };
        var leave = function () { mx(0); my(0); };
        area.addEventListener('pointermove', move, { passive: true });
        area.addEventListener('pointerleave', leave);
        cleanups.push(function () { area.removeEventListener('pointermove', move); area.removeEventListener('pointerleave', leave); });
      });
    }
  }

  if (motion) {
    var mm = gsap.matchMedia();

    // ---------- Turun: adegan close-up canyoning. Satu loop ticker membaca progres pin, menggerakkan dinding, air, meteran, dan kartu IG ----------
    // Dipakai kedua media (desktop dan ponsel); ukuran figur/dinding dari variabel CSS di .turun__panel, JS hanya menerima panjang pin total (opts.pinPct, % tinggi layar).
    // Tiga stasiun (atas tebing, di tali, pantai), batas di p = 1/4 dan 3/4. Satu fungsi kedalaman() dipakai meteran, dinding, langkah, awan, laut,
    // pose ikonik, dan drone: naik rata dari 0 m di awal pin sampai 30 m di akhir pin (pilihan pengguna: turun langsung sejak stasiun 01),
    // jadi meteran selalu bergerak selagi orangnya turun. Stasiun 02 muncul di 7,5 m, stasiun 03 di 22,5 m.
    // Ponsel: tetap dipin seperti desktop. Gulir cepat 390x844 dengan CPU 4x (CDP): frame Δt p95 16,7 ms (batas 33 ms), maks 25 ms, jadi cadangan sticky tanpa pin tidak dipakai.
    // Strip gelap di screenshot gulir ponsel hanya artefak Playwright screenshot(): lewat CDP Page.captureScreenshot (gulir sentuh dan rAF) strip <= 0,8 px di 23 frame.
    function turunCloseup(opts) {
      var panel = $('#turunPanel');
      if (!panel) return;
      var N = 3, TINGGI_M = 30, TRAVEL = 3;
      function kedalaman(p) { return Math.max(0, p) * TINGGI_M; }
      var S = { raw: 0, p: 0, v: 0, amp: 0, phase: 0, bounce: 0, station: 0, dir: 1, lean: 0 };
      var fig = $('#turunFigur'), meter = $('#turunMeter'), nomor = $('#turunNomor');
      // Strip kartu IG (pengganti teks stasiun, Opsi B): satu rel 13 kartu berurutan stasiun 01-03, cue = kartu pertama tiap stasiun.
      // Di dalam satu stasiun kartu berganti otomatis (foto IG_FOTO ms, video sepanjang klip) dan berputar di segmennya saja;
      // ganti stasiun = lompat ke cue (showStation). Video hanya main saat jadi kartu tengah. Klik kartu tengah = maju, klik tetangga = ke sana.
      var IG_FOTO = 4000, IG_VIDEO = 8000;
      var ig = { el: $('#turunIg', panel), rel: $('#igRel', panel), kartu: $$('.ig__kartu', panel), i: -1, timer: 0, seg: [] };
      ig.kartu.forEach(function (k, n) { var st = +k.getAttribute('data-st'); (ig.seg[st] = ig.seg[st] || []).push(n); k.setAttribute('data-n', n); var v = k.querySelector('video'); if (v) v.removeAttribute('controls'); });
      // Klon 3 kartu di kedua ujung rel sebagai tetangga visual (tanpa video: hanya poster), supaya kartu pertama/terakhir tidak menyisakan ruang kosong
      var klon = [];
      function buatKlon(k, awal) { var c = k.cloneNode(true); c.className += ' ig__kartu--klon'; c.setAttribute('aria-hidden', 'true'); var v = c.querySelector('video'); if (v) { var im = doc.createElement('img'); im.src = v.getAttribute('poster'); im.alt = ''; v.replaceWith(im); } c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; }); klon.push(c); if (awal) ig.rel.insertBefore(c, ig.rel.firstChild); else ig.rel.appendChild(c); }
      ig.kartu.slice(-3).reverse().forEach(function (k) { buatKlon(k, true); });
      ig.kartu.slice(0, 3).forEach(function (k) { buatKlon(k, false); });
      function igGeser() { // kartu aktif di tengah jendela
        var k = ig.kartu[ig.i]; if (!k) return;
        var x = k.offsetLeft + k.offsetWidth / 2 - ig.rel.parentNode.clientWidth / 2;
        ig.rel.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      }
      function igJadwal() {
        clearTimeout(ig.timer);
        if (!S.vis || doc.hidden || ig.i < 0) return;
        ig.timer = setTimeout(igLanjut, ig.kartu[ig.i].querySelector('video') ? IG_VIDEO : IG_FOTO);
      }
      function igSet(n) {
        if (n === ig.i) { igJadwal(); return; }
        ig.i = n;
        ig.kartu.forEach(function (k, m) {
          var on = m === n, v = k.querySelector('video'); k.classList.toggle('is-on', on);
          if (v) { if (on) { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
        });
        igGeser();
        igJadwal();
      }
      function igLanjut() { var seg = ig.seg[S.station] || [], p = seg.indexOf(ig.i); igSet(p < 0 ? seg[0] : seg[(p + 1) % seg.length]); }
      function igCue(st) { if (ig.seg[st]) igSet(ig.seg[st][0]); }
      // Klik tautan @username dibiarkan ke Instagram, tidak memajukan strip
      function igKlik(e) { if (e.target.closest('a')) return; var k = e.target.closest('.ig__kartu'); if (!k) return; var n = +k.getAttribute('data-n'); if (n === ig.i) igLanjut(); else igSet(n); }
      ig.rel.addEventListener('click', igKlik);
      doc.addEventListener('visibilitychange', igJadwal);
      // Dinding: tiap <i> digeser dengan transform sejauh d (px) modulo periode tile mask; periode = lebar × 1.3 × 1961 / 480
      var wDekat = { el: $('#turunDekat i', panel), per: 0 }, wJauh = { el: $('#turunJauh i', panel), per: 0 }, wAir = { el: $('#turunAir i', panel), per: 0 };
      var walls = [wDekat, wJauh, wAir];
      // Potongan figur dan sudut dasar pose menggantung (derajat)
      var BASE = { kepala: -4, lenganA: 15, lenganA2: 60, lenganB: -100, lenganB2: -40 };
      var tali = $('#turunTali', panel), inv, ptA = new DOMPoint(120, 160), ptB = new DOMPoint(120, 130), ptK = new DOMPoint(538, 1300), ptKaki = new DOMPoint(165, 320);
      // Bahu (sendi lenganA dalam ruang gambar badan) dan siku (sendi lenganA2 dalam ruang gambar lenganA), untuk IK lengan atas
      var ptBahu = new DOMPoint(392, 256), ptSiku = new DOMPoint(100, 236);
      var J = {};
      ['rig', 'pahaB', 'betisB', 'pahaA', 'betisA', 'badan', 'lenganB', 'lenganB2', 'kepala', 'karabiner', 'lenganA', 'lenganA2'].forEach(function (id) { J[id] = $('#' + id, panel); });
      // Keadaan statis dari markup, dipulihkan saat adegan dicabut
      var statis = {}, statisD = tali.getAttribute('d');
      Object.keys(J).forEach(function (id) { statis[id] = J[id].getAttribute('transform'); });
      var H = 0, lastMeter = '';

      // Kaki: IK dua tulang (paha, betis) dalam satuan viewBox. Sendi dan pivot dari data-j/data-p markup: panggul (147,500),
      // lutut = gambar paha (243,900), pergelangan = gambar betis (165,320). Pergelangan menempel di garis dinding dekat yang
      // miring 9° (sama dengan .turun__dinding), lewat pergelangan kaki dekat pada pose statis (paha 59°, betis -2°).
      var D2R = Math.PI / 180, HIP = { x: 147, y: 500 };
      var V1 = { x: 28 * 0.49, y: 671 * 0.49 }, V2 = { x: 7 * 0.49 * 2.8, y: 260 * 0.49 * 2.8 };
      var L1 = Math.hypot(V1.x, V1.y), L2 = Math.hypot(V2.x, V2.y), PHI1 = Math.atan2(V1.y, V1.x), PHI2 = Math.atan2(V2.y, V2.x);
      var U = { x: Math.sin(9 * D2R), y: Math.cos(9 * D2R) }, NRM = { x: U.y, y: -U.x }; // U menuruni dinding, NRM menjauhi dinding
      var F0 = { x: HIP.x + L1 * Math.cos(59 * D2R + PHI1) + L2 * Math.cos(57 * D2R + PHI2), y: HIP.y + L1 * Math.sin(59 * D2R + PHI1) + L2 * Math.sin(57 * D2R + PHI2) };
      // Pijakan dinyatakan sebagai a = jarak sepanjang U dari F0 (garis dinding tetap; yang berubah posisi orangnya, lihat postur())
      var ANGKAT = 95, figK = 1, figE = 0, PW = 0, Dw = null, LM = 0.9 * (L1 + L2);
      var pos = { tx: 0, ty: 0, aM: 0, badan: 18 };
      var kaki = [{ paha: J.pahaA, betis: J.betisA, w: 0, s: 0, ayun: null }, { paha: J.pahaB, betis: J.betisB, w: 0, s: 0, ayun: null }];
      // Pose ikonik di kedalaman 15 m (referensi: tergantung terbalik ala Spider-Man): tali bawah ditarik pemandu ke kanan,
      // orangnya rebah ke belakang sampai terbalik. Bobot w naik di 12-15 m, bertahan 15-18 m, turun di 18-21 m
      // (selesai sebelum teks stasiun 03 muncul di 22,5 m).
      // Rig diputar 180 derajat x w searah jarum jam di panggul dan bergeser menjauhi dinding; badan lurus, kaki lurus segaris
      // badan (jadi menunjuk ke atas) dengan pergelangannya nyantol di tali atas, kaki jauh menekuk ke arah dinding
      // (referensi Tebing 3), lengan lurus menjuntai ke bawah.
      var IKON = { dari: 12, puncak: 15, akhir: 18, lepas: 21, geserX: 120, geserY: 40, lenganA: 82, lenganA2: 12, lenganB: 98, lenganB2: 20 };
      var rig = { tx: 0, ty: 0, rot: 0 }, JANGKAR_X = 0.18, JANGKAR_M = 5;
      // Drone pemotret: masuk dari kiri di 12,5-15 m (slide + fade), melayang selama pose, dua kali kilat setelah tiba
      // (detik ke-0,6 dan 1,1 sejak tiba), lalu pergi ke kanan atas di 18-20,5 m. Begitu tiba, rangkaian kilat pasti dimainkan:
      // gulir cepat tidak bisa membawanya pergi sebelum kilat kedua selesai (lalu ia menyusul dalam ±0,9 detik), jadi
      // tidak perlu membatasi kecepatan gulir. Posisi dihitung dalam px layar lalu dikonversi ke viewBox lewat CTM figur.
      // Gambar 720x386, lensa di (356,301).
      var DRONE = { masuk: 12.5, tiba: 15, pergi: 18, hilang: 20.5, kilat: [0.6, 1.1], tahan: 0.35, susul: 0.9 };
      var drone = { el: $('#drone', panel), g: $('#droneBadan', panel), kilat: $('#droneKilat', panel), glow: $('#droneGlow', panel),
        percikG: $('#dronePercik', panel), baling: $$('.drone__baling > g', panel), x: null, vx: 0, rot: 0, h: 0, nyala: 0, tk: -1,
        tampak: false, percik: [], mulai: false, qe: 0 };
      var layarKilat = $('#turunKilat', panel);
      // Awan jauh (asap putih): 8 gambar berbeda di 3 lapisan, hanya di atas (mask memudar di 24-38% tinggi panel,
      // kira-kira setinggi badan). Melayang ke kanan menurut waktu (lapisan jauh lebih lambat, kecil, samar; lapisan dekat
      // lebih tinggi letaknya dan menumpuk di depan), muncul memudar dari balik tebing, dan saat turun hanya naik sedikit
      // (p = bagian tinggi panel per 30 m) karena letaknya jauh. Mask lapisan dibuat di measure() dari geometri dinding.
      // Jauh: pita tipis, lonjong, sepasang gumpalan; tengah: cumulus lebar, awan robek, awan berserat; dekat: dua cumulus menjulang.
      // [gambar, posisi awal (bagian lebar), pusat y (bagian tinggi), lebar (bagian lebar acuan), lapisan]; urutan = urutan tumpuk
      var AWAN = [[6, .10, .19, .34, 0], [7, .55, .21, .30, 0], [8, .95, .17, .26, 0],
        [3, .30, .13, .34, 1], [5, .75, .15, .32, 1], [4, 1.15, .10, .34, 1],
        [1, .05, .05, .30, 2], [2, .60, .04, .34, 2]];
      var LAPIS = [{ v: .005, p: .03, o: .3, s: .6 }, { v: .010, p: .06, o: .45, s: .85 }, { v: .018, p: .10, o: .6, s: 1.1 }];
      var awanEl = $('#turunAwan', panel), tebing = [{ el: $('#turunDekat', panel), a: 9 }, { el: $('#turunJauh', panel), a: 6 }], tepi = [];
      var awan = AWAN.map(function (a) {
        var im = new Image(); im.src = 'assets/img/awan-' + a[0] + '.webp'; im.alt = ''; im.decoding = 'async';
        awanEl.appendChild(im);
        return { el: im, px: null, x: a[1], y: a[2], w: a[3], l: LAPIS[a[4]], wpx: 0 };
      });
      // Laut: empat pita alun kontur putih (laut-1..4.webp, 1321 px, bisa diulang mendatar) ditumpuk di kanan bawah panel pada
      // ketinggian tetap: tumpukan 14% tinggi panel dengan tepi bawah di 96% (pilihan pengguna, kira-kira setinggi baris teks
      // "dinding kapur"). Di belakang dinding dan dipotong mask sejajar tepi tebing dengan pudar sempit (5% lebar) supaya laut
      // tampak menyentuh kaki tebing. Pita bawah paling dekat: paling besar, jelas, dan cepat. Gerak: bergeser pelan ke kiri
      // menurut waktu (laju 0,1 = sepersepuluh laju demo banding, pilihan pengguna), ayunan vertikal tipis, dan saat turun hanya
      // naik sedikit (p = bagian tinggi panel per 30 m). Tanpa ombak pecah di kaki tebing: gumpal tekstur dan ombak partikel
      // (demo kanvas) sudah dicoba dan ditolak pengguna, laut saja.
      // [skala tinggi (bagian tumpukan), ofset tepi bawah (bagian tumpukan), opasitas, detik per ulangan pada laju 1, paralaks p]
      // bawah > 1: pudar bawah pita 4 (22% tingginya) jatuh di luar panel supaya laut menutup sampai tepi bawah kontainer
      var LAUT = { tinggi: .18, bawah: 1.04, laju: .1 };
      var LAUT_LAPIS = [{ sk: .45, ofs: .66, o: .25, dur: 70, p: .04 }, { sk: .57, ofs: .44, o: .38, dur: 52, p: .05 },
        { sk: .68, ofs: .22, o: .5, dur: 40, p: .06 }, { sk: .80, ofs: 0, o: .65, dur: 30, p: .07 }];
      var lautEl = $('#turunLaut', panel);
      var laut = LAUT_LAPIS.map(function (l, k) {
        var el = document.createElement('div'), im = new Image();
        el.className = 'laut__lapis'; el.style.backgroundImage = 'url(assets/img/laut-' + (k + 1) + '.webp)';
        im.src = 'assets/img/laut-' + (k + 1) + '.webp';
        lautEl.appendChild(el);
        return { el: el, im: im, l: l, x: 0, h: 0, yb: 0, tw: 0 };
      });
      for (var pi = 0; pi < 16; pi++) {
        var pc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pc.setAttribute('r', '0'); drone.percikG.appendChild(pc);
        drone.percik.push({ el: pc, x: 0, y: 0, vx: 0, vy: 0, t: 1, T: 1 });
      }

      function lerp(a, b, t) { return a + (b - a) * t; }
      function halus(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
      // Transform potongan: translate(sendi) rotate(sudut) scale(skala) translate(-pivot), sama dengan markup statis
      function pose(el, a) {
        var j = el.getAttribute('data-j').split(','), p = el.getAttribute('data-p').split(','), sc = el.getAttribute('data-s');
        el.setAttribute('transform', 'translate(' + j[0] + ' ' + j[1] + ') rotate(' + a.toFixed(2) + ') scale(' + sc + ') translate(' + (-p[0]) + ' ' + (-p[1]) + ')');
      }
      // Titik titik tali dalam satuan viewBox: titik di ruang gambar potongan -> layar lewat CTM potongan -> ruang SVG lewat inverse CTM figur
      function ropePoint(pt, el) { return pt.matrixTransform(el.getScreenCTM()).matrixTransform(inv); }
      function moveWall(w, d) {
        var y = w.per > 0 ? -(((d % w.per) + w.per) % w.per) : 0;
        w.el.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
      }

      // Kecuraman tebing yang dilalui menurut posisi dinding D (satuan viewBox), 0 = landai, 1 = curam: ruas-ruas sepanjang
      // CURAM_RUAS bernilai tetap, berpindah halus di 40% akhir tiap ruas. Dinding yang tampak tidak berubah; ini hanya mengatur postur.
      var CURAM = [0.5, 1, 0.3, 0, 0.8, 0.15, 1, 0.45, 0.05, 0.7], CURAM_RUAS = 1100;
      function curam(D) {
        var x = Math.max(0, D) / CURAM_RUAS, i = Math.floor(x), f = Math.min(1, Math.max(0, (x - i - 0.6) / 0.4));
        var a = CURAM[i % CURAM.length], b = CURAM[(i + 1) % CURAM.length];
        return a + (b - a) * f * f * (3 - 2 * f);
      }
      // Postur menurut kecuraman c: kaki menunjuk β di bawah horizontal (landai 52°, curam 12°), panggul setinggi hy.
      // Titik tengah pijakan M ada di garis dinding setinggi hy + LM·sin β, panggul = M + LM·(cos β, -sin β), jadi saat landai
      // badan merapat ke dinding dan berdiri lebih tegak (paha-badan hampir segaris); saat curam kaki mendatar tegak lurus
      // dinding dan badan tegak, menekuk seperti huruf L. Hasilnya geseran rig (tx, ty) dan sudut badan.
      function postur(c) {
        var be = lerp(52, 12, c) * D2R, hy = lerp(560, 500, c), aM = (hy + LM * Math.sin(be) - F0.y) / U.y;
        pos.tx = F0.x + aM * U.x + LM * Math.cos(be) - HIP.x;
        pos.ty = hy - HIP.y;
        pos.aM = aM;
        pos.badan = lerp(20, 2, c);
      }
      // Pergelangan ke (x, y) di ruang rig; lutut menekuk ke atas. Target di luar jangkauan dipendekkan ke panjang kaki
      function ik(k, x, y) {
        var dx = x - HIP.x, dy = y - HIP.y, al = Math.atan2(dy, dx);
        var d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
        var t1 = al + Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
        var kx = HIP.x + L1 * Math.cos(t1), ky = HIP.y + L1 * Math.sin(t1);
        var t2 = Math.atan2(HIP.y + d * Math.sin(al) - ky, HIP.x + d * Math.cos(al) - kx), a = (t1 - PHI1) / D2R;
        pose(k.paha, a);
        pose(k.betis, (t2 - PHI2) / D2R - a);
      }
      // Berjalan mundur menuruni tebing: kaki berpijak menempel di dinding dan ikut naik bersama dinding (d px layar -> satuan
      // viewBox lewat figK). Kalau pijakan sudah terlalu tinggi, kaki diangkat menjauhi dinding dan dipijakkan lagi di bawah;
      // gulir balik membalik arahnya. Hanya satu kaki mengayun sekaligus. Kembali dari luar layar (lompatan besar): pijakan disetel ulang.
      function langkah(dt, d, w) {
        var D = d / figK, v = Dw === null ? 0 : (D - Dw) / Math.max(dt, 1e-4);
        // Panggul dalam ruang viewBox; rentang pijakan aAtas..aBawah di sekitar M, dibatasi jangkauan kaki
        var hx = HIP.x + rig.tx, hy = HIP.y + rig.ty;
        var rc = Math.cos(-rig.rot * D2R), rs = Math.sin(-rig.rot * D2R);
        // Titik viewBox -> ruang rig: kurangi geseran, putar balik di panggul
        function lokal(x, y) { var dx = x - hx, dy = y - hy; return { x: HIP.x + dx * rc - dy * rs, y: HIP.y + dx * rs + dy * rc }; }
        var aC = (hx - F0.x) * U.x + (hy - F0.y) * U.y, h = (hx - F0.x) * NRM.x + (hy - F0.y) * NRM.y;
        var aMax = aC + Math.sqrt(Math.max(0, Math.pow(0.97 * (L1 + L2), 2) - h * h));
        var aBawah = Math.min(pos.aM + 110, aMax), aAtas = pos.aM - 120;
        if (Dw === null || Math.abs(D - Dw) > 400) kaki.forEach(function (k, i) { k.ayun = null; k.w = (i ? pos.aM - 20 : aBawah - 10) + D; v = 0; });
        Dw = D;
        kaki.forEach(function (k, i) {
          // Selama pose ikonik kaki lepas dari dinding; pijakan disiapkan ulang supaya mendarat rapi saat pose selesai
          if (w > 0.5) { k.ayun = null; k.w = (i ? pos.aM - 20 : aBawah - 10) + D; }
          if (!k.ayun) {
            k.s = k.w - D;
            var naik = k.s < aAtas, mundur = k.s > aBawah + 18;
            if ((naik || mundur) && !kaki[1 - i].ayun && w < 0.05) {
              k.ayun = { s0: k.s, s1: naik ? aBawah : aAtas + 60, u: 0, T: Math.max(0.16, Math.min(0.55, (aBawah - aAtas) / (Math.abs(v) * 1.3 + 1))) };
            }
          }
          var lift = 0;
          if (k.ayun) {
            var a = k.ayun, e;
            a.u = Math.min(1, a.u + dt / a.T);
            e = a.u * a.u * (3 - 2 * a.u);
            // Angkat dulu, baru turun: puncak angkatan di awal ayunan, pijakan mendarat pelan
            k.s = a.s0 + (a.s1 - a.s0) * e;
            lift = ANGKAT * Math.sin(Math.PI * Math.pow(a.u, 0.75));
            if (a.u >= 1) { k.ayun = null; k.w = k.s + D; }
          }
          var t = lokal(F0.x + U.x * k.s + NRM.x * lift, F0.y + U.y * k.s + NRM.y * lift);
          if (w > 0) {
            // Pose (arah sebelum rig diputar 180°): kaki dekat lurus segaris badan; kaki jauh menekuk, telapak ke kanan bawah,
            // jadi setelah terbalik lututnya di atas dan betisnya mengarah ke dinding.
            // Di tengah putaran lutut ditekuk supaya badan yang melintang tidak terlalu panjang (layar ponsel)
            var r = (i ? 0.6 : 0.97) * (L1 + L2) * (1 - 0.4 * Math.sin(Math.PI * w)), al = (i ? 24 : 90) * D2R;
            t = { x: lerp(t.x, HIP.x + r * Math.cos(al), w), y: lerp(t.y, HIP.y + r * Math.sin(al), w) };
          }
          ik(k, t.x, t.y);
        });
      }

      // Kilat: cahaya lensa dan lapisan panel menyala cepat lalu meredup, percikan terlempar dari lensa
      function nyalakan(lx, ly) {
        drone.tk = 0;
        layarKilat.style.setProperty('--kx', lx.toFixed(0) + 'px');
        layarKilat.style.setProperty('--ky', ly.toFixed(0) + 'px');
        drone.percik.forEach(function (p) {
          var a = Math.random() * 2 * Math.PI, v = 450 + Math.random() * 1000;
          p.x = 0; p.y = 0; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v * 0.7; p.t = 0; p.T = 0.6 + Math.random() * 0.5;
          p.el.setAttribute('r', (5 + Math.random() * 7).toFixed(1));
        });
      }
      function droneTick(dt, tt, kd, ctm) {
        var e = halus((kd - DRONE.masuk) / (DRONE.tiba - DRONE.masuk)), q = halus((kd - DRONE.pergi) / (DRONE.hilang - DRONE.pergi));
        // Rangkaian kilat: mulai saat drone tiba (selama belum mulai pergi), disetel ulang hanya setelah gulir balik ke atas
        if (e < 0.5) { drone.mulai = false; drone.h = 0; drone.nyala = 0; }
        else if (!drone.mulai && e > 0.98 && q < 0.5) drone.mulai = true;
        if (drone.mulai) drone.h += dt;
        var tahan = drone.mulai && drone.h < DRONE.kilat[DRONE.kilat.length - 1] + DRONE.tahan;
        // Kepergian efektif: ditahan 0 selama rangkaian kilat, lalu menyusul posisi gulir paling cepat dalam DRONE.susul detik
        var qT = tahan ? 0 : q;
        drone.qe = qT > drone.qe ? Math.min(qT, drone.qe + dt / DRONE.susul) : qT;
        q = drone.qe;
        var op = Math.min(1, e * 1.6) * Math.min(1, (1 - q) * 1.6);
        var on = op > 0.002 || drone.tk >= 0;
        if (on !== drone.tampak) {
          drone.tampak = on; drone.el.setAttribute('visibility', on ? 'visible' : 'hidden');
          if (!on) { drone.x = null; drone.vx = 0; }
        }
        if (!on) return;
        // Lebar drone ±240 px (ponsel 38% lebar layar); titik melayang di kanan orang, dijaga tetap di dalam layar
        var wPx = Math.min(240, PW * 0.38), s = wPx / ctm.a / 720;
        var hx = Math.min(ctm.e + (HIP.x + rig.tx + 700) * ctm.a, PW - wPx / 2 - 14), hy = H * (PW < 640 ? 0.25 : 0.29);
        var pe = 1 - Math.pow(1 - e, 2.2), pq = q * q;
        var sx = lerp(-wPx * 0.7, hx, pe) + (PW + wPx * 0.7 - hx) * pq;
        var sy = hy - 70 * (1 - pe) - 160 * pq + Math.sin(tt * 1.7) * 5 + Math.sin(tt * 0.8) * 3;
        // Miring ke arah terbang (dari kecepatan layar), plus goyang kecil saat melayang
        if (drone.x !== null && dt > 0) drone.vx = lerp(drone.vx, (sx - drone.x) / dt, 1 - Math.pow(0.02, dt));
        drone.x = sx;
        var tilt = Math.max(-14, Math.min(14, drone.vx * 0.03)) + Math.sin(tt * 1.3) * 1.2;
        drone.el.setAttribute('opacity', (op * 0.92).toFixed(3));
        drone.g.setAttribute('transform', 'translate(' + ((sx - ctm.e) / ctm.a).toFixed(1) + ' ' + ((sy - ctm.f) / ctm.d).toFixed(1) +
          ') rotate(' + tilt.toFixed(2) + ') scale(' + s.toFixed(4) + ') translate(-360 -193)');
        // Baling-baling: pasangan diagonal berputar searah, pasangan lain berlawanan
        drone.rot = (drone.rot + dt * 2200) % 360;
        drone.baling.forEach(function (b, i) { b.setAttribute('transform', 'rotate(' + ((i === 0 || i === 3 ? 1 : -1) * drone.rot).toFixed(1) + ')'); });
        if (drone.mulai && drone.nyala < DRONE.kilat.length && drone.h >= DRONE.kilat[drone.nyala]) {
          drone.nyala++;
          nyalakan(sx + (356 - 360) * s * ctm.a, sy + (301 - 193) * s * ctm.a);
        }
        if (drone.tk >= 0) {
          drone.tk += dt;
          var t = drone.tk, b = t < 0.05 ? t / 0.05 : Math.exp(-(t - 0.05) * 9), hidup = false;
          drone.kilat.setAttribute('opacity', b.toFixed(3));
          drone.glow.setAttribute('r', (40 + 280 * (1 - Math.exp(-t * 14))).toFixed(1));
          layarKilat.style.opacity = (b * 0.5).toFixed(3);
          drone.percik.forEach(function (p) {
            if (p.t >= p.T) return;
            p.t += dt; p.vx *= Math.pow(0.08, dt); p.vy = p.vy * Math.pow(0.08, dt) + 260 * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            var o = Math.max(0, 1 - p.t / p.T);
            p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1)); p.el.setAttribute('opacity', o.toFixed(3));
            if (o > 0) hidup = true;
          });
          if (t > 0.6 && !hidup) { drone.tk = -1; drone.kilat.setAttribute('opacity', '0'); layarKilat.style.opacity = '0'; }
        }
      }

      // Tepi kanan tebing di ketinggian y (px panel): sudut kanan atas dinding tetap (transform-origin 100% 0), lalu
      // bergeser ke kanan tan(sudut) per px ke bawah; dinding dekat dan jauh, mana yang lebih menjorok
      function tepiX(y) {
        var x = -1e9;
        tepi.forEach(function (e) { x = Math.max(x, e.R + (y - e.T) * e.k); });
        return x + 6;
      }
      function ukurAwan() {
        tepi = tebing.map(function (t) { return { R: t.el.offsetLeft + t.el.offsetWidth, T: t.el.offsetTop, k: Math.tan(t.a * D2R) }; });
        // Mask lembut: sejajar tepi tebing (0 di kiri garis, naik ke 1 sejauh 12% lebar ke kanan) dikali pudar vertikal
        // (penuh sampai 24% tinggi, hilang di 38%); gradien SVG dalam px panel
        var L0 = tepiX(0), LH = tepiX(H), dx = LH - L0, len = Math.hypot(dx, H) || 1, F = PW * 0.12;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + PW + '" height="' + H + '"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="' +
          L0.toFixed(1) + '" y1="0" x2="' + (L0 + H / len * F).toFixed(1) + '" y2="' + (-dx / len * F).toFixed(1) +
          '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
          '<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset=".24" stop-color="#fff"/><stop offset=".38" stop-color="#000"/></linearGradient>' +
          '<mask id="m"><rect width="100%" height="100%" fill="url(#v)"/></mask></defs><rect width="100%" height="100%" fill="url(#g)" mask="url(#m)"/></svg>';
        var st = awanEl.style, u = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        st.webkitMaskImage = st.maskImage = u; st.webkitMaskSize = st.maskSize = '100% 100%';
        // Lebar acuan: ponsel memakai 2,2x lebar layar supaya awan tidak terlalu kecil
        var acuan = PW < 640 ? PW * 2.2 : PW;
        awan.forEach(function (a) { a.wpx = a.w * a.l.s * acuan; a.el.style.width = a.wpx.toFixed(0) + 'px'; });
      }
      function awanTick(dt, kd) {
        var cepat = PW < 640 ? 0.6 : 1;
        awan.forEach(function (a) {
          var nw = a.el.naturalWidth;
          if (!nw) return;
          if (a.px === null) a.px = a.x * PW;
          a.px += a.l.v * cepat * PW * dt;
          var yc = (a.y - a.l.p * Math.min(1, kd / TINGGI_M)) * H, tinggi = a.wpx * a.el.naturalHeight / nw;
          // Mulai sedikit di balik tebing, memudar masuk selama setengah lebarnya, melayang ke kanan sampai keluar layar, lalu berulang
          var x0 = tepiX(yc) - a.wpx * 0.35, span = Math.max(1, PW - x0), u = ((a.px % span) + span) % span;
          var f = Math.min(1, u / (a.wpx * 0.5));
          a.el.style.opacity = (a.l.o * f * f * (3 - 2 * f)).toFixed(3);
          a.el.style.transform = 'translate3d(' + (x0 + u).toFixed(1) + 'px,' + (yc - tinggi / 2).toFixed(1) + 'px,0)';
        });
      }
      function ukurLaut() {
        var yb = LAUT.bawah * H, tot = LAUT.tinggi * H;
        laut.forEach(function (a) {
          a.h = tot * a.l.sk; a.yb = yb - tot * a.l.ofs; a.tw = 0;
          a.el.style.height = a.h.toFixed(1) + 'px'; a.el.style.opacity = a.l.o;
        });
        // Mask: sejajar tepi tebing (0 di garis tepi, naik ke 1 sejauh 5% lebar ke kanan); gradien SVG dalam px panel
        var L0 = tepiX(0), LH = tepiX(H), dx = LH - L0, len = Math.hypot(dx, H) || 1, F = PW * 0.05;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + PW + '" height="' + H + '"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="' +
          L0.toFixed(1) + '" y1="0" x2="' + (L0 + H / len * F).toFixed(1) + '" y2="' + (-dx / len * F).toFixed(1) +
          '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
        var st = lautEl.style, u = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        st.webkitMaskImage = st.maskImage = u; st.webkitMaskSize = st.maskSize = '100% 100%';
      }
      function lautTick(dt, t, kd) {
        var cepat = PW < 640 ? 0.6 : 1, naik = Math.min(1, kd / TINGGI_M);
        laut.forEach(function (a, k) {
          var nw = a.im.naturalWidth;
          if (!nw) return;
          var tw = a.h * nw / a.im.naturalHeight; // lebar satu ulangan pita (px)
          if (tw !== a.tw) { a.tw = tw; a.el.style.width = Math.ceil(PW + 2 * tw) + 'px'; }
          a.x += tw / a.l.dur * LAUT.laju * cepat * dt;
          var u = ((a.x % tw) + tw) % tw;
          var y = a.yb - a.h - a.l.p * naik * H + Math.sin(t * 2 * Math.PI / 7 + k * 1.3) * 0.015 * a.h;
          a.el.style.transform = 'translate3d(' + (-u).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        });
      }

      // Ukuran yang bergantung layar: tinggi panel dan periode dinding
      function measure() {
        H = panel.clientHeight;
        var c = fig.getScreenCTM();
        if (c && c.a) { figK = c.a; figE = c.e; }
        PW = panel.clientWidth;
        walls.forEach(function (w) {
          w.per = w.el.offsetWidth * 1.3 * 1961 / 480;
          // <i> harus lebih tinggi satu periode dari kotaknya supaya tetap menutup saat digeser naik
          w.el.style.height = Math.ceil(w.el.parentNode.clientHeight + w.per) + 'px';
        });
        ukurAwan();
        ukurLaut();
        igGeser();
      }

      function showStation(i) { nomor.textContent = '0' + (i + 1); igCue(i); }

      function tick(time, dtMs) {
        var dt = Math.min(0.05, (dtMs || 0) / 1000), prev = S.p;
        S.p = lerp(S.p, S.raw, 1 - Math.pow(0.0005, dt));
        S.v = lerp(S.v, (S.p - prev) / Math.max(dt, 1e-4), 1 - Math.pow(0.001, dt));
        if (Math.abs(S.v) > 0.02) S.dir = S.v > 0 ? 1 : -1;
        var vn = Math.min(1, Math.abs(S.v) / 0.45);
        S.amp = lerp(S.amp, vn, 1 - Math.pow(0.002, dt));
        S.phase += dt * (0.15 + 2.1 * vn) * 2 * Math.PI;
        // Di luar layar: cukup keadaan skalar di atas, tanpa tulis DOM maupun getScreenCTM (hindari layout paksa tiap frame)
        if (!S.vis) return;

        var st = Math.max(0, Math.min(N - 1, Math.round(S.p * (N - 1))));
        if (st !== S.station) {
          var dir = st > S.station ? 1 : -1;
          S.station = st; showStation(st);
          gsap.killTweensOf(S, 'bounce');
          gsap.fromTo(S, { bounce: dir * 22 }, { bounce: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' });
        }

        // Kedalaman (m) dari progres pin; dinding naik mengikutinya, air ikut dinding dan mengalir ke bawah 140 px/detik
        var kd = kedalaman(S.p), d = kd / TINGGI_M * TRAVEL * H, t = (time || 0) % ((wAir.per || 1) / 140);
        postur(curam(d / figK));
        moveWall(wDekat, d);
        moveWall(wJauh, d * 0.45);
        moveWall(wAir, d - 140 * t);
        awanTick(dt, kd);
        lautTick(dt, time || 0, kd);


        // Rig: badan condong mengikuti arah dan kecepatan gulir, lengan berayun; kaki melangkah lewat langkah() di akhir
        var tt = time || 0, sw = Math.sin(S.phase + 1);
        var idle = Math.sin(tt * 1.1) * 0.8;
        S.lean = lerp(S.lean, S.dir * 5 * S.amp + S.v * 10, 1 - Math.pow(0.01, dt));
        // Badan sedikit turun bertumpu ke tali selagi satu kaki terangkat
        var dip = 0, ayunF = 0; // ayunF: fase langkah 0..1 (puncak saat kaki di tengah ayunan), dipakai juga tangan atas
        kaki.forEach(function (k) { if (k.ayun) { var f = Math.sin(Math.PI * k.ayun.u); dip += 9 * f; ayunF = Math.max(ayunF, f); } });
        var rigY = S.bounce + dip;
        // Bobot pose ikonik dari kedalaman, dihaluskan di kedua ujung
        var w = halus((kd - IKON.dari) / (IKON.puncak - IKON.dari)) * (1 - halus((kd - IKON.akhir) / (IKON.lepas - IKON.akhir)));
        var goyang = Math.sin(tt * 0.7) * 3 * w; // tergantung terbalik: berayun pelan di tali
        // Geser menjauhi dinding, tapi di layar sempit panggul digeser ke kiri secukupnya supaya kepala (±720 satuan dari
        // panggul) tidak keluar tepi kanan saat badan melintang di tengah putaran
        var batas = (PW - 720 * figK - 8 - figE) / figK - HIP.x - pos.tx;
        rig.tx = pos.tx + Math.min(IKON.geserX, batas) * w; rig.ty = pos.ty + rigY * (1 - w) + IKON.geserY * w; rig.rot = 180 * w + goyang;
        J.rig.setAttribute('transform', 'translate(' + rig.tx.toFixed(2) + ' ' + rig.ty.toFixed(2) + ') rotate(' + rig.rot.toFixed(2) + ' ' + HIP.x + ' ' + HIP.y + ')');
        // Sudut badan dari postur(); kepala mengimbangi sebagian supaya tetap menghadap dinding. Saat pose: badan lurus, lengan menjuntai
        pose(J.badan, lerp(pos.badan + idle + S.lean, 0, w));
        pose(J.kepala, lerp(BASE.kepala - S.lean * 0.5 - (pos.badan - 18) * 0.4, 6, w) + Math.sin(tt * 0.9) * 1.2);
        pose(J.karabiner, Math.sin(tt * 1.3) * 3 - S.lean * 0.3 * (1 - w));
        // Lengan atas: dipose dulu pada sudut dasar untuk mengukur rantainya, pose akhirnya dari IK ke tali di blok tali di bawah
        pose(J.lenganA, BASE.lenganA);
        pose(J.lenganA2, BASE.lenganA2);
        // Tangan rem: ikut fase langkah (mengulur tali: terangkat ke arah alat lalu turun lagi tiap langkah) di atas ayunan halus
        pose(J.lenganB, lerp(BASE.lenganB + 8 * S.amp * sw + Math.sin(tt * 1.7) * 1.5 - 22 * ayunF, IKON.lenganB + Math.sin(tt * 1.2 + 1) * 4, w));
        pose(J.lenganB2, lerp(BASE.lenganB2 - 5 * S.amp * sw + 16 * ayunF, IKON.lenganB2, w));
        langkah(dt, d, w);

        // Tali: dari jangkar di tepi atas panel, JANGKAR_X lebar panel dari kiri (pilihan pengguna; lurus ke atas dan miring 12 derajat
        // terasa kurang, tepat di pojok kiri atas terasa jelek) LURUS ke ujung karabiner (tangan atas menggenggam di garis itu, bukan
        // tali yang menekuk di tangan; pengguna: tangan mengikuti tegangan tali), melengkung ke tangan rem, lalu turun keluar kotak
        // (saat pose ikonik tangan lepas dari tali, lihat jalur ikon)
        var ctm = fig.getScreenCTM();
        if (ctm) {
          inv = ctm.inverse();
          var hB = ropePoint(ptB, J.lenganB2), kr = ropePoint(ptK, J.karabiner);
          var kk = w > 0 ? ropePoint(ptKaki, J.betisA) : kr; // pergelangan kaki dekat, tempat tali atas nyantol saat pose
          // Jalur biasa dan jalur pose (tali atas datang miring dari kiri atas, nyantol di pergelangan kaki dekat, lalu ke karabiner;
          // tali bawah lurus ditarik ke kanan bawah), dibaur w
          var ex = kr.x + 420, ey = 2200, g = function (t) { return [kr.x + (ex - kr.x) * t, kr.y + (ey - kr.y) * t]; };
          // Jangkar: titik di tepi atas panel dalam satuan viewBox, diteruskan 30% melewatinya supaya tali keluar panel.
          // Di 0 m tepat di pojok kiri atas, bergeser halus ke JANGKAR_X lebar panel sampai JANGKAR_M meter (pilihan pengguna)
          var pr = panel.getBoundingClientRect(), jx = JANGKAR_X * halus(kd / JANGKAR_M);
          var sx = (pr.left + pr.width * jx - ctm.e) / ctm.a, sy = (pr.top - ctm.f) / ctm.d;
          // Lengan atas mengikuti tegangan tali: tangan menggenggam di garis jangkar-karabiner sejauh ±76% jangkauan lengan dari bahu
          // saat diam (plus ayunan kecil), dan merambat ke atas tali sampai ±94% selagi kaki melangkah (lengan merentang lalu menarik
          // lagi tiap langkah; permintaan pengguna: gerak tangan atas lebih terasa saat melangkah), minimal 90 satuan di atas karabiner; lengan dipose IK dua tulang (bahu, siku) dalam satuan viewBox.
          // Rantai diukur dari pose dasar: sudut rotate aditif sepanjang rantai (badan > lengan atas > lengan bawah, skala seragam),
          // arah tekukan siku mengikuti pose dasar.
          var bahu = ropePoint(ptBahu, J.badan), siku = ropePoint(ptSiku, J.lenganA), tgn = ropePoint(ptA, J.lenganA2);
          var ux = siku.x - bahu.x, uy = siku.y - bahu.y, vx = tgn.x - siku.x, vy = tgn.y - siku.y;
          var Lu = Math.hypot(ux, uy), Lf = Math.hypot(vx, vy), thU = Math.atan2(uy, ux), thF = Math.atan2(vy, vx), tekuk = ux * vy - uy * vx < 0 ? 1 : -1;
          var nx = sx - kr.x, ny = sy - kr.y, nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          var R = (0.76 + 0.04 * Math.sin(tt * 1.1) + 0.18 * ayunF) * (Lu + Lf), bq = nx * (kr.x - bahu.x) + ny * (kr.y - bahu.y);
          var cq = (kr.x - bahu.x) * (kr.x - bahu.x) + (kr.y - bahu.y) * (kr.y - bahu.y) - R * R, disc = bq * bq - cq;
          var tq = Math.max(90, disc > 0 ? -bq + Math.sqrt(disc) : -bq);
          var hA = { x: kr.x + nx * tq, y: kr.y + ny * tq };
          var rx = hA.x - bahu.x, ry = hA.y - bahu.y, al = Math.atan2(ry, rx), dd = Math.max(Math.abs(Lu - Lf) + 1, Math.min(Lu + Lf - 0.5, Math.hypot(rx, ry)));
          var t1 = al + tekuk * Math.acos((Lu * Lu + dd * dd - Lf * Lf) / (2 * Lu * dd));
          var e2x = bahu.x + Lu * Math.cos(t1), e2y = bahu.y + Lu * Math.sin(t1);
          var t2 = Math.atan2(bahu.y + dd * Math.sin(al) - e2y, bahu.x + dd * Math.cos(al) - e2x);
          var a1 = BASE.lenganA + (t1 - thU) / D2R, a2 = BASE.lenganA2 + (t2 - thF) / D2R - (a1 - BASE.lenganA);
          pose(J.lenganA, lerp(a1, IKON.lenganA + Math.sin(tt * 1.4) * 4, w));
          pose(J.lenganA2, lerp(a2, IKON.lenganA2, w));
          var biasa = [hA.x + (sx - hA.x) * 1.3, hA.y + (sy - hA.y) * 1.3, hA.x, hA.y, kr.x, kr.y, kr.x + 40, kr.y + 60, hB.x - 30, hB.y - 40, hB.x, hB.y, hB.x + 10, hB.y + 200, hB.x + 14, 1500, hB.x + 14, 2200];
          var ikon = [kk.x + (sx - kk.x) * 1.3, kk.y + (sy - kk.y) * 1.3, kk.x, kk.y, kr.x, kr.y, kr.x + 30, kr.y + 60].concat(g(0.2), g(0.3), g(0.55), g(0.85), [ex, ey]);
          var q = biasa.map(function (n, k) { return lerp(n, ikon[k], w); });
          // Selama perubahan pose (0 < w < 1) pembauran titik demi titik membuat tali menekuk di titik genggam/pergelangan;
          // pengguna: tidak realistis. Di tengah transisi jalur dibaurkan ke jalur lurus: jangkar-karabiner satu garis, dan
          // karabiner-ujung bawah satu garis (titik kendali kurva diletakkan di garis itu). Bobot u = 0 di kedua ujung, 1 di tengah.
          var u = Math.sin(Math.PI * w);
          if (u > 0) {
            var ax = q[0], ay = q[1], bx = q[16], by = q[17], kx = q[4], ky = q[5];
            var L = function (t) { return [kx + (bx - kx) * t, ky + (by - ky) * t]; };
            var lurus = [ax, ay, (ax + kx) / 2, (ay + ky) / 2, kx, ky].concat(L(0.25), L(0.45), L(0.55), L(0.7), L(0.85), [bx, by]);
            q = q.map(function (n, k) { return lerp(n, lurus[k], u); });
          }
          q = q.map(function (n) { return n.toFixed(1); });
          tali.setAttribute('d', 'M' + q[0] + ' ' + q[1] + ' L' + q[2] + ' ' + q[3] + ' L' + q[4] + ' ' + q[5] +
            ' C' + q[6] + ' ' + q[7] + ' ' + q[8] + ' ' + q[9] + ' ' + q[10] + ' ' + q[11] +
            ' C' + q[12] + ' ' + q[13] + ' ' + q[14] + ' ' + q[15] + ' ' + q[16] + ' ' + q[17]);
          droneTick(dt, tt, kd, ctm);
        }

        // Meteran satu desimal dengan koma (0,0 m di awal pin, naik rata sampai 30,0 m)
        var m = kd.toFixed(1).replace('.', ',') + ' m';
        if (m !== lastMeter) { lastMeter = m; meter.textContent = m; }
      }

      var pin = ST.create({
        trigger: panel, start: 'top top', end: '+=' + opts.pinPct + '%', pin: true, anticipatePin: 1, refreshPriority: 2,
        onUpdate: function (t) { S.raw = t.progress; },
        onRefresh: function (t) { S.raw = t.progress; },
        onToggle: function (t) { root.classList.toggle('turun-pinned', t.isActive); }
      });
      // Gerbang visibilitas: loop hanya menulis DOM selagi bagian ini terlihat di layar (tanpa pin)
      var visGate = ST.create({ trigger: '#turun', start: 'top bottom', end: 'bottom top', onToggle: function (t) { S.vis = t.isActive; igJadwal(); } });
      S.vis = visGate.isActive;
      // Muat ulang di tengah bagian: mulai dari progres tersimpan, bukan dari 0
      S.raw = S.p = pin.progress;
      S.station = Math.max(0, Math.min(N - 1, Math.round(S.p * (N - 1))));
      nomor.textContent = '0' + (S.station + 1);
      measure();
      igCue(S.station);
      tick(0, 0);
      gsap.ticker.add(tick);
      // ScrollTrigger me-refresh sendiri saat ukuran berubah, jadi cukup satu pendengar 'refresh' (tanpa 'resize')
      ST.addEventListener('refresh', measure);
      if (location.search.indexOf('debug') > -1) { window.__turun = S; window.__turunTick = tick; window.__turunBase = BASE; }

      return function () {
        gsap.ticker.remove(tick);
        ST.removeEventListener('refresh', measure);
        pin.kill();
        visGate.kill();
        root.classList.remove('turun-pinned');
        clearTimeout(ig.timer);
        ig.rel.removeEventListener('click', igKlik); doc.removeEventListener('visibilitychange', igJadwal);
        ig.kartu.forEach(function (k) { k.classList.remove('is-on'); var v = k.querySelector('video'); if (v) { v.pause(); v.setAttribute('controls', ''); } });
        ig.rel.style.transform = ''; ig.i = -1;
        klon.forEach(function (c) { c.remove(); }); klon.length = 0;
        gsap.killTweensOf(S);
        Object.keys(J).forEach(function (id) { if (statis[id] === null) J[id].removeAttribute('transform'); else J[id].setAttribute('transform', statis[id]); });
        tali.setAttribute('d', statisD);
        drone.el.setAttribute('visibility', 'hidden'); drone.el.setAttribute('opacity', '0'); drone.kilat.setAttribute('opacity', '0');
        drone.percik.forEach(function (p) { p.el.remove(); });
        layarKilat.style.cssText = '';
        awan.forEach(function (a) { a.el.remove(); });
        awanEl.style.cssText = '';
        laut.forEach(function (a) { a.el.remove(); });
        lautEl.style.cssText = '';
        gsap.set(walls.map(function (w) { return w.el; }), { clearProps: 'all' });
        nomor.textContent = '01'; meter.textContent = '0,0 m';
        if (window.__turun === S) { delete window.__turun; delete window.__turunTick; delete window.__turunBase; }
      };
    }
    // Panjang pin dipertahankan seperti saat masih empat stasiun (4 x 120% / 4 x 100%) supaya turunnya terasa lama: 30 m ditempuh sepanjang pin
    mm.add('(min-width: 64rem)', function () { return turunCloseup({ pinPct: 480 }); });
    // 63.999rem (bukan 63.99rem): lebar pecahan antara 63.99 dan 64rem tidak jatuh di celah antara dua media
    mm.add('(max-width: 63.999rem)', function () { return turunCloseup({ pinPct: 400 }); });

    // ---------- Galeri: digeser horizontal saat discroll, tiap foto ber-parallax ----------
    mm.add('(min-width: 64rem)', function () {
      root.classList.add('is-pinned');
      var gtrack = $('.galeri__track'), section = $('.galeri');
      var dist = function () { return Math.max(0, gtrack.scrollWidth + parseFloat(getComputedStyle(gtrack).paddingLeft) - section.clientWidth); };
      var tween = gsap.to(gtrack, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
          // Rel samping disembunyikan selama foto lewat di bawahnya
          onToggle: function (t) { $('.rail').classList.toggle('is-hidden', t.isActive); }
        }
      });
      $$('.g img').forEach(function (img) {
        gsap.fromTo(img, { xPercent: -6, scale: 1.12 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      return function () { root.classList.remove('is-pinned'); };
    });
  }
  if (gsap && ST) {
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener('load', function () { ST.refresh(); });
  }

  // ---------- Kapan datang ----------
  var cond = { laut: 'surut', cuaca: 'cerah', waktu: 'pagi' };
  var verdict = $('#verdict'), vStatus = $('#vStatus'), vTitle = $('#vTitle'), vList = $('#vList'), seaViz = $('#seaViz'), vBody = $('#vBody'), gaugeLevel = $('#gaugeLevel');
  function setVerdict(animate) {
    var c = cond, items, status, title, color;
    seaViz.classList.toggle('pasang', c.laut === 'pasang');
    seaViz.classList.toggle('hujan', c.cuaca === 'hujan');
    seaViz.dataset.waktu = c.waktu;
    gaugeLevel.textContent = c.laut === 'pasang' ? 'pasang' : 'surut';
    if (c.cuaca === 'hujan') {
      status = 'Sebaiknya ditunda'; color = 'var(--color-bad)'; title = 'Jalur makadam licin dan arus sungai naik. Tunda kunjungan.';
      items = ['Jalan tanah di kebun tebu sulit dilewati motor saat hujan.', 'Debit air terjun meningkat, kolam alami dan tebing jadi berbahaya.', 'Operator biasanya menjadwalkan ulang canyoneering saat hujan.'];
    } else if (c.laut === 'pasang') {
      status = 'Hanya dari atas'; color = 'var(--color-warn)'; title = 'Pantai tertutup ombak. Nikmati dari tebing dan kolam alami.';
      items = ['Jangan turun ke pantai; ombak selatan menghantam karang di bawah air terjun.', 'Kolam alami di atas tebing tetap bisa dikunjungi.', 'Foto air terjun dari atas, tunggu surut jika ingin turun.'];
    } else {
      status = 'Waktu terbaik'; color = 'var(--color-ok)'; title = 'Turun ke pantai, nikmati air terjun dari bawah.';
      items = ['Pasir putih dan kaki air terjun terbuka saat surut.',
        c.waktu === 'pagi' ? 'Pagi: cahaya lembut dan udara belum panas, paling nyaman untuk trekking.' : (c.waktu === 'siang' ? 'Siang: panas terik, bawa topi, tabir surya, dan air cukup.' : 'Sore: perhatikan waktu, jalur turun tebing gelap setelah matahari terbenam.'),
        'Tetap pantau ombak; surut bisa berbalik dalam beberapa jam.'];
    }
    var apply = function () {
      verdict.style.setProperty('--vc', color); vStatus.textContent = status; vTitle.textContent = title;
      vList.textContent = '';
      items.forEach(function (s) { var li = doc.createElement('li'); li.textContent = s; vList.appendChild(li); });
    };
    if (!animate || reduce) { apply(); return; }
    vBody.classList.add('out'); clearTimeout(vBody._t);
    vBody._t = setTimeout(function () { apply(); vBody.classList.remove('out'); }, 130);
  }
  $$('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.k; cond[k] = b.dataset.v;
      $$('.seg button[data-k="' + k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      setVerdict(true);
    });
  });
  setVerdict(false);
  // Loop ombak, arus, hujan hanya berjalan saat gauge ada di layar
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seaViz.classList.toggle('is-live', es[0].isIntersecting); }).observe(seaViz);
  else seaViz.classList.add('is-live');

  // ---------- Tab rute (klik dan tombol panah) ----------
  var tabs = $$('.tabs [role=tab]');
  function selectTab(b) {
    tabs.forEach(function (x) {
      var on = x === b;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      var panel = $('#tab-' + x.dataset.tab);
      panel.hidden = !on;
      if (on && motion) gsap.from($$('li', panel), { opacity: 0, x: -10, duration: 0.5, stagger: 0.05, ease: 'expo.out' });
    });
    if (ST) ST.refresh();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selectTab(b); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus({ preventScroll: true }); selectTab(n);
    });
  });

  // ---------- Salin dan toast ----------
  var toast = $('#toast'), toastT;
  function showToast(m) { toast.textContent = m; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('show'); }, 2400); }
  function copyText(txt, el) {
    var done = function () { showToast('Disalin'); };
    var fallback = function () {
      if (el) { var r = doc.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      showToast('Pilih teks lalu salin manual');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
  }
  $('#copyCoord').addEventListener('click', function () { copyText($('#coordText').textContent, $('#coordText')); });

  // ---------- Pemesanan ----------
  var form = $('#bookForm'), panes = $$('.pane', form), bars = $$('.stepper div', form), step = 1;
  var f = {
    pkg: function () { var r = $('input[name=pkg]:checked'); return r ? r.value : 'canyoneering'; },
    tgl: $('#tgl'), pax: $('#pax'), jemput: $('#jemput'), nama: $('#nama'), wa: $('#wa'), asal: $('#asal'), catatan: $('#catatan')
  };
  var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  f.tgl.min = iso(new Date());
  function fmtDate(v) { if (!v) return 'Belum dipilih'; var d = new Date(v + 'T00:00:00'); return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  var dijemput = function () { return f.jemput.value === 'Stasiun Blitar'; };
  var harga = function (p) { return dijemput() ? PRICES_JEMPUT[p] : PRICES[p]; };
  var catatanHarga = function () { return dijemput() ? 'sudah termasuk antar jemput Stasiun Blitar pulang pergi' : 'ojek basecamp ke lokasi dan parkir sudah termasuk'; };
  function buildMsg() {
    var p = f.pkg(), n = parseInt(f.pax.value, 10) || 0, h = harga(p);
    var lines = ['Halo Wisata Umbul Waru, saya ingin memesan:', '',
      'Layanan: ' + LABELS[p], 'Tanggal: ' + fmtDate(f.tgl.value), 'Jumlah peserta: ' + n + ' orang', 'Titik kumpul: ' + f.jemput.value,
      'Nama: ' + (f.nama.value || '-'), 'WhatsApp: ' + (f.wa.value || '-'), 'Asal: ' + (f.asal.value || '-')];
    if (f.catatan.value) lines.push('Catatan: ' + f.catatan.value);
    if (h) lines.push('', 'Estimasi dari situs: ' + rupiah(h * n) + ' (mulai dari, ' + catatanHarga() + '). Mohon konfirmasi harga dan ketersediaan.');
    else lines.push('', 'Mohon info harga dan ketersediaan untuk tanggal tersebut.');
    lines.push('', 'Dikirim dari lautputra.com');
    return lines.join('\n');
  }
  function render() {
    var p = f.pkg(), n = parseInt(f.pax.value, 10) || 0, h = harga(p);
    $('#sPkg').textContent = LABELS[p]; $('#sTgl').textContent = fmtDate(f.tgl.value); $('#sPax').textContent = n + ' orang';
    $('#sJemput').textContent = f.jemput.value; $('#sNama').textContent = f.nama.value || 'Belum diisi';
    if (h) {
      $('#totalLabel').textContent = 'Estimasi mulai dari'; $('#sTotal').textContent = rupiah(h * n);
      $('#totalNote').textContent = 'Perhitungan: ' + rupiah(h) + ' × ' + n + ' peserta. Harga final dikonfirmasi operator; ' + catatanHarga() + '.';
    } else {
      $('#totalLabel').textContent = 'Harga'; $('#sTotal').textContent = 'Tanya operator';
      $('#totalNote').textContent = 'Tarif layanan ini belum dipublikasikan. Operator akan membalas dengan harga dan ketersediaan.';
    }
    $('#msgPreview').textContent = buildMsg();
    bars.forEach(function (b, i) { b.classList.toggle('done', i < step); });
    panes.forEach(function (pn) { pn.hidden = parseInt(pn.dataset.pane, 10) !== step; });
    try { localStorage.setItem('uw-draft', JSON.stringify({ pkg: p, tgl: f.tgl.value, pax: f.pax.value, jemput: f.jemput.value, nama: f.nama.value, wa: f.wa.value, asal: f.asal.value, catatan: f.catatan.value })); } catch (e) {}
  }
  function validate(s) {
    var ok = true;
    var mark = function (inp, bad) { var fd = inp.closest('.field'); if (fd) fd.classList.toggle('invalid', bad); inp.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad && ok) { ok = false; inp.focus({ preventScroll: true }); } };
    if (s === 2) { mark(f.tgl, !f.tgl.value || f.tgl.value < f.tgl.min); mark(f.pax, !(parseInt(f.pax.value, 10) >= 1)); }
    if (s === 3) { mark(f.nama, f.nama.value.trim().length < 2); mark(f.wa, !/^(\+?62|0)8\d{7,12}$/.test(f.wa.value.replace(/[\s-]/g, ''))); }
    return ok;
  }
  function goStep(n) {
    step = n; render();
    var pane = $('[data-pane="' + step + '"]', form);
    if (motion) gsap.from(pane, { opacity: 0, x: 16, duration: 0.5, ease: 'expo.out' });
    var first = $('input, select', pane);
    if (first) first.focus({ preventScroll: true });
    if (ST) ST.refresh();
  }
  $$('[data-next]', form).forEach(function (b) { b.addEventListener('click', function () { if (validate(step)) { goStep(Math.min(3, step + 1)); scrollToEl(form, -96); } }); });
  $$('[data-prev]', form).forEach(function (b) { b.addEventListener('click', function () { goStep(Math.max(1, step - 1)); }); });
  $('#paxMinus').addEventListener('click', function () { f.pax.value = Math.max(1, (parseInt(f.pax.value, 10) || 1) - 1); render(); });
  $('#paxPlus').addEventListener('click', function () { f.pax.value = Math.min(30, (parseInt(f.pax.value, 10) || 1) + 1); render(); });
  form.addEventListener('input', render); form.addEventListener('change', render);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(3)) return;
    var a = doc.createElement('a');
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildMsg()); a.target = '_blank'; a.rel = 'noopener';
    doc.body.appendChild(a); a.click(); a.remove();
    showToast('Membuka WhatsApp. Jika tidak terbuka, salin pesan di ringkasan.');
  });
  $('#copyMsg').addEventListener('click', function () { copyText(buildMsg(), $('#msgPreview')); });
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $('input[name=pkg][value="' + b.dataset.pick + '"]'); if (r) r.checked = true;
      step = 1; render(); scrollToEl($('#booking'));
    });
  });
  try {
    var d = JSON.parse(localStorage.getItem('uw-draft') || 'null');
    if (d) {
      var r = $('input[name=pkg][value="' + d.pkg + '"]'); if (r) r.checked = true;
      if (d.tgl && d.tgl >= f.tgl.min) f.tgl.value = d.tgl;
      if (d.pax) f.pax.value = d.pax; if (d.jemput) f.jemput.value = d.jemput;
      f.nama.value = d.nama || ''; f.wa.value = d.wa || ''; f.asal.value = d.asal || ''; f.catatan.value = d.catatan || '';
    }
  } catch (e) {}
  render();

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Bersih-bersih saat halaman ditinggalkan ----------
  window.addEventListener('pagehide', function (e) {
    if (e.persisted) return;
    cleanups.forEach(function (fn) { fn(); });
    if (lenis) lenis.destroy();
    if (ST) ST.getAll().forEach(function (t) { t.kill(); });
  });
});
