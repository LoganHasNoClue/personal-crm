/**
 * Tiny class-name helper. Joins truthy class strings with single spaces.
 * Avoids pulling in `clsx`/`classnames` until we actually need them.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
