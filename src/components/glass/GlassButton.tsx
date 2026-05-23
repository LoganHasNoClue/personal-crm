import * as React from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: cn(
    "bg-zinc-900/90 text-white",
    "hover:bg-zinc-800/90 active:bg-zinc-700/90",
    "dark:bg-white/90 dark:text-zinc-900 dark:hover:bg-white",
    "shadow-[0_8px_24px_-8px_rgba(15,23,42,0.6)]",
  ),
  secondary: cn(
    "bg-white/55 text-zinc-900",
    "hover:bg-white/70 active:bg-white/85",
    "dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    "border border-white/40 dark:border-white/10",
    "backdrop-blur-xl backdrop-saturate-150",
  ),
  ghost: cn(
    "bg-transparent text-zinc-700",
    "hover:bg-white/40 active:bg-white/55",
    "dark:text-zinc-200 dark:hover:bg-white/10 dark:active:bg-white/15",
  ),
};

const sizeClasses: Record<Size, string> = {
  // All sizes keep at least a 44px tap target per WCAG 2.5.5.
  sm: "min-h-11 min-w-11 px-4 text-sm",
  md: "min-h-12 min-w-12 px-5 text-base",
  lg: "min-h-14 min-w-14 px-6 text-base",
};

/**
 * Mobile-first glass button. Always renders at least a 44 × 44 pt tap
 * target. Use `variant="primary"` for the main CTA on a screen.
 */
export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    { variant = "primary", size = "md", className, type = "button", children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "relative inline-flex select-none items-center justify-center gap-2",
          "rounded-full font-medium tracking-tight",
          "transition-[transform,background-color,box-shadow] duration-200 ease-out",
          "active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70",
          "dark:focus-visible:ring-white/70 dark:focus-visible:ring-offset-zinc-950",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {/* Top-edge specular highlight — gives the button a hint of glass
            even on the primary (opaque) variant. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-3 top-0 h-px rounded-full",
            variant === "primary"
              ? "bg-white/25"
              : "bg-white/60 dark:bg-white/20",
          )}
        />
        <span className="relative inline-flex items-center gap-2">{children}</span>
      </button>
    );
  },
);
