(function () {
  'use strict';
  window.FF_READY = true;
  var d = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var P = window.FF_PROJECTS || [];
  var LG = d.lang === 'en' ? 1 : 0;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- sonido (Web Audio, solo si el visitante eligió sonido) ---------- */
  var AU = { on: false, ctx: null };
  AU.ensure = function () {
    if (!AU.on) return null;
    try { AU.ctx = AU.ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    if (AU.ctx.state === 'suspended') AU.ctx.resume();
    return AU.ctx;
  };
  AU.tone = function (f, o) {
    o = o || {}; var c = AU.ensure(); if (!c || c.state !== 'running') return;
    var osc = c.createOscillator(), g = c.createGain(), t = c.currentTime, dur = o.d || .6;
    osc.type = o.type || 'triangle'; osc.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.g || .14, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(g).connect(c.destination); osc.start(t); osc.stop(t + dur + .05);
  };
  var DOREMI = [523.25, 587.33, 659.25];

  /* ---------- idioma ---------- */
  var META = {
    title: ['Federico Fernández · Editor y postproductor de audio', 'Federico Fernández · Audio editor & post-production'],
    desc: ['Federico Fernández, editor y postproductor de audio en Buenos Aires. Edición de diálogos, diseño sonoro y Foley para animación, cine y series. Mafalda, Mini Beat Power Rockers, Underdogs United.',
           'Federico Fernández, audio editor and post-production engineer in Buenos Aires. Dialogue editing, sound design and Foley for animation, film and series. Mafalda, Mini Beat Power Rockers, Underdogs United.']
  };
  var T = function (v) { return Array.isArray(v) ? v[LG] : v; };
  function applyLang() {
    d.lang = LG ? 'en' : 'es';
    $$('[data-en]').forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.innerHTML;
      el.innerHTML = LG ? el.dataset.en : el.dataset.es;
    });
    $$('[data-en-label]').forEach(function (el) { el.setAttribute('aria-label', LG ? el.dataset.enLabel : el.dataset.esLabel); });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.l === 'en') === !!LG)); });
    document.title = META.title[LG];
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', META.desc[LG]);
    themeLabel();
    renderCues();
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = b.dataset.l === 'en' ? 1 : 0; if (n === LG) return;
      LG = n; store.set('ff-lang', LG ? 'en' : 'es'); applyLang();
    });
  });

  /* ---------- tema ---------- */
  var themeBtn = $('#theme');
  function themeLabel() {
    var dark = d.dataset.site !== 'light';
    var es = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro', en = dark ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.dataset.esLabel = es; themeBtn.dataset.enLabel = en; themeBtn.setAttribute('aria-label', LG ? en : es);
  }
  themeBtn.addEventListener('click', function () {
    var t = d.dataset.site === 'light' ? 'dark' : 'light';
    d.dataset.site = t; store.set('ff-theme', t); themeLabel();
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'light' ? '#ffffff' : '#141312');
    setTimeout(redrawAll, 470);
  });

  /* ---------- menú móvil ---------- */
  var nav = $('#nav'), menuBtn = $('#menuBtn');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var o = !nav.classList.contains('open'); nav.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', String(o));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(); });

  /* ---------- ondas ---------- */
  function cssVar(n) { return getComputedStyle(d).getPropertyValue(n).trim(); }
  var peaksCache = {};
  function seeded(seed, n) {
    var s = (seed * 7919) % 2147483647 || 1, r = function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
    var a = [], p0 = r() * 6, p1 = r() * 6;
    for (var i = 0; i < n; i++) {
      var t = i / n, e = Math.abs(Math.sin(t * Math.PI * (2 + seed % 3) + p0)) * .55 + Math.abs(Math.sin(t * Math.PI * 9 + p1)) * .3 + .1;
      e *= .55 + r() * .45; if (r() < .08) e *= .2; a.push(e);
    }
    return a;
  }
  function drawWave(cv) {
    var W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    var n = Math.floor(W / 3), src = peaksCache[cv.dataset.src];
    var pk = src ? resample(src, n) : seeded(+cv.dataset.seed || 1, n);
    var prog = +cv.dataset.prog || 0, off = cssVar('--wave'), on = cssVar('--wave-on');
    for (var i = 0; i < n; i++) {
      var bh = Math.max(1, pk[i] * H * .92);
      x.fillStyle = (i / n) < prog ? on : off;
      x.fillRect(i * 3, (H - bh) / 2, 2, bh);
    }
  }
  function resample(a, n) {
    var out = [], step = a.length / n;
    for (var i = 0; i < n; i++) { var m = 0, s = Math.floor(i * step), e = Math.max(s + 1, Math.floor((i + 1) * step)); for (var j = s; j < e; j++) m = Math.max(m, a[j]); out.push(m); }
    return out;
  }
  function loadPeaks(src, cv) {
    if (peaksCache[src] || !window.fetch) return;
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    fetch(src).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      var ctx = new C(); return ctx.decodeAudioData(buf).then(function (ab) { ctx.close && ctx.close(); return ab; });
    }).then(function (ab) {
      var ch = ab.getChannelData(0), N = 600, blk = Math.floor(ch.length / N), out = [], mx = 0;
      for (var i = 0; i < N; i++) { var m = 0; for (var j = 0; j < blk; j += 16) { var v = Math.abs(ch[i * blk + j]); if (v > m) m = v; } out.push(m); if (m > mx) mx = m; }
      peaksCache[src] = out.map(function (v) { return mx ? v / mx : 0; });
      drawWave(cv);
    }).catch(function () {});
  }
  var wt = 0, ro = 'ResizeObserver' in window ? new ResizeObserver(function () { clearTimeout(wt); wt = setTimeout(redrawAll, 120); }) : null;
  function redrawAll() { $$('#cues canvas').forEach(drawWave); }

  /* ---------- reproductor ---------- */
  var player = $('#player'), cur = null, raf = 0, tcEl = $('#tc');
  function fmt(s) { s = Math.max(0, s || 0); var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
  function tc(s) { var p = function (n) { return (n < 10 ? '0' : '') + n; }; return '01:' + p(Math.floor(s / 60) % 60) + ':' + p(Math.floor(s) % 60) + ':' + p(Math.floor((s % 1) * 25)); }
  function tick() {
    if (!cur) return;
    var p = player.duration ? player.currentTime / player.duration : 0;
    cur.cv.dataset.prog = p; drawWave(cur.cv);
    cur.range.value = Math.round(p * 1000);
    cur.time.textContent = fmt(player.currentTime) + ' / ' + fmt(player.duration);
    tcEl.textContent = tc(player.currentTime);
    if (!player.paused) raf = requestAnimationFrame(tick);
  }
  function setPlaying(btn, on) {
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? (LG ? 'Pause' : 'Pausar') : (LG ? 'Play' : 'Reproducir'));
  }
  function bindPlayer(root, p) {
    var btn = $('.play', root), cv = $('canvas', root), range = $('input', root), time = $('.time', root);
    var me = { btn: btn, cv: cv, range: range, time: time, src: p.audio };
    btn.addEventListener('click', function () {
      if (cur && cur.src === p.audio && !player.paused) { player.pause(); return; }
      if (!cur || cur.src !== p.audio) {
        if (cur) { setPlaying(cur.btn, false); cur.cv.dataset.prog = 0; drawWave(cur.cv); }
        cur = me; player.src = p.audio;
      }
      player.play().catch(function () {});
    });
    range.addEventListener('input', function () {
      if (!cur || cur.src !== p.audio) { btn.click(); }
      var go = function () { if (player.duration) player.currentTime = (range.value / 1000) * player.duration; tick(); };
      player.readyState >= 1 ? go() : player.addEventListener('loadedmetadata', go, { once: true });
    });
    if (cur && cur.src === p.audio) { cur = me; setPlaying(btn, !player.paused); tick(); }
  }
  player.addEventListener('play', function () { if (cur) setPlaying(cur.btn, true); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); });
  player.addEventListener('pause', function () { if (cur) setPlaying(cur.btn, false); tick(); });
  player.addEventListener('ended', function () { if (cur) { setPlaying(cur.btn, false); } });
  player.addEventListener('loadedmetadata', tick);

  /* ---------- lista de cues ---------- */
  var openIdx = 0, box = $('#cues');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function renderCues() {
    if (!box) return;
    if (ro) ro.disconnect();
    box.innerHTML = '';
    $('#cueCount').textContent = P.length + ' cues';
    P.forEach(function (p, i) {
      var o = openIdx === i, id = 'cue-' + i;
      var audio = p.audio ? '<div class="au"><div class="wv"><canvas data-seed="' + (i * 13 + 7) + '" data-src="' + esc(p.audio) + '" data-prog="0"></canvas><input type="range" min="0" max="1000" value="0" aria-label="' + (LG ? 'Seek in sample' : 'Avanzar en la muestra') + '"></div><div class="act"><button type="button" class="play" aria-pressed="false" aria-label="' + (LG ? 'Play' : 'Reproducir') + '"></button><span class="time">0:00</span><span>' + (LG ? 'Sample' : 'Muestra') + ' · ' + esc(T(p.title)) + '</span></div></div>' : '';
      var link = p.link ? '<a class="xlink" href="' + esc(p.link[1]) + '" target="_blank" rel="noopener">' + esc(p.link[0]) + ' ↗</a>' : '';
      var el = document.createElement('div'); el.className = 'cue';
      el.innerHTML =
        '<h3 style="margin:0;font:inherit"><button type="button" class="rowb" aria-expanded="' + o + '" aria-controls="' + id + '">' +
        '<span class="n">' + esc(p.code) + '-' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="pt">' + esc(T(p.title)) + '<i aria-hidden="true"></i></span>' +
        '<span class="st">' + esc(T(p.studio)) + '</span>' +
        '<span class="ta">' + esc(T(p.role)) + '</span>' +
        '<span class="lg">' + esc(p.lang) + '</span></button></h3>' +
        '<div class="xp' + (o ? ' open' : '') + '" id="' + id + '" role="region"><div><div class="xin' + (p.audio ? '' : ' solo') + '">' +
        '<p>' + esc(T(p.desc)) + '<span class="via">' + esc(T(p.role)) + ' · ' + esc(T(p.via)) + '</span>' + link + '</p>' + audio +
        '</div></div></div>';
      box.appendChild(el);
      $('.rowb', el).addEventListener('click', function () { toggle(i); });
      if (p.audio) bindPlayer(el, p);
    });
    $$('#cues canvas').forEach(function (c) { if (ro) ro.observe(c); });
    if (P[openIdx] && P[openIdx].audio) loadPeaks(P[openIdx].audio, $$('.cue')[openIdx].querySelector('canvas'));
  }
  function toggle(i) {
    openIdx = openIdx === i ? -1 : i;
    $$('.cue').forEach(function (c, j) {
      var o = openIdx === j;
      $('.rowb', c).setAttribute('aria-expanded', String(o));
      $('.xp', c).classList.toggle('open', o);
      if (o && P[j].audio) { var cv = $('canvas', c); setTimeout(function () { drawWave(cv); loadPeaks(P[j].audio, cv); }, 60); }
    });
    if (AU.on) AU.tone(DOREMI[i % 3] * 2, { d: .2, type: 'sine', g: .04 });
  }

  /* ---------- aparición al scrollear + sección activa ---------- */
  if ('IntersectionObserver' in window && !RM.matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(function (el, i) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 70 + 'ms';
      io.observe(el);
    });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }
  if ('IntersectionObserver' in window) {
    var links = $$('.nav a');
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['trabajos', 'servicios', 'perfil', 'contacto'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- copiar mail ---------- */
  var toast = $('#toast'), tt = 0;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 1800); }
  $('#copy').addEventListener('click', function () {
    var mail = 'Federicoafernandezs@gmail.com';
    var ok = function () { say(LG ? 'Email copied' : 'Mail copiado'); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(ok, function () { say(mail); }); else say(mail);
  });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- timecode del hero (corre solo; con audio, sigue al reproductor) ---------- */
  var hero = $('.hero'), t0 = performance.now(), heroVis = true;
  setInterval(function () {
    if (!heroVis || document.hidden || RM.matches || (cur && !player.paused)) return;
    tcEl.textContent = tc((performance.now() - t0) / 1000);
  }, 80);
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; hero.classList.toggle('paused', !heroVis); }).observe(hero);
  }

  /* ---------- intro automática ---------- */
  var intro = $('#intro'), done = false;
  function ready() { document.body.classList.add('ready'); }
  function endIntro() {
    if (done) return; done = true;
    try { sessionStorage.setItem('ff-intro', '1'); } catch (e) {}
    d.classList.remove('intro-on'); ready();
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function runIntro() {
    AU.on = true;
    AU.ensure();   // si el navegador permite audio sin interacción, suena; si no, la intro va en silencio
    var ks = $$('.knob', intro), i = 0;
    wait(500).then(function step() {
      if (done) return;
      if (i < 3) { ks[i].style.setProperty('--r', (40 + i * 25) + 'deg'); AU.tone(DOREMI[i], { d: .6 }); i++; return wait(420).then(step); }
      $('.fd', intro).classList.add('up'); AU.tone(DOREMI[0] * 2, { d: 1, type: 'sine', g: .08 });
      return wait(320).then(function () { $('.inm', intro).classList.add('on'); return wait(1200); })
        .then(function () { if (done) return; intro.classList.add('out'); return wait(780).then(endIntro); });
    });
  }
  if (d.classList.contains('intro-on')) {
    $('#skip').addEventListener('click', endIntro);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !done) endIntro(); });
    runIntro();
  } else { ready(); }

  /* ---------- arranque ---------- */
  if (LG) applyLang(); else { themeLabel(); renderCues(); }
})();
