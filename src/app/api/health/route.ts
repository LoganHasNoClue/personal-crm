import { NextResponse } from "next/server";

/**
 * Simple liveness probe. Intentionally avoids touching any external
 * service so it can answer even when env vars are missing or downstream
 * dependencies are down. Useful for uptime monitors and post-deploy checks.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "personal-crm",
    timestamp: new Date().toISOString(),
  });
}
