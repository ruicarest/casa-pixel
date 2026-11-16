// Experimental 2.5D (isometric) view of the same house. It has no data of its own: it reads the tile MAP and the
// same `objects` array as the top-down view, so anything moved or watered in one view shows in the other.
//
// How a flat sprite becomes a volume: every sprite is a 3/4 drawing, i.e. its upper part is the top of the thing and
// its lower part is the front. Solid sprites are split there and each part is sheared onto the matching face of a box.
// Sprites with a lot of see-through (plants, chairs, lamps, the cat) stand upright as billboards instead.
import { T, S, SPRITES, spriteCanvas, drawBubble, drawSelection } from './sprites.js';
import { MAP } from './house.js';

const COLS = MAP[0].length, ROWS = MAP.length;
const FLOOR = 'pSgvtwk', WALLFACE = 'BdGLC';
const WALL_H = 2, SIDE_H = 1;                 // wall heights, in tiles (a back wall is two tiles tall in the 2D art too)
const MARGIN = 10;
const OX = ROWS * T + MARGIN, OY = WALL_H * T + MARGIN;
export const ISO_W = (COLS + ROWS) * T + MARGIN * 2, ISO_H = (COLS + ROWS) * T / 2 + WALL_H * T + MARGIN * 2;

const tile = (x, y) => (MAP[y] && MAP[y][x]) || ' ';
const isFloor = (x, y) => FLOOR.includes(tile(x, y));

// world (tiles; z up) -> logical pixels
const px = (x, y) => (x - y) * T + OX;
const py = (x, y, z = 0) => (x + y) * T / 2 - z * T + OY;
// logical pixels on the ground -> world
const ground = (sx, sy) => { const a = (sx - OX) / T, b = (sy - OY) / (T / 2); return [(a + b) / 2, (b - a) / 2]; };

