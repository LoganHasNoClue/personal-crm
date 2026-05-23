/**
 * Centralized, lazy access to environment variables.
 *
 * All values are read from `process.env` on demand so a missing variable
 * never throws at module load / startup time. Callers must handle the
 * `undefined` case themselves (e.g. surface a friendly UI error or skip
 * the dependent feature).
 *
 * Never hardcode secrets here. Document every variable in `.env.example`
 * and the README's "Environment Variables" section.
 */

export type OptionalEnv = string | undefined;

/**
 * Read an environment variable without throwing.
 * Returns the trimmed value, or `undefined` if unset/empty.
 */
export function readEnv(name: string): OptionalEnv {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

/**
 * Read an env var and throw a descriptive error at *call* time (not at
 * import time). Use this inside request handlers / server actions where
 * a missing var should fail the operation, not the whole build.
 */
export function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `See .env.example for the full list of expected variables.`,
    );
  }
  return value;
}

export const env = {
  /** Public base URL of the deployed app, e.g. https://crm.example.com */
  appUrl: (): OptionalEnv => readEnv("NEXT_PUBLIC_APP_URL"),
  /** Connection string for the relational database (added in a later step). */
  databaseUrl: (): OptionalEnv => readEnv("DATABASE_URL"),
} as const;
