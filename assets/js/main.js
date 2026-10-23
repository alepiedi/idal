/* =========================================================
   IDAL · Italiana Distribuzione Alimenti — main.js
   Niente framework: HTML, CSS e JavaScript puri.
   ========================================================= */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const fmt = (n, d = 0) => n.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const img = c => `assets/img/prodotti/${c}.webp`;
const imgS = c => `assets/img/prodotti/s/${c}.webp`;
const ico = k => `assets/img/icone/${k}.png`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* Un solo gestore di scroll per tutto il sito, al massimo una volta per fotogramma */
const onScroll = (() => {
  const fns = []; let queued = false;
  const run = () => { queued = false; for (const f of fns) { try { f(scrollY); } catch (e) { console.error(e); } } };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true });
  return f => { fns.push(f); f(scrollY); };
})();

const PRODOTTI = Array.isArray(window.IDAL_PRODOTTI) ? window.IDAL_PRODOTTI : [];
const BY_CODE = Object.fromEntries(PRODOTTI.map(p => [p.c, p]));

/* ---------- Le linee (testi dal layout) ---------- */
const LINEE = [
  { k: 'caseari', nome: 'Caseari', c: '#EDD767', dark: true, ico: 'caseari',
    testo: 'La linea Caseari di Idal propone una gamma molto ampia di formaggi freschi, semi-stagionati e stagionati. Una selezione di specialità italiane e regionali come i prodotti DOP: Parmigiano Reggiano, Grana Padano, Pecorino Romano, Gorgonzola e Asiago. La linea è arricchita inoltre da altri prodotti nazionali, come lo stracchino, la robiola, il mascarpone e molto ancora.',
    fan: ['IDA0315', 'IDA0099', 'IDA0626', 'IDA0487'] },
  { k: 'salumi', nome: 'Salumi', c: '#E60002', ico: 'salumi',
    testo: 'La linea salumi di Idal nasce da un’accurata selezione di salumifici che lavorano secondo la tradizione italiana, per garantire al consumatore un’esperienza di gusto unica. Idal offre un’ampia varietà di salumi nostrani, IGP e DOP, direttamente da gustare e ideali per farcire toast, panini o per arricchire i tuoi piatti.',
    fan: ['IDA0982', 'IDA0056', 'IDA0425', 'IDA0538'] },
  { k: 'pasta', nome: 'Pasta', c: '#C37F40', ico: 'pasta',
    testo: 'Dalle regioni italiane principalmente vocate alla produzione di pasta (Puglia, Campania, Emilia Romagna e Veneto) nasce la Linea Pasta di Idal che comprende pasta fresca all’uovo e con semola di grano duro, pasta ripiena e gnocchi freschi di patate. La Linea Pasta di Idal offre un’ampia varietà di formati in grado di soddisfare ogni preparazione culinaria, dalla più tradizionale alla più creativa.',
    fan: ['IDA0285', 'IDA0642', 'IDA0620', 'IDA0459'] },
  { k: 'forno', nome: 'Prodotti da forno', c: '#693311', ico: 'forno',
    testo: 'I prodotti da forno di Idal accompagneranno con gusto ogni momento della tua giornata, da un pranzo veloce a un aperitivo in compagnia. Scopri la linea di focacce, pinse e piadine fresche, le friselle classiche ed integrali, il “Trecciolo sannita” prodotto artigianale tipico del Sannio anche nella variante al finocchietto ed alcuni pani speciali come il sardo Guttiau ed il pane azzimo di farro.',
    fan: ['IDA0570', 'IDA0959', 'IDA0945', 'IDA0839'] },
  { k: 'ortofrutta', nome: 'Ortofrutta', c: '#5AB41E', ico: 'ortofrutta',
    testo: 'Raccolta, lavata e pronta all’uso. E’ la IV gamma di Idal, sempre fresca e di alta qualità. L’azienda seleziona inoltre una varietà di frutta e ortaggi freschi, adatti per ogni tua preparazione o per essere gustati tal quali.',
    fan: ['IDA0150', 'IDA0521', 'IDA0735', 'IDA0899'] },
  { k: 'conserve', nome: 'Conserve e legumi', c: '#820A0B', ico: 'conserve',
    testo: 'Pomodori e datterini 100% italiani, coltivati e raccolti a mano nella Piana del Sele (provincia di Salerno), danno vita alla linea conserve di Idal. Una selezione di salse e sughi pronti ideali per condire la tua pasta, oltre alla selezione di gustose lenticchie italiane.',
    fan: ['IDA0989', 'IDA0994', 'IDA0992', 'IDA0505'] },
  { k: 'ittico', nome: 'Ittico', c: '#1BC1DB', ico: 'ittico',
    testo: 'Lavorato fresco in Italia ed affumicato con legni di faggio, il salmone norvegese di alta qualità della linea ittico di Idal è senza conservanti, aromi o additivi e naturalmente ricco di Omega 3. La linea comprende anche una selezione di tonno pinna gialle, disponibile sia in lattina che in tranci in olio ed in acqua di mare.',
    fan: ['IDA0550', 'IDA0551', 'IDA0921', 'IDA0920'] }
];
const LINEA = Object.fromEntries(LINEE.map(l => [l.k, l]));
const count = k => PRODOTTI.filter(p => p.k === k).length;

/* Le 8 tessere del layout, nello stesso ordine */
const TESSERE = [
  { ico: 'caseari', c: '#EDD767', nome: 'Caseari', k: 'caseari' },
  { ico: 'salumi', c: '#E60002', nome: 'Salumi', k: 'salumi' },
  { ico: 'conserve', c: '#820A0B', nome: 'Conserve', k: 'conserve' },
  { ico: 'ittico', c: '#1BC1DB', nome: 'Ittico', k: 'ittico' },
  { ico: 'pasta', c: '#C37F40', nome: 'Pasta', k: 'pasta' },
  { ico: 'legumi', c: '#456033', nome: 'Legumi', k: 'conserve', sub: 'Legumi' },
  { ico: 'ortofrutta', c: '#5AB41E', nome: 'Ortofrutta', k: 'ortofrutta' },
  { ico: 'forno', c: '#693311', nome: 'Prodotti da forno', k: 'forno' }
];

