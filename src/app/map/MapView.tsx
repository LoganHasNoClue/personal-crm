"use client";

import Link from "next/link";
import * as React from "react";

import { GlassCard, GlassPill } from "@/components/glass";
import { AppleMap } from "@/components/map/AppleMap";
import { SAMPLE_CONTACTS, findSampleContact } from "@/lib/sample-contacts";

/**
 * Full-bleed map screen. The Apple Map fills the viewport; a glass header
 * floats at the top with the count, and a glass detail card slides in
 * from the bottom when a pin is selected.
 */
export function MapView() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selectedContact = selectedId ? findSampleContact(selectedId) : null;

  const handleSelect = React.useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <main className="app-shell app-shell--full relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <AppleMap
          contacts={SAMPLE_CONTACTS}
          onSelectContact={handleSelect}
        />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <GlassCard padding="sm" className="pointer-events-auto flex w-full max-w-md items-center gap-3 sm:max-w-lg">
          <Link
            href="/"
            className="inline-flex size-10 items-center justify-center rounded-full text-zinc-700 hover:bg-white/40 dark:text-zinc-200 dark:hover:bg-white/10"
            aria-label="Back to home"
          >
            <span aria-hidden className="text-lg">&larr;</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Your people, mapped
            </p>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-300">
              Pins show where you met.
            </p>
          </div>
          <GlassPill tone="info">{SAMPLE_CONTACTS.length}</GlassPill>
        </GlassCard>
      </header>

      {selectedContact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <GlassCard
            padding="md"
            className="pointer-events-auto w-full max-w-md sm:max-w-lg"
          >
            <div className="flex items-start gap-3">
              <Avatar name={selectedContact.nickname ?? selectedContact.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedContact.nickname ?? selectedContact.name}
                </p>
                {selectedContact.meetingPlace && (
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-300">
                    Met at {selectedContact.meetingPlace.label}
                  </p>
                )}
                {selectedContact.notes && (
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {selectedContact.notes}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Dismiss"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-white/40 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <span aria-hidden className="text-base">×</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </main>
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
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-violet-300 text-sm font-semibold text-zinc-800 ring-1 ring-inset ring-white/60 dark:from-sky-500/40 dark:to-violet-500/40 dark:text-white"
    >
      {initials}
    </span>
  );
}
