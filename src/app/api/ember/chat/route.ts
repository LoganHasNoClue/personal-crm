import { NextResponse } from "next/server";

import {
  EmberAgentConfigError,
  type EmberMessage,
  type EmberStreamEvent,
  runEmberAgent,
} from "@/lib/ember-agent";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { findSampleContact } from "@/lib/sample-contacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages?: Array<{ role?: string; content?: string }>;
  contactId?: string | null;
  locale?: string | null;
}

/**
 * POST /api/ember/chat
 *
 * Body: `{ messages: [{role, content}], contactId?: string }`
 *
 * Streams an NDJSON body of `EmberStreamEvent` objects (one JSON object
 * per line). Returns HTTP 503 if `OPENAI_API_KEY` is not configured, so
 * the client can fall back to the offline mock.
 */
export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .map((m) => sanitizeMessage(m))
        .filter((m): m is EmberMessage => Boolean(m))
    : [];

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Send at least one user message." },
      { status: 400 },
    );
  }

  const contact = body.contactId
    ? (findSampleContact(body.contactId) ?? null)
    : null;

  // Prefer the locale the client sent (always reflects the most recent
  // toggle), then fall back to the cookie, then to English.
  const cookieLocale = await getLocale();
  const locale: Locale = isLocale(body.locale)
    ? body.locale
    : cookieLocale ?? DEFAULT_LOCALE;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: EmberStreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        for await (const event of runEmberAgent({
          messages,
          contact,
          locale,
          signal: req.signal,
        })) {
          send(event);
        }
      } catch (err) {
        if (err instanceof EmberAgentConfigError) {
          // Special-case: surface as a typed event so the client can
          // gracefully fall back to the mock.
          send({ type: "error", message: err.message });
        } else if (err instanceof Error && err.name === "AbortError") {
          // Client navigated away — silently end the stream.
        } else {
          const message =
            err instanceof Error
              ? err.message
              : "Ember hit an unexpected error.";
          console.error("[ember-agent] stream error", err);
          send({ type: "error", message });
        }
      } finally {
        controller.close();
      }
    },
  });

  // Quick pre-flight: if OPENAI_API_KEY is missing, bail out with 503
  // *before* we open the stream. The client renders a friendly notice
  // and falls back to the local mock for the duration of that turn.
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Ember is not configured. Set OPENAI_API_KEY to enable the live agent.",
      },
      { status: 503 },
    );
  }

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

function sanitizeMessage(raw: {
  role?: string;
  content?: string;
}): EmberMessage | null {
  if (raw.role !== "user" && raw.role !== "assistant") return null;
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  if (!content) return null;
  // Hard upper bound to keep cost / abuse risk in check.
  return { role: raw.role, content: content.slice(0, 4000) };
}
