import Link from "next/link";

import { GlassButton, GlassCard, GlassPill } from "@/components/glass";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";

export default function Home() {
  const recent = [...SAMPLE_CONTACTS]
    .filter((c) => c.lastContactedAt)
    .sort((a, b) =>
      (b.lastContactedAt ?? "").localeCompare(a.lastContactedAt ?? ""),
    )
    .slice(0, 3);

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-16">
      <header className="flex flex-col gap-3">
        <GlassPill tone="success">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
          v0 · in development
        </GlassPill>
        <h1 className="text-[2.25rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          A CRM for the
          <br />
          <span className="bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400">
            people in your life.
          </span>
        </h1>
        <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          Remember names, log catch-ups, and get nudged before too much time
          slips by. Built for phones, because that&apos;s where your people are.
        </p>
      </header>

      <GlassCard padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            Recent catch-ups
          </h2>
          <Link
            href="/contacts"
            className="text-xs font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            View all
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-white/40 dark:divide-white/10">
          {recent.map((contact) => (
            <li
              key={contact.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar name={contact.nickname ?? contact.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {contact.nickname ?? contact.name}
                </p>
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                  {contact.context ?? contact.meetingPlace?.label}
                </p>
              </div>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {formatRelative(contact.lastContactedAt!)}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard padding="lg" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          What&apos;s coming
        </h2>
        <ul className="flex flex-col gap-3 text-base">
          <FeatureRow
            title="Contacts you actually use"
            description="Names, faces, how you met, and the stuff you should remember."
          />
          <FeatureRow
            title="Lightweight check-in cadence"
            description="Tell it how often you want to keep in touch, get a friendly nudge."
          />
          <FeatureRow
            title="People on a map"
            description="See your network where you met them — powered by Apple Maps."
          />
        </ul>
      </GlassCard>

      <div className="flex flex-col gap-3 pb-2">
        <Link href="/contacts" className="contents">
          <GlassButton variant="primary" className="w-full">
            Open contacts
          </GlassButton>
        </Link>
        <Link href="/map" className="contents">
          <GlassButton variant="secondary" className="w-full">
            See the map
          </GlassButton>
        </Link>
      </div>

      <p className="pb-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Built mobile-first · tap targets are at least 44px
      </p>
    </main>
  );
}

function FeatureRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-1.5 size-2 shrink-0 rounded-full bg-zinc-900 dark:bg-white"
      />
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </span>
      </div>
    </li>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-violet-300 text-sm font-semibold text-zinc-800 ring-1 ring-inset ring-white/60 dark:from-sky-500/40 dark:to-violet-500/40 dark:text-white"
    >
      {initials}
    </span>
  );
}

/** Lightweight relative-time formatter — avoids pulling in a date lib. */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const deltaSeconds = Math.round((Date.now() - then) / 1000);
  const minutes = Math.round(deltaSeconds / 60);
  const hours = Math.round(deltaSeconds / 3600);
  const days = Math.round(deltaSeconds / 86400);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 14) return `${days}d`;
  if (weeks < 8) return `${weeks}w`;
  return `${months}mo`;
}
