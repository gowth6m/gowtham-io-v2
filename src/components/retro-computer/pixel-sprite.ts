// Pixel-art retro computer, drawn at a very low native resolution on a tiny
// canvas and scaled up with `image-rendering: pixelated`. Shapes are rasterised
// with rounded corners and a slanted keyboard so it reads as hand-drawn pixels.
// Colours come from the site palette.

export const SPRITE_W = 52;
export const SPRITE_H = 51;

export const SCREEN_COLS = 5;
export const SCREEN_ROWS = 3;

const NAVY_DARK = '#020c1b';
const NAVY = '#0a192f';
const NAVY_LIGHT = '#112240';
const NAVY_LIGHTEST = '#233554';
const SLATE = '#8892b0';

export type SpriteState = {
  color: string; // outline / phosphor colour
  lines: string[]; // screen text, max SCREEN_ROWS x SCREEN_COLS
  cursor: boolean;
  hover: boolean;
  bob: number; // 0 or 1 px lift of the monitor
  led: boolean;
  pressedKey: number; // -1 for none
};

// 3x5 pixel font. Each glyph is 5 rows of 3 bits.
const FONT: Record<string, string> = {
  A: '010101111101101',
  B: '110101110101110',
  C: '011100100100011',
  D: '110101101101110',
  E: '111100110100111',
  F: '111100110100100',
  G: '011100101101011',
  H: '101101111101101',
  I: '111010010010111',
  J: '001001001101010',
  K: '101101110101101',
  L: '100100100100111',
  M: '111111101101101',
  N: '110101101101101',
  O: '010101101101010',
  P: '110101110100100',
  Q: '010101101110011',
  R: '110101110101101',
  S: '011100010001110',
  T: '111010010010010',
  U: '101101101101111',
  V: '101101101101010',
  W: '101101101111101',
  X: '101101010101101',
  Y: '101101010010010',
  Z: '111001010100111',
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '110001010100111',
  '3': '110001010001110',
  '4': '101101111001001',
  '5': '111100110001110',
  '6': '011100111101111',
  '7': '111001010010010',
  '8': '111101111101111',
  '9': '111101111001110',
  '.': '000000000000010',
  ',': '000000000010100',
  ':': '000010000010000',
  '!': '010010010000010',
  '?': '110001010000010',
  '-': '000000111000000',
  _: '000000000000111',
  '>': '100010001010100',
  '<': '001010100010001',
  '/': '001001010100100',
  $: '011110010011110',
  '@': '010101111100011',
  "'": '010010000000000',
  '(': '010100100100010',
  ')': '010001001001010',
  '#': '101111101111101',
  '*': '000101010101000',
  '=': '000111000111000',
  '+': '000010111010000',
  '&': '010101010101011',
  '[': '110100100100110',
  ']': '011001001001011',
  '|': '010010010010010',
};

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, c: string, w = 1, h = 1) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

/** Is (x, y) inside a w x h rect with pixel-rounded corners of radius r? */
function inRound(x: number, y: number, w: number, h: number, r: number) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  const cx = x < r ? r - 0.5 : x >= w - r ? w - r - 0.5 : x;
  const cy = y < r ? r - 0.5 : y >= h - r ? h - r - 0.5 : y;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Rounded box with a 1px outline. `shade` adds a dithered darker band on the
 * right/bottom edge so the shape has some volume.
 */
function roundBox(
  ctx: Ctx,
  x0: number,
  y0: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  outline: string,
  shade?: string
) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inRound(x, y, w, h, r)) continue;
      const edge =
        !inRound(x - 1, y, w, h, r) ||
        !inRound(x + 1, y, w, h, r) ||
        !inRound(x, y - 1, w, h, r) ||
        !inRound(x, y + 1, w, h, r);
      let c = fill;
      if (edge) c = outline;
      else if (shade && (x >= w - 4 || y >= h - 3) && (x + y) % 2 === 0) c = shade;
      else if (shade && (x >= w - 2 || y >= h - 2)) c = shade;
      px(ctx, x0 + x, y0 + y, c);
    }
  }
}

function glyph(ctx: Ctx, ch: string, x: number, y: number) {
  const g = FONT[ch];
  if (!g) return;
  for (let i = 0; i < 15; i++) {
    if (g[i] === '1') ctx.fillRect(x + (i % 3), y + Math.floor(i / 3), 1, 1);
  }
}

// Keyboard: slanted (each row shifts left), keys are single pixels.
const KB_ROWS = [
  { y: 1, x: 3, n: 14 },
  { y: 3, x: 4, n: 13 },
];
export const KEY_COUNT = KB_ROWS.reduce((n, r) => n + r.n, 0);

