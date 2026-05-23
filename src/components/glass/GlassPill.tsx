import * as React from "react";

import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "info" | "warning";

interface GlassPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: "text-zinc-700 dark:text-zinc-200",
  success: "text-emerald-700 dark:text-emerald-300",
  info: "text-sky-700 dark:text-sky-300",
  warning: "text-amber-700 dark:text-amber-300",
};

/**
 * Compact, glassy badge for status, categories, or short labels.
 * Slightly translucent so it picks up tint from the surface behind it.
 */
export function GlassPill({
  tone = "neutral",
  className,
  children,
  ...rest
}: GlassPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "bg-white/55 dark:bg-white/10",
        "px-3 py-1 text-xs font-medium uppercase tracking-wide",
        "border border-white/40 dark:border-white/10",
        "backdrop-blur-xl backdrop-saturate-150",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
