import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  type Locale,
  type Translator,
  isLocale,
  makeTranslator,
} from "./dictionary";

export const LOCALE_COOKIE = "perso-lang";

/**
 * Resolve the active locale on the server. Reads the `perso-lang`
 * cookie set by the client toggle; falls back to the default locale.
 *
 * Pages that render in different languages must `await` this — Next's
 * `cookies()` API is async in App Router.
 */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Convenience: returns both the active locale and a translator bound
 * to it, so server components can do
 *   const { t, locale } = await getT();
 */
export async function getT(): Promise<{
  locale: Locale;
  t: Translator;
}> {
  const locale = await getLocale();
  return { locale, t: makeTranslator(locale) };
}
