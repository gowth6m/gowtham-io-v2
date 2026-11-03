// Canvas effects for the easter eggs. Each effect creates its own fixed,
// pointer-transparent canvas, runs for a fixed duration and cleans up after
// itself, so nothing is running (or even in the DOM) until it is triggered.

const GREEN = '100, 255, 218'; // --green-bright as rgb

export type StopEffect = () => void;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createOverlayCanvas(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.easterEgg = 'true';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '60',
    transition: 'opacity 600ms ease',
    opacity: '1',
  } satisfies Partial<CSSStyleDeclaration>);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);
  return { canvas, ctx };
}

function runOverlay(
  durationMs: number,
  frame: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void
): StopEffect {
  const created = createOverlayCanvas();
  if (!created) return () => {};
  const { canvas, ctx } = created;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const start = performance.now();
  let raf = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    canvas.style.opacity = '0';
    window.setTimeout(() => canvas.remove(), 650);
  };

  const loop = (now: number) => {
    const t = now - start;
    frame(ctx, w, h, t);
    if (t >= durationMs) return stop();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return stop;
}

/** Hyperspace jump: streaks of light flying out from the centre. */
export function warpSpeed(durationMs = 4000): StopEffect {
  if (prefersReducedMotion()) return () => {};
  const STAR_COUNT = window.innerWidth > 768 ? 400 : 150;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: Math.random(),
  }));

  return runOverlay(durationMs, (ctx, w, h, t) => {
    // Accelerate, cruise, then decelerate.
    const p = t / durationMs;
    const speed = 0.002 + 0.03 * Math.sin(Math.min(p, 1) * Math.PI);
    ctx.fillStyle = `rgba(2, 12, 27, ${0.25 + 0.2 * (1 - speed / 0.032)})`;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.max(w, h) / 2;
    ctx.lineCap = 'round';
    for (const s of stars) {
      const prevZ = s.z;
      s.z -= speed;
      if (s.z <= 0.01) {
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.z = 1;
        continue;
      }
      const x1 = cx + (s.x / prevZ) * scale * 0.2;
      const y1 = cy + (s.y / prevZ) * scale * 0.2;
      const x2 = cx + (s.x / s.z) * scale * 0.2;
      const y2 = cy + (s.y / s.z) * scale * 0.2;
      const alpha = Math.min(1, (1 - s.z) * 1.5);
      ctx.strokeStyle = `rgba(${GREEN}, ${alpha})`;
      ctx.lineWidth = Math.max(0.5, (1 - s.z) * 2.5);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });
}

/** Falling columns of 0s and 1s. */
export function binaryRain(durationMs = 6000): StopEffect {
  if (prefersReducedMotion()) return () => {};
  const FONT_SIZE = 16;
  const columns = Math.ceil(window.innerWidth / FONT_SIZE);
  const drops = Array.from({ length: columns }, () => Math.random() * -50);
  let lastStep = 0;

  return runOverlay(durationMs, (ctx, w, h, t) => {
    if (t - lastStep < 50) return; // ~20 steps per second keeps it readable
    lastStep = t;
    ctx.fillStyle = 'rgba(2, 12, 27, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    for (let i = 0; i < drops.length; i++) {
      const y = drops[i] * FONT_SIZE;
      if (y > 0) {
        ctx.fillStyle = Math.random() > 0.95 ? '#e6f1ff' : `rgba(${GREEN}, 0.85)`;
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * FONT_SIZE, y);
      }
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  });
}

/** Confetti made of the site's palette (and the occasional semicolon). */
export function confetti(durationMs = 3500): StopEffect {
  if (prefersReducedMotion()) return () => {};
  const colors = ['#64ffda', '#a166ed', '#5777ff', '#e6f1ff', '#CED1DE'];
  const glyphs = ['{', '}', ';', '<', '/>', '()', '01'];
  const w0 = window.innerWidth;
  const pieces = Array.from({ length: w0 > 768 ? 160 : 70 }, () => ({
    x: w0 / 2 + (Math.random() - 0.5) * 80,
    y: window.innerHeight + 10,
    vx: (Math.random() - 0.5) * 12,
    vy: -(Math.random() * 14 + 10),
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    glyph: Math.random() > 0.7 ? glyphs[Math.floor(Math.random() * glyphs.length)] : null,
  }));

  return runOverlay(durationMs, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = 'bold 16px ui-monospace, SFMono-Regular, Menlo, monospace';
    for (const p of pieces) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.glyph) ctx.fillText(p.glyph, 0, 0);
      else ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }
  });
}

/** Spins an element once (used for the page barrel roll and the name wobble). */
export function spin(el: HTMLElement, durationMs = 1200): void {
  if (prefersReducedMotion() || typeof el.animate !== 'function') return;
  el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
    duration: durationMs,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
  });
}

export function wobble(el: HTMLElement): void {
  if (prefersReducedMotion() || typeof el.animate !== 'function') return;
  el.animate(
    [
      { transform: 'none' },
      { transform: 'skewX(-8deg) translateX(-4px)', color: '#64ffda' },
      { transform: 'skewX(6deg) translateX(3px)' },
      { transform: 'skewX(-3deg) translateX(-1px)', color: '#64ffda' },
      { transform: 'none' },
    ],
    { duration: 600, easing: 'ease-out' }
  );
}
