import { T, S, SPRITES, spriteCanvas, drawMap, drawBubble, drawSelection } from './sprites.js';
import { MAP, ROOMS, LAYOUT, defaultObjects, fmtDate } from './house.js';
import { weather, refreshWeather, currentEnv } from './env.js';
import { createIso } from './iso.js';
import { getCode, setCode, takeCodeFromUrl, pull, push } from './sync.js';

const KEY = `casa-pixel:v${LAYOUT}`;
const W = MAP[0].length * T, H = MAP.length * T; // logical ("art") size; drawn at S real pixels per unit

const $ = id => document.getElementById(id);
const canvas = $('house'), ctx = canvas.getContext('2d');

const bg = document.createElement('canvas');
bg.width = W * S; bg.height = H * S;
const bgc = bg.getContext('2d');
bgc.scale(S, S);
const outdoor = drawMap(bgc, MAP); // tiles open to the sky (balcony + outside)
const iso = createIso($('house3d'), bg); // the experimental 2.5D view of the same data

// ---------- state ----------
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length) return saved.filter(o => SPRITES[o.type]);
  } catch { /* storage unavailable or corrupt: fall back to the default house */ }
  return defaultObjects();
}
function saveLocal() {
  try { localStorage.setItem(KEY, JSON.stringify(objects)); } catch { /* ignore */ }
}
function save() { saveLocal(); queuePush(); }

let objects = load();
let sel = { obj: null, plant: null }; // selected object, and (optionally) one plant inside it
let editMode = false;
const override = { time: 'auto', sky: 'auto' };
const view = { z: 1, ox: 0, oy: 0 }; // zoom and the logical point at the top-left corner
let k = 1;                           // backing-store pixels per logical unit at zoom 1

// ---------- plants ----------
const today = () => fmtDate(new Date());
const utc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const daysSince = s => Math.round((utc(today()) - utc(s)) / 864e5);
const remaining = p => p.intervalDays - daysSince(p.lastWatered);
const statusText = p => {
  const n = remaining(p);
  if (n < 0) return `Atrasada ${-n} d`;
  if (n === 0) return 'Regar hoje';
  return `Daqui a ${n} d`;
};
const prettyDate = s => new Date(utc(s)).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const isGroup = o => Array.isArray(o.plants);
const plantsOf = o => (isGroup(o) ? o.plants : o.plant ? [o.plant] : []);
const keyOf = (o, p) => p.id || o.id;
const thirstyIn = o => plantsOf(o).filter(p => remaining(p) <= 0).length;
const entries = () => objects.flatMap(o => plantsOf(o).map(p => ({ o, p, key: keyOf(o, p) })))
  .sort((a, b) => remaining(a.p) - remaining(b.p));
const water = p => { p.lastWatered = today(); if (p.history[0] !== today()) p.history.unshift(today()); };
const newPlant = (name, species, interval) => ({
  name, species, intervalDays: Math.max(1, Math.round(Number(interval)) || 7), lastWatered: today(), history: [today()],
});

function roomOf(o) {
  const s = SPRITES[o.type];
  const cx = o.x + s.w / T / 2, cy = o.y + s.h / T - 0.25;
  // things hung on a back wall belong to the room below it (the wall is two tiles tall)
  const room = [0, 1, 2].map(dy => ROOMS.find(r => cx >= r.x && cx < r.x + r.w && cy + dy >= r.y && cy + dy < r.y + r.h)).find(Boolean);
  return room ? room.name : 'Fora de casa';
}

// ---------- drawing ----------
// ---------- the cat ----------
// She sleeps on her bed (the `cat` object's saved position), then wanders: walks to a random reachable floor
// tile, sits for a while, and after a few stops goes back to bed. None of this is saved or synced.
const FLOOR = 'pSgvtwk';
const cat = { mode: 'sleep', x: 0, y: 0, path: [], until: 8000, dir: 1, stops: 0, last: 0 }; // x / y: her feet, in tiles
const awake = o => o.type === 'cat' && cat.mode !== 'sleep';
window.casaCat = cat; // handy in the console: casaCat.until = 0 wakes her up
const rnd = (a, b) => a + Math.random() * (b - a);

