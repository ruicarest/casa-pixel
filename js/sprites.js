// Pixel-art sprites and floor tiles, all drawn in code (no image assets).
export const T = 16;

const OUT = '#2a2030';
const WD = '#6b3f2a', WM = '#8f5a36', WL = '#b07a4a';
const GD = '#2f6b4a', GM = '#3f8f5f', GL = '#6bbf7a';
const RED = '#b5443f', CREAM = '#f1e3c4', WHITE = '#f1f4fa', GOLD = '#d9a441', STEEL = '#c9c9d6';
const BLK = '#2a2530', BLK2 = '#3d3742', KW = '#eef0f3', KS = '#cfd3da';
const LEAF = { ok: [GD, GM, GL], dry: ['#7a6a35', '#a08a45', '#c9b060'] };

const r = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// Outlined box with clipped corners.
const box = (c, col, x, y, w, h) => {
  r(c, OUT, x + 1, y, w - 2, h);
  r(c, OUT, x, y + 1, w, h - 2);
  r(c, col, x + 1, y + 1, w - 2, h - 2);
};

const blob = (c, L, x, y, w, h) => {
  box(c, L[0], x, y, w, h);
  r(c, L[1], x + 1, y + 1, w - 3, h - 4);
  r(c, L[2], x + 2, y + 2, Math.max(1, w >> 2), 1);
  r(c, L[2], x + 2, y + 3, 1, 1);
};

const pot = (c, x, y, w, h) => {
  box(c, '#b5653f', x + 1, y + 2, w - 2, h - 2);
  box(c, '#c8774a', x, y, w, 3);
  r(c, '#e09a6a', x + 1, y + 1, w - 2, .5);
  r(c, '#d98a5a', x + 2, y + 3.5, 1, h - 6);
  r(c, '#8a452c', x + 2, y + h - 2, w - 4, 1);
};

// Small rounded leaf with a half-pixel rim and a highlight.
const leaf = (c, L, x, y, w, h) => {
  r(c, OUT, x + .5, y, w - 1, h); r(c, OUT, x, y + .5, w, h - 1);
  r(c, L[0], x + .5, y + .5, w - 1, h - 1);
  r(c, L[1], x + .5, y + .5, w - 1.5, h - 1.5);
  r(c, L[2], x + 1, y + 1, Math.max(.5, w / 3), .5);
};

const flower = (c, col, cx, cy) => {
  r(c, OUT, cx - 2, cy - 1, 4, 2); r(c, OUT, cx - 1, cy - 2, 2, 4);
  r(c, col, cx - 1.5, cy - .5, 3, 1); r(c, col, cx - .5, cy - 1.5, 1, 3); r(c, col, cx - 1, cy - 1, 2, 2);
  r(c, '#f6e58d', cx - .5, cy - .5, 1, 1);
};

const at = (c, x, y, fn) => { c.save(); c.translate(x, y); fn(); c.restore(); };

const rug = (a, b) => (c, _dry, w, h) => {
  box(c, a, 0, 0, w, h);
  r(c, b, 3, 3, w - 6, 1); r(c, b, 3, h - 4, w - 6, 1);
  r(c, b, 3, 3, 1, h - 6); r(c, b, w - 4, 3, 1, h - 6);
  r(c, b, w / 2 - 5, h / 2 - 2, 10, 4); r(c, b, w / 2 - 2, h / 2 - 5, 4, 10);
  r(c, a, w / 2 - 1, h / 2 - 1, 2, 2);
};

const leg = (c, x, y, h) => { r(c, OUT, x, y, 4, h); r(c, WD, x + 1, y, 2, h - 1); };

