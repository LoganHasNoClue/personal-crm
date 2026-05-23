"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /**
   * When the current path starts with this prefix, the item is treated
   * as active. Use a more specific prefix than `href` if a route should
   * not "claim" deeper paths.
   */
  matchPrefix?: string;
}

const items: NavItem[] = [
  {
    href: "/",
    label: "Home",
    matchPrefix: "/$",
    icon: <HomeIcon />,
  },
  {
    href: "/contacts",
    label: "Contacts",
    matchPrefix: "/contacts",
    icon: <PeopleIcon />,
  },
  {
    href: "/map",
    label: "Map",
    matchPrefix: "/map",
    icon: <MapIcon />,
  },
];

/**
 * Mobile-first bottom navigation bar with a frosted-glass surface.
 * Floats above the content, respects iOS safe areas, and keeps every
 * tap target well above the 44px minimum.
 */
export function GlassNavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "px-3 pt-2",
        "pb-[max(env(safe-area-inset-bottom),0.5rem)]",
        "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-md sm:max-w-lg",
          "relative overflow-hidden rounded-[28px]",
          "bg-white/55 dark:bg-white/[0.06]",
          "border border-white/40 dark:border-white/10",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)]",
          "dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/25"
        />
        <ul className="relative flex items-stretch justify-around">
          {items.map((item) => {
            const isActive = isItemActive(pathname, item);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex h-14 min-h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 transition-colors",
                    isActive
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-7 w-7 items-center justify-center transition-transform group-active:scale-90",
                      isActive && "drop-shadow-[0_2px_6px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_2px_6px_rgba(255,255,255,0.18)]",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-medium leading-none">
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

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefix === "/$") return pathname === "/";
  const prefix = item.matchPrefix ?? item.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3.5 11.5 12 4l8.5 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1h3v-5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v5h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <circle cx={9} cy={9} r={3.25} />
      <path d="M3.5 19c.6-2.8 2.9-4.5 5.5-4.5s4.9 1.7 5.5 4.5" />
      <circle cx={16.5} cy={8} r={2.5} />
      <path d="M15.5 14.6c2.3.2 4.1 1.7 4.5 4.4" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M9 4 3.6 5.8A1 1 0 0 0 3 6.7v12.4a1 1 0 0 0 1.4.9L9 18" />
      <path d="m9 4 6 2" />
      <path d="m9 18 6 2" />
      <path d="m15 6 5.4-1.8A1 1 0 0 1 21.8 5l-.4 12.4a1 1 0 0 1-.7 1L15 20" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}
