/* ================================================================
   MPK SMK SMTI PADANG — script.js
   Berisi: Navigasi · SPA Router · Countdown · Profil Tabs
           Google Form · Scroll Reveal · Animasi Counter
   ================================================================ */

'use strict';

/* ────────────────────────────────────────────────
   ★ KONFIGURASI — ISI SESUAI DATA NYATA
   ──────────────────────────────────────────────── */

/** Link embed Google Form (viewform?embedded=true) */
var GFORM = {
  caketos  : '',   /* Contoh: "https://docs.google.com/forms/d/.../viewform?embedded=true" */
  cawaketos: '',
  osis     : ''    /* Form OSIS pelaporan */
};

/** Link unduh formulir (Google Drive, Dropbox, dsb.) */
var UNDUH = {
  caketos  : '',   /* Contoh: "https://drive.google.com/uc?export=download&id=..." */
  cawaketos: ''
};

/** Tanggal target hari pemilihan (format ISO) */
var TARGET_PEMILIHAN = '2025-10-01T08:00:00';

/* ────────────────────────────────────────────────
   NAVIGASI — TOGGLE DRAWER
   ──────────────────────────────────────────────── */
function toggleNav() {
  var drawer  = document.querySelector('.nav-drawer');
  var overlay = document.querySelector('.nav-overlay');
  if (!drawer) return;
  var open = drawer.classList.toggle('aktif');
  overlay.classList.toggle('aktif', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* Tutup drawer saat link di-klik */
function initDrawerClose() {
  document.querySelectorAll('.nav-drawer a').forEach(function(a) {
    a.addEventListener('click', function() {
      var drawer  = document.querySelector('.nav-drawer');
      var overlay = document.querySelector('.nav-overlay');
      if (drawer)  drawer.classList.remove('aktif');
      if (overlay) overlay.classList.remove('aktif');
      document.body.style.overflow = '';
    });
  });
}

/* ────────────────────────────────────────────────
   SPA ROUTER — GANTI HALAMAN TANPA RELOAD
   ──────────────────────────────────────────────── */
var HALAMAN = ['beranda','tentang','struktur','pemiltos','profil','keseruan','form-osis'];

function navigateTo(id, pushState) {
  var panel = document.getElementById('page-' + id);
  if (!panel) return;

  /* Sembunyikan semua */
  HALAMAN.forEach(function(h) {
    var el = document.getElementById('page-' + h);
    if (el) el.classList.remove('aktif');
  });

  /* Tampilkan target */
  panel.classList.add('aktif');

  /* URL hash */
  if (pushState !== false) history.pushState({ page: id }, '', '#' + id);

  /* Scroll ke atas */
  window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Update link aktif */
  document.querySelectorAll('[data-page]').forEach(function(el) {
    el.classList.toggle('aktif', el.getAttribute('data-page') === id);
  });

  /* Inisialisasi fitur halaman */
  setTimeout(initReveal, 80);
  if (id === 'beranda')  { initCountdown('beranda'); initCounter(); }
  if (id === 'pemiltos') { initCountdown('pemiltos'); initGform(); }
  if (id === 'profil')   { if (!_bpInited) { initBpTabs(); _bpInited = true; } }
  if (id === 'form-osis'){ initGformOsis(); }
}
var _bpInited = false;

/* Tombol back/forward */
window.addEventListener('popstate', function(e) {
  navigateTo(e.state && e.state.page ? e.state.page : 'beranda', false);
});

/* ────────────────────────────────────────────────
   COUNTDOWN TIMER
   ──────────────────────────────────────────────── */
var _cdIntervals = {};

function initCountdown(scope) {
  var target = new Date(TARGET_PEMILIHAN);

  function tick() {
    var diff = target - new Date();
    if (diff <= 0) {
      clearInterval(_cdIntervals[scope]);
      ['hari','jam','menit','detik'].forEach(function(k) {
        var el = document.getElementById('cd-' + scope + '-' + k);
        if (el) el.textContent = '00';
      });
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000)  / 60000);
    var s = Math.floor((diff % 60000)    / 1000);
    function pad(n) { return String(n).padStart(2,'0'); }
    var el = function(k){ return document.getElementById('cd-' + scope + '-' + k); };
    if (el('hari'))   el('hari').textContent   = pad(d);
    if (el('jam'))    el('jam').textContent    = pad(h);
    if (el('menit'))  el('menit').textContent  = pad(m);
    if (el('detik'))  el('detik').textContent  = pad(s);
  }

  clearInterval(_cdIntervals[scope]);
  tick();
  _cdIntervals[scope] = setInterval(tick, 1000);
}

/* ────────────────────────────────────────────────
   ANIMASI COUNTER (stat numbers)
   ──────────────────────────────────────────────── */
function initCounter() {
  document.querySelectorAll('[data-count]').forEach(function(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var dur = 1600, steps = 60, inc = target / steps, cur = 0;
    var sfx = el.getAttribute('data-suffix') || '';
    var t = setInterval(function() {
      cur += inc;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = Math.floor(cur) + sfx;
    }, dur / steps);
  });
}

/* ────────────────────────────────────────────────
   PROFIL — TAB ANGKATAN (BP)
   ──────────────────────────────────────────────── */
function initBpTabs() {
  /* Default tab dari URL hash atau bp23 */
  var hash = window.location.hash.replace('#','');
  var def  = /^bp\d+$/.test(hash) ? hash : 'bp23';
  gantiTab(def);
}

function gantiTab(bp, e) {
  if (e) e.preventDefault();
  document.querySelectorAll('.bp-panel').forEach(function(p) { p.classList.remove('aktif'); });
  document.querySelectorAll('.bp-tab').forEach(function(t) { t.classList.remove('aktif'); });
  var panel = document.getElementById(bp);
  var tab   = document.querySelector('.bp-tab[data-bp="' + bp + '"]');
  if (panel) panel.classList.add('aktif');
  if (tab)   tab.classList.add('aktif');
  setTimeout(initReveal, 80);
}

/* ────────────────────────────────────────────────
   PEMILTOS — GOOGLE FORM EMBED & UNDUH
   ──────────────────────────────────────────────── */
function initGform() {
  _renderGform('caketos');
  _renderGform('cawaketos');

  /* Default tab */
  bukaFormulir('caketos');
}

function _renderGform(jenis) {
  var wrap = document.getElementById('gform-wrap-' + jenis);
  if (!wrap) return;
  var link = GFORM[jenis];
  if (link && link.trim()) {
    wrap.innerHTML = '<iframe src="' + link + '" allowfullscreen loading="lazy" title="Formulir ' + jenis + '"></iframe>';
    var btn = document.getElementById('btn-buka-' + jenis);
    if (btn) btn.href = link.replace('?embedded=true','').replace('&embedded=true','');
  } else {
    wrap.innerHTML =
      '<div class="form-placeholder">' +
        '<div class="ph-icon">📋</div>' +
        '<h4>Formulir ' + (jenis==='caketos'?'Calon Ketua OSIS':'Calon Wakil Ketua') + '</h4>' +
        '<p>Link Google Form belum diisi. Admin: isi variabel <code>GFORM.' + jenis + '</code> di <strong>script.js</strong>.</p>' +
        '<a href="https://forms.google.com" target="_blank" class="btn-outline" style="margin-top:.5rem;display:inline-flex;">Buat Google Form →</a>' +
      '</div>';
  }
}

function bukaFormulir(jenis) {
  document.querySelectorAll('.form-panel').forEach(function(p) { p.classList.remove('aktif'); });
  document.querySelectorAll('.formulir-tab').forEach(function(t) { t.classList.remove('aktif'); });
  var panel = document.getElementById('form-panel-' + jenis);
  var tab   = document.getElementById('ftab-' + jenis);
  if (panel) panel.classList.add('aktif');
  if (tab)   tab.classList.add('aktif', jenis);
  /* Scroll ke section formulir */
  var sec = document.getElementById('formulir-section');
  if (sec) setTimeout(function(){ sec.scrollIntoView({ behavior:'smooth', block:'start' }); }, 80);
}

function unduhFormulir(jenis) {
  var link = UNDUH[jenis];
  if (link && link.trim()) {
    window.open(link, '_blank', 'noopener');
    return;
  }
  /* Jika tidak ada link unduh tapi ada embed, buka Google Form di tab baru */
  var glink = GFORM[jenis];
  if (glink && glink.trim()) {
    window.open(glink.replace('?embedded=true',''), '_blank', 'noopener');
  } else {
    alert(
      'Link unduh formulir belum dikonfigurasi.\n\n' +
      'Admin: isi variabel UNDUH.' + jenis + ' di script.js dengan link download file (PDF/Word).'
    );
  }
}

/* ────────────────────────────────────────────────
   FORM OSIS — GOOGLE FORM EMBED
   ──────────────────────────────────────────────── */
function initGformOsis() {
  var wrap = document.getElementById('gform-osis-wrap');
  if (!wrap) return;
  var link = GFORM.osis;
  if (link && link.trim()) {
    wrap.innerHTML = '<iframe src="' + link + '" allowfullscreen loading="lazy" title="Form Laporan OSIS"></iframe>';
  } else {
    wrap.innerHTML =
      '<div class="form-placeholder" style="min-height:300px;">' +
        '<div class="ph-icon">📝</div>' +
        '<h4>Form Laporan OSIS</h4>' +
        '<p>Link Google Form belum diisi. Admin: isi variabel <code>GFORM.osis</code> di <strong>script.js</strong>.</p>' +
        '<a href="https://forms.google.com" target="_blank" class="btn-outline" style="margin-top:.5rem;display:inline-flex;">Buat Google Form →</a>' +
      '</div>';
  }
}

/* Fallback: form manual jika Google Form belum dikonfigurasi */
function kirimFormManual(e) {
  e.preventDefault();
  var form = document.getElementById('form-laporan-manual');
  var msg  = document.getElementById('form-success-msg');
  if (form) form.style.display = 'none';
  if (msg)  msg.style.display  = 'block';
}

/* ────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
   ──────────────────────────────────────────────── */
function initReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal,.reveal-left,.reveal-scale,.stagger')
    .forEach(function(el) { obs.observe(el); });
}

/* ────────────────────────────────────────────────
   PROGRESS BAR (scroll indicator)
   ──────────────────────────────────────────────── */
function initProgressBar() {
  var bar = document.querySelector('.progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ────────────────────────────────────────────────
   LINK NAVIGASI — tandai aktif berdasarkan data-page
   ──────────────────────────────────────────────── */
function initNavLinks() {
  document.querySelectorAll('[data-page]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(el.getAttribute('data-page'));
    });
  });
}

/* ────────────────────────────────────────────────
   INIT — jalankan saat DOM siap
   ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  initDrawerClose();
  initNavLinks();
  initProgressBar();
  initReveal();

  /* Tentukan halaman awal dari hash URL */
  var hash  = window.location.hash.replace('#', '');
  var start = HALAMAN.indexOf(hash) !== -1 ? hash : 'beranda';
  navigateTo(start, false);

  /* Smooth scroll untuk anchor dalam halaman */
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    /* Jangan handle kalau itu nama halaman */
    if (HALAMAN.indexOf(id) !== -1) return;
    var el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});
