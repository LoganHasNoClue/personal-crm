import * as React from "react";

import { cn } from "@/lib/cn";

type Padding = "none" | "sm" | "md" | "lg";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual padding scale. Defaults to `md`. */
  padding?: Padding;
  /** Render as a different element (e.g. `section`, `article`). */
  as?: React.ElementType;
}

const paddingClasses: Record<Padding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

/**
 * Liquid-glass container. A frosted, translucent surface with a subtle
 * inner highlight and a soft outer shadow. Stack these on a colorful or
 * photographic background to get the full "glass over content" effect.
 */
export function GlassCard({
  padding = "md",
  as: Component = "div",
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-white/55 dark:bg-white/[0.06]",
        "backdrop-blur-2xl backdrop-saturate-150",
        "border border-white/40 dark:border-white/10",
        "shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.12)]",
        "dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]",
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {/* Inner specular highlight — the subtle bright top edge that gives
          Apple's glass surfaces their "wet" look. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/25"
      />
      {/* Inset ring softens the edge where the blur meets the content. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/30 dark:ring-white/[0.06]"
      />
      <div className="relative">{children}</div>
    </Component>
  );
}
