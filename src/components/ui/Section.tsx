import * as React from "react";

import { cn } from "@/lib/cn";

interface SectionProps {
  /** Small uppercase header above the grouped card (iOS Settings style). */
  header?: React.ReactNode;
  /** Small caption shown beneath the grouped card. */
  footer?: React.ReactNode;
  /** Children are rendered inside the glass card with auto separators. */
  children: React.ReactNode;
  className?: string;
}

/**
 * iOS grouped-list section. Wraps a stack of `<ListRow>` children in a
 * glass card and draws hairline separators between them — matching the
 * inset list style used throughout Settings and Contacts on iOS.
 */
export function Section({ header, footer, children, className }: SectionProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      {header && (
        <h2 className="px-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
          {header}
        </h2>
      )}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-white/55 dark:bg-white/[0.06]",
          "backdrop-blur-2xl backdrop-saturate-150",
          "border border-white/40 dark:border-white/10",
          "shadow-[0_4px_18px_-6px_rgba(15,23,42,0.16)]",
          "dark:shadow-[0_8px_22px_-8px_rgba(0,0,0,0.5)]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/15"
        />
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {item}
            {i < items.length - 1 && (
              <div
                aria-hidden
                className="ml-[3.75rem] h-px bg-zinc-900/8 dark:bg-white/10"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {footer && (
        <p className="px-4 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
          {footer}
        </p>
      )}
    </section>
  );
}
