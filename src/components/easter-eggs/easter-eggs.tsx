'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { binaryRain, confetti, spin, StopEffect, warpSpeed, wobble } from './effects';

// ------------------------------------------------------------
// Easter eggs. Everything lives in this folder and is mounted once from the
// root layout. Nothing renders or animates until an egg is triggered, keyboard
// listeners ignore form fields, and every animation is skipped when the
// visitor prefers reduced motion (the toast still announces what happened).
// ------------------------------------------------------------

const KONAMI = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

const NAME_CLICKS_NEEDED = 5;
const NAME_CLICK_WINDOW_MS = 1500;
const TOAST_MS = 4000;

type Toast = { id: number; text: string };

declare global {
  interface Window {
    gowtham?: Record<string, () => string>;
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

function barrelRoll() {
  const body = document.body;
  // Spin around the middle of the viewport rather than the middle of the page.
  const previousOrigin = body.style.transformOrigin;
  body.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
  spin(body, 1400);
  window.setTimeout(() => (body.style.transformOrigin = previousOrigin), 1500);
}

export default function EasterEggs() {
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const activeEffect = useRef<StopEffect | null>(null);

  const showToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const runEffect = useCallback((start: () => StopEffect) => {
    activeEffect.current?.();
    activeEffect.current = start();
  }, []);

  // Keyboard eggs: Konami code + typed words.
  useEffect(() => {
    const words: Record<string, () => void> = {
      sudo: () => showToast('gowtham is not in the sudoers file. This incident will be reported.'),
      matrix: () => {
        runEffect(() => binaryRain());
        showToast('Wake up, Neo… the tree is made of 0s and 1s.');
      },
      hire: () => {
        runEffect(() => confetti());
        showToast("Great choice. Scroll down and say hi, I'm all ears.");
      },
      barrelroll: () => {
        barrelRoll();
        showToast('Do a barrel roll!');
      },
    };
    const maxWordLength = Math.max(...Object.keys(words).map((w) => w.length));

    let konamiIndex = 0;
    let typed = '';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        activeEffect.current?.();
        activeEffect.current = null;
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();

      // Konami code
      konamiIndex = key === KONAMI[konamiIndex] ? konamiIndex + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        runEffect(() => warpSpeed());
        showToast('↑↑↓↓←→←→BA · Warp drive engaged. +30 lives.');
        return;
      }

      // Typed words (spaces are ignored so "barrel roll" works too)
      if (key.length !== 1 || key === ' ') return;
      typed = (typed + key).slice(-maxWordLength);
      for (const word of Object.keys(words)) {
        if (typed.endsWith(word)) {
          typed = '';
          words[word]();
          break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runEffect, showToast]);

  // Click the name in the hero five times quickly.
  useEffect(() => {
    let clicks: number[] = [];
    const onClick = (e: MouseEvent) => {
      const name = (e.target as HTMLElement | null)?.closest?.('#home h1');
      if (!(name instanceof HTMLElement)) return;
      const now = Date.now();
      clicks = [...clicks.filter((t) => now - t < NAME_CLICK_WINDOW_MS), now];
      wobble(name);
      if (clicks.length >= NAME_CLICKS_NEEDED) {
        clicks = [];
        runEffect(() => confetti());
        showToast("Yep, that's me 👋 Thanks for poking around.");
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [runEffect, showToast]);

  // A note for anyone who opens dev tools, plus a tiny console API.
  useEffect(() => {
    if (window.gowtham) return; // already set up (e.g. React strict mode)
    const accent = 'color:#64ffda;font-family:monospace;';
    const muted = 'color:#8892b0;font-family:monospace;';

    window.gowtham = {
      help: () => {
        console.log(
          '%cgowtham.warp()%c    engage warp drive\n' +
            '%cgowtham.matrix()%c  follow the white rabbit\n' +
            '%cgowtham.party()%c   🎉\n' +
            '%cgowtham.source()%c  view the source of this site',
          accent,
          muted,
          accent,
          muted,
          accent,
          muted,
          accent,
          muted
        );
        return 'There are a few more hidden on the page itself. Try the classics.';
      },
      warp: () => {
        runEffect(() => warpSpeed());
        return 'Engaging warp drive 🚀';
      },
      matrix: () => {
        runEffect(() => binaryRain());
        return 'There is no spoon.';
      },
      party: () => {
        runEffect(() => confetti());
        return '🎉';
      },
      source: () => {
        window.open('https://github.com/gowth6m/gowtham-io-v2', '_blank', 'noopener,noreferrer');
        return 'Opening GitHub…';
      },
    };

    console.log(
      `%c
   ██████╗
  ██╔════╝    Hey there, fellow developer 👋
  ██║  ███╗
  ██║   ██║   Curious how this was built? Same.
  ╚██████╔╝   Type %cgowtham.help()%c to see what else is in here.
   ╚═════╝
`,
      accent,
      'color:#e6f1ff;font-family:monospace;font-weight:bold;',
      accent
    );
  }, [runEffect]);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      activeEffect.current?.();
    },
    []
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-none px-4 w-max max-w-[calc(100vw-2rem)]"
    >
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-[var(--green-bright)] bg-[var(--light-navy)] px-4 py-3 text-sm font-mono text-[var(--lightest-slate)] shadow-lg shadow-[var(--navy-shadow)]"
        >
          <span className="text-[var(--green-bright)]">$ </span>
          {toast.text}
        </motion.div>
      )}
    </div>
  );
}
