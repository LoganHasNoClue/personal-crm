import { NextResponse } from "next/server";

import {
  AudioExtractConfigError,
  extractContactsFromAudio,
} from "@/lib/audio-extract";

/** Generated per-request — no caching. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Whisper allows up to 25MB. We mirror that here as a hard upper bound. */
const MAX_BYTES = 24 * 1024 * 1024;

/** Accept the common audio formats Whisper itself supports. */
const ACCEPTED_PREFIXES = ["audio/"];
const ACCEPTED_EXTRA_TYPES = new Set([
  "video/mp4", // .mp4 audio-only recordings come back as video/mp4
  "video/mpeg",
  "video/webm",
]);

/**
 * POST /api/audio/extract
 *
 * Accepts a single multipart field, `file`, containing the audio
 * recording. Returns a JSON `ExtractionResult` payload.
 *
 * Failure modes:
 *  - 400 — no file, wrong content-type, or extension
 *  - 413 — file too large
 *  - 503 — `OPENAI_API_KEY` not configured
 *  - 502 — upstream OpenAI error
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "bad_request", "Expected multipart/form-data body.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError(
      400,
      "missing_file",
      "No `file` field found. Attach the recording as a form field named 'file'.",
    );
  }

  if (file.size === 0) {
    return jsonError(400, "empty_file", "Uploaded file is empty.");
  }

  if (file.size > MAX_BYTES) {
    return jsonError(
      413,
      "file_too_large",
      `Recording is larger than ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB. Trim or split the file and try again.`,
    );
  }

  if (!isAcceptedType(file.type)) {
    return jsonError(
      400,
      "unsupported_type",
      `'${file.type || "unknown"}' isn't a supported audio format. Try mp3, m4a, wav, or webm.`,
    );
  }

  try {
    const result = await extractContactsFromAudio(file);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AudioExtractConfigError) {
      return jsonError(503, "openai_not_configured", error.message);
    }
    console.error("[audio/extract] upstream error", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Audio analysis failed unexpectedly.";
    return jsonError(502, "upstream_error", message);
  }
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

function isAcceptedType(mime: string): boolean {
  if (!mime) return true; // some browsers omit type for .m4a; let Whisper decide
  if (ACCEPTED_PREFIXES.some((p) => mime.startsWith(p))) return true;
  return ACCEPTED_EXTRA_TYPES.has(mime);
}