// ---------- what we know about each sprite ----------
const info = new Map();
function spriteInfo(type) {
  if (info.has(type)) return info.get(type);
  const s = SPRITES[type], cv = spriteCanvas(type);
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let n = 0, r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { n++; r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const fill = n / (d.length / 4);
  const tall = s.h >= s.w * 1.4;
  const front = tall ? s.h - Math.min(8, s.h * .25) : Math.min(14, s.h * .55); // art units of the sprite that are its front
  const it = {
    solid: fill > .72 && !s.plant && !s.group,
    front, top: s.h - front,
    side: n ? `rgb(${Math.round(r / n * .62)},${Math.round(g / n * .62)},${Math.round(b / n * .66)})` : '#333',
  };
  info.set(type, it);
  return it;
}

// First floor row at or below `row` in a column: the foot of the back wall something hangs on.
function wallFoot(cx, row) {
  for (let y = Math.max(0, Math.floor(row)); y < ROWS; y++) if (isFloor(Math.floor(cx), y)) return y;
  return null;
}

export function createIso(canvas, bg) {
  const ctx = canvas.getContext('2d');
  let k = 1;
  const ground2d = document.createElement('canvas'); // the floor, drawn once
  let boxes = [];                                    // screen boxes of the objects, in draw order (for picking)

  function buildFloor() {
    ground2d.width = Math.round(ISO_W * k); ground2d.height = Math.round(ISO_H * k);
    const g = ground2d.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.setTransform(k, 0, 0, k, 0, 0);
    // slab under the whole flat
    g.fillStyle = '#2a2030';
    g.beginPath();
    for (const [x, y] of [[0, 0], [COLS, 0], [COLS, ROWS], [0, ROWS]]) g.lineTo(px(x, y), py(x, y, -.15));
    g.fill();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (!isFloor(x, y)) continue;
      g.save();
      g.transform(1, .5, -1, .5, px(x, y), py(x, y));
      g.drawImage(bg, x * T * S, y * T * S, T * S, T * S, 0, 0, T + .3, T + .3);
      g.restore();
    }
  }

  function fit() {
    const cssW = canvas.parentElement.clientWidth, cssH = Math.round(cssW * ISO_H / ISO_W);
    canvas.style.height = `${cssH}px`;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    k = canvas.width / ISO_W;
    buildFloor();
  }

  // The parts of the walls you can see from the south-east: each room's back (north) wall and its left (west) wall.
  const walls = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!isFloor(x, y)) continue;
    if (!isFloor(x, y - 1)) walls.push({ key: x + y - .5, kind: 'n', x, y, textured: WALLFACE.includes(tile(x, y - 1)) && WALLFACE.includes(tile(x, y - 2)) });
    if (!isFloor(x - 1, y)) walls.push({ key: x + y - .5, kind: 'w', x, y });
  }

  function drawWall(w) {
    if (w.kind === 'n') {
      if (w.textured) { // the two wall-face tiles of the 2D map, stood up
        ctx.save();
        ctx.transform(1, .5, 0, 1, px(w.x, w.y), py(w.x, w.y, WALL_H));
        ctx.drawImage(bg, w.x * T * S, (w.y - 2) * T * S, T * S, 2 * T * S, 0, 0, T + .3, 2 * T);
        ctx.restore();
      } else quad('#d6d8e0', [w.x, w.y, WALL_H], [w.x + 1, w.y, WALL_H], [w.x + 1, w.y, 0], [w.x, w.y, 0]);
      edge([w.x, w.y, WALL_H], [w.x + 1, w.y, WALL_H]);
    } else {
      quad('#b9bcc8', [w.x, w.y, SIDE_H], [w.x, w.y + 1, SIDE_H], [w.x, w.y + 1, 0], [w.x, w.y, 0]);
      edge([w.x, w.y, SIDE_H], [w.x, w.y + 1, SIDE_H]);
    }
  }
  function quad(col, ...pts) {
    ctx.fillStyle = col; ctx.beginPath();
    for (const [x, y, z] of pts) ctx.lineTo(px(x, y), py(x, y, z));
    ctx.fill();
  }
  function edge(a, b) { // dark cap along the top of a wall
    ctx.strokeStyle = '#2a2030'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(px(a[0], a[1]), py(...a)); ctx.lineTo(px(b[0], b[1]), py(...b)); ctx.stroke();
  }

  // Turns one object into something drawable: { key, draw(), box:[x,y,w,h] }
  function shape(o, st) {
    const s = SPRITES[o.type];
    if (o.type === 'window_side') return null; // it sits on the cut-away east wall
    const w = s.w / T, h = s.h / T, yb = o.y + h;
    const count = st.plantsOf(o).length, dry = count > 0 && st.thirstyIn(o) * 2 >= count;
    let frame = 0;
    if (o.type === 'fireplace') frame = 2; else if (s.frames) frame = Math.floor(st.t / 1300) % s.frames;
    const cv = spriteCanvas(o.type, dry, frame);

    if (s.flat) { // rugs and mats lie on the floor
      return {
        key: -1000 + o.x + yb,
        box: [px(o.x, yb), py(o.x, o.y), px(o.x + w, o.y) - px(o.x, yb), py(o.x + w, yb) - py(o.x, o.y)],
        draw() {
          ctx.save(); ctx.transform(1, .5, -1, .5, px(o.x, o.y), py(o.x, o.y, .02));
          ctx.drawImage(cv, 0, 0, s.w, s.h); ctx.restore();
        },
      };
    }
    if (s.wall) { // hangs on the back wall of the room below it
      const foot = wallFoot(o.x + w / 2, o.y);
      if (foot == null) return null;
      const zt = Math.min(WALL_H, Math.max(h, foot - o.y));
      const x0 = px(o.x, foot), y0 = py(o.x, foot, zt);
      return {
        key: o.x + w / 2 + foot - .45,
        box: [x0, y0, s.w, s.h + s.w / 2],
        draw() {
          ctx.save(); ctx.transform(1, .5, 0, 1, x0, y0);
          ctx.drawImage(cv, 0, 0, s.w, s.h); ctx.restore();
        },
      };
    }
    const it = spriteInfo(o.type);
    if (!it.solid) { // upright billboard, standing on its base
      const cx = o.x + w / 2, cy = yb - .3, z = s.top ? .85 : o.type === 'cat' ? .95 : 0;
      const bx = px(cx, cy) - s.w / 2, by = py(cx, cy, z) - s.h + 2;
      return {
        key: cx + cy + (s.top || o.type === 'cat' ? 1.5 : 0),
        box: [bx, by, s.w, s.h],
        draw() {
          if (!z) { ctx.fillStyle = 'rgba(20,10,30,.25)'; ctx.beginPath(); ctx.ellipse(px(cx, cy), py(cx, cy), s.w * .45, s.w * .2, 0, 0, 7); ctx.fill(); }
          ctx.drawImage(cv, bx, by, s.w, s.h);
        },
      };
    }
    // a box: top of the sprite on the lid, the rest on the front, a plain shaded side
    const d = it.top / T, zf = it.front / T, y0 = yb - d, x1 = o.x + w;
    return {
      key: o.x + w / 2 + y0 + d / 2,
      box: [px(o.x, yb), py(o.x, y0, zf), px(x1, y0) - px(o.x, yb), py(x1, yb) - py(o.x, y0, zf)],
      draw() {
        ctx.fillStyle = 'rgba(20,10,30,.22)'; // contact shadow, cast to the right
        ctx.beginPath();
        for (const [x, y] of [[o.x, yb], [x1 + .2, yb], [x1 + .2, y0], [x1, y0]]) ctx.lineTo(px(x, y + .08), py(x, y + .08));
        ctx.fill();
        quad(it.side, [x1, y0, zf], [x1, yb, zf], [x1, yb, 0], [x1, y0, 0]);
        ctx.save(); ctx.transform(1, .5, -1, .5, px(o.x, y0), py(o.x, y0, zf));
        ctx.drawImage(cv, 0, 0, s.w * S, it.top * S, 0, 0, s.w, it.top); ctx.restore();
        ctx.save(); ctx.transform(1, .5, 0, 1, px(o.x, yb), py(o.x, yb, zf));
        ctx.drawImage(cv, 0, it.top * S, s.w * S, it.front * S, 0, 0, s.w, it.front); ctx.restore();
      },
    };
  }

  function render(st) {
    if (!canvas.width) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#15111b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ground2d, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);

    const items = walls.map(w => ({ key: w.key, draw: () => drawWall(w) }));
    boxes = [];
    for (const o of st.objects) {
      let it;
      if (o.type === 'cat' && st.cat.mode !== 'sleep') { // out of bed: follow her
        const c = st.cat, type = c.mode === 'sit' ? 'cat_sit' : 'cat_walk', cs = SPRITES[type];
        const cv = spriteCanvas(type, false, Math.floor(st.t / (c.mode === 'sit' ? 900 : 140)) % 2);
        const bx = px(c.x, c.y), by = py(c.x, c.y);
        it = {
          key: c.x + c.y, box: [bx - cs.w / 2, by - cs.h, cs.w, cs.h],
          draw() {
            ctx.fillStyle = 'rgba(20,10,30,.25)'; ctx.beginPath(); ctx.ellipse(bx, by, 6, 2.5, 0, 0, 7); ctx.fill();
            ctx.save(); ctx.translate(bx, by - cs.h + 1); ctx.scale(c.face || 1, 1);
            ctx.drawImage(cv, -cs.w / 2, 0, cs.w, cs.h); ctx.restore();
          },
        };
      } else it = shape(o, st);
      if (!it) continue;
      it.o = o; items.push(it); boxes.push(it);
    }
    items.sort((a, b) => a.key - b.key);
    for (const it of items) it.draw();
    boxes.sort((a, b) => a.key - b.key);

    // light: the same washes as the top-down view, only over what has been painted
    const e = st.env, dark = 1 - e.day;
    ctx.globalCompositeOperation = 'source-atop';
    const wash = (c, a) => { if (a > .01) { ctx.fillStyle = `rgba(${c},${a})`; ctx.fillRect(0, 0, ISO_W, ISO_H); } };
    wash('120,125,140', .16 * e.cloud * e.day); wash('255,150,60', .16 * e.golden); wash('14,18,58', .6 * dark);
    ctx.globalCompositeOperation = 'lighter';
    if (e.day < .6) for (const b of boxes) {
      if (SPRITES[b.o.type].glow !== 'lamp') continue;
      const cx = b.box[0] + b.box[2] / 2, cy = b.box[1] + 6, a = .5 * (1 - e.day / .6);
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46);
      g.addColorStop(0, `rgba(255,214,140,${a})`); g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 46, cy - 46, 92, 92);
    }
    ctx.globalCompositeOperation = 'source-over';

    for (const b of boxes) { // markers
      const [x, y, w, h] = b.box, n = st.thirstyIn(b.o);
      if (n) drawBubble(ctx, x + Math.round(w / 2) - 5, y - 13 - st.bob);
      if (b.o.id === st.sel.obj) drawSelection(ctx, x, y, w, h);
    }
  }

  // Topmost object under a pointer event; `any` also returns furniture (used while moving things).
  function pick(ev, any, plantsOf) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width * ISO_W, y = (ev.clientY - r.top) / r.height * ISO_H;
    for (let i = boxes.length - 1; i >= 0; i--) {
      const [bx, by, bw, bh] = boxes[i].box, o = boxes[i].o;
      if (x >= bx - 2 && x <= bx + bw + 2 && y >= by - 2 && y <= by + bh + 2 && (any || plantsOf(o).length || Array.isArray(o.plants))) return o;
    }
    return null;
  }
  // Where on the floor a pointer event is, in tiles.
  function floorAt(ev) {
    const r = canvas.getBoundingClientRect();
    return ground((ev.clientX - r.left) / r.width * ISO_W, (ev.clientY - r.top) / r.height * ISO_H);
  }

  return { fit, render, pick, floorAt };
}
