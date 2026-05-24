"use client";

import * as React from "react";

import { useT } from "@/lib/i18n/client";
import type { Contact } from "@/types/contact";

interface MindMapProps {
  contacts: Contact[];
  /**
   * Fires when the user taps a node. Provides the contact's id, or
   * `null` if they tapped the central "you" node.
   */
  onSelectContact?: (id: string) => void;
}

interface MmNode {
  id: string;
  contact: Contact | null; // null for the "you" root
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = root, 1 = direct connection, 2 = floating "mutual-only" node. */
  ring: 0 | 1 | 2;
  pinned: boolean;
}

interface MmEdge {
  source: string;
  target: string;
  /** "primary" = you→contact edge, "mutual" = contact↔contact edge. */
  kind: "primary" | "mutual";
}

const YOU_ID = "_you";

/**
 * Build a graph from the contact list:
 *  - one node per contact, plus a synthetic "you" node at the centre,
 *  - every contact connects to "you" (you know them),
 *  - every (contact, mutual-of-contact) pair gets an edge.
 *
 * We also auto-create floating nodes for `mutualConnectionIds` that
 * aren't in the explicit contact list, so 2nd-degree connections still
 * show up even when they haven't been imported yet.
 */
function buildGraph(contacts: Contact[]): {
  nodes: MmNode[];
  edges: MmEdge[];
} {
  const byId = new Map<string, Contact>();
  for (const c of contacts) byId.set(c.id, c);

  const nodes: MmNode[] = [];
  const nodeIds = new Set<string>();

  // Root node
  nodes.push({
    id: YOU_ID,
    contact: null,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ring: 0,
    pinned: true,
  });
  nodeIds.add(YOU_ID);

  // 1st-degree contacts on a ring around "you" — gives the simulation
  // a stable starting layout instead of all nodes at (0,0).
  const N = contacts.length;
  contacts.forEach((c, i) => {
    const angle = (i / Math.max(N, 1)) * Math.PI * 2;
    const r = 360;
    nodes.push({
      id: c.id,
      contact: c,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      ring: 1,
      pinned: false,
    });
    nodeIds.add(c.id);
  });

  const edges: MmEdge[] = [];

  // you → every imported contact
  for (const c of contacts) {
    edges.push({ source: YOU_ID, target: c.id, kind: "primary" });
  }

  // mutual edges + lazy node creation for unknown mutuals
  const seenPair = new Set<string>();
  let ghostIndex = 0;
  for (const c of contacts) {
    for (const otherId of c.mutualConnectionIds ?? []) {
      if (!nodeIds.has(otherId)) {
        // 2nd-degree "ghost" node. Place it on a deterministic outer
        // ring so SSR + client agree (no Math.random — that would
        // trigger a hydration mismatch).
        const angle = (ghostIndex * 137.5 * Math.PI) / 180; // golden-angle
        const r = 540 + (ghostIndex % 5) * 22;
        ghostIndex += 1;
        nodes.push({
          id: otherId,
          contact: null,
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          vx: 0,
          vy: 0,
          ring: 2,
          pinned: false,
        });
        nodeIds.add(otherId);
      }
      const a = c.id < otherId ? c.id : otherId;
      const b = c.id < otherId ? otherId : c.id;
      const key = `${a}::${b}`;
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      edges.push({ source: a, target: b, kind: "mutual" });
    }
  }

  return { nodes, edges };
}

/**
 * Tiny Fruchterman-Reingold-style force layout. Pure ops + arrays so
 * it's fast enough to run synchronously on mount for ~80 nodes.
 *
 * Tweak parameters live: longer mutual edges spread the graph out,
 * stronger repulsion separates clusters.
 */
function simulate(
  nodes: MmNode[],
  edges: MmEdge[],
  iterations = 360,
): void {
  const REPULSION = 14_000;
  const PRIMARY_REST = 220; // you → contact preferred edge length
  const MUTUAL_REST = 140; // contact ↔ contact preferred edge length
  const SPRING = 0.06;
  const DAMPING = 0.82;
  const CENTER_PULL = 0.002;

  const idIndex = new Map<string, number>();
  nodes.forEach((n, i) => idIndex.set(n.id, i));

  for (let iter = 0; iter < iterations; iter += 1) {
    // Pairwise repulsion. O(N^2) but trivial for ~80 nodes.
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = Math.max(dx * dx + dy * dy, 16);
        const dist = Math.sqrt(distSq);
        const force = REPULSION / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Edge springs
    for (const e of edges) {
      const ai = idIndex.get(e.source);
      const bi = idIndex.get(e.target);
      if (ai === undefined || bi === undefined) continue;
      const a = nodes[ai]!;
      const b = nodes[bi]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const rest = e.kind === "primary" ? PRIMARY_REST : MUTUAL_REST;
      const displacement = dist - rest;
      const force = displacement * SPRING;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Integrate + damp. Pinned nodes (you) stay put.
    for (const n of nodes) {
      if (n.pinned) {
        n.vx = 0;
        n.vy = 0;
        continue;
      }
      // Gentle pull toward origin so the whole graph doesn't drift.
      n.vx -= n.x * CENTER_PULL;
      n.vy -= n.y * CENTER_PULL;
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
    }
  }
}

/**
 * Compute a viewBox that snugly fits the laid-out nodes with a bit of
 * breathing room for labels. The SVG itself stays square so pan/zoom
 * math stays simple.
 */
function fitViewBox(nodes: MmNode[], padding = 80) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  }
  const w = maxX - minX + padding * 2;
  const h = maxY - minY + padding * 2;
  const size = Math.max(w, h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    x: cx - size / 2,
    y: cy - size / 2,
    width: size,
    height: size,
  };
}

