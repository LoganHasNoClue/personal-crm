import * as React from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

/**
 * Mobile-first button with a guaranteed >= 44px tap target (Apple HIG /
 * WCAG 2.5.5 recommendation). Use this anywhere a user taps to act.
 */
export function TouchButton({
  variant = "primary",
  className,
  type = "button",
  children,
  ...rest
}: TouchButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-5 text-base font-medium",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-950",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
