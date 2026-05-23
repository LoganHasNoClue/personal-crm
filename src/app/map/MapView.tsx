"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import { AppleMap } from "@/components/map/AppleMap";
import { Avatar, IconButton } from "@/components/ui";
import {
  SAMPLE_CONTACTS,
  findSampleContact,
} from "@/lib/sample-contacts";
import { formatRelativeLong } from "@/lib/time";

/**
 * Full-bleed map screen. The Apple Map fills the viewport; a glass
 * header floats at the top with the count, and a glass detail card
 * slides in from the bottom (above the tab nav) when a pin is selected.
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

      {/* Floating top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[22px] border border-white/40 bg-white/60 px-3 py-2 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-zinc-900/55 sm:max-w-lg">
          <Link href="/people" aria-label="Back" className="contents">
            <IconButton variant="ghost" size="sm" label="Back">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </IconButton>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              Your people, mapped
            </p>
            <p className="truncate text-[12px] text-zinc-500 dark:text-zinc-300">
              Pins show where you met.
            </p>
          </div>
          <GlassPill tone="info">{SAMPLE_CONTACTS.length}</GlassPill>
        </div>
      </header>

      {/* Floating bottom detail card */}
      {selectedContact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-10 flex justify-center px-3">
          <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/40 bg-white/65 p-4 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-zinc-900/65 sm:max-w-lg">
            <div className="flex items-start gap-3">
              <Avatar
                name={selectedContact.nickname ?? selectedContact.name}
                src={selectedContact.photoUrl}
                seed={selectedContact.id}
                size="lg"
                ring
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/people/${selectedContact.id}`}
                  className="truncate text-[17px] font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {selectedContact.nickname ?? selectedContact.name}
                </Link>
                {selectedContact.meetingPlace && (
                  <p className="truncate text-[13px] text-zinc-600 dark:text-zinc-300">
                    Met in {selectedContact.meetingPlace.label} ·{" "}
                    {formatRelativeLong(selectedContact.lastContactedAt)}
                  </p>
                )}
                {selectedContact.headline && (
                  <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                    {selectedContact.headline}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/people/${selectedContact.id}`}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-zinc-900 px-3 text-[13px] font-medium text-white active:scale-[0.97] dark:bg-white dark:text-zinc-900"
                  >
                    View profile
                  </Link>
                  <Link
                    href={`/chat/${selectedContact.id}`}
                    className="inline-flex h-9 items-center gap-1 rounded-full border border-violet-300/40 bg-gradient-to-br from-violet-500/15 to-indigo-500/15 px-3 text-[13px] font-medium text-violet-700 active:scale-[0.97] dark:border-violet-400/30 dark:text-violet-300"
                  >
                    <Sparkles className="size-3.5" />
                    Ask Nexus
                  </Link>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Dismiss"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-white/40 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