function freeTiles() { // floor tiles not under a piece of furniture
  const free = MAP.map(row => [...row].map(ch => FLOOR.includes(ch)));
  for (const o of objects) {
    const s = SPRITES[o.type];
    if (s.flat || s.wall || s.top || o.type === 'cat') continue;
    const bottom = o.y + s.h / T, top = Math.max(o.y, bottom - 1); // only its base blocks the way
    for (let y = Math.floor(top + .3); y <= Math.floor(bottom - .2); y++) {
      for (let x = Math.floor(o.x + .2); x <= Math.floor(o.x + s.w / T - .2); x++) if (free[y]?.[x]) free[y][x] = false;
    }
  }
  return free;
}
// Breadth-first search from (sx, sy); returns the tiles it can reach, each with the tile it was reached from.
function reach(free, sx, sy) {
  const from = new Map([[`${sx},${sy}`, null]]), queue = [[sx, sy]];
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (free[ny]?.[nx] && !from.has(`${nx},${ny}`)) { from.set(`${nx},${ny}`, [x, y]); queue.push([nx, ny]); }
    }
  }
  return { from, tiles: queue };
}
const feet = ([x, y]) => [x + .5, y + .75];
function planWalk(home) {
  const bed = objects.find(o => o.type === 'cat');
  if (!bed) return false;
  const free = freeTiles();
  const bx = bed.x + .4, by = bed.y + .6;
  // where she is now: her own tile, or the free tile nearest to the bed when she is just getting up
  let sx = Math.floor(cat.x), sy = Math.floor(cat.y);
  let doorstep = null, best = 1e9;
  for (let y = 0; y < free.length; y++) for (let x = 0; x < free[y].length; x++) {
    const d = Math.hypot(x + .5 - bx, y + .5 - by);
    if (free[y][x] && d < best) { best = d; doorstep = [x, y]; }
  }
  if (!doorstep) return false;
  if (cat.mode === 'sleep' || !free[sy]?.[sx]) { [sx, sy] = doorstep; if (cat.mode === 'sleep') { cat.x = bx; cat.y = by; } }
  const { from, tiles } = reach(free, sx, sy);
  const goal = home ? doorstep : tiles[Math.floor(Math.random() * tiles.length)];
  if (!from.has(`${goal[0]},${goal[1]}`)) return false;
  const path = [];
  for (let p = goal; p; p = from.get(`${p[0]},${p[1]}`)) path.unshift(feet(p));
  if (home) path.push([bx, by]);
  cat.path = path; cat.mode = home ? 'home' : 'walk';
  return true;
}
function updateCat(t) {
  const dt = Math.min(100, t - cat.last) / 1000; cat.last = t;
  if (editMode) return;
  if (cat.mode === 'sleep' || cat.mode === 'sit') {
    if (t < cat.until) return;
    const home = cat.mode === 'sit' && cat.stops >= 3;
    if (!planWalk(home)) cat.until = t + 5000;
    return;
  }
  let step = 1.7 * dt; // tiles per second
  while (step > 0 && cat.path.length) {
    const [tx, ty] = cat.path[0], d = Math.hypot(tx - cat.x, ty - cat.y);
    if (Math.abs(tx - cat.x) > .01) cat.dir = tx > cat.x ? 1 : -1;
    if (d > .01) cat.face = (tx - cat.x) - (ty - cat.y) >= 0 ? 1 : -1; // which way she faces in the 2.5D view
    if (d <= step) { cat.x = tx; cat.y = ty; cat.path.shift(); step -= d; }
    else { cat.x += (tx - cat.x) / d * step; cat.y += (ty - cat.y) / d * step; step = 0; }
  }
  if (cat.path.length) return;
  if (cat.mode === 'home') { cat.mode = 'sleep'; cat.stops = 0; cat.until = t + rnd(30000, 70000); }
  else { cat.mode = 'sit'; cat.stops++; cat.until = t + rnd(4000, 12000); }
}

// ---------- drawing ----------
const layer = o => (SPRITES[o.type].flat ? 0 : (o.type === 'cat' && !awake(o)) || SPRITES[o.type].top ? 2 : 1); // `top`: sits on other furniture
const base = o => (awake(o) ? cat.y * T : o.y * T + SPRITES[o.type].h);
const drawOrder = () => [...objects].sort((a, b) => layer(a) - layer(b) || base(a) - base(b));

const hash = n => (n * 73 + 17) % 97;
const idPhase = id => [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);