/* =========================================================
   LOADER — la bilancia
   ========================================================= */
function loader() {
  const el = $('#loader');
  const done = () => {
    el.classList.add('is-out');
    document.body.classList.remove('is-loading');
    setTimeout(() => el.classList.add('is-gone'), 1300);
  };
  let seen = false;
  try { seen = sessionStorage.getItem('idal-loader') === '1'; sessionStorage.setItem('idal-loader', '1'); } catch {}
  if (RM || seen) { el.classList.add('is-gone'); return; }
  document.body.classList.add('is-loading');
  const num = $('#loaderNum'), T = 1500, t0 = performance.now(), END = 1700000;
  (function tick(t) {
    const p = clamp((t - t0) / T, 0, 1), e = 1 - Math.pow(1 - p, 4);
    num.textContent = fmt(Math.round(END * e));
    if (p < 1) requestAnimationFrame(tick); else setTimeout(done, 380);
  })(t0);
}

/* =========================================================
   NAV
   ========================================================= */
function nav() {
  const navEl = $('#nav'), burger = $('#burger'), mm = $('#mobileMenu');
  $('#navCats').innerHTML = LINEE.map(l =>
    `<a href="#catalogo" data-cat="${l.k}"><i class="k-${l.k}"><img src="${ico(l.ico)}" alt="" width="20" height="20"></i>${esc(l.nome)}</a>`).join('');
  $('#mmenuCats').innerHTML = LINEE.map(l =>
    `<a href="#catalogo" data-cat="${l.k}" class="k-${l.k}" aria-label="${esc(l.nome)}"><img src="${ico(l.ico)}" alt="" loading="lazy"></a>`).join('');

  let lastY = scrollY;
  onScroll(y => {
    navEl.classList.toggle('is-scrolled', y > 30);
    if (y > 600 && y > lastY + 4 && !mm.classList.contains('is-open')) navEl.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 600) navEl.classList.remove('is-hidden');
    lastY = y;
  });

  const toggle = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (open) { mm.hidden = false; requestAnimationFrame(() => mm.classList.add('is-open')); }
    else { mm.classList.remove('is-open'); setTimeout(() => { if (!mm.classList.contains('is-open')) mm.hidden = true; }, 700); }
    document.body.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => toggle(burger.getAttribute('aria-expanded') !== 'true'));
  mm.addEventListener('click', e => { if (e.target.closest('a')) toggle(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('is-open')) toggle(false); });

  // voce attiva
  const links = $$('[data-nav]');
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.dataset.nav === en.target.dataset.section));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-section]').forEach(s => io.observe(s));
}

/* =========================================================
   HERO — parallasse
   ========================================================= */
function hero() {
  const stage = $('#heroStage'); if (!stage || RM) return;
  const items = $$('[data-depth]', stage);
  let mx = 0, my = 0, cx = 0, cy = 0, sy = 0, raf = 0;
  const loop = () => {
    cx += (mx - cx) * .08; cy += (my - cy) * .08;
    items.forEach(el => {
      const d = +el.dataset.depth;
      el.style.transform = `translate3d(${cx * d * 14}px, ${cy * d * 14 - sy * d * .12}px, 0)`;
    });
    raf = Math.abs(mx - cx) + Math.abs(my - cy) > .001 ? requestAnimationFrame(loop) : 0;
    if (!raf) items.forEach(el => { el.style.transform = `translate3d(${mx * +el.dataset.depth * 14}px, ${my * +el.dataset.depth * 14 - sy * +el.dataset.depth * .12}px, 0)`; });
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  if (FINE) addEventListener('pointermove', e => {
    if (scrollY > innerHeight) return;
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; kick();
  }, { passive: true });
  onScroll(y => { if (y < innerHeight * 1.2 || sy < innerHeight * 1.2) { sy = Math.min(y, innerHeight * 1.2); kick(); } });
}

/* =========================================================
   TESSERE + NASTRO
   ========================================================= */
function keys() {
  $('#keys').innerHTML = TESSERE.map(t => {
    const n = t.sub ? PRODOTTI.filter(p => p.k === t.k && p.s === t.sub).length : count(t.k);
    return `<a class="key key--${t.ico} k-${t.ico}" href="#catalogo" data-cat="${t.k}" ${t.sub ? `data-sub="${esc(t.sub)}"` : ''}>
      <img src="${ico(t.ico)}" alt="" width="120" height="120">
      <span>${esc(t.nome)}<small>${n} referenze</small></span></a>`;
  }).join('');
}

function belt() {
  const pool = PRODOTTI.filter(p => !p.x);
  const pick = (off, n) => Array.from({ length: n }, (_, i) => pool[(off + i * 13) % pool.length]);
  const fill = (el, list) => {
    const html = list.map(p => `<a class="belt__item" href="#catalogo" data-open="${esc(p.c)}" data-code="${esc(p.c)}" data-cursor="Apri" aria-label="${esc(p.n)}"><img src="${imgS(p.c)}" alt="" width="280" height="280" loading="lazy" decoding="async"></a>`).join('');
    el.innerHTML = html + html;
  };
  const t1 = $('#belt1'), t2 = $('#belt2');
  fill(t1, pick(0, 22)); fill(t2, pick(7, 22));
  if (RM) return;
  let x1 = 0, x2 = 0, v = 0, lastY = scrollY, raf = 0, w1 = 1, w2 = 1;
  // le larghezze si misurano solo quando cambiano, mai a ogni fotogramma
  const measure = () => { w1 = t1.scrollWidth / 2 || 1; w2 = t2.scrollWidth / 2 || 1; };
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(t1);
  onScroll(y => { v = clamp(v + (y - lastY) * .08, -40, 40); lastY = y; });
  const loop = () => {
    v *= .92;
    const s = .5 + Math.abs(v);
    x1 = (x1 - s) % w1; x2 = (x2 + s) % w2;
    t1.style.transform = `translate3d(${x1}px,0,0)`;
    t2.style.transform = `translate3d(${x2 - w2}px,0,0)`;
    raf = requestAnimationFrame(loop);
  };
  // il nastro gira solo quando è sullo schermo e la scheda è in primo piano
  let vis = false;
  const sync = () => {
    const go = vis && !document.hidden;
    if (go && !raf) raf = requestAnimationFrame(loop);
    if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; sync(); }).observe($('.belt'));
  document.addEventListener('visibilitychange', sync);
}

