'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { complete, Line, PROMPT, Theme, THEMES } from './commands';
import Snake from './snake';

export type Entry = { id: number; input?: string; lines: Line[] };

type Props = {
  entries: Entry[];
  history: string[];
  theme: Theme;
  mode: 'shell' | 'snake';
  fontFamily: string;
  reducedMotion: boolean;
  onSubmit: (input: string) => void;
  onClose: () => void;
  onSnakeExit: (score: number) => void;
  onKey: () => void;
};

const CHIPS = ['help', 'about', 'experience', 'projects', 'contact', 'neofetch', 'snake'];

function OutputLine({ line }: { line: Line }) {
  if (!line.length || line.every((s) => !s.text)) return <div className="retro-line">&nbsp;</div>;
  return (
    <div className="retro-line">
      {line.map((seg, i) =>
        seg.href ? (
          <a
            key={i}
            href={seg.href}
            target={seg.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={`retro-link ${seg.tone ? `retro-${seg.tone}` : ''}`}
          >
            {seg.text}
          </a>
        ) : (
          <span key={i} className={seg.tone ? `retro-${seg.tone}` : undefined}>
            {seg.text}
          </span>
        )
      )}
    </div>
  );
}

export default function Terminal({
  entries,
  history,
  theme,
  mode,
  fontFamily,
  reducedMotion,
  onSubmit,
  onClose,
  onSnakeExit,
  onKey,
}: Props) {
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the prompt on open (skip on touch devices so the keyboard doesn't jump up).
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) inputRef.current?.focus({ preventScroll: true });
    else dialogRef.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (mode === 'shell' && window.matchMedia('(pointer: fine)').matches)
      inputRef.current?.focus({ preventScroll: true });
  }, [mode]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, mode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'shell') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, onClose]);

  const submit = (cmd: string) => {
    onSubmit(cmd);
    setValue('');
    setCursor(null);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKey();
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      const cur = cursor ?? history.length;
      const next = e.key === 'ArrowUp' ? Math.max(0, cur - 1) : Math.min(history.length, cur + 1);
      setCursor(next);
      setValue(next === history.length ? '' : history[next]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const options = complete(value);
      if (options.length === 1) setValue(options[0] + ' ');
      else if (options.length > 1) {
        // Fill in the shared prefix.
        let prefix = options[0];
        for (const o of options) while (!o.startsWith(prefix)) prefix = prefix.slice(0, -1);
        if (prefix.length > value.length) setValue(prefix);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      submit('clear');
    }
  };

  const color = THEMES[theme].color;

  return createPortal(
    <div
      className="retro-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="GowthamOS terminal"
        tabIndex={-1}
        className={`retro-crt ${reducedMotion ? '' : 'retro-crt-animate'}`}
        style={{ '--retro-color': color, '--retro-font': fontFamily } as React.CSSProperties}
      >
        <div className="retro-bezel-top">
          <span className="retro-led" aria-hidden />
          <span className="retro-brand">GowthamOS 2.0</span>
          <button
            type="button"
            className="retro-close"
            onClick={onClose}
            aria-label="Close terminal"
          >
            power off ✕
          </button>
        </div>

        <div
          className="retro-screen"
          onClick={() => {
            if (mode === 'shell' && !window.getSelection()?.toString())
              inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <div ref={scrollRef} className="retro-scroll" role="log" aria-live="polite">
            {entries.map((entry) => (
              <div key={entry.id}>
                {entry.input !== undefined && (
                  <div className="retro-line">
                    <span className="retro-prompt">{PROMPT}</span> {entry.input}
                  </div>
                )}
                {entry.lines.map((line, i) => (
                  <OutputLine key={i} line={line} />
                ))}
              </div>
            ))}

            {mode === 'snake' ? (
              <Snake color={color} fontFamily={fontFamily} onExit={onSnakeExit} onKey={onKey} />
            ) : (
              <form
                className="retro-line retro-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(value);
                }}
              >
                <label htmlFor="retro-input" className="retro-prompt">
                  {PROMPT}
                </label>
                <input
                  id="retro-input"
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onInputKey}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="retro-input"
                />
              </form>
            )}
          </div>
          <div className="retro-scanlines" aria-hidden />
        </div>

        <div className="retro-chips" aria-label="Quick commands">
          {CHIPS.map((c) => (
            <button key={c} type="button" onClick={() => submit(c)} disabled={mode !== 'shell'}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