function render(t = performance.now()) {
  const e = currentEnv(override);
  const dark = 1 - e.day;
  const sun = e.day * (1 - 0.75 * e.cloud);
  const wet = e.kind === 'rain' || e.kind === 'storm';
  const fireLit = e.temp != null ? (e.temp < 16 || e.day < 0.3) : e.day < 0.3;
  const lampsOn = e.day < 0.6;
  const bob = Math.floor(t / 600) % 2;
  const order = drawOrder();
  const pos = o => [o.x * T, o.y * T];

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#15111b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const sc = k * view.z;
  ctx.setTransform(sc, 0, 0, sc, -Math.round(view.ox * sc), -Math.round(view.oy * sc));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bg, 0, 0, W, H);

  // light falling in from the windows: sun by day, a little moonlight on clear nights
  for (const o of order) {
    const s = SPRITES[o.type];
    if (!s.light) continue;
    const [x, y] = pos(o);
    const moon = e.kind === 'clear' ? 0.05 * dark : 0;
    const a = 0.16 * sun + moon;
    if (a < 0.01) continue;
    const rects = s.light === 'left'
      ? [[x - 52, y + 2, 52, s.h - 4], [x - 30, y + 6, 30, s.h - 12]]
      : [[x + 1, y + s.h, s.w - 2, 34], [x + 4, y + s.h, s.w - 8, 22]];
    ctx.fillStyle = `rgba(${sun > moon ? '255,238,190' : '170,190,255'},${a * 0.6})`;
    for (const rc of rects) ctx.fillRect(...rc);
  }

  // furniture, plants, cat
  for (const o of order) {
    if (awake(o)) { // the cat, out of bed
      const type = cat.mode === 'sit' ? 'cat_sit' : 'cat_walk', cs = SPRITES[type];
      const cv = spriteCanvas(type, false, Math.floor(t / (cat.mode === 'sit' ? 900 : 140)) % 2);
      const cx = Math.round(cat.x * T * 2) / 2, cy = Math.round(cat.y * T * 2) / 2;
      ctx.fillStyle = 'rgba(20,10,30,.28)';
      ctx.fillRect(cx - cs.w / 2 + 1, cy - 1.5, cs.w - 2, 2.5);
      ctx.save(); ctx.translate(cx, cy - cs.h); ctx.scale(cat.dir, 1);
      ctx.drawImage(cv, -cs.w / 2, 0, cs.w, cs.h);
      ctx.restore();
      continue;
    }
    const s = SPRITES[o.type], [x, y] = pos(o);
    const count = plantsOf(o).length;
    const dry = count > 0 && thirstyIn(o) * 2 >= count;
    if (!s.flat && !s.wall && o.type !== 'cat') { // contact shadow
      ctx.fillStyle = 'rgba(20,10,30,.30)';
      ctx.fillRect(x + 1, y + s.h - 2, s.w - 2, 3.5);
    }
    let frame = 0;
    if (o.type === 'fireplace') frame = fireLit ? Math.floor(t / 300) % 2 : 2;
    else if (s.frames) frame = Math.floor(t / 1300) % s.frames;
    const cv = spriteCanvas(o.type, dry, frame);

    if ((s.plant || s.group) && !s.still) { // leaves sway by half a pixel, the pot stays put
      const windy = roomOf(o) === 'Varanda' && e.wind > 15;
      const sw = Math.sin(t / (windy ? 260 : 1100) + idPhase(o.id));
      const dx = Math.round(sw * (windy ? 2 : 1.4)) / 2, top = s.h - 8;
      ctx.drawImage(cv, 0, 0, s.w * S, top * S, x + dx, y, s.w, top);
      ctx.drawImage(cv, 0, top * S, s.w * S, 8 * S, x, y + top, s.w, 8);
    } else {
      ctx.drawImage(cv, x, y, s.w, s.h);
    }

    if (s.glass) { // what you see through the window
      const [gx, gy, gw, gh] = s.glass;
      const tint = (c, a) => { if (a > 0.01) { ctx.fillStyle = `rgba(${c},${a})`; ctx.fillRect(x + gx, y + gy, gw, gh); } };
      tint('165,170,180', 0.55 * e.cloud * e.day);
      tint('245,150,80', 0.5 * e.golden);
      tint('14,18,58', 0.88 * dark);
      if (wet) {
        ctx.fillStyle = 'rgba(225,238,255,.85)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + gx + (i * 1.5 + .5) % gw, y + gy + ((t / 45 + i * 11) % (gh - 2)), .5, 2);
        }
      }
    }
  }

  // weather on the balcony and outside
  if (wet || e.kind === 'snow' || e.kind === 'fog') {
    for (const [tx, ty] of outdoor) {
      const x = tx * T, y = ty * T;
      if (e.kind === 'fog') { ctx.fillStyle = 'rgba(205,210,220,.13)'; ctx.fillRect(x, y, T, T); continue; }
      const n = e.intensity > 0.7 ? 4 : 3;
      for (let i = 0; i < n; i++) {
        const h = hash(tx * 7 + ty * 13 + i * 31);
        if (wet) {
          // keep the step per frame well under the 16px wrap, or the eye reads it as rising
          ctx.fillStyle = 'rgba(170,200,255,.6)';
          ctx.fillRect(x + h % 16, y + ((h * 5 + t * 0.07 * (1 + i * 0.2)) % 16), .5, 3);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.85)';
          ctx.fillRect(x + (h + Math.sin(t / 700 + h) * 2) % 16, y + ((h * 5 + t * 0.02) % 16), 1, 1);
        }
      }
    }
  }

  // time of day and overcast, over the whole scene
  const wash = (c, a) => { if (a > 0.005) { ctx.fillStyle = `rgba(${c},${a})`; ctx.fillRect(0, 0, W, H); } };
  wash('40,45,60', 0.14 * e.cloud * e.day);
  wash('255,140,60', 0.10 * e.golden);
  wash('10,14,52', 0.52 * dark);

  // warm light from lamps (only when it is getting dark) and the fireplace (when lit)
  ctx.globalCompositeOperation = 'lighter';
  for (const o of order) {
    const s = SPRITES[o.type];
    if (!s.glow) continue;
    const fire = s.glow === 'fire';
    if (fire ? !fireLit : !lampsOn) continue;
    const [x, y] = pos(o), flick = fire ? Math.floor(t / 300) % 2 : 0;
    const kk = fire ? 0.7 + 0.3 * dark : 0.45 + 0.55 * dark;
    const cx = x + s.w / 2, cy = y + (fire ? s.h + 2 : 5);
    for (const [rad, a] of [[34, 0.05], [22, 0.07], [12, 0.10]]) {
      ctx.fillStyle = `rgba(${fire ? '255,140,60' : '255,205,125'},${a * kk})`;
      ctx.beginPath(); ctx.arc(cx, cy, rad + flick * 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // lightning
  if (e.kind === 'storm' && hash(Math.floor(t / 1000)) % 9 === 0 && t % 1000 < 130) wash('255,255,255', 0.22);

  // interface markers stay readable whatever the light
  for (const o of order) {
    const s = SPRITES[o.type], [x, y] = pos(o), n = thirstyIn(o);
    if (n) {
      const bx = x + Math.round(s.w / 2) - 5, by = y - 13 - bob;
      drawBubble(ctx, bx, by);
      if (isGroup(o)) { // how many in the group are thirsty
        ctx.fillStyle = '#2a2030'; ctx.fillRect(bx + 7, by - 3, 7, 7);
        ctx.fillStyle = '#e0665e'; ctx.fillRect(bx + 7.5, by - 2.5, 6, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 5px ui-monospace, Menlo, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(n), bx + 10.5, by + 0.8);
      }
    }
    if (o.id === sel.obj) drawSelection(ctx, x, y, s.w, s.h);
  }
  iso.render({ t, env: e, objects, sel, cat, thirstyIn, plantsOf, bob });
}

// ---------- view: size, zoom, pan ----------
function fit() {
  const cssW = canvas.parentElement.clientWidth, cssH = Math.round(cssW * H / W);
  canvas.style.height = `${cssH}px`;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
  k = canvas.width / W;
  iso.fit();
  render();
}

function clampView() {
  view.z = Math.min(8, Math.max(1, view.z));
  view.ox = Math.min(W - W / view.z, Math.max(0, view.ox));
  view.oy = Math.min(H - H / view.z, Math.max(0, view.oy));
  // at 1× let the page scroll under the finger; once zoomed (or editing) the canvas takes every gesture
  canvas.style.touchAction = view.z > 1 || editMode ? 'none' : 'pan-y';
  $('z-level').textContent = `${Math.round(view.z * 100)}%`;
}

// Zoom by `factor`, keeping the point at canvas fraction (fx, fy) where it is.
function zoomAt(fx, fy, factor) {
  const lx = view.ox + fx * W / view.z, ly = view.oy + fy * H / view.z;
  view.z = Math.min(8, Math.max(1, view.z * factor));
  view.ox = lx - fx * W / view.z; view.oy = ly - fy * H / view.z;
  clampView(); render();
}

const frac = e => {
  const b = canvas.getBoundingClientRect();
  return { fx: (e.clientX - b.left) / b.width, fy: (e.clientY - b.top) / b.height, b };
};
const toLogical = ({ fx, fy }) => ({ x: view.ox + fx * W / view.z, y: view.oy + fy * H / view.z });

function hit(p, any) {
  return drawOrder().reverse().find(o => {
    if (!any && !plantsOf(o).length && !isGroup(o)) return false;
    const s = SPRITES[o.type], x = o.x * T, y = o.y * T;
    return p.x >= x - 2 && p.x < x + s.w + 2 && p.y >= y - 2 && p.y < y + s.h + 2;
  });
}

function select(o) {
  if (!o) sel = { obj: null, plant: null };
  else if (isGroup(o)) sel = { obj: o.id, plant: null };
  else if (o.plant) sel = { obj: o.id, plant: keyOf(o, o.plant) };
  else if (!editMode) sel = { obj: null, plant: null };
}

const pointers = new Map(); // pointerId -> last event
let gesture = null;         // { type: 'tap' | 'drag' | 'pinch', ... }

canvas.addEventListener('pointerdown', e => {
  pointers.set(e.pointerId, e);
  canvas.setPointerCapture(e.pointerId);
  if (pointers.size === 2) { // pinch: remember the logical point under the midpoint
    const [a, b] = [...pointers.values()];
    const mid = frac({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 });
    gesture = { type: 'pinch', dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: view.z, anchor: toLogical(mid) };
    return;
  }
  if (pointers.size > 2) return;
  const f = frac(e), p = toLogical(f);
  const o = editMode ? hit(p, true) : null;
  if (o) {
    select(o);
    gesture = { type: 'drag', o, dx: p.x - o.x * T, dy: p.y - o.y * T };
    refresh();
  } else {
    gesture = { type: 'tap', sx: e.clientX, sy: e.clientY, ox: view.ox, oy: view.oy, moved: false };
  }
});

canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, e);
  if (!gesture) return;
  if (gesture.type === 'pinch' && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const mid = frac({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 });
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    view.z = Math.min(8, Math.max(1, gesture.z * dist / gesture.dist));
    view.ox = gesture.anchor.x - mid.fx * W / view.z;
    view.oy = gesture.anchor.y - mid.fy * H / view.z;
    clampView(); render();
  } else if (gesture.type === 'drag') {
    const p = toLogical(frac(e)), s = SPRITES[gesture.o.type];
    const snap = v => Math.round(v / (T / 2)) / 2;
    gesture.o.x = Math.min(W / T - s.w / T, Math.max(0, snap(p.x - gesture.dx)));
    gesture.o.y = Math.min(H / T - s.h / T, Math.max(0, snap(p.y - gesture.dy)));
    render();
  } else if (gesture.type === 'tap') {
    const dx = e.clientX - gesture.sx, dy = e.clientY - gesture.sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) gesture.moved = true;
    if (gesture.moved && view.z > 1) { // drag the view around
      const b = canvas.getBoundingClientRect();
      view.ox = gesture.ox - dx / b.width * W / view.z;
      view.oy = gesture.oy - dy / b.height * H / view.z;
      clampView(); render();
    }
  }
});