export function drawSprite(ctx: Ctx, s: SpriteState) {
  const OUT = s.color;
  ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);

  // ground shadow
  px(ctx, 4, 50, NAVY_DARK, 46, 1);

  // --- desktop case ---------------------------------------------
  roundBox(ctx, 3, 33, 44, 8, 2, NAVY_LIGHT, OUT, NAVY);
  px(ctx, 6, 36, s.led ? OUT : NAVY_LIGHTEST, 2, 1); // power LED
  px(ctx, 10, 35, NAVY_LIGHTEST, 6, 1); // vents
  px(ctx, 10, 37, NAVY_LIGHTEST, 6, 1);
  px(ctx, 29, 36, NAVY_DARK, 12, 1); // floppy slot
  px(ctx, 29, 37, NAVY_LIGHTEST, 12, 1);
  px(ctx, 39, 38, SLATE, 2, 1);

  // --- monitor (bobs 1px) ---------------------------------------
  const oy = -s.bob;
  // stand
  roundBox(ctx, 19, 29 + oy, 12, 5 - oy, 1, NAVY, OUT);
  // CRT back, peeking out on the right
  roundBox(ctx, 33, 6 + oy, 11, 20, 5, NAVY, OUT);
  // front
  roundBox(ctx, 6, 1 + oy, 34, 30, 5, NAVY_LIGHT, OUT, NAVY);
  px(ctx, 9, 3 + oy, NAVY_LIGHTEST, 24, 1); // top highlight
  px(ctx, 8, 5 + oy, NAVY_LIGHTEST, 1, 16);

  // screen
  roundBox(ctx, 10, 5 + oy, 26, 19, 4, NAVY_DARK, NAVY_LIGHTEST);
  if (s.hover) {
    ctx.globalAlpha = 0.14;
    for (let y = 1; y < 18; y++)
      for (let x = 1; x < 25; x++) if (inRound(x, y, 26, 19, 4)) px(ctx, 10 + x, 5 + oy + y, OUT);
    ctx.globalAlpha = 1;
  }
  // glare
  px(ctx, 13, 7 + oy, NAVY_LIGHTEST, 2, 1);
  px(ctx, 12, 8 + oy, NAVY_LIGHTEST, 1, 2);

  // text
  ctx.fillStyle = OUT;
  const rows = s.lines.slice(-SCREEN_ROWS);
  rows.forEach((line, r) => {
    const text = line.toUpperCase().slice(0, SCREEN_COLS);
    for (let c = 0; c < text.length; c++) glyph(ctx, text[c], 13 + c * 4, 8 + r * 6 + oy);
  });
  if (s.cursor) {
    const r = Math.max(0, rows.length - 1);
    const len = Math.min(SCREEN_COLS - 1, (rows[r] ?? '').length);
    px(ctx, 13 + len * 4, 8 + r * 6 + oy, OUT, 3, 5);
  }

  // chin: badge + knob
  px(ctx, 11, 26 + oy, OUT, 4, 1);
  px(ctx, 33, 26 + oy, OUT, 2, 1);
  px(ctx, 33, 27 + oy, NAVY_LIGHTEST, 2, 1);

  // --- keyboard (slanted) ---------------------------------------
  const kx = 5;
  const ky = 43;
  const KH = 7;
  const KW = 33;
  for (let y = 0; y < KH; y++) {
    const x0 = kx + Math.floor((KH - 1 - y) / 2); // top rows sit further right
    for (let x = 0; x < KW; x++) {
      const edge = y === 0 || y === KH - 1 || x === 0 || x === KW - 1;
      px(ctx, x0 + x, ky + y, edge ? OUT : y >= KH - 2 ? NAVY : NAVY_LIGHT);
    }
  }
  let k = 0;
  for (const row of KB_ROWS) {
    const x0 = kx + Math.floor((KH - 1 - row.y) / 2);
    for (let i = 0; i < row.n; i++, k++) {
      const pressed = k === s.pressedKey;
      px(ctx, x0 + row.x + i * 2, ky + row.y, pressed ? OUT : NAVY_LIGHTEST);
    }
  }
  // space bar
  const sx = kx + Math.floor((KH - 1 - 5) / 2);
  px(ctx, sx + 9, ky + 5, NAVY_LIGHTEST, 14, 1);

  // --- mouse + cord ---------------------------------------------
  roundBox(ctx, 42, 44, 6, 6, 2, NAVY_LIGHT, OUT, NAVY);
  px(ctx, 44, 45, NAVY_LIGHTEST, 2, 1);
  px(ctx, 45, 41, OUT, 1, 3);
}
