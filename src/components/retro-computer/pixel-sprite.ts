// Pixel-art retro computer, drawn at native resolution on a tiny canvas and
// scaled up with `image-rendering: pixelated`. Colours come from the site palette.

export const SPRITE_W = 88;
export const SPRITE_H = 78;

export const SCREEN_COLS = 11;
export const SCREEN_ROWS = 5;

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

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string
) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

/** Filled box with a 1px outline. */
function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  outline: string
) {
  rect(ctx, x, y, w, h, outline);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, fill);
}

function glyph(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number) {
  const g = FONT[ch];
  if (!g) return;
  for (let i = 0; i < 15; i++) {
    if (g[i] === '1') ctx.fillRect(x + (i % 3), y + Math.floor(i / 3), 1, 1);
  }
}

// Keyboard key layout: [x, y, w] relative to the keyboard origin.
const KEYS: [number, number, number][] = [];
for (let i = 0; i < 14; i++) KEYS.push([4 + i * 4, 2, 3]);
for (let i = 0; i < 13; i++) KEYS.push([6 + i * 4, 4, 3]);
KEYS.push([16, 6, 30]); // space bar
export const KEY_COUNT = KEYS.length;

export function drawSprite(ctx: CanvasRenderingContext2D, s: SpriteState) {
  const OUT = s.color;
  ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);

  // Ground shadow
  ctx.globalAlpha = 0.5;
  rect(ctx, 6, 76, 76, 1, NAVY_DARK);
  ctx.globalAlpha = 1;

  // --- desktop unit ---------------------------------------------
  box(ctx, 8, 54, 72, 11, NAVY_LIGHT, OUT);
  rect(ctx, 9, 55, 70, 1, NAVY_LIGHTEST); // top highlight
  // vents
  for (let i = 0; i < 3; i++) rect(ctx, 18, 57 + i * 2, 12, 1, NAVY_LIGHTEST);
  // floppy drive
  box(ctx, 48, 57, 26, 5, NAVY, NAVY_LIGHTEST);
  rect(ctx, 51, 59, 18, 1, NAVY_DARK);
  rect(ctx, 70, 60, 2, 1, SLATE);
  // power LED
  rect(ctx, 12, 58, 2, 1, s.led ? OUT : NAVY_LIGHTEST);

  // --- monitor (bobs 1px) ---------------------------------------
  const oy = -s.bob;
  // neck
  box(ctx, 34, 49 + oy, 20, 6 - oy, NAVY_LIGHT, OUT);
  // body
  box(ctx, 14, 3 + oy, 60, 47, NAVY_LIGHT, OUT);
  rect(ctx, 15, 4 + oy, 58, 1, NAVY_LIGHTEST); // highlight
  rect(ctx, 15, 4 + oy, 1, 45, NAVY_LIGHTEST);
  // screen bezel + glass
  box(ctx, 19, 8 + oy, 50, 34, NAVY_DARK, NAVY_LIGHTEST);
  if (s.hover) {
    ctx.globalAlpha = 0.12;
    rect(ctx, 20, 9 + oy, 48, 32, OUT);
    ctx.globalAlpha = 1;
  }
  // corner glints
  rect(ctx, 21, 10 + oy, 2, 1, NAVY_LIGHTEST);
  rect(ctx, 21, 11 + oy, 1, 1, NAVY_LIGHTEST);

  // text
  ctx.fillStyle = OUT;
  const rows = s.lines.slice(-SCREEN_ROWS);
  rows.forEach((line, r) => {
    const text = line.toUpperCase().slice(0, SCREEN_COLS);
    for (let c = 0; c < text.length; c++) glyph(ctx, text[c], 22 + c * 4, 12 + r * 6 + oy);
  });
  if (s.cursor) {
    const r = Math.max(0, rows.length - 1);
    const len = Math.min(SCREEN_COLS - 1, (rows[r] ?? '').length);
    rect(ctx, 22 + len * 4, 12 + r * 6 + oy, 3, 5, OUT);
  }

  // scanlines over the glass
  ctx.globalAlpha = 0.18;
  for (let y = 10; y < 41; y += 2) rect(ctx, 20, y + oy, 48, 1, NAVY_DARK);
  ctx.globalAlpha = 1;

  // chin: badge + knob
  rect(ctx, 20, 45 + oy, 8, 1, OUT);
  rect(ctx, 20, 46 + oy, 8, 1, NAVY_LIGHTEST);
  box(ctx, 64, 44 + oy, 4, 3, NAVY_LIGHTEST, OUT);

  // --- keyboard -------------------------------------------------
  const kx = 12;
  const ky = 66;
  box(ctx, kx, ky, 64, 10, NAVY_LIGHT, OUT);
  KEYS.forEach(([x, y, w], i) => {
    rect(
      ctx,
      kx + x,
      ky + y + (i === s.pressedKey ? 1 : 0),
      w,
      1,
      i === s.pressedKey ? OUT : NAVY_LIGHTEST
    );
  });

  // --- mouse ----------------------------------------------------
  box(ctx, 79, 69, 5, 7, NAVY_LIGHT, OUT);
  rect(ctx, 81, 70, 1, 2, NAVY_LIGHTEST);
  rect(ctx, 81, 66, 1, 3, OUT);
  rect(ctx, 80, 64, 2, 2, OUT);
}
