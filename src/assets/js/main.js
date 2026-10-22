// Interaksi halaman Umbul Waru: menu, animasi, kondisi laut, rute, dan formulir pemesanan WhatsApp.
document.addEventListener('DOMContentLoaded', function(){
  var doc = document;
  doc.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = '6285655647066';
  var PRICES = { canyoneering: 300000 };
  var LABELS = { canyoneering:'Canyoneering Umbul Waru', homestay:'Basecamp / homestay', tenda:'Sewa tenda camping', ojek:'Ojek / jemput lokasi', kunjungan:'Kunjungan biasa dengan pemandu' };
  var $ = function(s,c){ return (c||doc).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||doc).querySelectorAll(s)); };
  var rupiah = function(n){ return 'Rp' + n.toLocaleString('id-ID'); };
  if(!$('#bookForm')) return;
  
  var burger=$('#burger'), drawer=$('#drawer');
  function setDrawer(o){ drawer.classList.toggle('open',o); burger.setAttribute('aria-expanded',o?'true':'false'); doc.body.style.overflow=o?'hidden':''; }
  burger.addEventListener('click',function(){ setDrawer(!drawer.classList.contains('open')); });
  $('#drawerClose').addEventListener('click',function(){ setDrawer(false); });
  $$('#drawer a').forEach(function(a){ a.addEventListener('click',function(){ setDrawer(false); }); });
  
  var revs=$$('.reveal');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    revs.forEach(function(el){ io.observe(el); });
    setTimeout(function(){ revs.forEach(function(el){ el.classList.add('in'); }); },2500);
  } else { revs.forEach(function(el){ el.classList.add('in'); }); }
  
  var words=$$('#tagline .w');
  function lightWords(){ words.forEach(function(w,i){ setTimeout(function(){ w.classList.add('on'); }, reduce?0:i*60); }); }
  if('IntersectionObserver' in window && !reduce){
    var tio=new IntersectionObserver(function(es){ if(es.some(function(e){ return e.isIntersecting; })){ lightWords(); tio.disconnect(); } },{threshold:.35});
    var tl=$('#tagline'); if(tl) tio.observe(tl);
    setTimeout(lightWords,4000);
  } else lightWords();
  
  var secs=$$('section[id]'), links=$$('.menu a'), fab=$('#fab');
  function onScroll(){
    var y=window.scrollY+140, cur='';
    secs.forEach(function(s){ if(s.offsetTop<=y) cur=s.id; });
    links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+cur); });
    fab.hidden = !(window.scrollY>500 && cur!=='booking' && window.innerWidth<820);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  
  if(!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.tilt').forEach(function(c){
      c.addEventListener('mousemove',function(e){ var r=c.getBoundingClientRect(); var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; c.style.transform='perspective(800px) rotateX('+(-y*7)+'deg) rotateY('+(x*7)+'deg) translateY(-4px)'; });
      c.addEventListener('mouseleave',function(){ c.style.transform=''; });
    });
  }
  
  var cv=$('#sea'), ctx=cv.getContext('2d'), t=0, W,H;
  function size(){ var r=cv.parentElement.getBoundingClientRect(); W=cv.width=Math.max(1,Math.floor(r.width)); H=cv.height=Math.max(1,Math.floor(r.height)); }
  function isDark(){ return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function draw(){
    ctx.clearRect(0,0,W,H);
    var dark=isDark();
    var layers=[ {a:14,f:.012,s:.6,y:.78,c:dark?'rgba(61,183,194,.10)':'rgba(19,122,134,.10)'},
                 {a:18,f:.009,s:.9,y:.84,c:dark?'rgba(61,183,194,.14)':'rgba(19,122,134,.14)'},
                 {a:22,f:.007,s:1.2,y:.90,c:dark?'rgba(61,183,194,.22)':'rgba(19,122,134,.20)'} ];
    layers.forEach(function(L){
      ctx.beginPath(); ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=6){ var y=H*L.y + Math.sin(x*L.f + t*L.s)*L.a + Math.sin(x*L.f*2.3 - t*L.s*.7)*L.a*.4; ctx.lineTo(x,y); }
      ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle=L.c; ctx.fill();
    });
    ctx.fillStyle=dark?'rgba(232,241,242,.35)':'rgba(255,255,255,.8)';
    for(var i=0;i<24;i++){ var px=((i*173 + t*40)%(W+60))-30; var py=H*.90 + Math.sin(px*.007 + t*1.2)*22 - 4; ctx.beginPath(); ctx.arc(px,py,1.6+(i%3),0,6.283); ctx.fill(); }
  }
  function loop(){ t+=0.018; draw(); if(!reduce) requestAnimationFrame(loop); }
  size(); loop(); window.addEventListener('resize',function(){ size(); draw(); });
  
  var cond={laut:'surut',cuaca:'cerah',waktu:'pagi'};
  var verdict=$('#verdict'), vStatus=$('#vStatus'), vTitle=$('#vTitle'), vList=$('#vList'), seaViz=$('#seaViz'), vBody=$('#vBody');
  function setVerdict(animate){
    var c=cond, items=[], status, title, color;
    seaViz.classList.toggle('pasang', c.laut==='pasang');
    if(c.cuaca==='hujan'){
      status='Sebaiknya ditunda'; color='#B93A3A'; title='Jalur makadam licin dan arus sungai naik. Tunda kunjungan.';
      items=['Jalan tanah di kebun tebu sulit dilewati motor saat hujan.','Debit air terjun meningkat, kolam alami dan tebing jadi berbahaya.','Operator biasanya menjadwalkan ulang canyoneering saat hujan.'];
    } else if(c.laut==='pasang'){
      status='Hanya dari atas'; color='#C27A1C'; title='Pantai tertutup ombak. Nikmati dari tebing dan kolam alami.';
      items=['Jangan turun ke pantai; ombak selatan menghantam karang di bawah air terjun.','Kolam alami di atas tebing tetap bisa dikunjungi.','Foto air terjun dari atas, tunggu surut jika ingin turun.'];
    } else {
      status='Waktu terbaik'; color='#2E8B57'; title='Turun ke pantai, nikmati air terjun dari bawah.';
      items=['Pasir putih dan kaki air terjun terbuka saat surut.', c.waktu==='pagi'?'Pagi: cahaya lembut dan udara belum panas, paling nyaman untuk trekking.':(c.waktu==='siang'?'Siang: panas terik, bawa topi, tabir surya, dan air cukup.':'Sore: perhatikan waktu, jalur turun tebing gelap setelah matahari terbenam.'),'Tetap pantau ombak; surut bisa berbalik dalam beberapa jam.'];
    }
    var apply=function(){
      verdict.style.setProperty('--vc',color); vStatus.textContent=status; vTitle.textContent=title;
      vList.innerHTML=''; items.forEach(function(s){ var li=doc.createElement('li'); li.textContent=s; vList.appendChild(li); });
    };
    if(!animate || reduce){ apply(); return; }
    vBody.classList.add('out'); clearTimeout(vBody._t);
    vBody._t=setTimeout(function(){ apply(); vBody.classList.remove('out'); },120);
  }
  $$('.seg button').forEach(function(b){ b.addEventListener('click',function(){ var k=b.dataset.k; cond[k]=b.dataset.v; $$('.seg button[data-k="'+k+'"]').forEach(function(x){ x.setAttribute('aria-pressed', x===b?'true':'false'); }); setVerdict(true); }); });
  setVerdict(false);
  
  $$('.tabs [role=tab]').forEach(function(b){ b.addEventListener('click',function(){
    $$('.tabs [role=tab]').forEach(function(x){ x.setAttribute('aria-selected', x===b?'true':'false'); });
    ['klasik','jls','jemput'].forEach(function(id){ $('#tab-'+id).hidden = id!==b.dataset.tab; });
  }); });
  
  var toast=$('#toast'), toastT;
  function showToast(m){ toast.textContent=m; toast.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ toast.classList.remove('show'); },2200); }
  function copyText(txt, el){
    var done=function(){ showToast('Disalin'); };
    var fallback=function(){ if(el){ var r=doc.createRange(); r.selectNodeContents(el); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); } showToast('Pilih teks lalu salin manual'); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,fallback); } else fallback();
  }
  $('#copyCoord').addEventListener('click',function(){ copyText($('#coordText').textContent,$('#coordText')); });
  
  var form=$('#bookForm'), panes=$$('.pane',form), bars=$$('.stepper div',form), step=1;
  var f={ pkg:function(){ var r=$('input[name=pkg]:checked'); return r?r.value:'canyoneering'; }, tgl:$('#tgl'), pax:$('#pax'), jemput:$('#jemput'), nama:$('#nama'), wa:$('#wa'), asal:$('#asal'), catatan:$('#catatan') };
  var iso=function(d){ return d.toISOString().slice(0,10); };
  f.tgl.min=iso(new Date());
  function fmtDate(v){ if(!v) return 'Belum dipilih'; var d=new Date(v+'T00:00:00'); return d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }
  function buildMsg(){
    var p=f.pkg(), n=parseInt(f.pax.value,10)||0;
    var lines=['Halo Wisata Umbul Waru, saya ingin memesan:','',
      'Layanan: '+LABELS[p], 'Tanggal: '+fmtDate(f.tgl.value), 'Jumlah peserta: '+n+' orang', 'Titik kumpul: '+f.jemput.value,
      'Nama: '+(f.nama.value||'-'), 'WhatsApp: '+(f.wa.value||'-'), 'Asal: '+(f.asal.value||'-')];
    if(f.catatan.value) lines.push('Catatan: '+f.catatan.value);
    if(PRICES[p]) lines.push('', 'Estimasi dari situs: '+rupiah(PRICES[p]*n)+' (mulai dari, belum termasuk transport dan parkir). Mohon konfirmasi harga dan ketersediaan.');
    else lines.push('', 'Mohon info harga dan ketersediaan untuk tanggal tersebut.');
    lines.push('', 'Dikirim dari lautputra.com');
    return lines.join('\n');
  }
  function render(){
    var p=f.pkg(), n=parseInt(f.pax.value,10)||0;
    $('#sPkg').textContent=LABELS[p]; $('#sTgl').textContent=fmtDate(f.tgl.value); $('#sPax').textContent=n+' orang';
    $('#sJemput').textContent=f.jemput.value; $('#sNama').textContent=f.nama.value||'Belum diisi';
    if(PRICES[p]){ $('#totalLabel').textContent='Estimasi mulai dari'; $('#sTotal').textContent=rupiah(PRICES[p]*n); $('#totalNote').textContent='Perhitungan: '+rupiah(PRICES[p])+' × '+n+' peserta. Harga final dikonfirmasi operator; biaya transport dan parkir belum termasuk.'; }
    else { $('#totalLabel').textContent='Harga'; $('#sTotal').textContent='Tanya operator'; $('#totalNote').textContent='Tarif layanan ini belum dipublikasikan. Operator akan membalas dengan harga dan ketersediaan.'; }
    $('#msgPreview').textContent=buildMsg();
    bars.forEach(function(b,i){ b.classList.toggle('done', i<step); });
    panes.forEach(function(pn){ pn.hidden = parseInt(pn.dataset.pane,10)!==step; });
    try{ localStorage.setItem('uw-draft',JSON.stringify({pkg:p,tgl:f.tgl.value,pax:f.pax.value,jemput:f.jemput.value,nama:f.nama.value,wa:f.wa.value,asal:f.asal.value,catatan:f.catatan.value})); }catch(e){}
  }
  function validate(s){
    var ok=true;
    var mark=function(inp,bad){ var fd=inp.closest('.field'); if(fd) fd.classList.toggle('invalid',bad); if(bad) ok=false; };
    if(s===2){ mark(f.tgl, !f.tgl.value || f.tgl.value<f.tgl.min); mark(f.pax, !(parseInt(f.pax.value,10)>=1)); }
    if(s===3){ mark(f.nama, f.nama.value.trim().length<2); mark(f.wa, !/^(\+?62|0)8\d{7,12}$/.test(f.wa.value.replace(/[\s-]/g,''))); }
    return ok;
  }
  $$('[data-next]',form).forEach(function(b){ b.addEventListener('click',function(){ if(validate(step)){ step=Math.min(3,step+1); render(); form.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); } }); });
  $$('[data-prev]',form).forEach(function(b){ b.addEventListener('click',function(){ step=Math.max(1,step-1); render(); }); });
  $('#paxMinus').addEventListener('click',function(){ f.pax.value=Math.max(1,(parseInt(f.pax.value,10)||1)-1); render(); });
  $('#paxPlus').addEventListener('click',function(){ f.pax.value=Math.min(30,(parseInt(f.pax.value,10)||1)+1); render(); });
  form.addEventListener('input',render); form.addEventListener('change',render);
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!validate(3)) return;
    var url='https://wa.me/'+WA+'?text='+encodeURIComponent(buildMsg());
    var a=doc.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; doc.body.appendChild(a); a.click(); a.remove();
    showToast('Membuka WhatsApp. Jika tidak terbuka, salin pesan di ringkasan.');
  });
  $('#copyMsg').addEventListener('click',function(){ copyText(buildMsg(),$('#msgPreview')); });
  $$('[data-pick]').forEach(function(b){ b.addEventListener('click',function(){ var r=$('input[name=pkg][value="'+b.dataset.pick+'"]'); if(r) r.checked=true; step=1; render(); $('#booking').scrollIntoView({behavior:reduce?'auto':'smooth'}); }); });
  try{ var d=JSON.parse(localStorage.getItem('uw-draft')||'null'); if(d){ var r=$('input[name=pkg][value="'+d.pkg+'"]'); if(r) r.checked=true; if(d.tgl&&d.tgl>=f.tgl.min) f.tgl.value=d.tgl; if(d.pax) f.pax.value=d.pax; if(d.jemput) f.jemput.value=d.jemput; f.nama.value=d.nama||''; f.wa.value=d.wa||''; f.asal.value=d.asal||''; f.catatan.value=d.catatan||''; } }catch(e){}
  render();
  var yr=$('#year'); if(yr) yr.textContent=new Date().getFullYear();
});