function pointerEnd(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);
  const g = gesture;
  if (!g) return;
  if (g.type === 'pinch') { if (pointers.size < 2) gesture = null; return; }
  gesture = null;
  if (g.type === 'drag') { save(); refresh(); }
  else if (g.type === 'tap' && !g.moved && e.type === 'pointerup') {
    select(hit(toLogical(frac(e)), false));
    refresh();
  }
}
canvas.addEventListener('pointerup', pointerEnd);
canvas.addEventListener('pointercancel', pointerEnd);

canvas.addEventListener('wheel', e => {
  if (view.z === 1 && e.deltaY > 0) return; // nothing left to zoom out: let the page scroll
  e.preventDefault();
  const f = frac(e);
  zoomAt(f.fx, f.fy, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0018)));
}, { passive: false });

$('z-in').addEventListener('click', () => zoomAt(0.5, 0.5, 1.5));
$('z-out').addEventListener('click', () => zoomAt(0.5, 0.5, 1 / 1.5));
$('z-reset').addEventListener('click', () => { view.z = 1; clampView(); render(); });

// ---------- 2.5D view: tap to select, and drag furniture in "Mover objetos" (same data as the top-down view) ----------
{
  const c3 = $('house3d');
  let drag = null;
  c3.addEventListener('pointerdown', ev => {
    const o = iso.pick(ev, editMode, plantsOf);
    if (editMode && o) {
      const [fx, fy] = iso.floorAt(ev);
      drag = { o, dx: fx - o.x, dy: fy - o.y, moved: false };
      c3.setPointerCapture(ev.pointerId); select(o); refresh();
    } else { select(o); refresh(); }
  });
  c3.addEventListener('pointermove', ev => {
    if (!drag) return;
    const [fx, fy] = iso.floorAt(ev);
    drag.o.x = Math.round((fx - drag.dx) * T) / T; drag.o.y = Math.round((fy - drag.dy) * T) / T;
    drag.moved = true; render();
  });
  const end = () => { if (drag?.moved) { save(); refresh(); } drag = null; };
  c3.addEventListener('pointerup', end); c3.addEventListener('pointercancel', end);
}

