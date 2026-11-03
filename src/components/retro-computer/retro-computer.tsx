'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CommandContext, runCommand, Theme, THEMES, WELCOME } from './commands';
import { drawSprite, KEY_COUNT, SCREEN_COLS, SPRITE_H, SPRITE_W } from './pixel-sprite';
import Terminal, { Entry } from './terminal';

const BOOT_LINES = ['GOWTHAM OS', 'READY.', '', '> CLICK ME', '> '];

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

export default function RetroComputer({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('green');
  const [mode, setMode] = useState<'shell' | 'snake'>('shell');
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: WELCOME }]);
  const [history, setHistory] = useState<string[]>([]);
  const [fontFamily, setFontFamily] = useState('monospace');
  const nextId = useRef(1);

  // Mutable animation state, read by the draw loop.
  const anim = useRef({ hover: false, pressedKey: -1, pressedUntil: 0, lastCommand: '' });

  // Restore theme, resolve the terminal font.
  useEffect(() => {
    setFontFamily(fontFamilyFromVar());
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved && THEMES[saved]) setTheme(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    anim.current.lastCommand = history[history.length - 1] ?? '';
  }, [history]);

  // ------------------------------------------------------------
  // Pixel-art computer: tiny canvas, redrawn on a slow tick while visible
  // ------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = THEMES[theme].color;
    const bootText = BOOT_LINES.join('\n');
    let shown = reduced ? bootText.length : 0;
    let tick = 0;
    let timer = 0;

    const draw = () => {
      const a = anim.current;
      const now = performance.now();
      const lines = a.lastCommand
        ? ['GOWTHAM OS', '', `> ${a.lastCommand}`.slice(0, SCREEN_COLS), 'OK.', '> ']
        : bootText.slice(0, shown).split('\n');
      drawSprite(ctx, {
        color,
        lines,
        cursor: reduced || Math.floor(tick / 4) % 2 === 0,
        hover: a.hover,
        bob: !reduced && Math.floor(tick / 6) % 2 === 1 ? 1 : 0,
        led: reduced || tick % 10 < 7,
        pressedKey: now < a.pressedUntil ? a.pressedKey : -1,
      });
    };

    const step = () => {
      tick++;
      if (shown < bootText.length) shown++;
      else if (tick % 5 === 0 && Math.random() < 0.35) {
        // idle "typing" on the keyboard
        anim.current.pressedKey = Math.floor(Math.random() * KEY_COUNT);
        anim.current.pressedUntil = performance.now() + 140;
      }
      draw();
    };

    draw();
    if (reduced) {
      const redraw = () => draw();
      wrap.addEventListener('retro-redraw', redraw);
      return () => wrap.removeEventListener('retro-redraw', redraw);
    }

    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      timer = 0;
      if (entry.isIntersecting) timer = window.setInterval(step, 130);
    });
    io.observe(wrap);
    const redraw = () => draw();
    wrap.addEventListener('retro-redraw', redraw);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
      wrap.removeEventListener('retro-redraw', redraw);
    };
  }, [theme, reduced]);

  const redraw = () => wrapRef.current?.dispatchEvent(new Event('retro-redraw'));
  const setHover = (h: boolean) => {
    anim.current.hover = h;
    redraw();
  };

  // ------------------------------------------------------------
  // Terminal
  // ------------------------------------------------------------

  const powerOn = () => {
    if (!open) setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    setMode('shell');
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

  const onKey = useCallback(() => {
    anim.current.pressedKey = Math.floor(Math.random() * KEY_COUNT);
    anim.current.pressedUntil = performance.now() + 140;
  }, []);

  return (
    <div ref={wrapRef} className={`retro-computer ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className="retro-computer-button"
        onClick={powerOn}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-haspopup="dialog"
        aria-label="Turn on Gowtham's retro computer and open its terminal"
        style={{ color: THEMES[theme].color }}
      >
        <canvas
          ref={canvasRef}
          width={SPRITE_W}
          height={SPRITE_H}
          className="retro-canvas"
          aria-hidden
        />
        <span className="retro-hint" aria-hidden>
          {history.length ? '› click to continue' : '› click to boot'}
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
