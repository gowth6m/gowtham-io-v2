// Draws the little CRT screen that sits on the 3D monitor.
// Plain 2D canvas, used as a texture by the three.js scene.

export const SCREEN_W = 640;
export const SCREEN_H = 480;

const PAD_X = 34;
const PAD_Y = 34;
const FONT_SIZE = 30;
const LINE_H = 29;

export const SCREEN_COLS = 36;
export const SCREEN_ROWS = Math.floor((SCREEN_H - PAD_Y * 2) / LINE_H);

export type ScreenState = {
  lines: string[];
  cursor: boolean;
  color: string;
  fontFamily: string;
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function wrapForScreen(lines: string[], cols = SCREEN_COLS): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (line.length <= cols) {
      out.push(line);
      continue;
    }
    let cur = '';
    for (const word of line.split(' ')) {
      if (cur && (cur + ' ' + word).length > cols) {
        out.push(cur);
        cur = '';
      }
      let w = word;
      while (w.length > cols) {
        out.push(w.slice(0, cols));
        w = w.slice(cols);
      }
      cur = cur ? cur + ' ' + w : w;
    }
    out.push(cur);
  }
  return out;
}

export function drawScreen(ctx: CanvasRenderingContext2D, state: ScreenState) {
  const { r, g, b } = hexToRgb(state.color);
  ctx.save();

  // Phosphor background: very dark, tinted towards the phosphor colour.
  ctx.fillStyle = `rgb(${Math.round(r * 0.04 + 2)}, ${Math.round(g * 0.05 + 6)}, ${Math.round(b * 0.05 + 8)})`;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const glow = ctx.createRadialGradient(
    SCREEN_W / 2,
    SCREEN_H / 2,
    20,
    SCREEN_W / 2,
    SCREEN_H / 2,
    SCREEN_W * 0.6
  );
  glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.10)`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Text
  ctx.font = `${FONT_SIZE}px ${state.fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = state.color;
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
  ctx.shadowBlur = 12;

  const rows = wrapForScreen(state.lines).slice(-SCREEN_ROWS);
  rows.forEach((line, i) => {
    ctx.fillText(line, PAD_X, PAD_Y + i * LINE_H);
  });

  if (state.cursor) {
    const last = rows[rows.length - 1] ?? '';
    const x = PAD_X + ctx.measureText(last).width + 4;
    const y = PAD_Y + Math.max(0, rows.length - 1) * LINE_H + 3;
    ctx.fillRect(x, y, FONT_SIZE * 0.5, FONT_SIZE * 0.8);
  }

  ctx.shadowBlur = 0;

  // Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  for (let y = 0; y < SCREEN_H; y += 4) ctx.fillRect(0, y, SCREEN_W, 2);

  // Vignette towards the curved edges
  const vignette = ctx.createRadialGradient(
    SCREEN_W / 2,
    SCREEN_H / 2,
    SCREEN_H * 0.35,
    SCREEN_W / 2,
    SCREEN_H / 2,
    SCREEN_W * 0.72
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  ctx.restore();
}