export const SPRITES = {
  // --- flat, drawn under everything else ---
  rug: { w: 48, h: 32, flat: true, draw: rug(GM, GL) },
  rug_red: { w: 48, h: 32, flat: true, draw: rug('#a8504a', '#e0a070') },
  mat: {
    w: 32, h: 10, flat: true, draw(c) {
      box(c, '#8a5a3a', 0, 0, 32, 10); r(c, WL, 2, 2, 28, 6);
      for (let x = 4; x < 28; x += 4) r(c, '#8a5a3a', x, 3, 1, 4);
    },
  },

  // --- living room ---
  sofa: {
    w: 40, h: 24, draw(c) {
      box(c, GD, 0, 0, 40, 10);
      box(c, GD, 0, 6, 7, 18); box(c, GD, 33, 6, 7, 18);
      box(c, GM, 6, 8, 14, 15); box(c, GM, 20, 8, 14, 15);
      r(c, GL, 8, 10, 10, 1); r(c, GL, 22, 10, 10, 1);
      r(c, GD, 7, 19, 12, 2); r(c, GD, 21, 19, 12, 2);
    },
  },
  armchair: {
    w: 20, h: 22, draw(c) {
      box(c, '#8a3a3f', 0, 0, 20, 9);
      box(c, '#8a3a3f', 0, 5, 5, 17); box(c, '#8a3a3f', 15, 5, 5, 17);
      box(c, RED, 4, 7, 12, 14); r(c, '#d9736a', 6, 9, 8, 1); r(c, '#8a3a3f', 5, 17, 10, 2);
    },
  },
  table: {
    w: 32, h: 26, draw(c) {
      leg(c, 2, 16, 10); leg(c, 26, 16, 10);
      box(c, WL, 0, 0, 32, 18);
      r(c, '#c9925e', 2, 2, 28, 2); r(c, WM, 1, 14, 30, 3);
    },
  },
  chair: {
    w: 12, h: 16, draw(c) {
      r(c, OUT, 1, 12, 2, 4); r(c, OUT, 9, 12, 2, 4);
      box(c, WM, 1, 0, 10, 8); r(c, WL, 3, 2, 6, 1); r(c, WL, 3, 4, 6, 1);
      box(c, WL, 0, 6, 12, 7);
    },
  },
  bookshelf: {
    w: 32, h: 38, draw(c) {
      box(c, WD, 0, 0, 32, 38);
      const cols = [RED, '#3f6f9f', GOLD, GM, '#8a5aa8', CREAM];
      for (let i = 0; i < 3; i++) {
        const y = 3 + i * 11;
        r(c, '#3a2530', 2, y, 28, 9);
        for (let k = 0; k < 9; k++) {
          const hh = 5 + ((i * 7 + k * 3) % 4);
          r(c, cols[(i * 2 + k * 5) % cols.length], 3 + k * 3, y + 9 - hh, 2, hh);
        }
      }
    },
  },
  tv: {
    w: 36, h: 26, draw(c) {
      box(c, WM, 0, 14, 36, 12); r(c, WL, 1, 15, 34, 2);
      r(c, WD, 3, 19, 13, 5); r(c, WD, 20, 19, 13, 5);
      box(c, '#1f1a28', 4, 0, 28, 16); r(c, '#3b5b7a', 6, 2, 24, 12); r(c, '#6f9cc0', 7, 3, 6, 2);
    },
  },
  lamp: {
    w: 12, h: 30, glow: 'lamp', draw(c) {
      r(c, OUT, 5, 9, 2, 17); box(c, WD, 2, 25, 8, 5);
      box(c, '#f6e2a8', 0, 0, 12, 10); r(c, '#fff3c9', 2, 2, 8, 3);
    },
  },

  // --- bedroom / office ---
  bed: {
    w: 36, h: 46, draw(c) {
      box(c, WD, 0, 0, 36, 46); r(c, WM, 1, 1, 34, 6);
      r(c, CREAM, 2, 7, 32, 37);
      box(c, '#fff7e6', 4, 8, 13, 8); box(c, '#fff7e6', 19, 8, 13, 8);
      r(c, GM, 2, 19, 32, 24); r(c, GL, 2, 19, 32, 3);
      r(c, GD, 2, 30, 32, 1); r(c, GD, 2, 37, 32, 1);
      r(c, WM, 1, 43, 34, 2);
    },
  },
  wardrobe: {
    w: 32, h: 38, draw(c) {
      box(c, WM, 0, 0, 32, 38); r(c, WL, 1, 1, 30, 3);
      r(c, '#9c6540', 3, 7, 11, 24); r(c, '#9c6540', 18, 7, 11, 24);
      r(c, WD, 15, 5, 2, 29); r(c, GOLD, 13, 18, 1, 3); r(c, GOLD, 18, 18, 1, 3);
      r(c, WD, 1, 34, 30, 3);
    },
  },
  desk: {
    w: 34, h: 26, draw(c) {
      leg(c, 1, 16, 10); leg(c, 29, 16, 10);
      box(c, WL, 0, 5, 34, 13); r(c, WM, 1, 14, 32, 3);
      box(c, STEEL, 11, 0, 12, 9); r(c, '#5fa8d3', 12, 1, 10, 7);
      r(c, '#a9a9b8', 10, 9, 14, 3);
    },
  },

  // --- kitchen ---
  counter: {
    w: 48, h: 24, draw(c) {
      box(c, RED, 0, 9, 48, 15); box(c, CREAM, 0, 0, 48, 10);
      r(c, '#8a2f33', 16, 10, 1, 13); r(c, '#8a2f33', 32, 10, 1, 13);
      r(c, CREAM, 7, 14, 3, 1); r(c, CREAM, 23, 14, 3, 1); r(c, CREAM, 39, 14, 3, 1);
    },
  },
  stove: {
    w: 16, h: 24, draw(c) {
      box(c, '#55506a', 0, 9, 16, 15); box(c, '#3a3347', 0, 0, 16, 10);
      r(c, '#6b6478', 2, 2, 4, 2); r(c, '#6b6478', 10, 2, 4, 2);
      r(c, '#6b6478', 2, 6, 4, 2); r(c, '#6b6478', 10, 6, 4, 2);
      r(c, OUT, 3, 13, 10, 8); r(c, '#e0a040', 5, 16, 6, 3);
      for (let x = 3; x < 13; x += 3) r(c, CREAM, x, 11, 1, 1);
    },
  },
  kitchen_sink: {
    w: 16, h: 24, draw(c) {
      box(c, RED, 0, 9, 16, 15); box(c, CREAM, 0, 0, 16, 10);
      r(c, '#6f95a9', 3, 3, 10, 5); r(c, '#8fb5c9', 3, 4, 10, 4);
      r(c, STEEL, 7, 1, 2, 3); r(c, CREAM, 7, 14, 3, 1);
    },
  },
  fridge: {
    w: 16, h: 34, draw(c) {
      box(c, '#d9dde6', 0, 0, 16, 34); r(c, WHITE, 1, 1, 14, 3);
      r(c, '#9aa0b0', 1, 12, 14, 1); r(c, '#7a8090', 12, 5, 1, 5); r(c, '#7a8090', 12, 15, 1, 8);
      r(c, '#b0b6c4', 1, 30, 14, 3);
    },
  },

  // --- bathroom ---
  toilet: {
    w: 14, h: 20, draw(c) {
      box(c, WHITE, 1, 0, 12, 7); box(c, WHITE, 0, 6, 14, 14);
      r(c, '#c9d0dc', 3, 9, 8, 8); r(c, '#8fb5c9', 4, 10, 6, 6);
    },
  },
  bathtub: {
    w: 44, h: 22, draw(c) {
      box(c, WHITE, 0, 0, 44, 22); box(c, '#8fc5d9', 3, 3, 38, 16);
      r(c, '#b9e0ee', 6, 6, 10, 2); r(c, STEEL, 37, 9, 4, 3);
    },
  },
  basin: {
    w: 16, h: 20, draw(c) {
      box(c, WM, 1, 12, 14, 8); box(c, WHITE, 0, 3, 16, 11);
      r(c, '#8fb5c9', 3, 6, 10, 5); r(c, STEEL, 7, 3, 2, 3);
    },
  },

  shower: {
    w: 16, h: 16, flat: true, draw(c) {
      box(c, '#d9e6ee', 0, 0, 16, 16); r(c, '#b9d0dc', 2, 2, 12, 12);
      r(c, STEEL, 7, 7, 2, 2); r(c, STEEL, 2, 2, 3, 1);
    },
  },
  washer: {
    w: 16, h: 22, draw(c) {
      box(c, WHITE, 0, 0, 16, 22); r(c, '#c9d0dc', 1, 1, 14, 4); r(c, RED, 11, 2, 2, 2);
      box(c, '#8fb5c9', 3, 8, 10, 10); r(c, '#b9e0ee', 5, 10, 3, 2);
    },
  },
  fireplace: {
    w: 32, h: 30, frames: 2, glow: 'fire', draw(c, _dry, _w, _h, frame) {
      box(c, '#8a4a48', 1, 4, 30, 26);
      for (let y = 10; y < 28; y += 6) r(c, '#6b3740', 2, y, 28, 1);
      box(c, '#1b1622', 8, 12, 16, 18);
      if (frame === 2) {
        r(c, '#3a2530', 11, 25, 10, 3);
      } else if (frame) {
        r(c, '#e0662e', 11, 21, 9, 8); r(c, '#e0662e', 18, 19, 2, 3);
        r(c, '#f6c242', 13, 23, 5, 6); r(c, '#fff3c9', 14, 26, 2, 3);
      } else {
        r(c, '#e0662e', 12, 22, 9, 7); r(c, '#e0662e', 13, 19, 2, 4);
        r(c, '#f6c242', 14, 24, 5, 5); r(c, '#fff3c9', 16, 26, 2, 3);
      }
      r(c, WD, 9, 28, 14, 1);
      box(c, WL, 0, 0, 32, 6);
    },
  },

  // --- pieces taken from the real rooms (photos) ---
  bed_sage: { // headboard against the bottom wall, white frame, sage bedding
    w: 36, h: 46, draw(c) {
      box(c, WHITE, 0, 0, 36, 46);
      r(c, '#9aa88f', 2, 2, 32, 30); r(c, '#8a9880', 2, 2, 32, 2);
      r(c, '#aab89f', 4, 8, 20, 1); r(c, '#aab89f', 10, 17, 18, 1); r(c, '#aab89f', 5, 25, 22, 1);
      box(c, '#8a2f4a', 12, 11, 9, 6);
      r(c, '#b7c2ad', 2, 32, 32, 9);
      box(c, '#8f9f86', 4, 32, 13, 8); box(c, '#8f9f86', 19, 32, 13, 8);
      r(c, CREAM, 8, 33, 6, 4);
      r(c, '#d9dde6', 1, 41, 34, 4);
    },
  },
  nightstand: {
    w: 12, h: 14, draw(c) {
      box(c, WHITE, 0, 0, 12, 14); r(c, '#c9d0dc', 1, 5, 10, 1); r(c, '#9aa0b0', 5, 8, 2, 1);
    },
  },
  nightstand_lamp: {
    w: 12, h: 14, glow: 'lamp', draw(c) {
      box(c, WHITE, 0, 0, 12, 14); r(c, '#c9d0dc', 1, 5, 10, 1); r(c, '#9aa0b0', 5, 8, 2, 1);
      r(c, OUT, 3, 0, 6, 5); r(c, '#3f6f9f', 4, 1, 4, 3);
    },
  },
  rug_grey: {
    w: 16, h: 40, flat: true, draw(c) { box(c, '#8f8f99', 0, 0, 16, 40); r(c, '#a3a3ad', 2, 2, 12, 36); },
  },
  mat_dark: {
    w: 24, h: 14, flat: true, draw(c) { box(c, '#2f2a33', 0, 0, 24, 14); r(c, '#3d3742', 2, 2, 20, 10); },
  },
  ladder: {
    w: 12, h: 30, draw(c) {
      r(c, '#c9a15e', 1, 0, 2, 30); r(c, '#c9a15e', 9, 0, 2, 30);
      for (let y = 6; y < 28; y += 8) r(c, '#a8824a', 1, y, 10, 1);
      box(c, '#3a3a44', 2, 4, 8, 10);
      box(c, '#d98a8a', 3, 15, 7, 11); r(c, WHITE, 4, 18, 5, 1); r(c, WHITE, 4, 21, 5, 1);
    },
  },
  basket: {
    w: 10, h: 10, draw(c) { box(c, '#c9a15e', 0, 2, 10, 8); r(c, '#a8824a', 1, 5, 8, 1); r(c, '#a8824a', 2, 0, 6, 2); },
  },
  heater: {
    w: 24, h: 14, draw(c) {
      box(c, WHITE, 0, 0, 24, 14); r(c, '#c9d0dc', 2, 2, 20, 3);
      for (let x = 3; x < 21; x += 2) r(c, '#9aa0b0', x, 2, 1, 3);
      r(c, OUT, 2, 8, 3, 3);
    },
  },
  kallax_side: { // low black shelf under the window, with the cat's bed and feeders on top
    w: 14, h: 34, draw(c) {
      box(c, '#2a2530', 0, 0, 14, 34); r(c, '#3d3742', 1, 1, 12, 28);
      box(c, WHITE, 3, 3, 4, 6); box(c, WHITE, 7, 3, 4, 6);
      box(c, '#5a565e', 1, 15, 12, 14); r(c, '#7a2a2a', 3, 17, 8, 10);
      r(c, WHITE, 2, 16, 2, 1); r(c, WHITE, 10, 16, 2, 1); r(c, WHITE, 2, 27, 2, 1); r(c, WHITE, 10, 27, 2, 1);
    },
  },
  desk_side: { // black standing desk against the window wall
    w: 20, h: 30, draw(c) {
      r(c, OUT, 2, 25, 3, 5); r(c, OUT, 15, 25, 3, 5);
      box(c, '#2f2a33', 0, 0, 20, 27); r(c, '#3d3742', 1, 1, 18, 2);
      r(c, '#1f1a28', 15, 3, 3, 12); r(c, '#5fa8d3', 14, 4, 1, 10);
      r(c, STEEL, 13, 17, 5, 7); r(c, '#5fa8d3', 13, 18, 1, 5);
      r(c, WHITE, 8, 6, 3, 9); r(c, '#8a2f33', 6, 18, 4, 4);
    },
  },
  office_chair: {
    w: 14, h: 17, draw(c) {
      r(c, OUT, 6, 12, 2, 3); r(c, '#8a857e', 2, 15, 10, 2);
      box(c, '#a8a29a', 1, 0, 12, 8); box(c, '#c0bab0', 0, 6, 14, 7);
    },
  },
  cabinet_dark: { // tall black cabinet with glass doors
    w: 20, h: 38, draw(c) {
      box(c, '#2a2530', 0, 0, 20, 38);
      r(c, '#4a5560', 2, 3, 7, 31); r(c, '#4a5560', 11, 3, 7, 31);
      r(c, '#2a2530', 2, 13, 16, 1); r(c, '#2a2530', 2, 24, 16, 1);
      r(c, '#6f7f8f', 3, 4, 2, 6); r(c, STEEL, 9, 17, 1, 4); r(c, STEEL, 10, 17, 1, 4);
    },
  },
  dresser_dark: {
    w: 22, h: 24, draw(c) {
      box(c, '#2a2530', 0, 6, 22, 18); r(c, '#3d3742', 1, 12, 20, 1); r(c, '#3d3742', 1, 18, 20, 1);
      box(c, '#3d3742', 0, 0, 22, 8); r(c, '#2f5a4a', 9, 2, 8, 4);
    },
  },
  whiteboard: {
    w: 20, h: 14, draw(c) {
      box(c, STEEL, 0, 0, 20, 14); r(c, WHITE, 2, 2, 16, 10);
      r(c, '#55506a', 3, 4, 12, 1); r(c, '#55506a', 3, 7, 9, 1); r(c, '#55506a', 3, 10, 13, 1);
    },
  },
  sign: {
    w: 12, h: 12, draw(c) { box(c, '#f2d24a', 0, 0, 12, 12); r(c, RED, 3, 4, 6, 2); r(c, '#c9a830', 3, 8, 6, 1); },
  },
  stool: {
    w: 10, h: 10, draw(c) { r(c, OUT, 1, 4, 1, 6); r(c, OUT, 8, 4, 1, 6); box(c, '#2f2a33', 0, 0, 10, 5); },
  },
  window_side: { // window on a side façade, drawn on the wall thickness
    w: 8, h: 44, wall: true, light: 'left', glass: [2, 2, 4, 40], draw(c) {
      box(c, WHITE, 0, 0, 8, 44); r(c, '#7fb7d9', 2, 2, 4, 40); r(c, '#a9d5ee', 2, 2, 2, 40);
      r(c, WHITE, 2, 21, 4, 2);
    },
  },

  cat: { // white, grey patch between the ears, tabby tail; curled up asleep
    w: 12, h: 10, frames: 2, draw(c, _dry, _w, _h, frame) {
      box(c, WHITE, 0, 1, 12, 9);
      r(c, OUT, 7, 0, 2, 1); r(c, OUT, 10, 0, 2, 1);
      r(c, '#7a746e', 7, 1, 2, 1); r(c, '#7a746e', 10, 1, 1, 1); r(c, '#7a746e', 8, 2, 3, 1);
      r(c, OUT, 8, 4, 1, 1); r(c, OUT, 10, 4, 1, 1); r(c, '#f0a5b0', 9, 5, 1, 1);
      r(c, '#7a746e', 1, 8, 6, 1); r(c, '#55504b', 3, 8, 1, 1); r(c, '#55504b', 5, 8, 1, 1);
      r(c, '#dfe3ea', 2, frame ? 3 : 4, 4, 1);
    },
  },

  // --- kitchen as in the photos: white fronts, black worktop ---
  k_cab: {
    w: 16, h: 24, draw(c) {
      box(c, KW, 0, 9, 16, 15); box(c, BLK, 0, 0, 16, 10); r(c, BLK2, 1, 1, 14, 1);
      r(c, KS, 7.5, 10, .5, 13); r(c, '#9aa0b0', 4, 12, 2.5, .5); r(c, '#9aa0b0', 9.5, 12, 2.5, .5);
    },
  },
  k_sink: {
    w: 16, h: 24, draw(c) {
      box(c, KW, 0, 9, 16, 15); box(c, BLK, 0, 0, 16, 10);
      r(c, STEEL, 3, 3, 10, 5); r(c, '#8a8f9a', 4, 4, 8, 3.5); r(c, OUT, 7.5, 1, 1, 3); r(c, STEEL, 7.5, 1, 2.5, .5);
      r(c, KS, 7.5, 10, .5, 13); r(c, '#9aa0b0', 4, 12, 2.5, .5); r(c, '#9aa0b0', 9.5, 12, 2.5, .5);
    },
  },
  k_dish: {
    w: 16, h: 24, draw(c) {
      box(c, KW, 0, 9, 16, 15); box(c, BLK, 0, 0, 16, 10); r(c, BLK2, 1, 1, 14, 1);
      r(c, '#9aa0b0', 3, 11.5, 10, 1); r(c, KS, 1, 14, 14, .5); r(c, '#5fa8d3', 12, 12.5, 1, .5);
    },
  },
  k_drawers: {
    w: 16, h: 24, draw(c) {
      box(c, KW, 0, 9, 16, 15); box(c, BLK, 0, 0, 16, 10); r(c, BLK2, 1, 1, 14, 1);
      for (let y = 13; y < 23; y += 3.5) { r(c, KS, 1, y, 14, .5); r(c, '#55506a', 6, y - 2, 4, .5); }
    },
  },
  k_oven: {
    w: 16, h: 24, draw(c) {
      box(c, BLK, 0, 9, 16, 15); box(c, BLK, 0, 0, 16, 10);
      for (const [x, y] of [[2, 2], [9, 2], [2, 5.5], [9, 5.5]]) { r(c, '#55506a', x, y, 5, 2.5); r(c, BLK, x + 1, y + .5, 3, 1.5); }
      r(c, STEEL, 2, 11.5, 12, 1); r(c, '#16121c', 2, 14, 12, 8); r(c, '#3d3742', 3, 15, 5, .5);
      r(c, '#5fd38a', 7, 10, 2.5, .5);
    },
  },
  k_upper: {
    w: 48, h: 12, wall: true, draw(c) {
      box(c, KW, 0, 0, 48, 12); r(c, KS, 1, 10, 46, 1);
      r(c, KS, 15.5, 1, .5, 10); r(c, KS, 31.5, 1, .5, 10);
      r(c, '#b9cfdc', 17, 2, 6, 7); r(c, '#b9cfdc', 25, 2, 6, 7); r(c, '#dbe8f0', 18, 3, 1, 4); r(c, '#dbe8f0', 26, 3, 1, 4);
      r(c, KW, 17, 5.5, 14, .5);
      for (const x of [7, 23.5, 39]) r(c, '#9aa0b0', x, 9, 2, .5);
    },
  },
  k_cart: { // metal trolley with the microwave and coffee machine
    w: 26, h: 28, draw(c) {
      r(c, '#9aa0b0', 0, 10, 1, 18); r(c, '#9aa0b0', 25, 10, 1, 18);
      r(c, '#9aa0b0', 0, 18, 26, 1); r(c, '#9aa0b0', 0, 25, 26, 1);
      r(c, '#5fa8d3', 3, 14, 5, 4); r(c, GOLD, 11, 15, 6, 3); r(c, WHITE, 19, 14, 4, 4); r(c, '#8fd3c9', 5, 21, 8, 4);
      box(c, BLK, 0, 9, 26, 3);
      box(c, '#e6e6ea', 1, 1, 14, 9); r(c, BLK, 2, 2, 9, 6); r(c, '#3d3742', 3, 3, 4, .5); r(c, '#9aa0b0', 12.5, 3, 1, 4);
      box(c, BLK, 17, 0, 8, 10); r(c, STEEL, 19, 5, 4, 2); r(c, RED, 19, 2, 1, 1);
    },
  },
  bin_yellow: { w: 8, h: 10, draw(c) { box(c, '#e8c53a', 0, 2, 8, 8); box(c, '#f2d24a', 0, 0, 8, 3); } },
  litter: {
    w: 14, h: 10, draw(c) { box(c, WHITE, 0, 1, 14, 9); r(c, '#f0a5b0', 1, 7, 12, 2); r(c, '#d9c9a8', 2, 2, 10, 4); },
  },
  bowls: {
    w: 14, h: 8, flat: true, draw(c) {
      box(c, '#3a3a44', 0, 0, 14, 8); box(c, STEEL, 1.5, 1.5, 5, 5); box(c, STEEL, 7.5, 1.5, 5, 5);
      r(c, '#8fc5d9', 3, 3, 2, 2); r(c, '#8a6a45', 9, 3, 2, 2);
    },
  },
  runner_grey: {
    w: 32, h: 10, flat: true, draw(c) {
      box(c, '#8f8f99', 1, 0, 30, 10); r(c, '#a3a3ad', 2, 2, 28, 6);
      for (let x = 3; x < 29; x += 2) r(c, '#8f8f99', x, 3 + (x % 4 ? 0 : 2), 1, .5);
      for (let y = 1; y < 9; y += 1.5) { r(c, CREAM, 0, y, 1, .5); r(c, CREAM, 31, y, 1, .5); }
    },
  },

  // --- laundry ---
  lav_shelf: {
    w: 30, h: 10, wall: true, draw(c) {
      r(c, OUT, 0, 7.5, 30, 2.5); r(c, WL, .5, 8, 29, 1.5);
      box(c, '#e8c53a', 2, 1, 5, 7); r(c, RED, 3, 3, 3, 2);
      box(c, '#5fa8d3', 9, 2, 4, 6); box(c, WHITE, 14, 3, 5, 5); box(c, RED, 21, 1, 4, 7); box(c, '#8fd3c9', 26, 4, 3.5, 4);
    },
  },
  drying_rack: {
    w: 16, h: 18, draw(c) {
      r(c, '#9aa0b0', 2, 3, 1, 15); r(c, '#9aa0b0', 13, 3, 1, 15); r(c, '#9aa0b0', 3, 10, 10, .5);
      r(c, OUT, 0, 2, 16, 1.5); r(c, STEEL, 0, 2, 16, 1);
      box(c, GD, 1, 3, 5, 9); box(c, '#3a3a44', 6.5, 3, 4, 7); box(c, '#8a2f4a', 11, 3, 4, 8);
    },
  },
  mop: { w: 9, h: 13, draw(c) { r(c, RED, 6, 0, 1, 9); box(c, '#3a3a44', 0, 5, 8, 8); r(c, '#55506a', 1, 6, 6, 1); } },
  laundry_basket: {
    w: 12, h: 10, draw(c) {
      box(c, WHITE, 0, 1, 12, 9);
      for (let x = 2; x < 11; x += 2) r(c, '#c9d0dc', x, 2, .5, 7);
      for (let y = 3; y < 9; y += 2) r(c, '#c9d0dc', 1, y, 10, .5);
    },
  },

  // --- bathrooms ---
  vanity: { // white drawer unit with a glass bowl basin
    w: 22, h: 20, draw(c) {
      box(c, WHITE, 0, 7, 22, 13); r(c, KS, 1, 13.5, 20, .5); r(c, KS, 11, 8, .5, 11);
      r(c, '#c9d0dc', 4, 10.5, 4, .5); r(c, '#c9d0dc', 14, 10.5, 4, .5);
      box(c, '#fbfcfe', 0, 4, 22, 4);
      box(c, '#cfe8f2', 6, 0, 9, 6); r(c, '#eaf6fb', 7, 1, 7, 1); r(c, '#a9cfe0', 8, 3, 5, 2);
      r(c, STEEL, 16, 1, 1, 4); r(c, STEEL, 15, 1, 2, .5);
      r(c, GM, 2, 2, 1.5, 3); r(c, RED, 19, 2, 1.5, 3); r(c, GOLD, 3.5, 2.5, 1, 2.5);
    },
  },
  mirror: {
    w: 12, h: 14, wall: true, draw(c) {
      box(c, WHITE, 0, 0, 12, 14); r(c, '#b9cfdc', 2, 2, 8, 10); r(c, '#dbe8f0', 3, 3, 1.5, 6); r(c, '#dbe8f0', 5, 3, .5, 3);
    },
  },
  bath_tower: {
    w: 8, h: 26, draw(c) {
      box(c, WHITE, 0, 0, 8, 26);
      for (const y of [7, 13, 19]) r(c, '#c9d0dc', 1, y, 6, .5);
      r(c, '#c9a15e', 1.5, 2, 5, 4.5); r(c, '#a8824a', 1.5, 4, 5, .5);
      r(c, '#c9a15e', 1.5, 8, 5, 4.5); r(c, '#a8824a', 1.5, 10, 5, .5);
      r(c, '#d98a8a', 1.5, 15, 5, 2); r(c, '#f0b89a', 1.5, 17, 5, 1.5); r(c, '#3f6f9f', 1.5, 21, 5, 2); r(c, '#dfe3ea', 1.5, 23, 5, 1.5);
    },
  },
  wicker_basket: {
    w: 10, h: 12, draw(c) {
      box(c, '#c9a15e', 0, 2, 10, 10);
      for (let y = 5; y < 11; y += 2) for (let x = 1; x < 9; x += 2) r(c, '#a8824a', x + (y % 4 === 1 ? 0 : 1), y, 1, .5);
      r(c, CREAM, 1, 2.5, 8, 1.5); box(c, WHITE, 5, 0, 4, 3);
    },
  },
  bin_steel: { w: 6, h: 8, draw(c) { box(c, STEEL, 0, 1, 6, 7); r(c, '#8a8f9a', 1, 2, 4, 1); r(c, WHITE, 1.5, 4, .5, 3); } },
  shower_glass: {
    w: 28, h: 16, flat: true, draw(c) {
      box(c, '#dfe6ec', 0, 0, 28, 16); r(c, WHITE, 1.5, 1.5, 25, 13);
      for (let x = 4; x < 26; x += 3) r(c, '#e9eef2', x, 3, .5, 10);
      r(c, STEEL, 13, 7, 2, 2); r(c, '#8a8f9a', 13.5, 7.5, 1, 1);
      r(c, 'rgba(150,200,225,.6)', 0, 0, 28, 1.5); r(c, 'rgba(150,200,225,.6)', 0, 0, 1.5, 16);
    },
  },
  rug_navy: {
    w: 16, h: 10, flat: true, draw(c) {
      box(c, '#2a3a6a', 0, 0, 16, 10); r(c, WHITE, 1, 2, 14, 1.5); r(c, WHITE, 1, 5, 14, 1.5); r(c, WHITE, 1, 8, 14, .5);
    },
  },
  rug_peach: {
    w: 14, h: 9, flat: true, draw(c) {
      box(c, '#f0b89a', 0, 0, 14, 9); r(c, OUT, 2.5, 4, 3.5, 1); r(c, OUT, 8, 4, 3.5, 1);
      r(c, OUT, 2.5, 5, .5, 1); r(c, OUT, 4, 5, .5, 1); r(c, OUT, 8, 5, .5, 1); r(c, OUT, 9.5, 5, .5, 1);
    },
  },

  // --- closet ---
  clothes_rack: {
    w: 34, h: 30, draw(c) {
      r(c, '#c9d0dc', 1, 2, 1.5, 28); r(c, '#c9d0dc', 31.5, 2, 1.5, 28);
      r(c, OUT, 0, 1.5, 34, 2); r(c, '#eef0f3', .5, 2, 33, 1);
      const cols = ['#c98a45', '#8a2f4a', '#e8dcc0', '#55407a', '#3a3a44', '#6a6f7a', '#2f4a3a', '#1f1a28', '#3a3a44'];
      cols.forEach((col, i) => { box(c, col, 2 + i * 3.3, 3, 4.3, 13 + (i * 5) % 7); r(c, 'rgba(255,255,255,.18)', 3 + i * 3.3, 4, .5, 9); });
      r(c, '#c9d0dc', 2, 25.5, 30, 1);
      box(c, WHITE, 4, 22, 5, 3.5); box(c, '#3a3a44', 11, 22, 5, 3.5); box(c, WHITE, 18, 22, 5, 3.5); box(c, '#8a6a45', 25, 22, 5, 3.5);
    },
  },
  dresser_white: {
    w: 22, h: 30, draw(c) {
      r(c, '#e8b0a0', 8, 0, 2.5, 4); r(c, '#f0c8b8', 11, .5, 3, 3.5); r(c, '#e8b0a0', 14, 1.5, 2, 3); r(c, '#b08a7a', 11, 4, .5, 2);
      box(c, '#9ab89a', 9, 4, 5, 5); r(c, WHITE, 10.5, 5.5, 2, 2);
      box(c, '#4a7fa8', 2, 5, 6, 4); r(c, '#6f9cc0', 3, 6, 4, .5);
      box(c, WHITE, 0, 8, 22, 22); r(c, '#fbfcfe', 1, 9, 20, 2);
      for (const y of [15, 20, 25]) r(c, KS, 1, y, 20, .5);
    },
  },
  dehumidifier: {
    w: 10, h: 14, draw(c) { box(c, WHITE, 0, 0, 10, 14); r(c, KS, 2, 2, 6, 3); r(c, '#9aa0b0', 3, 8, 4, .5); r(c, '#9aa0b0', 3, 9.5, 4, .5); },
  },
  storage_box: { w: 12, h: 9, draw(c) { box(c, '#dfe9ee', 0, 2, 12, 7); box(c, '#8fb5c9', 0, 0, 12, 3); r(c, WHITE, 2, 4, 5, 3); } },
  armchair_black: {
    w: 20, h: 22, draw(c) {
      box(c, BLK, 0, 0, 20, 9); box(c, BLK, 0, 5, 5, 17); box(c, BLK, 15, 5, 5, 17);
      box(c, BLK2, 4, 7, 12, 14); r(c, '#55506a', 6, 9, 8, .5); r(c, BLK, 5, 17, 10, 2);
    },
  },
  ironing_board: {
    w: 24, h: 9, draw(c) {
      r(c, '#9aa0b0', 6, 5, 1, 4); r(c, '#9aa0b0', 17, 5, 1, 4);
      box(c, '#d9d3c8', 0, 0, 24, 6); r(c, '#8a8f9a', 9, 1.5, 11, 3); r(c, '#b0a89a', 2, 2, 5, .5);
    },
  },
  office_chair_black: {
    w: 14, h: 17, draw(c) {
      r(c, OUT, 6, 12, 2, 3); r(c, '#55506a', 2, 15, 10, 2);
      box(c, BLK, 1, 0, 12, 8); box(c, BLK2, 0, 6, 14, 7);
    },
  },

  // --- hall ---
  console: { // wood top on a black metal frame, vase of dried flowers and a wooden diffuser
    w: 28, h: 24, draw(c) {
      for (const [x, y] of [[5, 1], [7, 0], [9, 1], [6, 3], [8, 2.5], [10, 3], [4.5, 3.5], [7.5, 4.5]]) r(c, x % 2 ? '#8a6a7a' : '#a8889a', x, y, 1.5, 1.5);
      r(c, '#6b5a4a', 7.5, 5, .5, 3);
      box(c, WHITE, 5.5, 7, 5, 6); r(c, WHITE, 6.5, 6, 3, 1.5);
      box(c, '#c9925e', 14, 8, 5, 5); r(c, '#b07a4a', 15.5, 6.5, 2, 2);
      r(c, BLK, 1, 14, 1.5, 10); r(c, BLK, 25.5, 14, 1.5, 10);
      box(c, WL, 0, 12, 28, 3.5); r(c, '#c9925e', 1, 13, 26, .5);
      r(c, OUT, 2, 19, 24, 2); r(c, WL, 2.5, 19, 23, 1.5);
    },
  },
  pantry: { // the despensa by the front door, seen open
    w: 32, h: 38, draw(c) {
      box(c, '#e9e4d8', 0, 0, 32, 38); r(c, '#f6f2e8', 2, 2, 20, 34);
      for (const y of [9, 17, 25]) r(c, WL, 2, y, 13, 1);
      r(c, '#5fa8d3', 3, 4, 3, 5); r(c, RED, 7, 5, 3, 4); r(c, GOLD, 11, 4, 3, 5);
      r(c, WHITE, 3, 13, 5, 4); r(c, GM, 10, 12, 3, 5); r(c, '#e8c53a', 4, 21, 3, 4); r(c, '#8a6a45', 9, 20, 5, 5);
      r(c, STEEL, 17, 14, 1, 20); r(c, STEEL, 20, 14, 1, 20); for (let y = 17; y < 34; y += 4) r(c, STEEL, 17, y, 4, .5);
      r(c, '#9aa0b0', 12, 22, 1, 8); box(c, RED, 7, 28, 9, 7); r(c, '#d9736a', 8, 29, 4, 1);
      box(c, WHITE, 22, 1, 9, 36); r(c, KS, 23, 2, .5, 34); r(c, STEEL, 23.5, 20, 1, 1);
      box(c, '#7a4a3a', 24, 5, 3.5, 15); box(c, '#3a4a6a', 27, 6, 3.5, 14); r(c, '#9a6a55', 24.5, 8, 2.5, .5); r(c, '#9a6a55', 24.5, 12, 2.5, .5);
    },
  },

  // --- on the wall ---
  window: {
    w: 32, h: 26, wall: true, light: 'down', glass: [2, 2, 28, 19], draw(c) {
      box(c, WD, 0, 0, 32, 23);
      r(c, '#7fb7d9', 2, 2, 28, 19); r(c, '#a9d5ee', 2, 2, 28, 8);
      r(c, '#5fa56b', 2, 16, 28, 5); r(c, GM, 4, 13, 7, 8); r(c, GM, 19, 14, 8, 7);
      r(c, WD, 15, 2, 2, 19); r(c, WD, 2, 10, 28, 2);
      box(c, WL, 0, 21, 32, 5);
    },
  },
  picture: {
    w: 14, h: 12, wall: true, draw(c) {
      box(c, GOLD, 0, 0, 14, 12); r(c, CREAM, 2, 2, 10, 8);
      r(c, RED, 4, 4, 3, 3); r(c, GM, 7, 6, 4, 3);
    },
  },

  // --- plants (draw receives `dry`), drawn at half-pixel detail ---
  plant_small: {
    w: 12, h: 16, plant: true, fine: true, label: 'Vaso pequeno', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      for (const [x, y, w, h] of [[5, 0, 3, 3.5], [3, 1, 6, 5], [0, 3, 5, 4], [7, 3, 5, 4], [1, 6, 4, 3.5], [7, 6, 4, 3.5], [4, 4, 4, 5]]) leaf(c, L, x, y, w, h);
      pot(c, 2, 9, 8, 7);
    },
  },
  plant_tall: {
    w: 16, h: 30, plant: true, fine: true, label: 'Planta alta', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      r(c, OUT, 7, 9, 2, 13); r(c, WD, 7.5, 9, 1, 13); r(c, WD, 5, 14, 2.5, .5); r(c, WD, 8.5, 12, 3, .5);
      for (const [x, y, w, h] of [[5, 0, 6, 6], [1, 3, 6, 5], [9, 3, 6, 5], [4, 6, 5, 5], [0, 8, 6, 5], [10, 8, 6, 5], [7, 10, 5, 5], [3, 12, 5, 4.5]]) leaf(c, L, x, y, w, h);
      pot(c, 4, 21, 8, 9);
    },
  },
  monstera: {
    w: 20, h: 24, plant: true, fine: true, label: 'Folha larga', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      r(c, L[0], 9.5, 8, 1, 9); r(c, L[0], 5, 11, 5, .5); r(c, L[0], 10, 12, 5, .5);
      for (const [x, y, w, h] of [[5, 0, 10, 8], [0, 4, 9, 7], [11, 5, 9, 7], [3, 10, 7, 5], [11, 11, 6, 4.5]]) {
        leaf(c, L, x, y, w, h);
        r(c, L[0], x + 1.5, y + h / 2, w - 3, .5);              // midrib
        r(c, OUT, x + w - 2, y + 1.5, 2, .5); r(c, OUT, x, y + h - 2.5, 2, .5); // the cuts in the leaf
        if (w > 7) { r(c, OUT, x + w - 2.5, y + h - 2.5, 2.5, .5); r(c, OUT, x, y + 2, 2, .5); }
      }
      pot(c, 6, 16, 8, 8);
    },
  },
  cactus: {
    w: 10, h: 16, plant: true, fine: true, still: true, label: 'Cato', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      box(c, L[1], 6.5, 4, 3.5, 5); r(c, L[2], 7.5, 5, .5, 3);
      box(c, L[1], 2, 1, 6, 10); r(c, L[0], 4, 1.5, .5, 9); r(c, L[0], 6, 1.5, .5, 9); r(c, L[2], 3, 2, .5, 8);
      for (let y = 2; y < 10; y += 2) { r(c, CREAM, 3.5, y, .5, .5); r(c, CREAM, 5, y + 1, .5, .5); r(c, CREAM, 7, y, .5, .5); }
      r(c, OUT, 3.5, 0, 3, 1.5); r(c, dry ? '#a08a45' : '#e86a8a', 4, 0, 2, 1.5); r(c, '#f6e58d', 4.5, .5, 1, .5);
      pot(c, 1, 10, 8, 6);
    },
  },
  flowers: {
    w: 14, h: 16, plant: true, fine: true, label: 'Flores', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      for (const [x, y, w, h] of [[1, 5, 6, 5], [7, 5, 6, 5], [3, 7, 8, 4]]) leaf(c, L, x, y, w, h);
      const pink = dry ? '#9a7a55' : '#f08aa5', white = dry ? '#b8a888' : '#fff7e6';
      flower(c, pink, 3.5, 3.5); flower(c, white, 10, 2.5); flower(c, pink, 7, 5.5); flower(c, white, 6, 1.5);
      pot(c, 2, 10, 10, 6);
    },
  },

  // --- groups: one object on the map that holds several plants ---
  plant_group: {
    w: 32, h: 30, group: true, fine: true, label: 'Canto de plantas', draw(c, dry) {
      at(c, 9, 0, () => SPRITES.plant_tall.draw(c, dry));
      at(c, 0, 6, () => SPRITES.monstera.draw(c, dry));
      at(c, 18, 14, () => SPRITES.flowers.draw(c, dry));
      at(c, 10, 14, () => SPRITES.plant_small.draw(c, dry));
    },
  },
  plant_shelf: {
    w: 28, h: 46, group: true, fine: true, still: true, label: 'Estante de plantas', draw(c, dry) {
      box(c, WM, 0, 6, 3, 40); box(c, WM, 25, 6, 3, 40);
      for (const y of [15, 29, 43]) { box(c, WL, 0, y, 28, 3); r(c, '#c9925e', 1, y + .5, 26, .5); }
      at(c, 2, 0, () => SPRITES.plant_small.draw(c, dry)); at(c, 16, 0, () => SPRITES.cactus.draw(c, dry));
      at(c, 1, 14, () => SPRITES.flowers.draw(c, dry)); at(c, 15, 14, () => SPRITES.plant_small.draw(c, dry));
      at(c, 3, 28, () => SPRITES.cactus.draw(c, dry)); at(c, 13, 28, () => SPRITES.flowers.draw(c, dry));
    },
  },
  // --- sala (from photos): sofa wall is the back wall, TV wall is the cut-away front wall ---
  sofa_grey: { // dark grey corner sofa with the chaise on the right, throws and patterned cushions
    w: 60, h: 40, draw(c) {
      const D = '#3f424c', M = '#565a66', Lt = '#6c717e';
      box(c, D, 0, 0, 60, 11);
      box(c, D, 0, 6, 6, 19); box(c, D, 54, 6, 6, 19);
      box(c, M, 5, 9, 28, 16); box(c, M, 32, 9, 23, 30);
      r(c, Lt, 7, 11, 24, .5); r(c, Lt, 34, 11, 19, .5);
      // cream throw over the seat
      r(c, '#e9e2d2', 8, 14, 30, 9); r(c, '#d2c9b6', 8, 22, 30, 1);
      for (let x = 9; x < 38; x += 3) r(c, '#d2c9b6', x, 23, 1, 1.5);
      // cushions
      box(c, '#efe9dc', 12, 3, 10, 9); r(c, BLK, 14, 5, 5, .5); r(c, BLK, 14, 5, .5, 4); r(c, BLK, 16, 7, 4, .5); r(c, BLK, 19, 7, .5, 3);
      box(c, '#e6dfd0', 24, 6, 9, 8); for (let i = 0; i < 3; i++) { r(c, '#5a5560', 26 + i * 2, 8, 1, .5); r(c, '#5a5560', 25 + i * 2, 10, 1, .5); }
      box(c, '#e6dfd0', 38, 5, 9, 8); for (let i = 0; i < 3; i++) r(c, '#8a8590', 40, 7 + i * 2, 5, .5);
      // sage throw on the right arm, striped blanket on the chaise
      r(c, '#9fc0a8', 53, 8, 7, 15); r(c, '#86a890', 53, 22, 7, 1); r(c, '#b7d3bd', 54, 9, 5, .5);
      r(c, '#8d9098', 36, 26, 15, 9); for (let y = 27; y < 35; y += 2) r(c, '#e4e4e8', 36, y, 15, .5);
    },
  },
  rug_shag: {
    w: 72, h: 40, flat: true, fine: true, draw(c) {
      box(c, '#4a4b52', 0, 0, 72, 40);
      for (let i = 0; i < 520; i++) {
        const x = 1 + (i * 37 % 140) / 2, y = 1 + (i * 61 % 76) / 2;
        r(c, i % 3 ? '#5d5e66' : '#383940', x, y, .5, .5);
      }
    },
  },
  wall_shelves: { // two floating white shelves by the balcony window
    w: 20, h: 26, wall: true, draw(c) {
      box(c, STEEL, 9, 0, 7, 7); r(c, WHITE, 10.5, 1.5, 2, 1.5); r(c, '#8a8f9a', 12, 7, 1, 2);
      box(c, WHITE, 0, 9, 20, 3);
      r(c, '#e8a0a0', 4, 2, .5, 5); r(c, '#f0b8b0', 5.5, 1, .5, 6); r(c, '#e8a0a0', 7, 3, .5, 4);
      r(c, '#f0b8b0', 3, 2, 2, 1); r(c, '#f6cfc6', 5, .5, 2, 1); r(c, '#f0b8b0', 6.5, 2.5, 2, 1);
      box(c, '#d9c9b0', 4, 6, 4, 3.5);
      box(c, WHITE, 0, 21, 20, 3);
      box(c, '#3a3a44', 12, 16, 4, 5.5); r(c, CREAM, 13, 17, 2, 3);
    },
  },
  niche_shelves: { // recessed white shelves right of the sofa
    w: 20, h: 36, wall: true, draw(c) {
      box(c, '#c9ccd6', 0, 0, 20, 36);
      r(c, '#b4b8c4', 1, 1, 18, 34);
      for (const y of [10, 21, 32]) { r(c, OUT, 0, y - .5, 20, 3.5); r(c, WHITE, .5, y, 19, 2.5); }
      // top shelf: books (the pothos is its own object)
      r(c, CREAM, 1.5, 3, 1.5, 7); r(c, '#e8c53a', 3, 2.5, 2, 7.5); r(c, BLK, 3.5, 4, 1, 3);
      // middle: green jar, pink glass, books
      box(c, '#7c9a6a', 2, 16, 4, 5); r(c, '#a9c498', 3, 17, 1, 2);
      r(c, '#f0a6b8', 8, 15.5, 2.5, 2.5); r(c, '#f0a6b8', 9, 18, .5, 2.5); r(c, '#f0a6b8', 8, 20.5, 2.5, .5);
      r(c, WHITE, 12, 19, 6, 1); r(c, BLK, 12, 20, 6, 1); r(c, RED, 13, 18.5, 4, .5);
      // bottom: speaker and gift boxes
      box(c, BLK, 1.5, 27, 8, 5); r(c, GOLD, 3, 28.5, 5, .5); r(c, CREAM, 2.5, 30, 6, 1);
      box(c, '#c9605a', 11, 25, 7, 7); r(c, CREAM, 14, 25.5, 1, 6); r(c, CREAM, 11.5, 28, 6, 1);
    },
  },
  picture_elephant: {
    w: 11, h: 13, wall: true, draw(c) {
      box(c, '#3a2a22', 0, 0, 11, 13); r(c, '#e9dcc4', 1.5, 1.5, 8, 10);
      r(c, '#6b4a3a', 3, 4, 5, 4); r(c, '#6b4a3a', 2.5, 5, 1, 4); r(c, '#6b4a3a', 7, 6, 1, 4); r(c, WHITE, 4, 7.5, 1.5, .5);
    },
  },
  picture_antelope: {
    w: 11, h: 11, wall: true, draw(c) {
      box(c, '#3a2a22', 0, 0, 11, 11); r(c, '#e0b070', 1.5, 1.5, 8, 8);
      r(c, '#8a5a3a', 4, 5, 3, 4.5); r(c, BLK, 4, 2.5, .5, 3); r(c, BLK, 6, 2, .5, 3.5); r(c, '#f1e3c4', 4.5, 7.5, 2, 2);
    },
  },
  dining_table: { // dark table under a yellow tablecloth, fruit bowl and water bottle
    w: 30, h: 30, draw(c) {
      r(c, OUT, 2, 22, 3, 8); r(c, OUT, 25, 22, 3, 8); r(c, BLK2, 2.5, 22, 2, 7.5); r(c, BLK2, 25.5, 22, 2, 7.5);
      box(c, '#e3c55c', 0, 0, 30, 25);
      r(c, '#eed47a', 1, 1, 28, 17); r(c, '#c9a840', 1, 19, 28, .5);
      for (let x = 3; x < 28; x += 5) { r(c, '#f5e09a', x, 4, 2, .5); r(c, '#f5e09a', x + 2, 10, 2, .5); r(c, '#f5e09a', x, 15, 2, .5); }
      box(c, WM, 3, 9, 9, 6); r(c, WD, 4.5, 10.5, 6, 3); r(c, '#e88a3a', 6, 11, 2, 2);
      r(c, '#b9e0ee', 22, 9, 2.5, 6); r(c, '#3f6f9f', 22.5, 8, 1.5, 1.5); r(c, WHITE, 22, 11.5, 2.5, 1.5);
    },
  },
  chair_dark: { // seen from the front: backrest first, cream cushion below
    w: 12, h: 16, draw(c) {
      r(c, OUT, 1, 11, 2, 5); r(c, OUT, 9, 11, 2, 5);
      box(c, BLK, 1, 0, 10, 8); r(c, BLK2, 3, 2, 6, .5); r(c, BLK2, 3, 4, 6, .5);
      box(c, '#ece6d6', 0, 6, 12, 7); r(c, '#d6cfbc', 1, 11, 10, 1);
    },
  },
  chair_dark_b: { // seen from behind
    w: 12, h: 16, draw(c) {
      box(c, '#ece6d6', 0, 0, 12, 6);
      r(c, OUT, 1, 12, 2, 4); r(c, OUT, 9, 12, 2, 4);
      box(c, BLK, 1, 3, 10, 11); r(c, BLK2, 3, 5, 6, .5); r(c, BLK2, 3, 7, 6, .5); r(c, BLK2, 3, 9, 6, .5);
    },
  },
  chair_dark_l: { // sideways, backrest on the left
    w: 12, h: 17, draw(c) {
      r(c, OUT, 2, 12, 2, 5); r(c, OUT, 9, 12, 2, 5);
      box(c, '#ece6d6', 2, 6, 10, 7); r(c, '#d6cfbc', 3, 11, 8, 1);
      box(c, BLK, 0, 0, 4, 13); r(c, BLK2, 1, 2, 1, 9);
    },
  },
  chair_dark_r: {
    w: 12, h: 17, draw(c) {
      r(c, OUT, 1, 12, 2, 5); r(c, OUT, 8, 12, 2, 5);
      box(c, '#ece6d6', 0, 6, 10, 7); r(c, '#d6cfbc', 1, 11, 8, 1);
      box(c, BLK, 8, 0, 4, 13); r(c, BLK2, 10, 2, 1, 9);
    },
  },
  tv_south: { // low black unit and the wall TV, both on the cut-away front wall, so the TV shows its back
    w: 48, h: 23, draw(c) {
      box(c, BLK, 0, 0, 48, 14); r(c, BLK2, 1, 1, 46, 6);
      box(c, '#18151c', 4, 2.5, 16, 3); r(c, '#55506a', 6, 3.5, 1, 1); r(c, '#55506a', 9, 3.5, 1, 1); r(c, '#55506a', 12, 3.5, 1, 1);
      r(c, WHITE, 36, 2, 7, 4); r(c, '#8a8f9a', 37, 3, 5, .5); r(c, '#8a8f9a', 37, 4.5, 4, .5);
      box(c, '#1f1a28', 5, 8, 38, 15); r(c, '#33303c', 6, 9.5, 36, 12); r(c, '#45424e', 20, 13, 8, 5);
      r(c, '#8fc0e6', 6, 9, 36, .5);
    },
  },
  cabinet_black: { // tall black cabinet by the balcony door, seen from behind
    w: 20, h: 28, draw(c) {
      box(c, BLK, 0, 0, 20, 28); r(c, BLK2, 1, 1, 18, 5);
      r(c, STEEL, 3, 2, 7, 2); r(c, WHITE, 11, 1.5, 5, 3); r(c, '#33303c', 1, 7, 18, 20); r(c, BLK, 9.5, 7, 1, 20);
    },
  },
  beanbag: {
    w: 16, h: 11, draw(c) {
      box(c, '#d99a82', 0, 2, 16, 9); box(c, '#e6ab92', 2, 0, 11, 7); r(c, '#f2c4ae', 4, 1.5, 5, .5); r(c, '#b97a64', 2, 8.5, 12, 1);
    },
  },
  console_glass: { // black glass-door console: wooden face sculpture, photo frame
    w: 24, h: 18, draw(c) {
      box(c, BLK, 0, 5, 24, 13); r(c, BLK2, 1, 6, 22, 4);
      r(c, '#4a5560', 2, 11, 9, 6); r(c, '#4a5560', 13, 11, 9, 6); r(c, RED, 3, 13, 1, 4); r(c, CREAM, 5, 13, 1, 4); r(c, GOLD, 14, 14, 3, 3);
      box(c, '#c99a62', 15, 0, 5, 8); r(c, '#8a5a3a', 16.5, 2, .5, 1); r(c, '#8a5a3a', 18, 2, .5, 1); r(c, '#8a5a3a', 17, 5, 1, .5);
      box(c, BLK, 5, 2, 6, 6); r(c, '#9fc0a8', 6, 3, 4, 4);
    },
  },
  floor_lamp: { // brass pole, white drum shade
    w: 12, h: 34, glow: 'lamp', draw(c) {
      r(c, OUT, 5, 11, 2, 20); r(c, GOLD, 5.5, 11, 1, 20); box(c, GOLD, 2, 30, 8, 4);
      box(c, '#f4efe2', 0, 0, 12, 12); r(c, '#fffaf0', 2, 2, 8, 3);
    },
  },

  // --- varanda ---
  bistro_set: { // folding slatted table and two chairs, weathered grey wood
    w: 30, h: 22, draw(c) {
      const G1 = '#8f8b84', G2 = '#b3aea6';
      box(c, G1, 0, 4, 8, 9); for (let y = 5.5; y < 12; y += 2) r(c, G2, 1, y, 6, 1);
      r(c, OUT, 1, 13, 1.5, 6); r(c, OUT, 5.5, 13, 1.5, 6);
      box(c, G1, 22, 4, 8, 9); for (let y = 5.5; y < 12; y += 2) r(c, G2, 23, y, 6, 1);
      r(c, OUT, 23, 13, 1.5, 6); r(c, OUT, 27.5, 13, 1.5, 6);
      box(c, G1, 7, 0, 16, 13); for (let y = 1.5; y < 12; y += 2) r(c, G2, 8, y, 14, 1);
      r(c, OUT, 9, 13, 1.5, 9); r(c, OUT, 19.5, 13, 1.5, 9); r(c, OUT, 9, 17, 12, 1);
    },
  },

  // --- Rui's plants ---
  zz: { // ZZ plant in the white pot with a face
    w: 14, h: 20, plant: true, fine: true, label: 'Zamioculca', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      for (const [x0, y0, x1, y1] of [[7, 13, 10, 1], [6, 13, 2, 6], [7, 13, 6, 5]]) {
        for (let i = 0; i <= 6; i++) {
          const x = x0 + (x1 - x0) * i / 6, y = y0 + (y1 - y0) * i / 6;
          r(c, L[0], x, y, .5, 2);
          if (i > 0) { leaf(c, L, x - 2.5, y - .5, 2.5, 1.5); leaf(c, L, x + .5, y - 1, 2.5, 1.5); }
        }
      }
      box(c, WHITE, 3, 13, 8, 7); r(c, BLK, 5, 15.5, 1, .5); r(c, BLK, 8, 15.5, 1, .5); r(c, RED, 6.5, 17.5, 1, .5);
      r(c, '#cfd3da', 4, 14, 6, .5);
    },
  },
  calathea: { // striped oval leaves, green pot
    w: 18, h: 16, plant: true, fine: true, top: true, label: 'Folhas riscadas', draw(c, dry) {
      const L = dry ? LEAF.dry : ['#3f7a4f', '#a9c9a0', '#d3e6c9'];
      for (const [x, y, w, h] of [[5, 0, 8, 5], [0, 3, 8, 5], [10, 3, 8, 5], [2, 7, 7, 4], [9, 7, 7, 4], [5, 4, 8, 5]]) {
        leaf(c, L, x, y, w, h);
        for (let k = 1.5; k < w - 1; k += 1.5) r(c, L[0], x + k, y + 1, .5, h - 2);
        r(c, L[0], x + 1, y + h / 2 - .25, w - 2, .5);
      }
      box(c, '#6f9a6a', 6, 10, 6, 6); r(c, '#8fba8a', 7, 11, 1, 3);
    },
  },
  pothos: { // trailing from a shelf, yellow-variegated
    w: 16, h: 17, plant: true, fine: true, wall: true, top: true, label: 'Pendente', draw(c, dry) {
      const L = dry ? LEAF.dry : [GD, GM, '#d9e07a'];
      box(c, '#c9b47a', 5, 4, 7, 6); r(c, '#ddc98f', 6, 5, 1, 3); r(c, BLK, 4.5, 9.5, 8, 1);
      for (const [x, y, w, h] of [[4, 0, 4, 3.5], [8, 0, 4, 3], [11, 1, 4, 3.5], [1, 2, 4, 3.5], [6, 2, 4, 3]]) leaf(c, L, x, y, w, h);
      r(c, L[0], 3, 6, .5, 8); r(c, L[0], 13.5, 5, .5, 6);
      for (const [x, y] of [[1, 7], [3.5, 9.5], [.5, 12], [3, 14], [11.5, 6.5], [13.5, 9]]) leaf(c, L, x, y, 3, 2.5);
    },
  },
  fatsia: { // big hand-shaped leaves, pot on an iron stand
    w: 20, h: 26, plant: true, fine: true, label: 'Folha de mão', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      r(c, L[0], 9.5, 8, 1, 9);
      for (const [x, y] of [[6, 0], [0, 4], [12, 4], [3, 9], [10, 10]]) {
        leaf(c, L, x + 1, y + 1, 6, 5);
        leaf(c, L, x, y + 2, 3, 2.5); leaf(c, L, x + 5, y + 2, 3, 2.5); leaf(c, L, x + 2.5, y, 3, 2.5);
        r(c, L[0], x + 3.5, y + 2, .5, 3.5);
      }
      box(c, '#e6d9d0', 6, 16, 8, 5); r(c, WHITE, 7, 17, 1, 2);
      r(c, BLK, 4, 20.5, 12, 1); r(c, BLK, 5, 21, 1, 5); r(c, BLK, 14, 21, 1, 5); r(c, BLK, 3.5, 25, 2, 1); r(c, BLK, 14.5, 25, 2, 1);
    },
  },
  rail_planter: { // grey window box: snake plant and stonecrop
    w: 20, h: 13, plant: true, fine: true, still: true, label: 'Floreira', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      for (const [x, h] of [[9, 7], [11, 8.5], [13, 6.5], [15, 8], [7.5, 5]]) { r(c, OUT, x - .5, 8 - h, 2, h); r(c, L[1], x, 8.5 - h, 1, h); r(c, L[2], x, 8.5 - h, .5, h - 1); }
      for (const [x, y] of [[1, 4.5], [3.5, 3.5], [5, 5]]) leaf(c, L, x, y, 3, 3);
      box(c, '#6f7480', 0, 7, 20, 6); r(c, '#8a8f9a', 1, 8, 18, 1);
    },
  },

  // --- Rui's plant groups ---
  plant_tables: { // three round grey side tables by the balcony window, plus the low white shelf
    w: 44, h: 40, group: true, fine: true, label: 'Mesas de plantas', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      const tableTop = (x, y, w) => {
        r(c, WL, x + 2, y + 3, 1.5, 9); r(c, WL, x + w - 3.5, y + 3, 1.5, 9); r(c, WM, x + w / 2 - .5, y + 3, 1.5, 7);
        box(c, '#6a6d78', x, y, w, 4.5); r(c, '#8a8d98', x + 1.5, y + 1, w - 3, 1);
      };
      const darkPot = (x, y, w, h) => { box(c, '#2f2c36', x, y, w, h); r(c, '#4a4654', x + 1, y + 1, w - 2, .5); };
      // back table: parlour palm and the tall euphorbia
      tableTop(22, 17, 14);
      for (let i = -3; i <= 3; i++) {
        const x = 26 + i * 1.6, top = 2 + Math.abs(i) * 1.5;
        r(c, L[0], 26 + i * .5, 9, .5, 6);
        for (let y = top; y < 11; y += 1.5) { r(c, L[1], x - 1, y + Math.abs(i) * .3, 2.5, .5); r(c, L[2], x - .5, y + Math.abs(i) * .3, 1, .5); }
      }
      darkPot(23.5, 12, 6, 5.5);
      r(c, OUT, 31.5, 3, 3, 14); r(c, L[1], 32, 3.5, 2, 13.5); r(c, L[2], 32, 4, .5, 12);
      r(c, OUT, 34, 6, 2.5, 5); r(c, L[1], 34.5, 6.5, 1.5, 4); r(c, OUT, 29.5, 8, 2.5, 4); r(c, L[1], 30, 8.5, 1.5, 3);
      darkPot(31, 14, 4.5, 3.5);
      // low white shelf with the succulent in a wicker pot
      box(c, WHITE, 34, 22, 10, 10); r(c, KS, 35, 26, 8, .5);
      for (const [x, y] of [[36, 15], [38.5, 14], [40.5, 15.5], [37.5, 16.5]]) leaf(c, L, x, y, 3, 2.5);
      box(c, '#d9c39a', 36, 18, 7, 5); r(c, '#b89a6a', 37, 20, 5, .5);
      // middle table: dracaena in a white pot, peace lily in a ribbed dark pot
      tableTop(8, 24, 18);
      for (const [x, y, w] of [[9, 13, 6], [13, 11, 6], [8, 16, 5], [14, 15, 6], [11, 9, 4]]) { leaf(c, L, x, y, w, 2); r(c, L[0], x + 1, y + .75, w - 2, .5); }
      r(c, L[0], 12.5, 12, .5, 8);
      box(c, WHITE, 9.5, 19, 6, 6);
      for (const [x, y] of [[17, 15], [20, 14], [22.5, 16], [18.5, 17.5], [21, 18]]) leaf(c, L, x, y, 3.5, 3);
      darkPot(18, 20, 6, 5.5); r(c, '#4a4654', 19.5, 21.5, .5, 3); r(c, '#4a4654', 21.5, 21.5, .5, 3);
      // front table: the zebra-stemmed alocasia and a young plant in terracotta
      tableTop(0, 29, 14);
      r(c, OUT, 5, 19, 1.5, 8); r(c, '#c9c0a0', 5.25, 19, 1, 8); for (let y = 20; y < 27; y += 2) r(c, '#4a4030', 5.25, y, 1, .5);
      leaf(c, L, 0, 17, 6, 3); r(c, L[0], 1, 18.25, 4, .5);
      darkPot(2.5, 24.5, 7, 5.5);
      pot(c, 9, 25, 5, 5); leaf(c, L, 9.5, 22.5, 2.5, 2.5); leaf(c, L, 11.5, 23, 2.5, 2.5);
    },
  },
  balcony_pots: { // dark trough and white pot with canes, small shrub in a brown pot
    w: 30, h: 22, group: true, fine: true, label: 'Vasos da varanda', draw(c, dry) {
      const L = dry ? LEAF.dry : LEAF.ok;
      for (const [x, y, h] of [[13, 1, 13], [16, 0, 14], [21, 3, 12], [25, 2, 13], [27.5, 5, 10]]) r(c, '#c9a070', x, y, .5, h);
      r(c, '#c9a070', 12, 4, 6, .5);
      box(c, '#3a3d46', 16, 13, 14, 9); r(c, '#5a4a3a', 17, 14, 12, 2); r(c, '#55586a', 17, 16.5, 12, .5);
      box(c, '#e9e9ec', 9, 11, 8, 10); r(c, '#5a4a3a', 10, 12, 6, 1.5); r(c, WHITE, 10, 14, 1, 5);
      r(c, WD, 3.5, 9, .5, 6);
      for (const [x, y] of [[1, 6], [4, 5], [0, 9], [4.5, 8.5], [2, 11], [5.5, 11.5]]) leaf(c, L, x, y, 3, 2);
      box(c, '#7a5540', 1, 15, 7, 6); r(c, '#96705a', 2, 16, 5, .5);
    },
  },
};

