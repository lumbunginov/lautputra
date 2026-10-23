// Interaksi halaman Umbul Waru: Lenis + GSAP (intro hero, urutan "Turun", galeri, parallax, tombol magnet),
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
  var PRICES = { canyoneering: 300000 };
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
    // (.turun__media di desktop dikendalikan urutan pin, jadi reveal-nya hanya untuk layar sempit, lihat di bawah)
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

  // ---------- Turun: urutan foto; desktop dipin dan di-scrub, ponsel ditumpuk ----------
  var steps = $$('.turun__step'), turunNum = $('#turunNum'), turunBar = $('#turunBar'), turunPin = $('#turunPin');
  var ropeFill = $('#ropeFill'), ropeClip = $('#ropeClip'), ropeDepth = $('#ropeDepth'), knots = $$('.rope__knot');
  var N = steps.length;
  // Tali: isian, posisi karabiner, label persen, dan simpul yang sudah dilewati. pos 0..1 = kemajuan turun.
  function rope(pos) {
    ropeFill.style.transform = 'scaleY(' + pos + ')';
    ropeClip.style.top = (pos * 100) + '%';
    var pct = Math.round(pos * 100) + '%';
    if (ropeDepth.textContent !== pct) ropeDepth.textContent = pct;
    var here = Math.round(pos * (N - 1));
    knots.forEach(function (k, j) { k.classList.toggle('is-passed', j / (N - 1) <= pos + 0.001); k.classList.toggle('is-here', j === here); });
  }
  if (motion) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 64rem)', function () {
      steps.forEach(function (s) { s.classList.add('is-active'); });
      var medias = steps.map(function (s) { return s.querySelector('.turun__media'); });
      var imgs = medias.map(function (m) { return m.querySelector('img'); });
      var texts = steps.map(function (s) { return s.querySelector('.turun__text'); });
      // Semua figure menempati jendela yang sama; gambar ke-k diparkir k jendela di bawah (skala dasar 1 supaya tepi slot tidak saling menimpa), lalu seluruh strip "diturunkan" satu jendela per langkah
      imgs.forEach(function (im, k) { gsap.set(im, { yPercent: k * 100, transformOrigin: '50% 0%' }); }); // skala membesar ke bawah saja supaya tidak masuk ke jendela sebelumnya
      gsap.set(medias, { transformOrigin: '50% 0%' }); // panel berayun menggantung dari tepi atasnya
      gsap.set(texts.slice(1), { opacity: 0 });
      var HOLD = 0.8, DROP = 1;            // jeda di tiap pijakan, lalu panjang tiap penurunan (satuan waktu timeline)
      var state = { pos: 0 };               // posisi di tali 0..1, dipakai untuk karabiner (bukan progress mentah supaya pas dengan simpul)
      var swayT, rotTo = gsap.quickTo(medias, 'rotation', { duration: 0.9, ease: 'power3.out' }), clipTo = gsap.quickTo(ropeClip, 'rotation', { duration: 0.7, ease: 'power3.out' });
      function sway(v) { rotTo(v * 1.2); clipTo(v * -14); }
      var seq = gsap.timeline({
        scrollTrigger: {
          // refreshPriority: bagian yang dipin dihitung lebih dulu supaya pemicu lain memperhitungkan ruang pin
          trigger: turunPin, start: 'top top', end: '+=' + (N * 110) + '%', pin: true, scrub: 0.7, anticipatePin: 1, refreshPriority: 2,
          onUpdate: function (t) {
            // Ayunan tali: makin cepat gulir, strip dan karabiner makin miring; kembali tegak saat gulir berhenti
            var v = gsap.utils.clamp(-1, 1, t.getVelocity() / 3500);
            sway(v); clearTimeout(swayT); swayT = setTimeout(function () { sway(0); }, 140);
          }
        },
        onUpdate: function () {
          var i = Math.round(state.pos * (N - 1));
          var num = (i + 1 < 10 ? '0' : '') + (i + 1);
          if (turunNum.textContent !== num) turunNum.textContent = num;
          turunBar.style.transform = 'scaleX(' + state.pos + ')';
          rope(state.pos);
        }
      });
      for (var i = 1; i < N; i++) {
        var at = HOLD + (i - 1) * (DROP + HOLD);
        // Turun satu jendela: semua gambar naik 100% dengan ease tali (pelan, deras, lalu mengerem di pijakan)
        seq.to(imgs, { yPercent: '-=100', duration: DROP, ease: 'power2.inOut' }, at)
          .to(state, { pos: i / (N - 1), duration: DROP, ease: 'power2.inOut' }, at)
          .to(turunPin, { '--turun-depth': i / (N - 1), duration: DROP, ease: 'none' }, at)
          // Bayangan tebing lewat: gambar yang ditinggalkan sedikit mengecil, yang datang mendekat
          .fromTo(imgs[i], { scale: 1.12 }, { scale: 1, duration: DROP + HOLD, ease: 'power2.out', immediateRender: false }, at)
          .to(texts[i - 1], { opacity: 0, y: -28, duration: 0.35, ease: 'power2.in' }, at)
          .fromTo(texts[i], { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at + DROP * 0.4);
      }
      seq.to({}, { duration: HOLD });
      rope(0);
      return function () {
        clearTimeout(swayT);
        steps.forEach(function (s, k) { s.classList.toggle('is-active', k === 0); });
        gsap.set(medias.concat(imgs, texts, [ropeClip]), { clearProps: 'all' });
        turunPin.style.setProperty('--turun-depth', 0);
      };
    });

    mm.add('(max-width: 63.99rem)', function () {
      var medias = $$('.turun__media'), stepsEl = $('#turunSteps');
      medias.forEach(function (fig) {
        gsap.from(fig, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 90%', once: true } });
        gsap.from(fig.querySelector('img'), { scale: 1.2, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 90%', once: true } });
      });
      // Tali di tepi kiri: simpul di tengah tiap foto (dihitung ulang tiap refresh), karabiner mengikuti garis 60% layar
      var ys = [];
      function placeKnots() {
        var pinTop = turunPin.getBoundingClientRect().top;
        ys = medias.map(function (m) { var r = m.getBoundingClientRect(); return r.top - pinTop + r.height / 2; });
        knots.forEach(function (k, j) { k.style.top = ys[j] + 'px'; });
      }
      placeKnots();
      ST.addEventListener('refreshInit', placeKnots);
      var ropeST = ST.create({
        trigger: stepsEl, start: 'top 60%', end: 'bottom 60%',
        onUpdate: function (t) {
          // Petakan kemajuan ke posisi tali dalam px (antara simpul pertama dan terakhir) supaya simpul dan karabiner bertemu
          var y0 = ys[0], y1 = ys[N - 1], ropeH = turunPin.clientHeight;
          var yPx = gsap.utils.interpolate(y0, y1, t.progress);
          var pos = gsap.utils.clamp(0, 1, (yPx - y0) / (y1 - y0));
          ropeFill.style.transform = 'scaleY(' + (yPx / ropeH) + ')';
          ropeClip.style.top = yPx + 'px';
          var pct = Math.round(pos * 100) + '%';
          if (ropeDepth.textContent !== pct) ropeDepth.textContent = pct;
          var here = Math.round(pos * (N - 1));
          knots.forEach(function (k, j) { k.classList.toggle('is-passed', ys[j] <= yPx + 1); k.classList.toggle('is-here', j === here); });
        }
      });
      return function () { ST.removeEventListener('refreshInit', placeKnots); ropeST.kill(); knots.forEach(function (k) { k.style.top = ''; }); gsap.set(ropeClip, { clearProps: 'all' }); };
    });

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
  function buildMsg() {
    var p = f.pkg(), n = parseInt(f.pax.value, 10) || 0;
    var lines = ['Halo Wisata Umbul Waru, saya ingin memesan:', '',
      'Layanan: ' + LABELS[p], 'Tanggal: ' + fmtDate(f.tgl.value), 'Jumlah peserta: ' + n + ' orang', 'Titik kumpul: ' + f.jemput.value,
      'Nama: ' + (f.nama.value || '-'), 'WhatsApp: ' + (f.wa.value || '-'), 'Asal: ' + (f.asal.value || '-')];
    if (f.catatan.value) lines.push('Catatan: ' + f.catatan.value);
    if (PRICES[p]) lines.push('', 'Estimasi dari situs: ' + rupiah(PRICES[p] * n) + ' (mulai dari, belum termasuk transport dan parkir). Mohon konfirmasi harga dan ketersediaan.');
    else lines.push('', 'Mohon info harga dan ketersediaan untuk tanggal tersebut.');
    lines.push('', 'Dikirim dari lautputra.com');
    return lines.join('\n');
  }
  function render() {
    var p = f.pkg(), n = parseInt(f.pax.value, 10) || 0;
    $('#sPkg').textContent = LABELS[p]; $('#sTgl').textContent = fmtDate(f.tgl.value); $('#sPax').textContent = n + ' orang';
    $('#sJemput').textContent = f.jemput.value; $('#sNama').textContent = f.nama.value || 'Belum diisi';
    if (PRICES[p]) {
      $('#totalLabel').textContent = 'Estimasi mulai dari'; $('#sTotal').textContent = rupiah(PRICES[p] * n);
      $('#totalNote').textContent = 'Perhitungan: ' + rupiah(PRICES[p]) + ' × ' + n + ' peserta. Harga final dikonfirmasi operator; biaya transport dan parkir belum termasuk.';
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
