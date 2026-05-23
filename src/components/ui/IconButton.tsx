import * as React from "react";

import { cn } from "@/lib/cn";

type Variant = "filled" | "tinted" | "ghost";
type Size = "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Accessible label — required since the button has no visible text. */
  label: string;
}

const sizeClasses: Record<Size, string> = {
  // Always ≥ 44pt tap target. iOS HIG defines circular controls in this range.
  sm: "size-11 [&_svg]:size-5",
  md: "size-12 [&_svg]:size-[22px]",
  lg: "size-14 [&_svg]:size-6",
};

const variantClasses: Record<Variant, string> = {
  filled:
    "bg-zinc-900/85 text-white hover:bg-zinc-800/85 active:bg-zinc-700/85 dark:bg-white/90 dark:text-zinc-900 dark:hover:bg-white",
  tinted:
    "bg-white/55 text-zinc-800 hover:bg-white/70 active:bg-white/85 border border-white/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/10 dark:hover:bg-white/[0.12]",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-white/40 active:bg-white/55 dark:text-zinc-200 dark:hover:bg-white/10",
};

/**
 * Circular, icon-only button. Matches the look of iOS toolbar buttons
 * (e.g. the close/dismiss buttons on Apple's bottom sheets).
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "tinted", size = "md", label, className, children, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "transition-[transform,background-color] duration-150 ease-out",
          "active:scale-[0.94]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70",
          "dark:focus-visible:ring-white/70 dark:focus-visible:ring-offset-zinc-950",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
