"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./dictionary";
import { LOCALE_COOKIE } from "./server";

/**
 * Server Action: persist the user's preferred locale in a long-lived
 * cookie and revalidate every route so server components re-render
 * with the new language. Called from the language toggle button.
 */
export async function setLocaleAction(next: Locale): Promise<void> {
  const value = isLocale(next) ? next : DEFAULT_LOCALE;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // one year
    sameSite: "lax",
    httpOnly: false, // read by client provider on hydration
  });
  // Flush every cached route so the next navigation paints in the
  // new language. We use the root layout path because all of our
  // server components depend on the cookie.
  revalidatePath("/", "layout");
}
