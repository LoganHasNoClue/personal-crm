"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/cn";

interface SearchFieldProps {
  value: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
  /** Optional callback when the user submits via Enter. */
  onSubmit?: (value: string) => void;
  /** Autofocus on mount. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * iOS-style search field. Frosted glass, leading magnifier glyph, and
 * a clear button that only appears when the field has content.
 */
export function SearchField({
  value,
  onValueChange,
  placeholder = "Search",
  onSubmit,
  autoFocus,
  className,
}: SearchFieldProps) {
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
      >
        <Search className="size-4" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "h-11 w-full rounded-xl pl-9 pr-10 text-[16px] leading-none",
          "bg-white/55 dark:bg-white/[0.06]",
          "border border-white/40 dark:border-white/10",
          "text-zinc-900 placeholder:text-zinc-500 dark:text-zinc-50 dark:placeholder:text-zinc-400",
          "backdrop-blur-2xl backdrop-saturate-150",
          "outline-none transition-shadow",
          "focus:ring-2 focus:ring-zinc-900/30 dark:focus:ring-white/30",
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 hover:bg-white/40 active:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