// ---------- side panel ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const chip = p => { const n = remaining(p); return `<span class="chip ${n < 0 ? 'late' : n === 0 ? 'due' : 'ok'}">${statusText(p)}</span>`; };
const typeOptions = (flag, current) => Object.entries(SPRITES).filter(([, s]) => s[flag])
  .map(([key, s]) => `<option value="${key}" ${key === current ? 'selected' : ''}>${s.label}</option>`).join('');

function renderList() {
  const list = entries();
  const thirsty = list.filter(x => remaining(x.p) <= 0).length;
  $('summary').textContent = !list.length ? 'Ainda não há plantas.'
    : thirsty ? `${thirsty} ${thirsty === 1 ? 'planta precisa' : 'plantas precisam'} de água`
    : 'Todas as plantas estão regadas';
  $('summary').classList.toggle('alert', thirsty > 0);
  $('plants').innerHTML = list.map(({ o, p, key }) => `<li>
    <button type="button" data-obj="${esc(o.id)}" data-key="${esc(key)}" class="${key === sel.plant ? 'sel' : ''}">
      <span class="name">${esc(p.name)}</span>
      <span class="room">${esc(roomOf(o))}${isGroup(o) ? ` · ${esc(o.name)}` : ''}</span>
      ${chip(p)}
    </button></li>`).join('');
}

