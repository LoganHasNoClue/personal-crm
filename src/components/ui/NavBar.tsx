import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/cn";

interface NavBarProps {
  /** Optional back-link target. When present, renders the iOS chevron. */
  back?: { href: string; label?: string };
  /** Large iOS-style title text. */
  title: string;
  /** Optional subtitle shown beneath the title. */
  subtitle?: string;
  /** Trailing action slot (usually `<IconButton />`). */
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * iOS-style large-title navigation header. Pair it with a scrollable
 * content area below; we let the OS handle large-to-compact behavior
 * via scroll perception alone (no scroll listeners required for v1).
 */
export function NavBar({ back, title, subtitle, trailing, className }: NavBarProps) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-11 items-center justify-between">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex h-11 items-center gap-1 -ml-2 px-2 text-[15px] font-medium text-zinc-700 hover:text-zinc-900 active:opacity-70 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            <ChevronLeft />
            <span className="leading-none">{back.label ?? "Back"}</span>
          </Link>
        ) : (
          <span />
        )}
        {trailing && <div className="flex items-center gap-2">{trailing}</div>}
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