/* =========================================================
   MAPPE
   ========================================================= */
const G = window.IDAL_GEO;
const NS = 'http://www.w3.org/2000/svg';
const proj = (lon, lat) => [(lon - G.proj[0]) * G.proj[2], (G.proj[1] - lat) * G.proj[3]];
const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

function minimap() {
  const box = $('#minimap'); if (!G || !box) return;
  const s = svgEl('svg', { viewBox: '540 590 300 188', preserveAspectRatio: 'xMidYMid slice' }, box);
  G.regions.forEach(r => svgEl('path', { d: r.d, fill: r.n === 'Campania' ? '#fff' : '#F6F1E6', stroke: r.n === 'Campania' ? '#009FE3' : '#c5d6df', 'stroke-width': r.n === 'Campania' ? 1.4 : .8 }, s));
  const [bx, by] = G.cities.Benevento;
  ['Napoli', 'Avellino', 'Caserta', 'Salerno', 'Campobasso', 'Foggia'].forEach(n => {
    const [x, y] = G.cities[n];
    svgEl('circle', { cx: x, cy: y, r: 1.6, fill: '#706E6F' }, s);
    svgEl('text', { x: x + 4, y: y + 3, 'font-size': 8, fill: '#706E6F', 'font-family': 'Manrope', 'font-weight': 700 }, s).textContent = n;
  });
  const ring = svgEl('circle', { cx: bx, cy: by, r: 6, fill: 'none', stroke: '#E40311', 'stroke-width': 1.5 }, s);
  if (!RM) {
    svgEl('animate', { attributeName: 'r', values: '4;16', dur: '1.8s', repeatCount: 'indefinite' }, ring);
    svgEl('animate', { attributeName: 'opacity', values: '1;0', dur: '1.8s', repeatCount: 'indefinite' }, ring);
  }
  svgEl('circle', { cx: bx, cy: by, r: 4.5, fill: '#E40311', stroke: '#fff', 'stroke-width': 1.5 }, s);
  const t = svgEl('text', { x: bx + 9, y: by - 6, 'font-size': 12, fill: '#0E1C2B', 'font-family': 'Manrope', 'font-weight': 800, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 }, s);
  t.textContent = 'IDAL · Benevento';
  pauseOffscreen(s, box);
}

/* Le animazioni SVG (SMIL) ridisegnano tutta la mappa: si fermano quando non si vede */
function pauseOffscreen(svg, watch, extra = () => true) {
  if (!svg.pauseAnimations) return;
  svg.pauseAnimations();
  let vis = false;
  const sync = () => (vis && extra() && !document.hidden ? svg.unpauseAnimations() : svg.pauseAnimations());
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; sync(); }).observe(watch);
  document.addEventListener('visibilitychange', sync);
  return sync;
}