function renderDetail() {
  const o = objects.find(x => x.id === sel.obj);
  const p = o && sel.plant ? plantsOf(o).find(q => keyOf(o, q) === sel.plant) : null;
  if (!o || (!p && !isGroup(o))) {
    $('detail').innerHTML = '<p class="muted">Escolhe uma planta ou um grupo na casa, ou uma planta na lista.</p>';
    return;
  }
  if (p) {
    $('detail').innerHTML = `
      ${isGroup(o) ? `<button type="button" data-act="back">← ${esc(o.name)}</button>` : ''}
      <h3>${esc(p.name)}</h3>
      <button type="button" class="primary" data-act="water">Reguei hoje</button>
      <label>Nome <input data-f="name" value="${esc(p.name)}"></label>
      <label>Espécie <input data-f="species" value="${esc(p.species)}"></label>
      ${isGroup(o) ? '' : `<label>Desenho <select data-f="type">${typeOptions('plant', o.type)}</select></label>`}
      <label>Regar a cada (dias) <input data-f="intervalDays" type="number" min="1" max="365" value="${p.intervalDays}"></label>
      <label>Última rega <input data-f="lastWatered" type="date" max="${today()}" value="${p.lastWatered}"></label>
      <p class="muted">Regas anteriores: ${p.history.length ? p.history.slice(0, 6).map(prettyDate).join(' · ') : 'nenhuma'}</p>
      <button type="button" class="danger" data-act="delete">Remover planta</button>`;
    return;
  }
  const n = thirstyIn(o);
  $('detail').innerHTML = `
    <h3>${esc(o.name)}</h3>
    <p class="muted">${esc(roomOf(o))} · ${o.plants.length} ${o.plants.length === 1 ? 'planta' : 'plantas'}</p>
    ${n ? `<button type="button" class="primary" data-act="water-thirsty">Reguei as ${n} com sede</button>` : ''}
    ${o.plants.length ? '<button type="button" data-act="water-all">Reguei todas</button>' : ''}
    <ul class="members">${[...o.plants].sort((a, b) => remaining(a) - remaining(b)).map(q => `<li>
      <button type="button" data-key="${esc(keyOf(o, q))}"><span class="name">${esc(q.name)}</span>${chip(q)}</button></li>`).join('')}</ul>
    <button type="button" data-act="add-member">+ Planta neste grupo</button>
    <label>Nome do grupo <input data-f="groupName" value="${esc(o.name)}"></label>
    <label>Desenho <select data-f="type">${typeOptions('group', o.type)}</select></label>
    <button type="button" class="danger" data-act="delete-group">Remover grupo</button>`;
}

