"use client";

import { Globe } from "lucide-react";
import * as React from "react";

import { LOCALES, LOCALE_LABEL, LOCALE_SHORT, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/client";

interface LanguageToggleProps {
  variant?: "icon" | "pill";
}

/**
 * Floating language switcher. By default renders as a small glass pill
 * with the native short label ("EN" / "中"); pass `variant="icon"` for
 * a globe-only avatar-sized button (used inside dense nav bars).
 *
 * Tapping it flips to the *next* locale in the list and triggers a
 * server-action round-trip + router refresh so the rest of the app
 * re-renders in the new language without a hard reload.
 */
export function LanguageToggle({ variant = "pill" }: LanguageToggleProps) {
  const { locale, setLocale, pending } = useLocale();
  const nextLocale = nextOf(locale);
  const ariaLabel = `Switch language to ${LOCALE_LABEL[nextLocale]}`;
  const onClick = () => {
    if (!pending) void setLocale(nextLocale);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={pending}
        className="inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/55 text-zinc-700 backdrop-blur-xl backdrop-saturate-150 transition-transform active:scale-95 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
      >
        <Globe className="size-[18px]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={pending}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/40 bg-white/65 px-3 text-[13px] font-medium text-zinc-800 backdrop-blur-xl backdrop-saturate-150 transition-transform active:scale-[0.97] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
    >
      <Globe className="size-[14px]" />
      <span aria-hidden className="tabular-nums">
        {LOCALE_SHORT[locale]}
      </span>
      <span className="sr-only">{LOCALE_LABEL[locale]}</span>
    </button>
  );
}

function nextOf(current: Locale): Locale {
  const idx = LOCALES.indexOf(current);
  return LOCALES[(idx + 1) % LOCALES.length]!;
}
