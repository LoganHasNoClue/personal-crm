import "server-only";

import OpenAI from "openai";

import { env } from "./env";

/**
 * Lazily instantiated OpenAI client. We resolve at call time so the
 * SDK isn't constructed during `next build` (no env var probing at
 * module-load time, per Eazo's compatibility rules).
 */
function client(): OpenAI {
  const apiKey = env.openaiApiKey();
  if (!apiKey) {
    throw new AudioExtractConfigError(
      "OpenAI is not configured. Set OPENAI_API_KEY in your environment " +
        "(see .env.example).",
    );
  }
  return new OpenAI({ apiKey });
}

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

/** One person the model believes was mentioned in the recording. */
export interface ExtractedContact {
  name: string;
  /** Optional one-line headline derived from context (job, vibe, role). */
  headline: string | null;
  /** Optional textual location ("San Francisco, CA"). Not yet geocoded. */
  location: string | null;
  /** Optional context: where / how you met them, or what was said about them. */
  context: string | null;
  /** Optional free-form notes the user might want to remember. */
  notes: string | null;
  /** 0–1 confidence the model has that this is a distinct, real person. */
  confidence: number;
}

export interface ExtractionResult {
  /** 1–2 sentence summary of the recording. */
  summary: string;
  /** Distinct people mentioned in the recording, sorted by confidence desc. */
  contacts: ExtractedContact[];
  /** Length of the transcript text — useful UI signal. */
  transcriptLength: number;
}

/**
 * Thrown when OpenAI credentials are missing. The route handler maps
 * this to an HTTP 503 with a friendly body so the upload UI can render
 * a "configure OpenAI" empty state.
 */
export class AudioExtractConfigError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AudioExtractConfigError";
  }
}

/* -------------------------------------------------------------------------- */
/* Core entry point                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Transcribe an audio file with Whisper, then extract distinct people
 * mentioned via a strict-JSON-schema GPT call.
 *
 * Throws `AudioExtractConfigError` if `OPENAI_API_KEY` is missing — the
 * route handler should translate that into a 503 response.
 */
export async function extractContactsFromAudio(
  file: File,
): Promise<ExtractionResult> {
  const openai = client();

  // 1. Transcribe via Whisper. `whisper-1` accepts up to 25MB; route
  //    guards size before we get here.
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
  const transcript = transcription.text.trim();
  if (!transcript) {
    return { summary: "(empty transcript)", contacts: [], transcriptLength: 0 };
  }

  // 2. Run structured extraction. Strict mode guarantees the response
  //    matches our schema (no parsing surprises in the UI).
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You analyze short personal audio notes about meeting people. From the transcript, extract every distinct human the speaker mentions. For each person, infer the best available details from context: a short headline (job, role, or how the speaker described them), a textual location (where they met or where the person is based), a 'context' line (where/how they met, or the situation being described), and any short notes worth remembering. Skip the speaker themselves, generic pronouns ('someone', 'a guy'), and brands/companies that aren't people. Assign a confidence score from 0 to 1 — be conservative when the name is uncertain. Return null for any field that has no signal in the transcript.",
      },
      {
        role: "user",
        content:
          "Transcript:\n```\n" + transcript + "\n```\n\nExtract the people.",
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extracted_contacts",
        strict: true,
        schema: EXTRACTION_SCHEMA,
      },
    },
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  let parsed: ExtractionPayload;
  try {
    parsed = JSON.parse(raw) as ExtractionPayload;
  } catch (cause) {
    throw new Error(
      "Could not parse model response as JSON. " +
        (cause instanceof Error ? cause.message : ""),
    );
  }

  const contacts: ExtractedContact[] = (parsed.contacts ?? [])
    .filter((c) => c.name?.trim())
    .map((c) => ({
      name: c.name.trim(),
      headline: c.headline?.trim() || null,
      location: c.location?.trim() || null,
      context: c.context?.trim() || null,
      notes: c.notes?.trim() || null,
      confidence: clamp(c.confidence ?? 0.5, 0, 1),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  return {
    summary: (parsed.summary ?? "").trim() || "(no summary)",
    contacts,
    transcriptLength: transcript.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Schema (strict JSON-schema for Structured Outputs)                         */
/* -------------------------------------------------------------------------- */

interface ExtractionPayload {
  summary: string;
  contacts: Array<{
    name: string;
    headline: string | null;
    location: string | null;
    context: string | null;
    notes: string | null;
    confidence: number;
  }>;
}

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "1-2 sentence summary of what the audio was about.",
    },
    contacts: {
      type: "array",
      description: "Distinct people the speaker described.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "Best-guess display name for the person (e.g. 'Alex Chen').",
          },
          headline: {
            type: ["string", "null"],
            description:
              "Short role / vibe line. Null if no signal in the transcript.",
          },
          location: {
            type: ["string", "null"],
            description:
              "Free-form text location: city, neighborhood, or venue.",
          },
          context: {
            type: ["string", "null"],
            description: "Where / how the speaker met them.",
          },
          notes: {
            type: ["string", "null"],
            description: "Anything memorable the speaker said about them.",
          },
          confidence: {
            type: "number",
            description: "0–1 confidence this is a distinct, real person.",
          },
        },
        required: [
          "name",
          "headline",
          "location",
          "context",
          "notes",
          "confidence",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "contacts"],
  additionalProperties: false,
} as const;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
