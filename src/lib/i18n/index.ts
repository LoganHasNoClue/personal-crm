/**
 * Public i18n surface — import from `@/lib/i18n` instead of the
 * individual files so the server/client split stays an implementation
 * detail.
 *
 * Server components:
 *   `import { getT, getLocale } from "@/lib/i18n/server";`
 *
 * Client components:
 *   `import { useT, useLocale, LocaleProvider } from "@/lib/i18n/client";`
 *
 * Shared:
 *   `import { LOCALES, type Locale, translate } from "@/lib/i18n";`
 */

export {
  DEFAULT_LOCALE,
  HTML_LANG,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_SHORT,
  isLocale,
  makeTranslator,
  translate,
  type Locale,
  type Translator,
} from "./dictionary";