function storyMap() {
  const svg = $('#storyMap'), box = $('#mapbox'), badge = $('#mapBadge'); if (!G || !svg) return;
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const gR = svgEl('g', {}, svg);
  G.regions.forEach(r => svgEl('path', { d: r.d, class: 'reg' + (r.hi ? ' is-hi' : '') }, gR));

  const [bx, by] = G.cities.Benevento;
  const [dx, dy] = G.cities.Durazzano;

  // punti vendita: un solo path, costa pochissimo
  let d = '';
  for (let i = 0; i < G.pts.length; i += 2) d += `M${G.pts[i]} ${G.pts[i + 1]}h0`;
  svgEl('path', { d, class: 'dots', 'stroke-width': 2.4 }, svg);

  // archi dai siti produttivi
  const SRC = [
    ['Parmigiano Reggiano', 10.33, 44.80, 1], ['Grana Padano', 9.50, 45.31, 1], ['Gorgonzola', 8.62, 45.45, 1],
    ['Asiago', 11.51, 45.87, 1], ['Pecorino Romano', 12.50, 41.90, 1], ['Prosciutto San Daniele', 13.01, 46.16, 0],
    ['Valtellina', 9.87, 46.17, 0], ['Mortadella Bologna', 11.34, 44.49, 0], ['Piana del Sele', 15.05, 40.55, 0],
    ['Pasta di Puglia', 16.55, 40.83, 0], ['Pecorino in Sardegna', 9.0, 40.1, 0], ['Pasta del Veneto', 12.0, 45.4, 0]
  ];
  const gA = svgEl('g', {}, svg);
  SRC.forEach(([n, lon, lat, dop]) => {
    const [x, y] = proj(lon, lat);
    const mx = (x + bx) / 2, my = (y + by) / 2, len = Math.hypot(bx - x, by - y);
    const nx = -(by - y) / len, ny = (bx - x) / len, k = Math.min(140, len * .3);
    svgEl('path', { d: `M${x} ${y}Q${mx + nx * k} ${my + ny * k} ${bx} ${by}`, pathLength: 1, class: 'arc' + (dop ? ' is-dop' : '') }, gA);
    const g = svgEl('g', { class: 'src' + (dop ? ' is-dop' : '') }, gA);
    svgEl('circle', { cx: x, cy: y, r: 7 }, g);
    const left = x < 260;
    svgEl('text', { x: left ? x - 9 : x + 9, y: y + 5, 'font-size': 21, 'text-anchor': left ? 'end' : 'start' }, g).textContent = n;
  });

  // orbita dei comparti (step 3)
  const gO = svgEl('g', { class: 'orbit' }, svg);
  const gSpin = svgEl('g', {}, gO);
  TESSERE.forEach((t, i) => {
    const a = i / TESSERE.length * Math.PI * 2, R = 112;
    const x = bx + Math.cos(a) * R, y = by + Math.sin(a) * R;
    svgEl('circle', { cx: x, cy: y, r: 27, fill: t.c, stroke: '#fff', 'stroke-width': 3 }, gSpin);
    svgEl('image', { href: ico(t.ico), x: x - 16, y: y - 16, width: 32, height: 32 }, gSpin);
  });
  if (!RM) svgEl('animateTransform', { attributeName: 'transform', type: 'rotate', from: `0 ${bx} ${by}`, to: `360 ${bx} ${by}`, dur: '40s', repeatCount: 'indefinite' }, gSpin);
  const logo = svgEl('g', { class: 'orbit' }, svg);
  svgEl('circle', { cx: bx, cy: by, r: 58, fill: '#fff', stroke: '#009FE3', 'stroke-width': 2 }, logo);
  svgEl('image', { href: 'assets/img/logo-idal-sm.webp', x: bx - 46, y: by - 22, width: 92, height: 43 }, logo);

  // etichette dei singoli step
  const g0 = svgEl('g', { class: 'lbl lbl-0' }, svg);
  svgEl('text', { x: dx - 6, y: dy + 16, 'font-size': 8.5, 'text-anchor': 'end' }, g0).textContent = 'Durazzano (BN)';
  svgEl('text', { x: bx + 8, y: by - 6, 'font-size': 8.5 }, g0).textContent = 'Benevento';
  svgEl('circle', { cx: dx, cy: dy, r: 3.2, fill: '#009D3E', stroke: '#fff', 'stroke-width': 1 }, g0);
  // bidone del latte
  const can = svgEl('g', { transform: `translate(${dx - 30} ${dy - 40}) scale(.42)` }, g0);
  svgEl('path', { d: 'M18 4h24v8l6 8v40a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V20l6-8z', fill: '#fff', stroke: '#0E1C2B', 'stroke-width': 3, 'stroke-linejoin': 'round' }, can);
  svgEl('path', { d: 'M12 34h36M12 44h36', stroke: '#009FE3', 'stroke-width': 3 }, can);
  svgEl('rect', { x: 16, y: 0, width: 28, height: 6, rx: 3, fill: '#0E1C2B' }, can);

  const g4 = svgEl('g', { class: 'lbl lbl-4' }, svg);
  [['Campania', 14.95, 40.95], ['Molise', 14.55, 41.72], ['Puglia', 16.75, 41.25], ['Basilicata', 16.05, 40.42]].forEach(([n, lon, lat]) => {
    const [x, y] = proj(lon, lat);
    svgEl('text', { x, y, 'font-size': 13, 'text-anchor': 'middle' }, g4).textContent = n.toUpperCase();
  });

  // Benevento sempre visibile
  const home = svgEl('g', { class: 'home' }, svg);
  svgEl('circle', { cx: bx, cy: by, r: 6, class: 'ring' }, home);
  svgEl('circle', { cx: bx, cy: by, r: 4.2, class: 'core', stroke: '#fff', 'stroke-width': 1.5 }, home);

  const ITALY = [-30, -20, 1060, 1347];
  const VIEWS = [
    [dx - 95, dy - 70, 190, 150],
    ITALY, ITALY,
    [bx - 330, by - 320, 660, 640],
    [575, 545, 430, 290]
  ];
  const BADGES = [
    ['Durazzano (BN)', 'Raccolta del latte'],
    ['Siti produttivi in tutta Italia'],
    ['1988 · marchio IDAL', 'Formaggi D.O.P.'],
    ['8 comparti', '1.700.000 kg l’anno', '200 collaboratori'],
    ['2.700+ punti vendita', 'Campania · Molise · Puglia · Basilicata']
  ];
  let cur = VIEWS[0].slice(), target = VIEWS[0], raf = 0, step = -1;
  const apply = () => svg.setAttribute('viewBox', cur.map(v => v.toFixed(1)).join(' '));
  const loop = () => {
    let moving = false;
    cur = cur.map((v, i) => { const n = v + (target[i] - v) * .075; if (Math.abs(target[i] - n) > .2) moving = true; return n; });
    apply();
    raf = moving ? requestAnimationFrame(loop) : 0;
  };
  const go = n => {
    if (n === step) return; step = n;
    target = VIEWS[n];
    svg.setAttribute('class', 'smap s' + n);
    box.className = 'mapbox s' + n;
    badge.innerHTML = BADGES[n].map(b => `<span>${esc(b)}</span>`).join('');
    $$('.step').forEach(s => s.classList.toggle('is-on', +s.dataset.step === n));
    if (RM) { cur = target.slice(); apply(); } else if (!raf) raf = requestAnimationFrame(loop);
    syncAnim && syncAnim();
  };
  // l'orbita dei comparti gira solo nello step 3 e solo se la mappa è sullo schermo
  const syncAnim = pauseOffscreen(svg, box, () => step === 3);
  apply(); go(0);
  // su telefono la mappa occupa la parte alta dello schermo: il testo "attivo" è quello che si legge sotto
  const band = matchMedia('(max-width: 900px)').matches ? '-66% 0px -30% 0px' : '-45% 0px -45% 0px';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) go(+e.target.dataset.step); }), { rootMargin: band });
  $$('.step').forEach(s => io.observe(s));
}

/* =========================================================
   NUMERI + CONTATORE LIVE
   ========================================================= */
