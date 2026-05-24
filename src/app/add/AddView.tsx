"use client";

import {
  ArrowRight,
  AudioLines,
  MessageSquareText,
  Mic,
  Smartphone,
  Sparkles,
  UserPlus2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AudioImport } from "@/components/audio/AudioImport";
import { GlassPill } from "@/components/glass";
import {
  IconButton,
  InstagramIcon,
  LinkedInIcon,
  ListRow,
  Section,
  Sheet,
} from "@/components/ui";
import { useT } from "@/lib/i18n/client";

interface ImportSource {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Pretend-stat: how many people we'd import from this source. */
  estimated: number;
  /** Whether the platform is already wired up. None of them are, in v1. */
  status: "available" | "soon";
}

const SOURCES: ImportSource[] = [
  {
    id: "apple-contacts",
    label: "Apple Contacts",
    description: "Names, numbers, emails from your device.",
    icon: Smartphone,
    estimated: 364,
    status: "available",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Headlines, locations, and the who-knows-who graph.",
    icon: LinkedInIcon,
    estimated: 1208,
    status: "available",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Friends you follow, with handles & profile photos.",
    icon: InstagramIcon,
    estimated: 412,
    status: "soon",
  },
  {
    id: "imessage",
    label: "iMessage",
    description: "Threads, group chats, and recent activity.",
    icon: MessageSquareText,
    estimated: 96,
    status: "soon",
  },
];

/**
 * Audio capture platforms. These pretend to sync entire libraries — the
 * "upload one recording" flow below them is the actually-working path
 * via OpenAI Whisper + GPT-4o-mini.
 */
const AUDIO_SOURCES: ImportSource[] = [
  {
    id: "plaud",
    label: "Plaud",
    description: "Voice recordings from your Plaud Note device.",
    icon: Mic,
    estimated: 47,
    status: "soon",
  },
  {
    id: "granola",
    label: "Granola",
    description: "Meeting notes captured on your Mac.",
    icon: AudioLines,
    estimated: 19,
    status: "soon",
  },
  {
    id: "usemagic",
    label: "Usemagic",
    description: "AI-summarised voice notes from your library.",
    icon: Sparkles,
    estimated: 0,
    status: "soon",
  },
];

/** Sheet-style add screen. The whole screen is the sheet — no overlay. */
export function AddView() {
  const t = useT();
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [where, setWhere] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const canSave = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    // Mock save — in v1 we just confetti a tiny checkmark and bounce home.
    setSubmitted(true);
    window.setTimeout(() => router.push("/people"), 900);
  }

  return (
    <main className="app-shell app-shell--full relative flex min-h-dvh w-full flex-col px-3 pt-2 sm:px-6 sm:pt-6">
      <Sheet
        title={t("add.title")}
        trailing={
          <Link href="/people" aria-label={t("add.closeAria")} className="contents">
            <IconButton variant="ghost" size="sm" label={t("add.closeAria")}>
              <X />
            </IconButton>
          </Link>
        }
        className="mb-24 mt-2"
      >
        <div className="flex flex-col gap-6 pt-2">
          {/* Import sources */}
          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
              {t("add.import.title")}
            </h2>
            <Section>
              {SOURCES.map((source) => (
                <ListRow
                  key={source.id}
                  as="button"
                  leading={<SourceIcon Icon={source.icon} />}
                  title={source.label}
                  subtitle={source.description}
                  value={
                    source.status === "available" ? (
                      <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="tabular-nums text-[15px]">
                          {source.estimated}
                        </span>
                        <ArrowRight className="size-4" />
                      </span>
                    ) : (
                      <GlassPill tone="info">{t("source.soon")}</GlassPill>
                    )
                  }
                  onClick={() => {
                    /* Mock connect flow placeholder. */
                  }}
                  disabled={source.status !== "available"}
                />
              ))}
            </Section>
            <p className="px-4 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
              {t("add.import.subtitle")}
            </p>
          </div>

          {/* Import from audio: connectors + working upload flow */}
          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
              {t("add.audio.title")}
            </h2>
            <Section>
              {AUDIO_SOURCES.map((source) => (
                <ListRow
                  key={source.id}
                  as="button"
                  leading={<SourceIcon Icon={source.icon} />}
                  title={source.label}
                  subtitle={source.description}
                  value={
                    source.status === "available" ? (
                      <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="tabular-nums text-[15px]">
                          {source.estimated}
                        </span>
                        <ArrowRight className="size-4" />
                      </span>
                    ) : (
                      <GlassPill tone="info">{t("source.soon")}</GlassPill>
                    )
                  }
                  onClick={() => {
                    /* Mock connect flow placeholder. */
                  }}
                  disabled={source.status !== "available"}
                />
              ))}
            </Section>
            <AudioImport />
          </div>

          {/* Manual add */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
              {t("add.manual.title")}
            </h2>
            <Section>
              <Field
                label={t("add.manual.nameLabel")}
                value={name}
                onChange={setName}
                placeholder={t("add.manual.namePlaceholder")}
                autoFocus
              />
              <Field
                label={t("add.manual.headlineLabel")}
                value={headline}
                onChange={setHeadline}
                placeholder={t("add.manual.headlinePlaceholder")}
              />
              <Field
                label={t("add.manual.placeLabel")}
                value={where}
                onChange={setWhere}
                placeholder={t("add.manual.placePlaceholder")}
              />
            </Section>

            <button
              type="submit"
              disabled={!canSave || submitted}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-[16px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.5)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 dark:bg-white dark:text-zinc-900"
            >
              {submitted ? (
                <>
                  <Check className="size-4" />
                  {t("common.save")}
                </>
              ) : (
                <>
                  <UserPlus2 className="size-4" />
                  {t("add.manual.save")}
                </>
              )}
            </button>
          </form>
        </div>
      </Sheet>
    </main>
  );
}

function SourceIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-700 dark:from-white/15 dark:to-white/5 dark:text-zinc-200">
      <Icon className="size-5" />
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex min-h-[52px] items-center gap-3 px-4 py-2 text-left">
      <span className="w-28 shrink-0 text-[15px] text-zinc-600 dark:text-zinc-300">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-[16px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
    </label>
  );
}
