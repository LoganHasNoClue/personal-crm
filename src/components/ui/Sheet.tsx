import * as React from "react";

import { cn } from "@/lib/cn";

interface SheetProps {
  /** Optional title shown inside the sheet (compact nav-bar style). */
  title?: string;
  /** Optional trailing slot for a close button or action. */
  trailing?: React.ReactNode;
  /** Sheet body. */
  children: React.ReactNode;
  className?: string;
}

/**
 * iOS-style modal sheet container. Renders with the rounded top corners,
 * the small grabber indicator, and a frosted background. Designed for
 * use as a *page* (not a true overlay) — pair it with a route that
 * presents from the bottom of the tab UI.
 */
export function Sheet({ title, trailing, children, className }: SheetProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-md flex-col sm:max-w-lg",
        "rounded-t-[28px] sm:rounded-3xl",
        "bg-white/70 dark:bg-zinc-900/70",
        "backdrop-blur-2xl backdrop-saturate-150",
        "border border-white/40 dark:border-white/10",
        "shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.25)]",
        "dark:shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.7)]",
        className,
      )}
    >
      {/* Grabber */}
      <div className="flex justify-center pt-2">
        <span
          aria-hidden
          className="h-1 w-9 rounded-full bg-zinc-400/60 dark:bg-zinc-500/50"
        />
      </div>
      {(title || trailing) && (
        <div className="flex h-11 items-center justify-between px-4">
          <span className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </span>
          {trailing}
        </div>
      )}
      <div className="px-4 pb-6">{children}</div>
    </div>
  );
}
