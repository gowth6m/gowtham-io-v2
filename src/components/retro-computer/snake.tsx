'use client';

import React, { useEffect, useRef, useState } from 'react';

const COLS = 24;
const ROWS = 14;
const CELL = 18;

type P = { x: number; y: number };
const DIRS: Record<string, P> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomFood(snake: P[]): P {
  for (;;) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

/** A tiny snake game that runs inside the terminal. */
export default function Snake({
  color,
  fontFamily,
  onExit,
  onKey,
}: {
  color: string;
  fontFamily: string;
  onExit: (score: number) => void;
  onKey?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const dirQueue = useRef<P[]>([]);
  const touch = useRef<P | null>(null);
  const exitRef = useRef(onExit);
  const keyRef = useRef(onKey);

  useEffect(() => {
    exitRef.current = onExit;
    keyRef.current = onKey;
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let snake: P[] = [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 },
    ];
    let dir: P = { x: 1, y: 0 };
    let food = randomFood(snake);
    let points = 0;
    let over = false;

    const draw = () => {
      ctx.fillStyle = '#020c1b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      snake.forEach((s, i) => {
        ctx.globalAlpha = i === 0 ? 1 : 0.75;
        ctx.fillRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4);
      });
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.font = `28px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 6);
        ctx.font = `18px ${fontFamily}`;
        ctx.fillText('press any key', canvas.width / 2, canvas.height / 2 + 18);
      }
    };

    const step = () => {
      if (over) return;
      const next = dirQueue.current.shift();
      if (next && (next.x !== -dir.x || next.y !== -dir.y)) dir = next;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= COLS ||
        head.y >= ROWS ||
        snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        over = true;
        draw();
        return;
      }
      snake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) {
        points += 1;
        setScore(points);
        food = randomFood(snake);
      } else snake.pop();
      draw();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') {
        e.preventDefault();
        e.stopPropagation();
        exitRef.current(points);
        return;
      }
      if (over) {
        e.preventDefault();
        exitRef.current(points);
        return;
      }
      const d = DIRS[e.key];
      if (d) {
        e.preventDefault();
        keyRef.current?.();
        if (dirQueue.current.length < 3) dirQueue.current.push(d);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    draw();
    const id = window.setInterval(step, 110);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [color, fontFamily]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    dirQueue.current.push(
      Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) }
    );
  };

  return (
    <div className="retro-snake">
      <div className="retro-snake-bar">
        <span>SNAKE</span>
        <span>score {score}</span>
        <span className="retro-dim">arrows / wasd / swipe · q quits</span>
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`Snake game, score ${score}`}
      />
    </div>
  );
}