/**
 * Force-directed mind map. Renders an SVG graph of the user's network
 * with the user at the centre, direct contacts on the first ring, and
 * 2nd-degree mutuals on the outside.
 *
 * Touch / pointer interactions:
 *  - One-finger drag → pan
 *  - Pinch (two-finger) → zoom (kept inside [0.4, 3])
 *  - Wheel → zoom (desktop)
 *  - Tap a node → fires `onSelectContact`
 */
export function MindMap({ contacts, onSelectContact }: MindMapProps) {
  const t = useT();

  // Build + simulate once per contact-list reference. Stable contacts
  // ⇒ stable graph layout ⇒ no jumping when re-rendering.
  const { nodes, edges, baseViewBox } = React.useMemo(() => {
    const graph = buildGraph(contacts);
    simulate(graph.nodes, graph.edges);
    return { ...graph, baseViewBox: fitViewBox(graph.nodes) };
  }, [contacts]);

  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [view, setView] = React.useState({ tx: 0, ty: 0, scale: 1 });

  // Pointer / touch state. Held in refs so we don't re-render on every
  // move event.
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseTx: number;
    baseTy: number;
    moved: boolean;
  } | null>(null);
  const pinchRef = React.useRef<{
    ids: [number, number];
    startDist: number;
    startScale: number;
  } | null>(null);
  const activePointersRef = React.useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );

  const onPointerDown = React.useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gestureMovedRef.current = false;

    if (activePointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        baseTx: view.tx,
        baseTy: view.ty,
        moved: false,
      };
    } else if (activePointersRef.current.size === 2) {
      const [a, b] = Array.from(activePointersRef.current.entries());
      const dx = b![1].x - a![1].x;
      const dy = b![1].y - a![1].y;
      pinchRef.current = {
        ids: [a![0], b![0]],
        startDist: Math.hypot(dx, dy),
        startScale: view.scale,
      };
      dragRef.current = null;
    }
  }, [view.scale, view.tx, view.ty]);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (pinchRef.current) {
        const a = activePointersRef.current.get(pinchRef.current.ids[0]);
        const b = activePointersRef.current.get(pinchRef.current.ids[1]);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchRef.current.startDist;
        const nextScale = clamp(pinchRef.current.startScale * ratio, 0.4, 3);
        setView((v) => ({ ...v, scale: nextScale }));
      } else if (dragRef.current && dragRef.current.pointerId === e.pointerId) {
        // Snapshot the drag origin into locals — `setView` is async and
        // can run after `onPointerUp` has nulled `dragRef.current`,
        // which used to crash with `null.baseTx`.
        const drag = dragRef.current;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 4) {
          drag.moved = true;
          // eslint-disable-next-line react-hooks/immutability -- refs are designed to be mutated; the linter trips over the conditional update.
          gestureMovedRef.current = true;
        }
        const nextTx = drag.baseTx + dx;
        const nextTy = drag.baseTy + dy;
        setView((v) => ({ ...v, tx: nextTx, ty: nextTy }));
      }
    },
    [],
  );

  const onPointerUp = React.useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) pinchRef.current = null;
    if (activePointersRef.current.size === 0) dragRef.current = null;
  }, []);

  const onWheel = React.useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({ ...v, scale: clamp(v.scale * factor, 0.4, 3) }));
  }, []);

  // Track whether the gesture that *just* ended was actually a drag,
  // so a `click` that fires right after a pan doesn't accidentally
  // navigate. Reset on the next pointerdown.
  const gestureMovedRef = React.useRef(false);

  const handleNodeClick = React.useCallback(
    (id: string) => (e: React.MouseEvent) => {
      if (gestureMovedRef.current) return;
      e.stopPropagation();
      if (id === YOU_ID) return;
      onSelectContact?.(id);
    },
    [onSelectContact],
  );

  const recenter = React.useCallback(() => {
    setView({ tx: 0, ty: 0, scale: 1 });
  }, []);

  const nodeById = React.useMemo(() => {
    const m = new Map<string, MmNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-zinc-50 via-violet-50/40 to-indigo-100/40 dark:from-zinc-950 dark:via-violet-950/30 dark:to-indigo-950/40">
      <svg
        ref={svgRef}
        viewBox={`${baseViewBox.x} ${baseViewBox.y} ${baseViewBox.width} ${baseViewBox.height}`}
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <defs>
          {/* Soft radial halo behind clusters, for visual depth. */}
          <radialGradient id="mm-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(139,92,246)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0" />
          </radialGradient>

          {/* One <clipPath> per node so SVG <image> renders as a circle.
              Generated inline below. */}
          {nodes.map((n) => (
            <clipPath
              key={`clip-${n.id}`}
              id={`mm-clip-${n.id}`}
              clipPathUnits="userSpaceOnUse"
            >
              <circle cx={n.x} cy={n.y} r={radiusFor(n)} />
            </clipPath>
          ))}
        </defs>

        {/* Apply user pan/zoom via an inner transform group. */}
        <g
          transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}
          style={{ transformOrigin: "center" }}
        >
          <circle
            cx={0}
            cy={0}
            r={Math.max(baseViewBox.width, baseViewBox.height) / 2.2}
            fill="url(#mm-halo)"
          />

          {/* Edges */}
          <g strokeLinecap="round">
            {edges.map((e, i) => {
              const a = nodeById.get(e.source);
              const b = nodeById.get(e.target);
              if (!a || !b) return null;
              const isPrimary = e.kind === "primary";
              return (
                <line
                  key={`edge-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isPrimary ? "rgb(139,92,246)" : "rgb(148,163,184)"}
                  strokeOpacity={isPrimary ? 0.32 : 0.5}
                  strokeWidth={isPrimary ? 1.4 : 1.1}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((n) => (
              <MindMapNode
                key={n.id}
                node={n}
                onClick={handleNodeClick(n.id)}
                youLabel={t("common.you")}
              />
            ))}
          </g>
        </g>
      </svg>

      {/* Reset / recentre control */}
      <button
        type="button"
        onClick={recenter}
        aria-label="Recenter"
        title="Recenter"
        className="absolute bottom-28 right-4 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/70 text-zinc-700 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.4)] backdrop-blur-xl backdrop-saturate-150 transition active:scale-95 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
        </svg>
      </button>
    </div>
  );
}

function MindMapNode({
  node,
  onClick,
  youLabel,
}: {
  node: MmNode;
  onClick: (e: React.MouseEvent) => void;
  youLabel: string;
}) {
  const r = radiusFor(node);
  const isYou = node.id === YOU_ID;
  const isGhost = !isYou && !node.contact;
  const display = node.contact
    ? (node.contact.nickname ?? node.contact.name)
    : isYou
      ? youLabel
      : ghostName(node.id);
  const photoUrl = node.contact?.photoUrl;

  // Compact label width so very long names don't crowd the graph.
  const labelMaxChars = 16;
  const labelText =
    display.length > labelMaxChars
      ? display.slice(0, labelMaxChars - 1) + "…"
      : display;

  return (
    <g style={{ cursor: isYou ? "default" : "pointer" }}>
      {/* Outer ring — colour codes the node category. */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r + 2.5}
        fill="none"
        stroke={
          isYou
            ? "rgb(99,102,241)"
            : isGhost
              ? "rgb(148,163,184)"
              : "rgb(255,255,255)"
        }
        strokeOpacity={isYou ? 0.85 : isGhost ? 0.6 : 0.95}
        strokeWidth={isYou ? 3 : 2}
        style={{ pointerEvents: "none" }}
      />

      {/* Disc background — falls back to a gradient pill if no photo. */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={
          isYou
            ? "rgb(99,102,241)"
            : isGhost
              ? "rgb(226,232,240)"
              : "rgb(244,244,245)"
        }
        style={{ pointerEvents: "none" }}
      />

      {/* Photo, if we have one. SVG <image> respects the clipPath above. */}
      {photoUrl && !isGhost && (
        <image
          href={photoUrl}
          x={node.x - r}
          y={node.y - r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#mm-clip-${node.id})`}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Initials fallback (photo missing or ghost node). */}
      {(!photoUrl || isGhost) && (
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 0.85}
          fontWeight={600}
          fill={isYou ? "white" : isGhost ? "rgb(100,116,139)" : "rgb(63,63,70)"}
          style={{ pointerEvents: "none" }}
        >
          {initialsOf(display)}
        </text>
      )}

      {/* Label */}
      <text
        x={node.x}
        y={node.y + r + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="rgb(24,24,27)"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={3}
        paintOrder="stroke fill"
        style={{ pointerEvents: "none" }}
      >
        {labelText}
      </text>

      {/* Transparent hit target — sits on top of everything in this
          group and is the only element that receives pointer events.
          That way the click reliably fires on a known element instead
          of bubbling from an arbitrary child like <image>. */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r + 4}
        fill="transparent"
        onClick={onClick}
      />
    </g>
  );
}

function radiusFor(n: MmNode): number {
  if (n.id === YOU_ID) return 32;
  if (!n.contact) return 16;
  return 22;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function ghostName(id: string): string {
  // Strip the `c_` prefix and prettify so unknown mutuals still feel
  // human in the graph instead of like raw ids.
  const cleaned = id.replace(/^c_/, "").replace(/_/g, " ");
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