export const S = 2; // real pixels per art unit: sprites can use half-unit detail

// Half-pixel bevel: lighten the top/left rim and darken the bottom/right rim of every shape.
function bevel(g, w, h) {
  const img = g.getImageData(0, 0, w, h), d = img.data, src = new Uint8ClampedArray(d);
  const edge = i => i < 0 || src[i + 3] === 0 || (src[i] === 42 && src[i + 1] === 32 && src[i + 2] === 48);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (src[i + 3] !== 255 || edge(i)) continue;
    let k = 0;
    if (edge(y > 0 ? i - w * 4 : -1)) k += 24; else if (edge(x > 0 ? i - 4 : -1)) k += 12;
    if (edge(y < h - 1 ? i + w * 4 : -1)) k -= 30; else if (edge(x < w - 1 ? i + 4 : -1)) k -= 16;
    if (k) for (let ch = 0; ch < 3; ch++) d[i + ch] = src[i + ch] + k;
  }
  g.putImageData(img, 0, 0);
}

const cache = new Map();
export function spriteCanvas(type, dry = false, frame = 0) {
  const key = `${type}|${dry}|${frame}`;
  if (!cache.has(key)) {
    const s = SPRITES[type];
    const cv = document.createElement('canvas');
    cv.width = s.w * S; cv.height = s.h * S;
    const g = cv.getContext('2d');
    g.scale(S, S);
    s.draw(g, dry, s.w, s.h, frame);
    if (!s.fine) bevel(g, cv.width, cv.height);
    cache.set(key, cv);
  }
  return cache.get(key);
}