function numbers() {
  const els = $$('[data-count]');
  const run = el => {
    const end = +el.dataset.count, sep = 'sep' in el.dataset, plus = 'plus' in el.dataset;
    const out = v => (sep ? fmt(v) : String(v)) + (plus ? '+' : '');
    if (RM) { el.textContent = out(end); return; }
    const T = 1800, t0 = performance.now(), from = end === 1988 ? 1950 : 0;
    (function tick(t) {
      const p = clamp((t - t0) / T, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = out(Math.round(from + (end - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  els.forEach(e => io.observe(e));

  // 1.700.000 kg l'anno, al secondo
  const RATE = 1700000 / (365 * 24 * 3600), t0 = Date.now();
  const CMP = [
    [0.03, 'Più o meno: un mazzetto di Basilico IDAL da 30 g.'],
    [0.1, 'Più o meno: una busta di Rucola IDAL da 100 g.'],
    [0.25, 'Più o meno: una vaschetta di Mascarpone IDAL da 250 g.'],
    [0.5, 'Più o meno: un pacco di Orecchiette IDAL da 500 g.'],
    [1, 'Più o meno: un chilo di Grana Padano sottovuoto.'],
    [2, 'Più o meno: un Fiaschetto Affumicato da 2 kg.'],
    [5, 'Più o meno: un Formaggio di capra Capros da 5 kg.'],
    [9.5, 'Più o meno: un Prosciutto Crudo di Parma con l’osso.'],
    [13, 'Più o meno: una Mortadella Venere con pistacchio da 13 kg.'],
    [25, 'Più o meno: un Provolone Mandarino da 25 kg.'],
    [60, 'Più o meno: un Provolone Pancettone da 60 kg. Sì, esiste.']
  ];
  const kgEl = $('#liveKg'), cmpEl = $('#liveCmp');
  let lastCmp = '';
  setInterval(() => {
    const kg = (Date.now() - t0) / 1000 * RATE;
    kgEl.textContent = fmt(kg, 2) + ' kg';
    let c = 'Ancora più leggero di una foglia di basilico.';
    for (const [w, s] of CMP) if (kg >= w) c = s;
    if (kg >= 120) c = `Più o meno: ${fmt(Math.floor(kg / 60))} Provoloni Pancettone da 60 kg. Resta ancora un po’.`;
    if (c !== lastCmp) { cmpEl.textContent = c; lastCmp = c; }
  }, 250);
}

/* =========================================================
   FILOSOFIA — le parole si accendono scorrendo
   ========================================================= */
function philo() {
  const el = $('#philoBig'); if (!el) return;
  const HL = /^(qualità|materie|prime|standard|igienici|autentici|genuini|consumatore)/i;
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w${HL.test(w) ? ' hl' : ''}">${esc(w)}</span>`).join(' ');
  const ws = $$('.w', el);
  if (RM) { ws.forEach(w => w.classList.add('on')); return; }
  let on = -1;
  const upd = () => {
    const r = el.getBoundingClientRect();
    const p = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1);
    const n = Math.round(p * ws.length);
    if (n === on) return; on = n;
    ws.forEach((w, i) => w.classList.toggle('on', i < n));
  };
  onScroll(upd);
}

/* =========================================================
   LE LINEE — scorrimento orizzontale
   ========================================================= */
function lines() {
  const track = $('#linesTrack'), pin = $('#linesPin'), dots = $('#linesDots');
  track.innerHTML = LINEE.map((l, i) => {
    const subs = [...new Set(PRODOTTI.filter(p => p.k === l.k).map(p => p.s))];
    const inv = l.dark ? ' inv' : '';
    return `<article class="panel k-${l.k}${l.dark ? ' is-dark' : ''}" id="linea-${l.k}">
      <img class="panel__bgico${inv}" src="${ico(l.ico)}" alt="" loading="lazy">
      <div class="panel__txt">
        <span class="panel__num">0${i + 1} / 0${LINEE.length} <b>${count(l.k)} referenze</b></span>
        <h3><img class="${inv}" src="${ico(l.ico)}" alt="" loading="lazy">${esc(l.nome)}</h3>
        <p>${esc(l.testo)}</p>
        <div class="panel__subs">${subs.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <a class="btn" href="#catalogo" data-cat="${l.k}"><span>Vedi le ${count(l.k)} referenze</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
      <div class="panel__fan">${l.fan.filter(c => BY_CODE[c]).map(c => `<figure><img src="${imgS(c)}" alt="${esc(BY_CODE[c].n)}" width="280" height="280" loading="lazy" decoding="async"></figure>`).join('')}</div>
    </article>`;
  }).join('');
  dots.innerHTML = LINEE.map((l, i) => `<button type="button" aria-label="${esc(l.nome)}" data-i="${i}"></button>`).join('');
  pin.style.setProperty('--n', LINEE.length * .8 + .6);
  const mq = matchMedia('(min-width: 901px)');
  let maxX = 0, top = 0, total = 1, lastIdx = -1;
  const btns = () => $$('button', dots);
  // misure lette solo al ridimensionamento: durante lo scroll si fa solo matematica
  const measure = () => {
    maxX = Math.max(0, track.scrollWidth - innerWidth);
    top = pin.getBoundingClientRect().top + scrollY;
    total = Math.max(1, pin.offsetHeight - innerHeight);
  };
  const upd = () => {
    if (!mq.matches) return;
    const p = clamp((scrollY - top) / total, 0, 1);
    track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
    const idx = Math.round(p * (LINEE.length - 1));
    if (idx !== lastIdx) { lastIdx = idx; btns().forEach((b, i) => b.classList.toggle('is-on', i === idx)); }
  };
  dots.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    measure();
    scrollTo({ top: top + total * (+b.dataset.i / (LINEE.length - 1)), behavior: RM ? 'auto' : 'smooth' });
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); upd(); }, 100); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); upd(); }).observe(document.body);
  measure(); onScroll(upd);
  addEventListener('load', () => { measure(); upd(); });
}

