import {
  ArrowRight,
  Clock,
  Map as MapIcon,
  Sparkles,
  UserPlus2,
} from "lucide-react";
import Link from "next/link";

import { GlassCard, GlassPill } from "@/components/glass";
import { Avatar, NavBar } from "@/components/ui";
import {
  SAMPLE_CONTACTS,
  checkInUrgency,
  daysSinceLastContact,
} from "@/lib/sample-contacts";
import { formatRelative } from "@/lib/time";
import type { Contact } from "@/types/contact";

export default function Home() {
  const overdue = [...SAMPLE_CONTACTS]
    .map((c) => ({ contact: c, urgency: checkInUrgency(c) }))
    .filter(
      (item): item is { contact: Contact; urgency: number } =>
        item.urgency !== null && item.urgency > 0,
    )
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 6)
    .map((item) => item.contact);

  const recentlyAdded = [...SAMPLE_CONTACTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title="Hey there 👋"
        subtitle={`${SAMPLE_CONTACTS.length} people in your network`}
        trailing={
          <Link href="/more" className="contents" aria-label="More">
            <Avatar name="You" seed="self" size="md" ring />
          </Link>
        }
      />

      {/* Quick actions row */}
      <div className="grid grid-cols-3 gap-2">
        <QuickAction
          href="/chat"
          label="Ask Ember"
          glyph={<Sparkles className="size-5" />}
          accent
        />
        <QuickAction
          href="/map"
          label="Map"
          glyph={<MapIcon className="size-5" />}
        />
        <QuickAction
          href="/add"
          label="Add"
          glyph={<UserPlus2 className="size-5" />}
        />
      </div>

      {/* Catch-up due rail */}
      {overdue.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
              Catch up due
            </h2>
            <Link
              href="/search?q=overdue"
              className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              See all
            </Link>
          </div>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {overdue.map((c) => (
              <CatchUpCard key={c.id} contact={c} />
            ))}
          </div>
        </section>
      )}

      {/* Ember call-to-action card */}
      <Link
        href="/chat?q=Who+should+I+check+in+on%3F"
        className="contents"
      >
        <GlassCard
          padding="lg"
          className="relative overflow-hidden border-violet-300/30 bg-gradient-to-br from-violet-500/15 via-fuchsia-400/10 to-indigo-500/15 dark:border-violet-400/20"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.7)]">
              <Sparkles className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-violet-700 dark:text-violet-300">
                Try this
              </p>
              <p className="mt-0.5 text-[17px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                &ldquo;Who should I check in on?&rdquo;
              </p>
              <p className="mt-1 text-[13px] text-zinc-600 dark:text-zinc-300">
                I&apos;ll surface the friendships that need a little love.
              </p>
            </div>
            <ArrowRight className="size-5 text-zinc-500 dark:text-zinc-300" />
          </div>
        </GlassCard>
      </Link>

      {/* Recently added rail */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
            Recently added
          </h2>
          <Link
            href="/people"
            className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            See all
          </Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {recentlyAdded.map((c) => (
            <RecentCard key={c.id} contact={c} />
          ))}
        </div>
      </section>

      {/* Network stat tiles */}
      <GlassCard padding="md">
        <div className="flex items-stretch gap-2">
          <NetworkStat
            value={`${SAMPLE_CONTACTS.filter((c) => c.source === "apple-contacts").length}`}
            label="From Apple"
          />
          <Divider />
          <NetworkStat
            value={`${SAMPLE_CONTACTS.filter((c) => c.source === "linkedin").length}`}
            label="From LinkedIn"
          />
          <Divider />
          <NetworkStat
            value={`${overdue.length}`}
            label="Overdue"
            tone="warning"
          />
        </div>
      </GlassCard>
    </main>
  );
}

function QuickAction({
  href,
  label,
  glyph,
  accent,
}: {
  href: string;
  label: string;
  glyph: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border backdrop-blur-2xl backdrop-saturate-150 transition-transform active:scale-[0.97] ${
        accent
          ? "border-violet-300/40 bg-gradient-to-br from-violet-500/15 to-indigo-500/15 text-zinc-900 dark:border-violet-400/20 dark:text-zinc-50"
          : "border-white/40 bg-white/55 text-zinc-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
      }`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${
          accent
            ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_20px_-8px_rgba(99,102,241,0.7)]"
            : "bg-zinc-900/8 text-zinc-700 dark:bg-white/10 dark:text-zinc-100"
        }`}
      >
        {glyph}
      </span>
      <span className="text-[12px] font-medium leading-none">{label}</span>
    </Link>
  );
}

function CatchUpCard({ contact }: { contact: Contact }) {
  const display = contact.nickname ?? contact.name;
  const since = daysSinceLastContact(contact);
  const due =
    contact.checkInCadenceDays && since !== null
      ? Math.max(0, since - contact.checkInCadenceDays)
      : null;
  return (
    <Link
      href={`/people/${contact.id}`}
      className="flex h-44 w-44 shrink-0 flex-col items-center justify-between rounded-3xl border border-white/40 bg-white/55 p-4 backdrop-blur-2xl backdrop-saturate-150 transition-transform active:scale-[0.97] dark:border-white/10 dark:bg-white/[0.06]"
    >
      <Avatar
        name={display}
        src={contact.photoUrl}
        seed={contact.id}
        size="lg"
        ring
      />
      <div className="flex flex-col items-center text-center">
        <span className="line-clamp-1 text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
          {display}
        </span>
        <span className="line-clamp-1 text-[12px] text-zinc-500 dark:text-zinc-400">
          {contact.headline ?? contact.meetingPlace?.label ?? "—"}
        </span>
      </div>
      <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
        <Clock className="size-3" />
        {due !== null ? `${due}d overdue` : "Catch up"}
      </div>
    </Link>
  );
}

function RecentCard({ contact }: { contact: Contact }) {
  const display = contact.nickname ?? contact.name;
  return (
    <Link
      href={`/people/${contact.id}`}
      className="flex h-44 w-44 shrink-0 flex-col items-center justify-between rounded-3xl border border-white/40 bg-white/55 p-4 backdrop-blur-2xl backdrop-saturate-150 transition-transform active:scale-[0.97] dark:border-white/10 dark:bg-white/[0.06]"
    >
      <Avatar
        name={display}
        src={contact.photoUrl}
        seed={contact.id}
        size="lg"
        ring
      />
      <div className="flex flex-col items-center text-center">
        <span className="line-clamp-1 text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
          {display}
        </span>
        <span className="line-clamp-1 text-[12px] text-zinc-500 dark:text-zinc-400">
          {contact.headline ?? contact.meetingPlace?.label ?? "—"}
        </span>
      </div>
      <GlassPill tone="info">
        Added {formatRelative(contact.createdAt)} ago
      </GlassPill>
    </Link>
  );
}

function NetworkStat({
  value,
  label,
  tone = "neutral",
}: {
  value: string;
  label: string;
  tone?: "neutral" | "warning";
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1">
      <span
        className={`text-2xl font-semibold tabular-nums ${
          tone === "warning"
            ? "text-amber-600 dark:text-amber-300"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </span>
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="w-px self-stretch bg-zinc-900/10 dark:bg-white/10"
    />
  );
}
