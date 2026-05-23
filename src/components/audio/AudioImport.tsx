"use client";

import {
  AudioLines,
  CheckCircle2,
  Mic,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import { Avatar, Section, Sheet, ThinkingDots } from "@/components/ui";

interface AudioImportProps {
  /** Called once the user confirms an import. Mock-only for now. */
  onImported?: (count: number) => void;
}

interface ExtractedContact {
  name: string;
  headline: string | null;
  location: string | null;
  context: string | null;
  notes: string | null;
  confidence: number;
}

interface ExtractionResult {
  summary: string;
  contacts: ExtractedContact[];
  transcriptLength: number;
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; file: File; stage: Stage }
  | { kind: "error"; message: string; recoverable: boolean }
  | { kind: "results"; file: File; result: ExtractionResult };

type Stage = "uploading" | "transcribing" | "extracting";

const STAGE_LABELS: Record<Stage, string> = {
  uploading: "Uploading your recording…",
  transcribing: "Transcribing with Whisper…",
  extracting: "Finding the people you mentioned…",
};

/**
 * The whole audio import surface. A clear "tap to upload" affordance,
 * three live progress stages, and a beautiful iOS-style results sheet
 * (with per-row deselect + confidence chips).
 */
export function AudioImport({ onImported }: AudioImportProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setStatus({ kind: "uploading", file, stage: "uploading" });

    const formData = new FormData();
    formData.append("file", file);

    let response: Response;
    try {
      // Simulate stage progression so the UI feels alive while the
      // single request is in flight. Real progress would need SSE.
      const fakeStages = window.setTimeout(() => {
        setStatus((curr) =>
          curr.kind === "uploading"
            ? { ...curr, stage: "transcribing" }
            : curr,
        );
      }, 800);
      const fakeStage2 = window.setTimeout(() => {
        setStatus((curr) =>
          curr.kind === "uploading"
            ? { ...curr, stage: "extracting" }
            : curr,
        );
      }, 2800);

      response = await fetch("/api/audio/extract", {
        method: "POST",
        body: formData,
      });
      window.clearTimeout(fakeStages);
      window.clearTimeout(fakeStage2);
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Network error while uploading the recording.",
        recoverable: true,
      });
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;
      const recoverable = response.status !== 503;
      setStatus({
        kind: "error",
        message:
          body?.message ??
          `Couldn't analyze the recording (HTTP ${response.status}).`,
        recoverable,
      });
      return;
    }

    const result = (await response.json()) as ExtractionResult;
    setSelectedIds(new Set(result.contacts.map((_c, i) => i)));
    setStatus({ kind: "results", file, result });
  }

  function reset() {
    setStatus({ kind: "idle" });
    setSelectedIds(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function confirmImport() {
    if (status.kind !== "results") return;
    const count = selectedIds.size;
    reset();
    onImported?.(count);
    router.push("/people");
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
        Or upload a voice memo
      </h2>

      {status.kind === "idle" && (
        <UploadCard
          onPick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          onFile={handleFile}
        />
      )}

      {status.kind === "uploading" && <ProgressCard stage={status.stage} />}

      {status.kind === "error" && (
        <ErrorCard
          message={status.message}
          onRetry={status.recoverable ? reset : undefined}
          onDismiss={reset}
        />
      )}

      {status.kind === "results" && (
        <ResultsSheet
          file={status.file}
          result={status.result}
          selectedIds={selectedIds}
          onToggle={(i) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(i)) next.delete(i);
              else next.add(i);
              return next;
            })
          }
          onCancel={reset}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function UploadCard({
  onPick,
  fileInputRef,
  onFile,
}: {
  onPick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.m4a,.mp3,.wav,.webm,.mp4,.mpga,.ogg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        onClick={onPick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={`relative flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-5 py-7 text-center transition-colors ${
          dragging
            ? "border-violet-400/80 bg-violet-400/10"
            : "border-white/40 bg-white/40 hover:bg-white/55 dark:border-white/15 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
        }`}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.7)]">
          <UploadCloud className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
            Drop a recording, or tap to pick one
          </p>
          <p className="text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
            mp3, m4a, wav, webm · up to 24MB. Your voice memo gets
            transcribed, then I&apos;ll pull out every person mentioned.
          </p>
        </div>
      </button>
      <p className="px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        Audio is processed in memory and sent only to OpenAI for analysis.
        Nothing is stored on disk.
      </p>
    </div>
  );
}

function ProgressCard({ stage }: { stage: Stage }) {
  const stages: Stage[] = ["uploading", "transcribing", "extracting"];
  const activeIdx = stages.indexOf(stage);
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/40 bg-white/55 p-5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_20px_-8px_rgba(99,102,241,0.7)]">
          <AudioLines className="size-5" />
        </span>
        <div className="flex flex-col">
          <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
            {STAGE_LABELS[stage]}
          </p>
          <div className="flex items-center gap-2 text-[12px] text-zinc-500 dark:text-zinc-400">
            <ThinkingDots />
            <span>This usually takes a few seconds.</span>
          </div>
        </div>
      </div>
      <ol className="flex flex-col gap-2 pl-1">
        {stages.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-[13px]">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                i < activeIdx
                  ? "bg-emerald-500 text-white"
                  : i === activeIdx
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-300 text-zinc-600 dark:bg-white/10 dark:text-zinc-400"
              }`}
            >
              {i < activeIdx ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </span>
            <span
              className={
                i <= activeIdx
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              }
            >
              {STAGE_LABELS[s]}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-rose-300/40 bg-rose-500/10 p-5 backdrop-blur-2xl backdrop-saturate-150 dark:border-rose-500/30">
      <p className="text-[15px] font-semibold text-rose-700 dark:text-rose-300">
        Couldn&apos;t analyze the recording
      </p>
      <p className="text-[13px] leading-relaxed text-rose-700/90 dark:text-rose-200/90">
        {message}
      </p>
      <div className="flex gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-zinc-900 px-4 text-[14px] font-medium text-white active:scale-[0.97] dark:bg-white dark:text-zinc-900"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-white/40 bg-white/55 px-4 text-[14px] font-medium text-zinc-700 active:scale-[0.97] dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ResultsSheet({
  file,
  result,
  selectedIds,
  onToggle,
  onCancel,
  onConfirm,
}: {
  file: File;
  result: ExtractionResult;
  selectedIds: Set<number>;
  onToggle: (i: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const empty = result.contacts.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-results-title"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Dismiss results"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_180ms_ease-out_both]"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md sm:max-w-lg pointer-events-auto pb-[max(env(safe-area-inset-bottom),0.5rem)] animate-[slideUp_240ms_cubic-bezier(0.32,0.72,0,1)_both]"
      >
        <Sheet
          title=""
          trailing={
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 hover:bg-white/40 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          }
          className="mb-2 max-h-[88dvh] overflow-hidden"
        >
          <div className="flex max-h-[78dvh] flex-col gap-5 overflow-y-auto pb-2">
            {/* Header */}
            <header className="flex items-start gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]">
                <Sparkles className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="audio-results-title"
                  className="text-[20px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  {empty
                    ? "No people detected"
                    : `Found ${result.contacts.length} ${
                        result.contacts.length === 1 ? "person" : "people"
                      }`}
                </h2>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                  From <span className="font-medium">{file.name}</span> ·
                  {" "}
                  <Bytes bytes={file.size} />
                </p>
              </div>
            </header>

            {/* Summary */}
            {result.summary && (
              <div className="rounded-2xl border border-white/40 bg-white/55 p-4 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  What I heard
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                  {result.summary}
                </p>
              </div>
            )}

            {/* Contacts */}
            {!empty && (
              <Section header="People in this recording">
                {result.contacts.map((c, i) => {
                  const checked = selectedIds.has(i);
                  return (
                    <button
                      key={`${c.name}-${i}`}
                      type="button"
                      onClick={() => onToggle(i)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/40 active:bg-white/55 dark:hover:bg-white/[0.04]"
                    >
                      <Avatar name={c.name} seed={c.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
                            {c.name}
                          </span>
                          <ConfidencePill value={c.confidence} />
                        </div>
                        {c.headline && (
                          <p className="truncate text-[13px] text-zinc-600 dark:text-zinc-300">
                            {c.headline}
                          </p>
                        )}
                        {c.location && (
                          <p className="truncate text-[12px] text-zinc-500 dark:text-zinc-400">
                            {c.location}
                          </p>
                        )}
                        {c.context && (
                          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                            “{c.context}”
                          </p>
                        )}
                      </div>
                      <Checkbox checked={checked} />
                    </button>
                  );
                })}
              </Section>
            )}

            {/* CTA */}
            <div className="mt-1 flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onConfirm}
                disabled={selectedIds.size === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 px-5 text-[16px] font-semibold text-white shadow-[0_10px_28px_-8px_rgba(99,102,241,0.6)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                <CheckCircle2 className="size-4" />
                Add {selectedIds.size} {selectedIds.size === 1 ? "person" : "people"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/40 bg-white/55 px-4 text-[14px] font-medium text-zinc-700 active:scale-[0.97] dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
              >
                Discard
              </button>
            </div>
          </div>
        </Sheet>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.8 ? "success" : value >= 0.5 ? "info" : "warning";
  return (
    <GlassPill tone={tone} className="!px-2 !py-0.5 !text-[10px]">
      <Mic className="size-2.5" />
      {pct}%
    </GlassPill>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
        checked
          ? "bg-emerald-500 text-white"
          : "border border-zinc-300 bg-white/55 dark:border-zinc-600 dark:bg-white/5"
      }`}
    >
      {checked && <CheckCircle2 className="size-3.5" />}
    </span>
  );
}

function Bytes({ bytes }: { bytes: number }) {
  if (bytes < 1024) return <>{bytes}B</>;
  if (bytes < 1024 * 1024) return <>{(bytes / 1024).toFixed(0)} KB</>;
  return <>{(bytes / 1024 / 1024).toFixed(1)} MB</>;
}
