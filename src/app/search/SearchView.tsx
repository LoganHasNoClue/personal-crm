"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Avatar,
  ListRow,
  NavBar,
  SearchField,
  Section,
} from "@/components/ui";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";
import { formatRelative } from "@/lib/time";
import type { Contact } from "@/types/contact";

interface CannedQuery {
  id: string;
  label: string;
  description: string;
  predicate: (c: Contact) => boolean;
}

/**
 * Suggested searches modeled on the inspiration screenshots — small
 * "structured queries" the agent could answer over your network.
 */
const CANNED: CannedQuery[] = [
  {
    id: "vcs",
    label: "Who do I know who knows VCs?",
    description: "Contacts tagged as investors",
    predicate: (c) =>
      (c.tags ?? []).some((t) => ["investor", "vc", "solo-gp"].includes(t)),
  },
  {
    id: "recent",
    label: "I met last quarter",
    description: "Added in the past 90 days",
    predicate: (c) => {
      const created = new Date(c.createdAt).getTime();
      return Date.now() - created < 90 * 86_400_000;
    },
  },
  {
    id: "founders",
    label: "Founders in my network",
    description: "Tagged founder · early-stage builders",
    predicate: (c) => (c.tags ?? []).includes("founder"),
  },
  {
    id: "overdue",
    label: "I haven't talked to in a while",
    description: "Past their check-in cadence",
    predicate: (c) => {
      if (!c.checkInCadenceDays || !c.lastContactedAt) return false;
      const since = (Date.now() - new Date(c.lastContactedAt).getTime()) /
        86_400_000;
      return since > c.checkInCadenceDays;
    },
  },
  {
    id: "family",
    label: "Family",
    description: "People I never want to neglect",
    predicate: (c) => (c.tags ?? []).includes("family"),
  },
];

export function SearchView() {
  const [query, setQuery] = React.useState("");
  const [activeCanned, setActiveCanned] = React.useState<string | null>(null);

  const trimmed = query.trim().toLowerCase();
  const canned = activeCanned
    ? CANNED.find((c) => c.id === activeCanned) ?? null
    : null;

  const results = React.useMemo(() => {
    if (canned) return SAMPLE_CONTACTS.filter(canned.predicate);
    if (!trimmed) return [];
    return SAMPLE_CONTACTS.filter((c) =>
      [
        c.name,
        c.nickname,
        c.headline,
        c.context,
        c.meetingPlace?.label,
        ...(c.tags ?? []),
        c.notes,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(trimmed)),
    );
  }, [canned, trimmed]);

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title="Search"
        subtitle="Find anyone, or ask Nexus a question"
      />

      <SearchField
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          if (activeCanned) setActiveCanned(null);
        }}
        placeholder="Name, place, tag, notes…"
        autoFocus
      />

      {/* Canned queries — horizontally scrollable chips. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
          Try a question
        </h2>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {CANNED.map((c) => {
            const isActive = activeCanned === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCanned(isActive ? null : c.id);
                  setQuery("");
                }}
                className={`shrink-0 max-w-[260px] rounded-2xl border px-3 py-2 text-left backdrop-blur-2xl backdrop-saturate-150 transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                    : "bg-white/55 text-zinc-800 border-white/40 hover:bg-white/70 dark:bg-white/[0.06] dark:text-zinc-100 dark:border-white/10 dark:hover:bg-white/[0.1]"
                }`}
              >
                <span className="block text-[14px] font-semibold leading-tight">
                  {c.label}
                </span>
                <span
                  className={`mt-0.5 block text-[12px] leading-tight ${
                    isActive
                      ? "text-white/80 dark:text-zinc-700"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {c.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ask Nexus pivot — appears whenever there's any input. */}
      {(trimmed.length > 0 || canned) && (
        <Link
          href={{
            pathname: "/chat",
            query: { q: canned ? canned.label : query },
          }}
          className="inline-flex items-center gap-3 rounded-2xl border border-violet-300/40 bg-gradient-to-br from-violet-500/15 to-indigo-500/15 px-4 py-3 text-left text-[15px] backdrop-blur-2xl backdrop-saturate-150 hover:from-violet-500/20 hover:to-indigo-500/20 dark:border-violet-400/20"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_20px_-8px_rgba(99,102,241,0.7)]">
            <Sparkles className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-zinc-900 dark:text-zinc-50">
              Ask Nexus: &ldquo;{canned ? canned.label : query}&rdquo;
            </span>
            <span className="block text-[12px] text-zinc-500 dark:text-zinc-400">
              Run this as an agent task across your network.
            </span>
          </span>
        </Link>
      )}

      {results.length > 0 && (
        <Section header={canned ? canned.label : "Matches"}>
          {results.map((c) => (
            <ListRow
              key={c.id}
              as="link"
              href={`/people/${c.id}`}
              leading={
                <Avatar
                  name={c.nickname ?? c.name}
                  src={c.photoUrl}
                  seed={c.id}
                  size="md"
                />
              }
              title={c.nickname ?? c.name}
              subtitle={c.headline ?? c.meetingPlace?.label ?? c.context}
              value={
                c.lastContactedAt ? formatRelative(c.lastContactedAt) : undefined
              }
              chevron
            />
          ))}
        </Section>
      )}

      {trimmed.length > 0 && results.length === 0 && !canned && (
        <p className="px-1 text-[14px] text-zinc-500 dark:text-zinc-400">
          No matches in your network. Try asking Nexus instead — it can pull
          in people you haven&apos;t added yet.
        </p>
      )}
    </main>
  );
}