function refresh() { render(); renderList(); renderDetail(); }

$('plants').addEventListener('click', e => {
  const b = e.target.closest('button[data-key]');
  if (!b) return;
  sel = { obj: b.dataset.obj, plant: b.dataset.key };
  refresh();
});

$('detail').addEventListener('change', e => {
  const f = e.target.dataset.f, o = objects.find(x => x.id === sel.obj);
  if (!f || !o) return;
  const v = e.target.value, p = sel.plant ? plantsOf(o).find(q => keyOf(o, q) === sel.plant) : null;
  if (f === 'type') o.type = v;
  else if (f === 'groupName') o.name = v.trim() || o.name;
  else if (!p) return;
  else if (f === 'intervalDays') p.intervalDays = Math.max(1, Math.round(Number(v)) || 1);
  else if (f === 'lastWatered') { if (v && v <= today()) p.lastWatered = v; }
  else p[f] = v.trim() || p[f];
  save(); refresh();
});

$('detail').addEventListener('click', e => {
  const b = e.target.closest('button');
  const o = objects.find(x => x.id === sel.obj);
  if (!b || !o) return;
  if (b.dataset.key) { sel = { obj: o.id, plant: b.dataset.key }; refresh(); return; }
  const act = b.dataset.act, p = sel.plant ? plantsOf(o).find(q => keyOf(o, q) === sel.plant) : null;
  if (act === 'back') sel = { obj: o.id, plant: null };
  else if (act === 'water' && p) water(p);
  else if (act === 'water-all') o.plants.forEach(water);
  else if (act === 'water-thirsty') o.plants.filter(q => remaining(q) <= 0).forEach(water);
  else if (act === 'add-member') { openDialog({ kind: 'member', group: o.id }); return; }
  else if (act === 'delete' && p) {
    if (!confirm(`Remover "${p.name}"?`)) return;
    if (isGroup(o)) { o.plants = o.plants.filter(q => q !== p); sel = { obj: o.id, plant: null }; }
    else { objects = objects.filter(x => x !== o); sel = { obj: null, plant: null }; }
  } else if (act === 'delete-group') {
    if (!confirm(`Remover o grupo "${o.name}" e as ${o.plants.length} plantas que lá estão?`)) return;
    objects = objects.filter(x => x !== o); sel = { obj: null, plant: null };
  } else return;
  save(); refresh();
});

// ---------- header actions ----------
function setEdit(on) {
  editMode = on;
  $('edit').setAttribute('aria-pressed', String(on));
  $('edit').textContent = on ? 'Concluir' : 'Mover objetos';
  canvas.classList.toggle('editing', on);
  $('hint').textContent = on
    ? 'Arrasta móveis e plantas para os mudar de sítio.'
    : 'Toca numa planta ou num grupo para ver e registar regas. Roda do rato ou dois dedos para aproximar.';
  clampView();
}
$('edit').addEventListener('click', () => setEdit(!editMode));

const dlg = $('dlg');
let dlgMode = { kind: 'single' };
function openDialog(mode) {
  dlgMode = mode;
  const g = mode.kind === 'group', m = mode.kind === 'member';
  $('dlg-title').textContent = g ? 'Novo grupo de plantas' : m ? 'Nova planta no grupo' : 'Nova planta';
  dlg.querySelector('form').reset();
  $('new-type').innerHTML = typeOptions(g ? 'group' : 'plant');
  $('l-species').hidden = g; $('l-interval').hidden = g; $('l-type').hidden = m;
  dlg.showModal();
}
$('add').addEventListener('click', () => openDialog({ kind: 'single' }));
$('add-group').addEventListener('click', () => openDialog({ kind: 'group' }));
$('cancel').addEventListener('click', () => dlg.close());
dlg.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('new-name').value.trim();
  if (!name) return;
  const id = `n${Date.now()}`;
  if (dlgMode.kind === 'member') {
    const g = objects.find(x => x.id === dlgMode.group);
    if (!g) return;
    g.plants.push({ id, ...newPlant(name, $('new-species').value.trim(), $('new-interval').value) });
    sel = { obj: g.id, plant: id };
  } else {
    // drop it in the middle of what is on screen
    const s = SPRITES[$('new-type').value];
    const o = {
      id, type: $('new-type').value,
      x: Math.round((view.ox + W / view.z / 2 - s.w / 2) / T * 2) / 2,
      y: Math.round((view.oy + H / view.z / 2 - s.h / 2) / T * 2) / 2,
    };
    if (dlgMode.kind === 'group') { o.name = name; o.plants = []; }
    else o.plant = newPlant(name, $('new-species').value.trim(), $('new-interval').value);
    objects.push(o);
    select(o);
    setEdit(true);
  }
  dlg.close();
  save(); refresh();
});

