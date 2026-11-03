'use client';

import React, { useEffect, useMemo } from 'react';
import {
  motion,
  MotionValue,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

// ------------------------------------------------------------
// A decorative binary tree that "grows" as the page is scrolled.
// Edges are drawn in breadth-first order and each node lights up
// once the edge leading into it has finished drawing.
// ------------------------------------------------------------

const DEPTH = 4; // levels, root included -> 2^DEPTH - 1 nodes
const VIEW_W = 240;
const VIEW_H = 200;
const PAD_X = 12;
const PAD_Y = 12;
const NODE_R = 4;

// Leave a little headroom so the last leaf lights up before the very bottom.
const REVEAL_END = 0.92;
// How much each edge's draw window overlaps the next, for a fluid cascade.
const OVERLAP = 1.6;

interface TreeNode {
  id: number;
  x: number;
  y: number;
}

interface TreeEdge {
  id: number;
  from: TreeNode;
  to: TreeNode;
  d: string;
}

function buildTree() {
  const nodes: TreeNode[] = [];
  const levelGap = (VIEW_H - PAD_Y * 2) / (DEPTH - 1);

  for (let level = 0; level < DEPTH; level++) {
    const count = 2 ** level;
    const slot = (VIEW_W - PAD_X * 2) / count;
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: nodes.length,
        x: PAD_X + slot * (i + 0.5),
        y: PAD_Y + levelGap * level,
      });
    }
  }

  // In a heap-ordered array, node k's parent is (k - 1) >> 1, so iterating
  // k = 1..n gives edges in breadth-first order.
  const edges: TreeEdge[] = [];
  for (let k = 1; k < nodes.length; k++) {
    const from = nodes[(k - 1) >> 1];
    const to = nodes[k];
    const midY = (from.y + to.y) / 2;
    edges.push({
      id: k,
      from,
      to,
      d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
    });
  }

  return { nodes, edges };
}

function edgeWindow(index: number, total: number): [number, number] {
  const step = REVEAL_END / total;
  const start = index * step;
  return [start, Math.min(REVEAL_END, start + step * OVERLAP)];
}

// ------------------------------------------------------------

const Edge = ({
  edge,
  index,
  total,
  progress,
}: {
  edge: TreeEdge;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) => {
  const [start, end] = edgeWindow(index, total);
  const pathLength = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.001], [0, 1]);

  return (
    <motion.path
      d={edge.d}
      fill="none"
      stroke="var(--green-bright)"
      strokeWidth={1.25}
      strokeLinecap="round"
      style={{ pathLength, opacity }}
    />
  );
};

const Node = ({
  node,
  litAt,
  progress,
}: {
  node: TreeNode;
  litAt: number;
  progress: MotionValue<number>;
}) => {
  const fill = useTransform(
    progress,
    [litAt - 0.02, litAt],
    ['rgba(100, 255, 218, 0)', 'rgba(100, 255, 218, 1)']
  );
  const glow = useTransform(progress, [litAt - 0.02, litAt, litAt + 0.08], [0, 0.45, 0.15]);
  const glowR = useTransform(
    progress,
    [litAt - 0.02, litAt, litAt + 0.08],
    [NODE_R, NODE_R * 3, NODE_R * 2]
  );
  const strokeOpacity = useTransform(progress, [litAt - 0.02, litAt], [0, 1]);

  return (
    <g>
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={glowR}
        fill="var(--green-bright)"
        style={{ opacity: glow }}
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={NODE_R}
        fill="var(--navy)"
        stroke="var(--lightest-navy)"
        strokeWidth={1.25}
      />
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={NODE_R}
        stroke="var(--green-bright)"
        strokeWidth={1.25}
        style={{ fill, strokeOpacity }}
      />
    </g>
  );
};

// ------------------------------------------------------------

/**
 * Page scroll progress (0..1). The site scrolls on <body> rather than the
 * window (html/body both set overflow-x), so framer's window-based useScroll
 * stays at 0. Listen in the capture phase to catch scrolls on any element and
 * read from whichever of the root/body actually has scrollable height.
 */
function usePageScrollProgress() {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const candidates = [document.scrollingElement, document.body].filter(
        (el): el is Element => !!el
      );
      const el = candidates.find((c) => c.scrollHeight - c.clientHeight > 1) ?? candidates[0];
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      progress.set(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };

    update();
    document.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      document.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
  }, [progress]);

  return progress;
}

const AnimatedTree = ({ nodes, edges }: ReturnType<typeof buildTree>) => {
  const scrollProgress = usePageScrollProgress();
  const progress = useSpring(scrollProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <>
      <g>
        {edges.map((edge, i) => (
          <Edge key={edge.id} edge={edge} index={i} total={edges.length} progress={progress} />
        ))}
      </g>
      <g>
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            // Root is lit from the start; every other node lights when its edge finishes.
            litAt={node.id === 0 ? 0.001 : edgeWindow(node.id - 1, edges.length)[1]}
            progress={progress}
          />
        ))}
      </g>
    </>
  );
};

const StaticTree = ({ nodes, edges }: ReturnType<typeof buildTree>) => (
  <>
    {edges.map((edge) => (
      <path
        key={edge.id}
        d={edge.d}
        fill="none"
        stroke="var(--green-bright)"
        strokeOpacity={0.6}
        strokeWidth={1.25}
      />
    ))}
    {nodes.map((node) => (
      <circle
        key={node.id}
        cx={node.x}
        cy={node.y}
        r={NODE_R}
        fill="var(--navy)"
        stroke="var(--green-bright)"
        strokeWidth={1.25}
      />
    ))}
  </>
);

export default function ScrollTree({ className = '' }: { className?: string }) {
  const tree = useMemo(buildTree, []);
  const reduceMotion = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMinYMid meet"
        className="h-full w-full max-w-[300px] overflow-visible"
        role="presentation"
        focusable="false"
      >
        {/* Faint skeleton, always visible */}
        <g stroke="var(--lightest-navy)" strokeWidth={1} fill="none">
          {tree.edges.map((edge) => (
            <path key={edge.id} d={edge.d} />
          ))}
        </g>

        {reduceMotion ? <StaticTree {...tree} /> : <AnimatedTree {...tree} />}
      </svg>
    </div>
  );
}