export function drawBubble(c, x, y) {
  box(c, WHITE, x, y, 10, 11);
  r(c, OUT, x + 4, y + 11, 2, 1);
  r(c, '#4a9fe0', x + 4, y + 2, 2, 2); r(c, '#4a9fe0', x + 3, y + 4, 4, 4);
  r(c, '#b9e0ee', x + 4, y + 5, 1, 1);
}

export function drawSelection(c, x, y, w, h) {
  const col = '#fff3c9', x0 = x - 2, y0 = y - 2, x1 = x + w + 1, y1 = y + h + 1;
  for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    r(c, col, dx > 0 ? cx : cx - 3, cy, 4, 1);
    r(c, col, cx, dy > 0 ? cy : cy - 3, 1, 4);
  }
}

// ---------- map tiles ----------
function wood(c, tx, ty) {
  const x = tx * T, y = ty * T;
  r(c, '#b9773f', x, y, T, T);
  for (let i = 0; i < 4; i++) {
    const row = ty * 4 + i, py = y + i * 4;
    for (let p = 0; p < T; p++) {
      const g = x + p + row * 10, plank = Math.floor(g / 24) + row * 7;
      if (plank % 3 === 0) r(c, 'rgba(255,225,170,.10)', x + p, py, 1, 3.5);
      else if (plank % 5 === 0) r(c, 'rgba(60,25,10,.08)', x + p, py, 1, 3.5);
      if (g % 24 === 0) { r(c, '#8f552c', x + p, py, .5, 3.5); r(c, 'rgba(255,230,180,.18)', x + p + .5, py, .5, 3.5); }
      if ((g * 7 + row * 13) % 19 === 0) r(c, 'rgba(90,45,20,.22)', x + p, py + 1 + (row % 2), 2.5, .5);
      if ((g * 5 + row * 11) % 37 === 0) r(c, 'rgba(255,235,190,.20)', x + p, py + 2 - (row % 2), 2, .5);
    }
    r(c, '#8f552c', x, py + 3.5, T, .5);
    r(c, 'rgba(255,230,180,.14)', x, py, T, .5);
  }
}

