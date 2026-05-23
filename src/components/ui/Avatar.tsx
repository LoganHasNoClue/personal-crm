"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  /** Display name used for fallback initials. */
  name: string;
  /** Optional remote photo URL. Falls back to initials on error / 404. */
  src?: string;
  /** Stable identity used to colorize the gradient fallback. */
  seed?: string;
  size?: Size;
  /** Decorative ring around the avatar. Useful on map pins / chat. */
  ring?: boolean;
  className?: string;
}

const sizeMap: Record<Size, { box: string; text: string; px: number }> = {
  xs: { box: "size-7", text: "text-[10px]", px: 28 },
  sm: { box: "size-9", text: "text-xs", px: 36 },
  md: { box: "size-11", text: "text-sm", px: 44 },
  lg: { box: "size-14", text: "text-base", px: 56 },
  xl: { box: "size-20", text: "text-xl", px: 80 },
  "2xl": { box: "size-28", text: "text-2xl", px: 112 },
};

/**
 * A small palette of soft duotones; deterministic per-seed so the same
 * contact always gets the same gradient. Inspired by iOS Contacts and
 * the Mesh inspiration screenshots.
 */
const gradients = [
  "from-sky-300 to-violet-400",
  "from-emerald-300 to-cyan-400",
  "from-pink-300 to-purple-400",
  "from-amber-300 to-rose-400",
  "from-teal-300 to-indigo-400",
  "from-fuchsia-300 to-sky-400",
  "from-lime-300 to-emerald-400",
  "from-orange-300 to-pink-400",
];

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return gradients[hash % gradients.length]!;
}

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * iOS-style round avatar. Renders the photo when available; otherwise a
 * deterministic gradient with the contact's initials — same energy as
 * the Apple Contacts fallback monograms.
 */
export function Avatar({
  name,
  src,
  seed,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const [hasImage, setHasImage] = React.useState(Boolean(src));
  const dims = sizeMap[size];
  const initials = initialsFor(name);
  const gradient = pickGradient(seed ?? name);

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br",
        gradient,
        ring &&
          "ring-2 ring-white/80 dark:ring-zinc-900/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]",
        dims.box,
        className,
      )}
    >
      {hasImage && src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          width={dims.px}
          height={dims.px}
          loading="lazy"
          onError={() => setHasImage(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "font-semibold text-zinc-800/90 mix-blend-luminosity",
            dims.text,
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
