"use client";

import {
  ArrowRight,
  MessageSquareText,
  Smartphone,
  UserPlus2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import {
  IconButton,
  InstagramIcon,
  LinkedInIcon,
  ListRow,
  Section,
  Sheet,
} from "@/components/ui";

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

/** Sheet-style add screen. The whole screen is the sheet — no overlay. */
export function AddView() {
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
        title="Add a person"
        trailing={
          <Link href="/people" aria-label="Close" className="contents">
            <IconButton variant="ghost" size="sm" label="Close">
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
              Import in bulk
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
                      <GlassPill tone="info">Soon</GlassPill>
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
              Tapping a source will open the platform&apos;s native auth flow
              in a real build. None of these are wired up yet.
            </p>
          </div>

          {/* Manual add */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
              Or add one manually
            </h2>
            <Section>
              <Field
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Joshua Browder"
                autoFocus
              />
              <Field
                label="Headline"
                value={headline}
                onChange={setHeadline}
                placeholder="What they do, or how you'd describe them"
              />
              <Field
                label="Where you met"
                value={where}
                onChange={setWhere}
                placeholder="Coffee shop in SoMa"
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
                  Saved
                </>
              ) : (
                <>
                  <UserPlus2 className="size-4" />
                  Save person
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
