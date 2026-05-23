import "server-only";

import { SignJWT, importPKCS8 } from "jose";

import { env } from "./env";

/**
 * Default token lifetime. MapKit JS will request a new token before this
 * expires, and we sign on demand, so 30 minutes is a comfortable trade-off
 * between signing overhead and exposure of a leaked token.
 */
const DEFAULT_TTL_SECONDS = 30 * 60;

interface SignOptions {
  /**
   * Optional `origin` claim (e.g. https://crm.example.com). When present,
   * MapKit JS will reject the token if the page that loaded it has a
   * different origin — a useful belt-and-braces protection.
   */
  origin?: string;
  /** Override the lifetime in seconds. Apple recommends <= 7 days. */
  ttlSeconds?: number;
}

export interface MapKitTokenResult {
  token: string;
  /** Unix timestamp (seconds) when this token expires. */
  expiresAt: number;
}

/**
 * Sign a short-lived MapKit JS authorization token (ES256 JWT).
 *
 * Throws a descriptive error when any of the three required env vars are
 * missing, so the calling route handler can surface a 503 with a clear
 * "configure your credentials" message instead of crashing.
 */
export async function signMapKitToken(
  options: SignOptions = {},
): Promise<MapKitTokenResult> {
  const teamId = env.mapkitTeamId();
  const keyId = env.mapkitKeyId();
  const privateKeyPem = env.mapkitPrivateKey();

  if (!teamId || !keyId || !privateKeyPem) {
    throw new MapKitConfigError(
      "MapKit is not configured. Set MAPKIT_TEAM_ID, MAPKIT_KEY_ID, and " +
        "MAPKIT_PRIVATE_KEY in your environment (see .env.example).",
    );
  }

  let privateKey: CryptoKey;
  try {
    privateKey = await importPKCS8(privateKeyPem, "ES256");
  } catch (cause) {
    throw new MapKitConfigError(
      "MAPKIT_PRIVATE_KEY could not be parsed as a PKCS8 ES256 key. " +
        "Make sure you pasted the full .p8 contents including the " +
        "BEGIN/END PRIVATE KEY lines.",
      { cause },
    );
  }

  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + ttlSeconds;

  const builder = new SignJWT(options.origin ? { origin: options.origin } : {})
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setIssuer(teamId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt);

  const token = await builder.sign(privateKey);
  return { token, expiresAt };
}

/**
 * Thrown when MapKit credentials are missing or malformed. The route
 * handler maps this to an HTTP 503 with a friendly body — callers
 * (browser) can use that to render an empty state.
 */
export class MapKitConfigError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MapKitConfigError";
  }
}
