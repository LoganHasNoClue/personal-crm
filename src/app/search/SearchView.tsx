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
import { useT } from "@/lib/i18n/client";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";
import { formatRelative } from "@/lib/time";
import type { Contact } from "@/types/contact";

interface CannedQuery {
  id: string;
  labelKey: string;
  descriptionKey: string;
  predicate: (c: Contact) => boolean;
}

/**
 * Suggested searches modeled on the inspiration screenshots — small
 * "structured queries" the agent could answer over your network. The
 * `label`/`description` strings come from the i18n dictionary so they
 * respect the active locale.
 */
const CANNED: CannedQuery[] = [
  {
    id: "overdue",
    labelKey: "search.q.overdue.label",
    descriptionKey: "search.q.overdue.desc",
    predicate: (c) => {
      if (!c.checkInCadenceDays || !c.lastContactedAt) return false;
      const since = (Date.now() - new Date(c.lastContactedAt).getTime()) /
        86_400_000;
      return since > c.checkInCadenceDays;
    },
  },
  {
    id: "closest",
    labelKey: "search.q.closest.label",
    descriptionKey: "search.q.closest.desc",
    predicate: (c) =>
      (c.tags ?? []).some((t) =>
        ["best-friend", "partner"].includes(t),
      ),
  },
  {
    id: "family",
    labelKey: "search.q.family.label",
    descriptionKey: "search.q.family.desc",
    predicate: (c) => (c.tags ?? []).includes("family"),
  },
  {
    id: "recent",
    labelKey: "search.q.recent.label",
    descriptionKey: "search.q.recent.desc",
    predicate: (c) => {
      const created = new Date(c.createdAt).getTime();
      return Date.now() - created < 90 * 86_400_000;
    },
  },
  {
    id: "founders",
    labelKey: "search.q.founders.label",
    descriptionKey: "search.q.founders.desc",
    predicate: (c) => (c.tags ?? []).includes("founder"),
  },
  {
    id: "vcs",
    labelKey: "search.q.vcs.label",
    descriptionKey: "search.q.vcs.desc",
    predicate: (c) =>
      (c.tags ?? []).some((t) => ["investor", "vc", "solo-gp"].includes(t)),
  },
];

export function SearchView() {
  const t = useT();
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
        title={t("search.title")}
        subtitle={t("chat.subtitle")}
      />

      <SearchField
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          if (activeCanned) setActiveCanned(null);
        }}
        placeholder={t("search.placeholder")}
        autoFocus
      />

      {/* Canned queries — horizontally scrollable chips. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
          {t("search.canned.title")}
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
                  {t(c.labelKey)}
                </span>
                <span
                  className={`mt-0.5 block text-[12px] leading-tight ${
                    isActive
                      ? "text-white/80 dark:text-zinc-700"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {t(c.descriptionKey)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ask Ember pivot — appears whenever there's any input. */}
      {(trimmed.length > 0 || canned) && (
        <Link
          href={{
            pathname: "/chat",
            query: { q: canned ? t(canned.labelKey) : query },
          }}
          className="inline-flex items-center gap-3 rounded-2xl border border-violet-300/40 bg-gradient-to-br from-violet-500/15 to-indigo-500/15 px-4 py-3 text-left text-[15px] backdrop-blur-2xl backdrop-saturate-150 hover:from-violet-500/20 hover:to-indigo-500/20 dark:border-violet-400/20"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_20px_-8px_rgba(99,102,241,0.7)]">
            <Sparkles className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {t("search.askEmber", {
                query: canned ? t(canned.labelKey) : query,
              })}
            </span>
          </span>
        </Link>
      )}

      {results.length > 0 && (
        <Section header={canned ? t(canned.labelKey) : t("search.matches")}>
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
          {t("people.empty")}
        </p>
      )}
    </main>
  );
}