/* =========================================================
   CATALOGO
   ========================================================= */
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// la lista salvata nel browser può essere vecchia o manomessa: si tengono solo codici esistenti
const cleanList = v => Array.isArray(v) ? [...new Set(v.filter(c => typeof c === 'string' && BY_CODE[c]))].slice(0, 400) : [];
const PAGE = 30;
const state = { cat: 'tutti', sub: '', q: '', list: cleanList(store.get('idal-lista', [])), view: [], shown: PAGE, shownFrom: 0 };

function catalog() {
  const grid = $('#catGrid'), chips = $('#catChips'), subs = $('#subChips'), search = $('#catSearch');
  chips.innerHTML = `<button class="chip" type="button" data-c="tutti" aria-pressed="true"><i><img src="assets/img/favicon.svg" alt=""></i>Tutti <em>${PRODOTTI.length}</em></button>` +
    LINEE.map(l => `<button class="chip k-${l.k}${l.dark ? ' is-dark' : ''}" type="button" data-c="${l.k}" aria-pressed="false"><i><img class="${l.dark ? 'inv' : ''}" src="${ico(l.ico)}" alt=""></i>${esc(l.nome)} <em>${count(l.k)}</em></button>`).join('');

  // normalizzazione carattere per carattere: gli indici restano allineati al testo originale
  const normEach = t => [...t].map(ch => norm(ch).charAt(0) || ch).join('');
  const hl = (txt, q) => {
    const t = esc(txt); if (!q) return t;
    const i = normEach(txt).indexOf(q); if (i < 0) return t;
    return esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + q.length)) + '</mark>' + esc(txt.slice(i + q.length));
  };

  const more = $('#catMore'), moreBtn = $('#catMoreBtn');
  const render = (keep = false) => {
    const q = norm(state.q.trim().slice(0, 60));
    const from = keep ? state.shownFrom : 0;
    if (!keep) state.shown = PAGE;
    state.view = PRODOTTI.filter(p =>
      (state.cat === 'tutti' || p.k === state.cat) &&
      (!state.sub || p.s === state.sub) &&
      (!q || norm(`${p.c} ${p.n} ${p.s} ${LINEA[p.k].nome} ${p.f}`).includes(q)));
    $('#catCount').textContent = state.view.length;
    $('#catEmpty').hidden = state.view.length > 0;
    const html = state.view.slice(from, state.shown).map(p => {
      const l = LINEA[p.k], inList = state.list.includes(p.c);
      const pic = p.x
        ? `<span class="card__ph"><img src="${ico(l.ico)}" alt=""></span>`
        : `<img src="${imgS(p.c)}" srcset="${imgS(p.c)} 280w, ${img(p.c)} 420w" sizes="(max-width: 560px) 46vw, 210px" alt="" width="280" height="280" loading="lazy" decoding="async">`;
      return `<article class="card k-${p.k}">
        <button class="card__img" type="button" data-open="${esc(p.c)}" data-cursor="Apri" aria-label="Scheda di ${esc(p.n)}">${pic}</button>
        <p class="code">${hl(p.c, q)}</p>
        <h3>${hl(p.n, q)}</h3>
        ${p.f ? `<span class="card__f">${esc(p.f)}</span>` : ''}
        <div class="card__meta"><span class="tag">${esc(p.s)}</span>
        <button class="add${inList ? ' is-in' : ''}" type="button" data-add="${esc(p.c)}" aria-pressed="${inList}" aria-label="${inList ? 'Togli dalla lista' : 'Aggiungi alla lista'}: ${esc(p.n)}">${inList ? '✓' : '+'}</button></div>
      </article>`;
    }).join('');
    if (keep) grid.insertAdjacentHTML('beforeend', html); else grid.innerHTML = html;
    // entrata a cascata senza stili inline
    [...grid.children].slice(from).forEach((c, j) => c.style.setProperty('--i', Math.min(j, 24)));
    const left = state.view.length - state.shown;
    more.hidden = left <= 0;
    if (left > 0) moreBtn.firstElementChild.textContent = `Mostra altre ${Math.min(left, PAGE)} referenze (${left} in tutto)`;
  };
  moreBtn.addEventListener('click', () => { state.shownFrom = state.shown; state.shown += PAGE; render(true); });

  const renderSubs = () => {
    if (state.cat === 'tutti') { subs.innerHTML = ''; return; }
    const list = [...new Set(PRODOTTI.filter(p => p.k === state.cat).map(p => p.s))];
    subs.innerHTML = `<button class="chip" type="button" data-s="" aria-pressed="${!state.sub}">Tutte</button>` +
      list.map(s => `<button class="chip" type="button" data-s="${esc(s)}" aria-pressed="${state.sub === s}">${esc(s)}</button>`).join('');
  };

  const setCat = (c, sub = '') => {
    state.cat = c; state.sub = sub;
    $$('.chip', chips).forEach(b => b.setAttribute('aria-pressed', b.dataset.c === c));
    renderSubs(); render();
  };
  catalog.setCat = setCat;

  chips.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) setCat(b.dataset.c); });
  subs.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; state.sub = b.dataset.s; renderSubs(); render(); });
  let tmr; search.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { state.q = search.value; render(); }, 120); });
  $('#catReset').addEventListener('click', () => { search.value = ''; state.q = ''; setCat('tutti'); });

  // tilt
  if (FINE && !RM) {
    grid.addEventListener('pointermove', e => {
      const c = e.target.closest('.card'); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `translateY(-6px) perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
    });
    grid.addEventListener('pointerout', e => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
  }

  // link da tessere, linee, menu
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-cat]'); if (!a) return;
    search.value = ''; state.q = '';
    setCat(a.dataset.cat, a.dataset.sub || '');
  });

  render();
}

/* ---------- Scheda prodotto ---------- */
function modal() {
  const dlg = $('#modal'); let idx = -1, list = [];
  const show = code => {
    if (!BY_CODE[code]) return;
    list = state.view.some(p => p.c === code) ? state.view : PRODOTTI;
    idx = list.findIndex(p => p.c === code);
    fill();
    if (!dlg.open) {
      // browser vecchi senza <dialog>: la scheda si apre comunque
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      document.body.classList.add('is-locked');
    }
  };
  const fill = () => {
    const p = list[idx], l = LINEA[p.k];
    dlg.className = 'modal k-' + p.k;
    const im = $('#mImg');
    im.classList.toggle('ph', !!p.x);
    im.src = p.x ? ico(l.ico) : img(p.c);
    im.alt = p.n;
    const line = $('#mLine');
    line.className = 'modal__line' + (l.dark ? ' is-dark' : '');
    line.innerHTML = `<img class="${l.dark ? 'inv' : ''}" src="${ico(l.ico)}" alt="">${esc(l.nome)}`;
    $('#mCode').textContent = p.c;
    $('#mName').textContent = p.n;
    const rows = [['Linea', l.nome], ['Tipologia', p.s], p.f && ['Formato', p.f], p.o && ['Origine', p.o], ['Codice', p.c]].filter(Boolean);
    $('#mData').innerHTML = rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('');
    const inL = state.list.includes(p.c);
    $('#mAdd span').textContent = inL ? 'Nella tua lista ✓' : 'Aggiungi alla lista';
    $('#mAdd').dataset.add = p.c;
  };
  const close = () => {
    if (typeof dlg.close === 'function') dlg.close();
    else { dlg.removeAttribute('open'); document.body.classList.remove('is-locked'); }
  };
  dlg.addEventListener('close', () => document.body.classList.remove('is-locked'));
  $('#mClose').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  $('#mPrev').addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; fill(); });
  $('#mNext').addEventListener('click', () => { idx = (idx + 1) % list.length; fill(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'Escape' && typeof dlg.showModal !== 'function') close();
    if (e.key === 'ArrowLeft') $('#mPrev').click();
    if (e.key === 'ArrowRight') $('#mNext').click();
  });
  document.addEventListener('click', e => {
    const o = e.target instanceof Element && e.target.closest('[data-open]'); if (!o) return;
    e.preventDefault(); show(o.dataset.open);
  });
  modal.refresh = () => { if (dlg.open) fill(); };
}

/* ---------- La mia lista ---------- */
function lista() {
  const fab = $('#listFab'), dr = $('#listDrawer'), ul = $('#listItems');
  const save = () => store.set('idal-lista', state.list);
  const body = () => 'Buongiorno,\nvorrei ricevere informazioni sulle seguenti referenze a marchio IDAL:\n\n' +
    state.list.filter(c => BY_CODE[c]).map(c => { const p = BY_CODE[c]; return `• ${c} — ${p.n}${p.f ? ' (' + p.f + ')' : ''}`; }).join('\n') + '\n\nGrazie.';
  const paint = () => {
    $('#listCount').textContent = state.list.length;
    fab.classList.toggle('is-on', state.list.length > 0 || dr.classList.contains('is-open'));
    ul.innerHTML = state.list.length ? state.list.map(c => {
      const p = BY_CODE[c]; if (!p) return '';
      return `<li class="k-${p.k}"><img class="${p.x ? 'ph' : ''}" src="${p.x ? ico(LINEA[p.k].ico) : imgS(c)}" alt="" width="56" height="56"><div><small>${esc(c)}</small><b>${esc(p.n)}</b></div><button type="button" data-del="${esc(c)}" aria-label="Togli ${esc(p.n)}">×</button></li>`;
    }).join('') : '<li class="is-empty">La lista è vuota. Tocca “+” su una referenza per aggiungerla.</li>';
    $('#listMail').href = 'mailto:idalsrl@idal-srl.it?subject=' + encodeURIComponent('Richiesta informazioni referenze IDAL') + '&body=' + encodeURIComponent(body());
    // sincronizza i bottoni visibili
    $$('[data-add]').forEach(b => {
      const inL = state.list.includes(b.dataset.add);
      if (b.classList.contains('add')) {
        b.classList.toggle('is-in', inL); b.textContent = inL ? '✓' : '+'; b.setAttribute('aria-pressed', inL);
      }
    });
    modal.refresh && modal.refresh();
  };
  const toggleItem = c => {
    if (!BY_CODE[c]) return;
    const i = state.list.indexOf(c);
    if (i >= 0) { state.list.splice(i, 1); toast('Tolto dalla lista'); }
    else { state.list.push(c); toast(`${BY_CODE[c].n} aggiunto alla lista`); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); }
    save(); paint();
  };
  const open = o => {
    dr.hidden = false;
    requestAnimationFrame(() => dr.classList.toggle('is-open', o));
    fab.setAttribute('aria-expanded', o);
    if (!o) setTimeout(() => { if (!dr.classList.contains('is-open')) dr.hidden = true; }, 600);
    else $('#listClose').focus();
    paint();
  };
  document.addEventListener('click', e => {
    if (!(e.target instanceof Element)) return;
    const a = e.target.closest('[data-add]'); if (a) { e.stopPropagation(); toggleItem(a.dataset.add); return; }
    const d = e.target.closest('[data-del]'); if (d) toggleItem(d.dataset.del);
  });
  fab.addEventListener('click', () => open(!dr.classList.contains('is-open')));
  $('#listClose').addEventListener('click', () => open(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && dr.classList.contains('is-open')) open(false); });
  $('#listCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(body()); toast('Elenco copiato'); } catch { toast('Copia non riuscita: usa “Richiedi informazioni”'); }
  });
  $('#listClear').addEventListener('click', () => { state.list = []; save(); paint(); });
  addEventListener('storage', e => { if (e.key === 'idal-lista') { state.list = cleanList(store.get('idal-lista', [])); paint(); } });
  paint();
}

/* =========================================================
   VARIE
   ========================================================= */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-on'), 2200);
}

function reveals() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

function progress() {
  const bar = $('#progress');
  let max = 1;
  const measure = () => { max = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  addEventListener('resize', measure);
  onScroll(y => { bar.style.transform = `scaleX(${clamp(y / max, 0, 1)})`; });
}

/* Le animazioni continue (CSS) si fermano nelle sezioni fuori schermo */
function pauseSections() {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '100px 0px' });
  $$('main > section, .foot').forEach(s => io.observe(s));
}

function cursor() {
  if (!FINE || RM) return;
  const c = $('#cursor'), dot = c.firstElementChild;
  let x = -100, y = -100, cx = x, cy = y;
  let raf = 0;
  c.style.transform = 'translate3d(-100px,-100px,0)';
  // il pallino si muove solo mentre si muove il mouse
  const loop = () => {
    cx += (x - cx) * .2; cy += (y - cy) * .2;
    c.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > .3 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  document.addEventListener('pointerover', e => {
    if (!(e.target instanceof Element)) return;
    const t = e.target.closest('[data-cursor]');
    c.classList.toggle('is-big', !!t); dot.textContent = t ? t.dataset.cursor : '';
    c.classList.toggle('is-hide', !t && !!e.target.closest('a,button,input,textarea,label'));
  });
}

function magnetic() {
  if (!FINE || RM) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

function contact() {
  const f = $('#contactForm');
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.field', f).forEach(l => {
      const i = l.querySelector('input,textarea');
      const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
      l.classList.toggle('is-err', bad); if (bad && ok) { i.focus(); ok = false; }
    });
    if (!ok) { toast('Compila tutti i campi, per favore'); return; }
    const d = new FormData(f);
    const sub = `[${d.get('chi')}] Messaggio dal sito di ${d.get('nome')}`;
    const body = `${d.get('msg')}\n\n— ${d.get('nome')} (${d.get('email')})\n${d.get('chi')}`;
    location.href = `mailto:idalsrl@idal-srl.it?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    toast('Si apre la tua posta. Grazie!');
  });
  $('#gmapLoad').addEventListener('click', () => {
    // la mappa di Google si carica solo se richiesta, in un iframe isolato
    const f = document.createElement('iframe');
    f.title = 'Mappa: IDAL, Via Antonio Abete 40, Benevento';
    f.loading = 'lazy';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    f.src = 'https://www.google.com/maps?q=Via+Antonio+Abete+40,+82100+Benevento&output=embed';
    $('#gmap').replaceChildren(f);
  });
  $('#year').textContent = new Date().getFullYear();
}