function brick(c, tx, ty) {
  const x = tx * T, y = ty * T;
  r(c, '#6b3740', x, y, T, T);
  for (let i = 0; i < 4; i++) {
    const row = ty * 4 + i, off = (row % 2) * 4, py = y + i * 4;
    for (let p = 0; p < T; p++) {
      const g = x + p + off, w = g % 8 === 7 ? .5 : 1;
      const n = (Math.floor(g / 8) * 31 + row * 17) % 11;
      r(c, n === 0 || n === 4 ? '#9c5a50' : n === 7 ? '#74403f' : n === 9 ? '#95524a' : '#8a4a48', x + p, py, w, 3.5);
      r(c, 'rgba(255,210,190,.16)', x + p, py, w, .5);
      r(c, 'rgba(30,10,30,.18)', x + p, py + 3, w, .5);
    }
  }
}

// Dark grey wood-look floor tile (bathrooms).
function greyPlank(c, tx, ty) {
  const x = tx * T, y = ty * T;
  r(c, '#5c6068', x, y, T, T);
  for (let i = 0; i < 4; i++) {
    const row = ty * 4 + i, py = y + i * 4;
    for (let p = 0; p < T; p++) {
      const g = x + p + row * 9;
      if ((Math.floor(g / 32) + row) % 2) r(c, 'rgba(255,255,255,.05)', x + p, py, 1, 3.5);
      if (g % 32 === 0) r(c, '#40444b', x + p, py, .5, 3.5);
      if ((g * 7 + row * 5) % 23 === 0) r(c, 'rgba(255,255,255,.10)', x + p, py + 1 + (row % 2), 3, .5);
      if ((g * 3 + row * 11) % 29 === 0) r(c, 'rgba(0,0,0,.16)', x + p, py + 2, 2.5, .5);
    }
    r(c, '#40444b', x, py + 3.5, T, .5);
  }
}

