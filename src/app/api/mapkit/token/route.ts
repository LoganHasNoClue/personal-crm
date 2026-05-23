import { NextResponse } from "next/server";

import { MapKitConfigError, signMapKitToken } from "@/lib/mapkit-token";

/**
 * Token is short-lived and per-request; static caching would defeat the
 * whole point. Mark this route handler dynamic so Next.js never tries
 * to prerender or cache responses.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/mapkit/token
 *
 * Returns a signed MapKit JS authorization token. The browser's loader
 * calls this and feeds the token to `@apple/mapkit-loader`'s `load()`.
 *
 * Failure modes:
 *  - 503 when credentials are missing/malformed (renders empty state)
 *  - 500 on unexpected errors
 */
export async function GET(request: Request) {
  try {
    const origin = pickOrigin(request);
    const { token, expiresAt } = await signMapKitToken({ origin });
    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    if (error instanceof MapKitConfigError) {
      return NextResponse.json(
        { error: "mapkit_not_configured", message: error.message },
        { status: 503 },
      );
    }
    console.error("[mapkit/token] unexpected error", error);
    return NextResponse.json(
      { error: "internal_error", message: "Could not sign MapKit token." },
      { status: 500 },
    );
  }
}

/**
 * Prefer the request's own origin so we work in dev, preview, and prod
 * without manual reconfiguration. Falls back to NEXT_PUBLIC_APP_URL when
 * the request lacks a usable origin (e.g. some preview environments).
 */
function pickOrigin(request: Request): string | undefined {
  try {
    const url = new URL(request.url);
    if (url.origin && url.origin !== "null") return url.origin;
  } catch {
    /* fall through */
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return configured && configured.length > 0 ? configured : undefined;
}
