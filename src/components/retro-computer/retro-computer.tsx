'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CommandContext, Line, lineText, runCommand, Theme, THEMES, WELCOME } from './commands';
import { drawScreen, SCREEN_H, SCREEN_W } from './screen-texture';
import type { RetroScene } from './scene';
import Terminal, { Entry } from './terminal';

const BOOT_LINES = [
  'GOWTHAM-OS v2.0',
  '(C) 2026 G. RAVINDRATHAS',
  '',
  '640K RAM ............... OK',
  'LOADING PORTFOLIO.SYS .. OK',
  '',
  'READY. CLICK TO BOOT.',
  '$ ',
];

const THEME_KEY = 'gowtham-os-theme';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function fontFamilyFromVar() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-vt323').trim();
  return v ? `${v}, monospace` : 'monospace';
}

/** Static fallback / placeholder drawing (shown before three.js loads or without WebGL). */
function PixelComputer() {
  return (
    <svg viewBox="0 0 64 56" className="retro-fallback" aria-hidden shapeRendering="crispEdges">
      <rect x="10" y="2" width="44" height="34" fill="#d8d0bc" />
      <rect x="14" y="6" width="36" height="25" fill="#16181d" />
      <rect x="16" y="8" width="32" height="21" fill="#04140f" />
      <rect x="18" y="11" width="10" height="2" fill="currentColor" />
      <rect x="18" y="15" width="16" height="2" fill="currentColor" opacity=".7" />
      <rect x="18" y="19" width="3" height="3" fill="currentColor" />
      <rect x="22" y="36" width="20" height="3" fill="#b9b09a" />
      <rect x="6" y="39" width="52" height="8" fill="#d8d0bc" />
      <rect x="38" y="42" width="14" height="2" fill="#16181d" />
      <rect x="10" y="42" width="3" height="2" fill="currentColor" />
      <rect x="8" y="49" width="48" height="5" fill="#cfc7b2" />
    </svg>
  );
}