/* ---------- Pioggia di prodotti (easter egg) ---------- */
function rain() {
  const cv = $('#rain'), ctx = cv.getContext('2d');
  let bodies = [], running = false, t0 = 0;
  const go = () => {
    if (RM) { toast('Ti avevamo detto di non premerlo 😄'); return; }
    if (running) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pool = PRODOTTI.filter(p => !p.x).sort(() => Math.random() - .5).slice(0, innerWidth < 700 ? 26 : 48);
    bodies = pool.map((p, i) => {
      const im = new Image(); im.src = img(p.c);
      const s = 60 + Math.random() * 60;
      return { im, s, x: Math.random() * innerWidth, y: -s - i * 40 - Math.random() * 200, vx: (Math.random() - .5) * 4, vy: Math.random() * 2, r: Math.random() * 6, vr: (Math.random() - .5) * .2 };
    });
    cv.classList.add('is-on'); running = true; t0 = performance.now();
    toast('Ti avevamo detto di non premerlo. Ora raccogli tutto!');
    requestAnimationFrame(step);
  };
  const step = t => {
    const el = (t - t0) / 1000, H = innerHeight, W = innerWidth;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = el > 6 ? Math.max(0, 1 - (el - 6) / 1.2) : 1;
    for (const b of bodies) {
      b.vy += .45; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (b.y + b.s / 2 > H) { b.y = H - b.s / 2; b.vy *= -.55; b.vx *= .9; b.vr *= .8; }
      if (b.x < b.s / 2 || b.x > W - b.s / 2) { b.vx *= -.8; b.x = clamp(b.x, b.s / 2, W - b.s / 2); }
      if (!b.im.complete || !b.im.naturalWidth) continue;
      const k = b.s / Math.max(b.im.naturalWidth, b.im.naturalHeight);
      const w = b.im.naturalWidth * k, h = b.im.naturalHeight * k;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.shadowColor = 'rgba(14,28,43,.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 12) : ctx.rect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.drawImage(b.im, -w / 2, -h / 2, w, h); ctx.restore();
    }
    if (el < 7.3) requestAnimationFrame(step);
    else { running = false; cv.classList.remove('is-on'); ctx.clearRect(0, 0, W, H); }
  };
  $('#dontPress').addEventListener('click', go);
  // scrivi "idal" sulla tastiera
  let buf = '';
  addEventListener('keydown', e => {
    if (typeof e.key !== 'string' || e.key.length !== 1) return;
    if (e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]')) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf === 'idal') go();
  });
  // oppure 5 clic sul logo
  let n = 0, tm;
  $('#logoBtn').addEventListener('click', () => { n++; clearTimeout(tm); tm = setTimeout(() => n = 0, 1200); if (n >= 5) { n = 0; go(); } });
}

/* =========================================================
   AVVIO
   ========================================================= */
// ogni parte parte da sola: se una si rompe, le altre funzionano lo stesso
const safe = fn => { try { fn(); } catch (e) { console.error('[IDAL]', fn.name, e); } };
try { loader(); } catch (e) { document.body.classList.remove('is-loading'); console.error('[IDAL] loader', e); }
[nav, keys, belt, hero, minimap, storyMap, numbers, philo, lines, catalog, modal, lista,
 reveals, progress, pauseSections, cursor, magnetic, contact, rain].forEach(safe);
})();