// Dark slate floor tile (kitchen, laundry).
function slate(c, tx, ty) {
  const x = tx * T, y = ty * T;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const bx = tx * 2 + i, by = ty * 2 + j, px = x + i * 8, py = y + j * 8, n = (bx * 7 + by * 13) % 5;
    r(c, ['#34373d', '#2f3238', '#383b42', '#313439', '#363940'][n], px, py, 8, 8);
    r(c, 'rgba(255,255,255,.07)', px + .5, py + .5, 7, .5);
    r(c, 'rgba(255,255,255,.05)', px + 2 + n, py + 3, 2.5, .5);
    r(c, '#1d1f24', px + 7.5, py, .5, 8); r(c, '#1d1f24', px, py + 7.5, 8, .5);
  }
}

export function drawMap(c, map) {
  const at = (x, y) => (map[y] && map[y][x]) || ' ';
  const isWall = ch => 'BdGLC'.includes(ch);
  const near = (x, y) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(x + dx, y + dy) !== ' ') return true;
    return false;
  };
  const outdoor = [];
  // An empty tile is the top of a wall when it touches a room, or when it sits
  // between two rooms in its row or column (fills enclosed gaps). The rest is outside.
  const solid = (x, y) => at(x, y) !== ' ';
  const between = (x, y) => {
    let l = false, rr = false, u = false, d = false;
    for (let i = 0; i < map[0].length; i++) { if (solid(i, y)) { if (i < x) l = true; else if (i > x) rr = true; } }
    for (let j = 0; j < map.length; j++) { if (solid(x, j)) { if (j < y) u = true; else if (j > y) d = true; } }
    return (l && rr) || (u && d);
  };
  const wallTop = (x, y) => y >= 0 && y < map.length && x >= 0 && x < map[0].length
    && at(x, y) === ' ' && (near(x, y) || between(x, y) || (at(x, y - 1) === ' ' && between(x, y - 1)));

  r(c, '#15111b', 0, 0, map[0].length * T, map.length * T);
  for (let ty = 0; ty < map.length; ty++) {
    for (let tx = 0; tx < map[ty].length; tx++) {
      const ch = at(tx, ty), x = tx * T, y = ty * T;
      if (ch === ' ') {
        if (wallTop(tx, ty)) { // top of a wall, seen from above
          r(c, '#2f2536', x, y, T, T);
          if (at(tx, ty - 1) === ' ' && !wallTop(tx, ty - 1)) r(c, '#4a3d52', x, y, T, 1);
          const up = at(tx, ty - 1);
          if (up !== ' ' && !isWall(up)) r(c, '#1f1826', x, y, T, 2);
        } else outdoor.push([tx, ty]);
        continue;
      }
      if (ch === 'w') wood(c, tx, ty);
      else if (ch === 'k') {
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          r(c, (tx * 2 + i + ty * 2 + j) % 2 ? '#f1ead8' : '#3a3347', x + i * 8, y + j * 8, 8, 8);
        }
      } else if (ch === 't') {
        r(c, '#a9d0c9', x, y, T, T);
        r(c, '#8dbab3', x, y + 7, T, 1); r(c, '#8dbab3', x, y + 15, T, 1);
        r(c, '#8dbab3', x + 7, y, 1, T); r(c, '#8dbab3', x + 15, y, 1, T);
      } else if (ch === 'v') {
        outdoor.push([tx, ty]);
        r(c, '#9a94a0', x, y, T, T);
        r(c, '#7f7988', x, y + 7, T, 1); r(c, '#7f7988', x, y + 15, T, 1);
        r(c, '#7f7988', x + ((ty % 2) ? 3 : 11), y, 1, 7); r(c, '#7f7988', x + ((ty % 2) ? 11 : 3), y + 8, 1, 7);
      } else if (ch === 'p') { // basket-weave parquet: blocks of four strips
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          const bx = tx * 2 + i, by = ty * 2 + j, px = x + i * 8, py = y + j * 8, hz = (bx + by) % 2;
          for (let k = 0; k < 4; k++) {
            const tone = ['#c98a45', '#d39650', '#bf8040', '#cc8f4a'][(bx * 3 + by * 5 + k * 7) % 4];
            if (hz) { r(c, tone, px, py + k * 2, 8, 2); r(c, 'rgba(90,50,20,.35)', px, py + k * 2 + 1.5, 8, .5); }
            else { r(c, tone, px + k * 2, py, 2, 8); r(c, 'rgba(90,50,20,.35)', px + k * 2 + 1.5, py, .5, 8); }
          }
          r(c, 'rgba(70,35,15,.45)', px + 7.5, py, .5, 8); r(c, 'rgba(70,35,15,.45)', px, py + 7.5, 8, .5);
        }
      } else if (ch === 'g') {
        greyPlank(c, tx, ty);
      } else if (ch === 'S') {
        slate(c, tx, ty);
      } else if (ch === 'L' || ch === 'C') { // tiled walls: large light-grey tiles, or small cream ones
        const big = ch === 'L', step = big ? 8 : 4;
        r(c, big ? '#cfd2d6' : '#e6dcc6', x, y, T, T);
        for (let q = step - .5; q < T; q += step) r(c, big ? '#b2b6bd' : '#cdc2a8', x, y + q, T, .5);
        for (let q = (big ? 16 : 4) - .5; q < T; q += big ? 16 : 4) r(c, big ? '#b2b6bd' : '#cdc2a8', x + q, y, .5, T);
        for (let q = 0; q < T; q += step) r(c, 'rgba(255,255,255,.35)', x, y + q, T, .5);
        if (big && (tx + ty) % 3 === 0) r(c, 'rgba(255,255,255,.55)', x + 5, y + 3, 1.5, 1);
        if (!isWall(at(tx, ty - 1))) { r(c, OUT, x, y, T, 2); r(c, '#f4f5f7', x, y + 2, T, 1); }
        if (!isWall(at(tx, ty + 1))) r(c, 'rgba(40,40,50,.35)', x, y + 15, T, 1);
      } else if (ch === 'G') { // painted light-grey wall
        r(c, '#d5d8de', x, y, T, T);
        if (!isWall(at(tx, ty - 1))) { r(c, OUT, x, y, T, 2); r(c, '#eceef2', x, y + 2, T, 2); }
        if (!isWall(at(tx, ty + 1))) { r(c, '#bfc3cb', x, y + 11, T, 2); r(c, WHITE, x, y + 13, T, 3); }
      } else if (ch === 'B') {
        brick(c, tx, ty);
        if (!isWall(at(tx, ty - 1))) { r(c, OUT, x, y, T, 2); r(c, '#a86a5a', x, y + 2, T, 1); }
        if (!isWall(at(tx, ty + 1))) r(c, '#4a2a38', x, y + 13, T, 3);
      } else if (ch === 'd') {
        wood(c, tx, ty);
        r(c, at(tx, ty + 1) === 'd' ? 'rgba(20,10,25,.6)' : 'rgba(20,10,25,.3)', x, y, T, T);
        if (at(tx - 1, ty) === 'B') r(c, WD, x, y, 2, T);
        if (at(tx + 1, ty) === 'B') r(c, WD, x + 14, y, 2, T);
        if (!isWall(at(tx, ty - 1))) r(c, OUT, x, y, T, 2);
      }
      if (!isWall(ch)) {
        if (isWall(at(tx, ty - 1))) r(c, 'rgba(0,0,0,.2)', x, y, T, 3);
        if (at(tx - 1, ty) === ' ') r(c, 'rgba(0,0,0,.12)', x, y, 2, T);
        if (at(tx + 1, ty) === ' ') r(c, 'rgba(255,235,200,.07)', x + 14, y, 2, T);
        if (at(tx, ty - 1) === ' ' && at(tx, ty + 1) === ' ') { // doorway through a side wall
          r(c, 'rgba(0,0,0,.3)', x, y, T, 4); r(c, WD, x, y + T - 1, T, 1);
        }
        if (ch === 'v' && at(tx - 1, ty) === ' ') { // balcony railing
          r(c, STEEL, x, y, 2, T); r(c, '#8a8f9a', x + 2, y, 1, T); r(c, OUT, x, y, 3, 1);
        }
      }
    }
  }
  return outdoor;
}