// ---------- weather + time of day ----------
function showWeather() {
  $('weather').textContent = weather.ok ? `${weather.place} · ${weather.temp}° · ${weather.label}` : weather.label;
}
async function updateWeather() { await refreshWeather(); showWeather(); render(); }
for (const [id, key] of [['ov-time', 'time'], ['ov-sky', 'sky']]) {
  $(id).addEventListener('change', e => { override[key] = e.target.value; render(); });
}

// ---------- cloud sync ----------
// The server copy wins on load and whenever it changes (e.g. Siri registered a watering);
// local edits are pushed a moment after they happen. Without a house code the page stays local-only.
const cloud = { code: getCode(), at: 0, dirty: false, timer: 0, busy: false };

function showCloud(text, state = '') {
  const b = $('sync');
  b.textContent = text; b.dataset.state = state;
}
function queuePush() {
  if (!cloud.code) return;
  cloud.dirty = true;
  clearTimeout(cloud.timer);
  cloud.timer = setTimeout(pushNow, 800);
}
async function pushNow() {
  if (!cloud.code || cloud.busy) return;
  cloud.busy = true; cloud.dirty = false;
  try {
    // `room` is stored so that Siri can water "a sala" without knowing the map
    const at = await push(cloud.code, [...objects.map(o => ({ ...o, room: roomOf(o) })), { id: '_meta', type: '_meta', layout: LAYOUT }]);
    if (at) { cloud.at = at; showCloud('Nuvem: ligada', 'ok'); } else showCloud('Nuvem: código inválido', 'err');
  } catch { cloud.dirty = true; showCloud('Nuvem: sem ligação', 'err'); }
  cloud.busy = false;
  if (cloud.dirty) queuePush();
}
async function pullNow() {
  if (!cloud.code || cloud.busy || cloud.dirty || editMode || gesture) return;
  cloud.busy = true;
  try {
    const remote = await pull(cloud.code);
    if (!remote) showCloud('Nuvem: código inválido', 'err');
    else if (!remote.objects.length) { cloud.busy = false; return pushNow(); } // first device: upload this house
    else {
      if (remote.at !== cloud.at && !cloud.dirty) {
        const theirs = remote.objects.filter(o => SPRITES[o.type]);
        const stale = (remote.objects.find(o => o.id === '_meta')?.layout || 0) < LAYOUT;
        // The cloud copy was saved with an older house layout: keep its plants, take the furniture from this version.
        if (stale) {
          const furniture = defaultObjects().filter(o => !o.plant && !isGroup(o));
          const taken = new Set(furniture.map(o => o.id));
          objects = [...furniture, ...theirs.filter(o => o.plant || isGroup(o)).map(o => (taken.has(o.id) ? { ...o, id: `c${o.id}` } : o))];
        } else objects = theirs;
        if (!objects.some(o => o.id === sel.obj)) sel = { obj: null, plant: null };
        cloud.at = remote.at; saveLocal(); refresh();
        if (stale) queuePush();
      }
      showCloud('Nuvem: ligada', 'ok');
    }
  } catch { showCloud('Nuvem: sem ligação', 'err'); }
  cloud.busy = false;
}
$('sync').addEventListener('click', () => {
  const code = prompt(cloud.code
    ? 'Esta página está ligada à nuvem. Para desligar, apaga o código e confirma.'
    : 'Código da casa (está no ficheiro .house-code do projeto):', cloud.code);
  if (code === null) return;
  cloud.code = code.trim(); cloud.at = 0; setCode(cloud.code);
  if (cloud.code) { showCloud('Nuvem: a ligar…'); pullNow(); } else showCloud('Nuvem: desligada');
});
if (takeCodeFromUrl()) cloud.code = getCode();
showCloud(cloud.code ? 'Nuvem: a ligar…' : 'Nuvem: desligada');
pullNow();
setInterval(pullNow, 30 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) pullNow(); });

// ---------- go ----------
window.addEventListener('resize', fit);
let last = 0;
function loop(t) {
  if (t - last > 30 && !(gesture && gesture.type !== 'tap')) { last = t; updateCat(t); render(t); }
  requestAnimationFrame(loop);
}
setEdit(false); fit(); refresh(); showWeather();
updateWeather();
setInterval(updateWeather, 15 * 60 * 1000);
requestAnimationFrame(loop);
