"use client";

import { House, Plus, Search, SquareUserRound, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * When the current path matches this prefix, the item is treated as
   * active. Use the special token `/$` to mean "exact match only".
   */
  matchPrefix: string;
  /** Visually emphasize this tab as a primary action. */
  primary?: boolean;
}

const items: NavItem[] = [
  { href: "/", label: "Home", icon: House, matchPrefix: "/$" },
  { href: "/people", label: "People", icon: SquareUserRound, matchPrefix: "/people" },
  { href: "/add", label: "Add", icon: Plus, matchPrefix: "/add", primary: true },
  { href: "/search", label: "Search", icon: Search, matchPrefix: "/search" },
  { href: "/chat", label: "Ember", icon: Sparkles, matchPrefix: "/chat" },
];

/**
 * Mobile-first bottom navigation bar — five iOS tabs with a centered
 * raised "+" primary action (à la TikTok, Mesh, and many iOS apps).
 * Floats above content, respects safe-area, and gives every tap a
 * generous target.
 */
export function GlassNavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-md sm:max-w-lg",
          "relative overflow-visible rounded-[28px]",
          "bg-white/55 dark:bg-zinc-900/55",
          "border border-white/40 dark:border-white/10",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)]",
          "dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[28px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/25"
        />
        <ul className="relative flex items-stretch justify-around">
          {items.map((item) => {
            const isActive = isItemActive(pathname, item);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "group flex h-16 min-h-16 min-w-12 flex-col items-center justify-center gap-0.5 px-1",
                    item.primary ? "-mt-3" : "",
                  )}
                >
                  {item.primary ? (
                    <PrimaryGlyph Icon={item.icon} isActive={isActive} />
                  ) : (
                    <StandardGlyph Icon={item.icon} isActive={isActive} />
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      item.primary ? "mt-1" : "",
                      isActive
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-500 dark:text-zinc-400",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function StandardGlyph({
  Icon,
  isActive,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-7 w-7 items-center justify-center transition-transform group-active:scale-90",
        isActive
          ? "text-zinc-900 dark:text-white"
          : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      <Icon className="size-[26px]" />
    </span>
  );
}

function PrimaryGlyph({
  Icon,
  isActive,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-12 items-center justify-center rounded-full",
        "bg-gradient-to-br from-zinc-900 to-zinc-700 text-white",
        "dark:from-white dark:to-zinc-200 dark:text-zinc-900",
        "shadow-[0_8px_20px_-6px_rgba(15,23,42,0.45)]",
        "transition-transform group-active:scale-95",
        isActive && "ring-2 ring-white/70 dark:ring-zinc-900/70",
      )}
    >
      <Icon className="size-6" />
    </span>
  );
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefix === "/$") return pathname === "/";
  return (
    pathname === item.matchPrefix ||
    pathname.startsWith(`${item.matchPrefix}/`)
  );
}