export default function RetroComputer({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sceneRef = useRef<RetroScene | null>(null);
  const screenRef = useRef<HTMLCanvasElement | null>(null);
  const fontRef = useRef('monospace');
  const bootRef = useRef(0); // number of boot characters revealed
  const reduced = usePrefersReducedMotion();

  const [status, setStatus] = useState<'idle' | 'ready' | 'fallback'>('idle');
  const [open, setOpen] = useState(false);
  const [booted, setBooted] = useState(false); // user has opened the terminal at least once
  const [theme, setTheme] = useState<Theme>('green');
  const [mode, setMode] = useState<'shell' | 'snake'>('shell');
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: WELCOME }]);
  const [history, setHistory] = useState<string[]>([]);
  const [fontFamily, setFontFamily] = useState('monospace');
  const nextId = useRef(1);

  // Restore theme, resolve the terminal font.
  useEffect(() => {
    fontRef.current = fontFamilyFromVar();
    setFontFamily(fontRef.current);
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved && THEMES[saved]) setTheme(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // ------------------------------------------------------------
  // Screen texture on the 3D monitor
  // ------------------------------------------------------------

  const screenLines = useCallback((): string[] => {
    if (!booted) {
      const total = BOOT_LINES.join('\n');
      const shown = total.slice(0, bootRef.current);
      return shown.split('\n');
    }
    const out: string[] = [];
    for (const e of entries) {
      if (e.input !== undefined) out.push(`$ ${e.input}`);
      out.push(...e.lines.map((l: Line) => lineText(l)));
    }
    if (mode === 'snake') out.push('', '  [ playing snake... ]');
    out.push(open ? '$ ' : '$ click to continue');
    return out;
  }, [booted, entries, mode, open]);

  const paint = useCallback(
    (cursorOn: boolean) => {
      const c = screenRef.current;
      if (!c) return;
      drawScreen(c.getContext('2d')!, {
        lines: screenLines(),
        cursor: cursorOn,
        color: THEMES[theme].color,
        fontFamily: fontRef.current,
      });
      sceneRef.current?.updateScreen();
    },
    [screenLines, theme]
  );

  // ------------------------------------------------------------
  // Lazy-load three.js once the computer is near the viewport
  // ------------------------------------------------------------

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (getComputedStyle(wrap).display === 'none') return;

    let cancelled = false;
    let visible = false;
    let started = false;

    const start = async () => {
      started = true;
      try {
        const probe = document.createElement('canvas');
        if (!probe.getContext('webgl2') && !probe.getContext('webgl')) throw new Error('no webgl');

        const family = fontRef.current;
        await document.fonts?.load(`30px ${family}`).catch(() => undefined);

        const screen = document.createElement('canvas');
        screen.width = SCREEN_W;
        screen.height = SCREEN_H;
        screenRef.current = screen;

        const { createRetroScene } = await import('./scene');
        if (cancelled) return;
        const reducedNow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedNow) bootRef.current = BOOT_LINES.join('\n').length;
        sceneRef.current = createRetroScene(canvas, {
          reducedMotion: reducedNow,
          screenCanvas: screen,
          color: THEMES[theme].color,
        });
        sceneRef.current.setActive(visible);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sceneRef.current?.setActive(visible && document.visibilityState === 'visible');
        if (visible && !started) {
          const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
            .requestIdleCallback;
          if (ric) ric(() => start());
          else setTimeout(start, 200);
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(wrap);

    const onVis = () =>
      sceneRef.current?.setActive(visible && document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // The scene is created once; theme changes are pushed via setColor below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot typing animation + blinking cursor on the little screen.
  useEffect(() => {
    if (status !== 'ready') return;
    const total = BOOT_LINES.join('\n').length;
    if (reduced) {
      bootRef.current = total;
      paint(true);
      return;
    }
    let tick = 0;
    paint(true);
    const id = window.setInterval(() => {
      tick++;
      if (!booted && bootRef.current < total) {
        bootRef.current = Math.min(total, bootRef.current + 2);
        paint(true);
      } else if (tick % 9 === 0) {
        paint(tick % 18 === 0);
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [status, paint, reduced, booted]);

  useEffect(() => {
    sceneRef.current?.setColor(THEMES[theme].color);
  }, [theme, status]);

  // ------------------------------------------------------------
  // Terminal
  // ------------------------------------------------------------

  const powerOn = async () => {
    if (open) return;
    setBooted(true);
    if (sceneRef.current) await sceneRef.current.zoomIn();
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    setMode('shell');
    sceneRef.current?.zoomOut();
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const submit = (raw: string) => {
    const input = raw.trim();
    const ctx: CommandContext = { history, theme };
    const result = runCommand(input, ctx);
    if (input) setHistory((h) => [...h, input]);

    const effect = result.effect;
    if (effect?.type === 'clear') {
      setEntries([]);
      return;
    }
    if (effect?.type === 'exit') {
      close();
      return;
    }
    if (effect?.type === 'theme') {
      setTheme(effect.theme);
      try {
        localStorage.setItem(THEME_KEY, effect.theme);
      } catch {
        /* ignore */
      }
    }
    if (effect?.type === 'open') window.open(effect.href, '_blank', 'noopener,noreferrer');
    if (effect?.type === 'snake') setMode('snake');

    setEntries((list) => [
      ...list.slice(-80),
      { id: nextId.current++, input, lines: result.lines },
    ]);
  };

  const onSnakeExit = useCallback((score: number) => {
    setMode('shell');
    setEntries((list) => [
      ...list,
      {
        id: nextId.current++,
        lines: [
          [
            {
              text: `snake: game over. score ${score}. ${score >= 10 ? 'Impressive.' : 'Try again?'}`,
              tone: 'accent',
            },
          ],
        ],
      },
    ]);
  }, []);

  const onKey = useCallback(() => sceneRef.current?.pressKey(), []);

  return (
    <div ref={wrapRef} className={`retro-computer ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className="retro-computer-button"
        onClick={powerOn}
        onPointerEnter={() => sceneRef.current?.setHover(true)}
        onPointerLeave={() => sceneRef.current?.setHover(false)}
        onFocus={() => sceneRef.current?.setHover(true)}
        onBlur={() => sceneRef.current?.setHover(false)}
        aria-haspopup="dialog"
        aria-label="Turn on Gowtham's retro computer and open its terminal"
        style={{ color: THEMES[theme].color }}
      >
        <span className="retro-stage">
          <canvas
            ref={canvasRef}
            className={`retro-canvas ${status === 'ready' ? 'is-ready' : ''}`}
            aria-hidden
          />
          {status !== 'ready' && <PixelComputer />}
        </span>
        <span className="retro-hint" aria-hidden>
          {booted ? '› click to continue' : '› click to boot'}
        </span>
      </button>

      {open && (
        <Terminal
          entries={entries}
          history={history}
          theme={theme}
          mode={mode}
          fontFamily={fontFamily}
          reducedMotion={reduced}
          onSubmit={submit}
          onClose={close}
          onSnakeExit={onSnakeExit}
          onKey={onKey}
        />
      )}
    </div>
  );
}
