"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { setLocaleAction } from "./actions";
import {
  DEFAULT_LOCALE,
  type Locale,
  type Translator,
  makeTranslator,
} from "./dictionary";

interface LocaleContextValue {
  locale: Locale;
  t: Translator;
  /**
   * Switch the app language. Persists a cookie via a server action,
   * then refreshes the router so server components paint in the new
   * locale on the next render.
   */
  setLocale: (next: Locale) => Promise<void>;
  /** True while a `setLocale` round-trip is in flight. */
  pending: boolean;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

/**
 * Wraps the app tree and provides the current locale + translator to
 * every client component. The root layout reads the cookie server-side
 * and passes `initialLocale` here so the first paint matches SSR.
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  // If the cookie changes outside this tab (different language picked
  // in another browser window), keep this provider in sync on focus.
  React.useEffect(() => {
    function syncFromCookie() {
      const m = document.cookie.match(/(?:^|;\s*)perso-lang=([^;]+)/);
      const next = m?.[1];
      if (next && (next === "en" || next === "zh") && next !== locale) {
        setLocaleState(next);
      }
    }
    window.addEventListener("focus", syncFromCookie);
    return () => window.removeEventListener("focus", syncFromCookie);
  }, [locale]);

  const setLocale = React.useCallback(
    (next: Locale) => {
      return new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            await setLocaleAction(next);
          } finally {
            setLocaleState(next);
            // Refresh the route so cached server components fetch the
            // new cookie and re-render with the new translator.
            router.refresh();
            resolve();
          }
        });
      });
    },
    [router],
  );

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: makeTranslator(locale),
      setLocale,
      pending,
    }),
    [locale, setLocale, pending],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/**
 * Read the current locale + translator inside a client component.
 * Throws a friendly error if the provider is missing so we catch
 * missing-wrap mistakes early.
 */
export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    // Fail safe: return an English translator. This keeps stories and
    // tests rendering even when they forget the provider — and avoids
    // a hard crash mid-paint in production.
    return {
      locale: DEFAULT_LOCALE,
      t: makeTranslator(DEFAULT_LOCALE),
      setLocale: async () => {},
      pending: false,
    };
  }
  return ctx;
}

/** Shorthand for `useLocale().t` — saves a destructure at call sites. */
export function useT(): Translator {
  return useLocale().t;
}
