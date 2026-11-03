'use client';

import React, { useEffect, useRef } from 'react';

// ------------------------------------------------------------
// Animated pixel-art avatar: a dev with headphones behind a laptop.
//
// Each sprite is a grid of characters; every character maps to a colour in
// PALETTE ('.' is transparent). Edit the grids or palette to restyle it.
// Animations live in src/styles/pixel-avatar.css:
//   - idle bob + blink + typing hands + music notes + pulsing laptop logo
//   - waves on hover (and once on load)
//   - types / bobs faster while the page is being scrolled
// ------------------------------------------------------------

const SIZE = 32;

const PALETTE: Record<string, string> = {
  H: '#2a1f3d', // hair
  h: '#4b3a6b', // hair highlight
  B: '#2a1f3d', // eyebrows
  S: '#c68863', // skin
  s: '#a86d4c', // skin shadow
  E: '#1a1423', // eyes
  e: '#e6f1ff', // eye glint
  M: '#7a3e2c', // mouth
  G: '#64ffda', // headphones
  g: '#2bb999', // headphones shadow
  T: '#5777ff', // hoodie
  t: '#4459c9', // hoodie shadow
  L: '#a9b0c6', // laptop lid
  l: '#8892b0', // laptop edge
  O: '#64ffda', // laptop logo
  N: '#64ffda', // music note
};

const BODY = [
  '................................',
  '..........GGGGGGGGGGGG..........',
  '.........G.HHHHHHHHHH.G.........',
  '........GHHHhhhhHHHHHHHG........',
  '.......GHHhhhHHHHHHHHHHHG.......',
  '.......GHHHHHHHHHHHHHHHHG.......',
  '.......GHHHHHHHHHHHHHHHHG.......',
  '.......GHHHHHHSSHHHHHHHHG.......',
  '.....GGGGHHSSSSSSHHSHHHGGGG.....',
  '.....gGGGsSBBBSSSSBBBSsGGGg.....',
  '.....gGGGsSSSSSSSSSSSSsGGGg.....',
  '.....gGGGsSSSSSSSSSSSSsGGGg.....',
  '.....gGGGsSSSSSSsSSSSSsGGGg.....',
  '.....GGGGsSSSSSssSSSSSsGGGG.....',
  '.........sSSSMSSSSMSSSs.........',
  '..........SSSSMMMMSSSS..........',
  '...........SSSSSSSSSS...........',
  '.............ssssss.............',
  '.............ssssss.............',
  '..........TTTttttttTTT..........',
  '.......TTTTTTTTTTTTTTTTTT.......',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
  '....tTTTTTTTTTTTTTTTTTTTTTTt....',
];

const EYES_OPEN = [
  '..........', // rows offset by EYES_Y
  '............eE....eE............',
  '............EE....EE............',
];
const EYES_CLOSED = [
  '..........',
  '................................',
  '............EE....EE............',
];
const EYES_Y = 9;

const LAPTOP = [
  '.......llllllllllllllllll.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
  '.......lLLLLLLLLLLLLLLLLl.......',
];
const LAPTOP_Y = 23;

const LOGO = ['.O...O.', 'O..O..O', '.O.O.O.'];
const LOGO_X = 13;
const LOGO_Y = 26;

// Hands resting on the keyboard, peeking around the lid.
const HAND_LEFT = ['SS', 'Ss'];
const HAND_RIGHT = ['SS', 'sS'];
const HANDS_Y = 28;

// Raised waving arm (right side of the sprite): two frames swapped by CSS.
const WAVE_SHOULDER = ['....TTt', '....TTt', '...TTTt', '..TTTt.', '.TTTt..', 'TTTt...'];
const WAVE_HAND_A = ['..S.S.S', '..SSSSS', '..SSSSS', '...SSSs', '....SSs', '....SSs', '....SSs'];
const WAVE_HAND_B = ['.S.S.S.', '.SSSSS.', '.SSSSS.', '..SSSs.', '...SSs.', '....SSs', '....SSs'];
const WAVE_X = 25;
const WAVE_Y = 8;

const NOTE = ['.NN', '.N.', 'NN.'];

// ------------------------------------------------------------

type Rect = { x: number; y: number; w: number; fill: string };

/** Turn a sprite grid into horizontal runs of same-colour pixels. */
function toRects(grid: string[], ox = 0, oy = 0): Rect[] {
  const rects: Rect[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (row[x + w] === ch) w++;
      if (PALETTE[ch]) rects.push({ x: x + ox, y: y + oy, w, fill: PALETTE[ch] });
      x += w;
    }
  });
  return rects;
}

const Sprite = ({ grid, x = 0, y = 0 }: { grid: string[]; x?: number; y?: number }) => (
  <>
    {toRects(grid, x, y).map((r, i) => (
      <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
    ))}
  </>
);

// ------------------------------------------------------------

export default function PixelAvatar({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Flag the avatar as "active" while the page is scrolling so CSS can
  // speed up its animations. The site scrolls on <body>, so listen in the
  // capture phase to catch scroll events from any element.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      el.dataset.active = 'true';
      clearTimeout(timeout);
      timeout = setTimeout(() => delete el.dataset.active, 450);
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <div ref={rootRef} className="pixel-avatar">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          shapeRendering="crispEdges"
          role="presentation"
          focusable="false"
        >
          <g className="pa-notes">
            <g className="pa-note pa-note-1">
              <Sprite grid={NOTE} x={2} y={7} />
            </g>
            <g className="pa-note pa-note-2">
              <Sprite grid={NOTE} x={27} y={7} />
            </g>
            <g className="pa-note pa-note-3">
              <Sprite grid={NOTE} x={3} y={7} />
            </g>
          </g>

          <g className="pa-bob">
            <Sprite grid={BODY} />
            <g className="pa-eyes-open">
              <Sprite grid={EYES_OPEN} y={EYES_Y} />
            </g>
            <g className="pa-eyes-closed">
              <Sprite grid={EYES_CLOSED} y={EYES_Y} />
            </g>
            <g className="pa-wave">
              <Sprite grid={WAVE_SHOULDER} x={WAVE_X} y={WAVE_Y + WAVE_HAND_A.length} />
              <g className="pa-wave-a">
                <Sprite grid={WAVE_HAND_A} x={WAVE_X} y={WAVE_Y} />
              </g>
              <g className="pa-wave-b">
                <Sprite grid={WAVE_HAND_B} x={WAVE_X} y={WAVE_Y} />
              </g>
            </g>
          </g>

          <Sprite grid={LAPTOP} y={LAPTOP_Y} />
          <g className="pa-logo">
            <Sprite grid={LOGO} x={LOGO_X} y={LOGO_Y} />
          </g>

          <g className="pa-hand pa-hand-left">
            <Sprite grid={HAND_LEFT} x={6} y={HANDS_Y} />
          </g>
          <g className="pa-hand pa-hand-right">
            <Sprite grid={HAND_RIGHT} x={24} y={HANDS_Y} />
          </g>
        </svg>
      </div>
    </div>
  );
}
