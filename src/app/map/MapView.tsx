"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import { AppleMap } from "@/components/map/AppleMap";
import { IconButton } from "@/components/ui";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";

/**
 * Full-bleed map screen. The Apple Map fills the viewport; a glass
 * header floats at the top with the count. Tapping a photo-bubble pin
 * goes straight to that contact's profile.
 */
export function MapView() {
  const router = useRouter();

  // Prefetch every contact route so the navigation from a pin tap feels
  // instant. Each contact route is statically generated, so this just
  // warms Next's client-side cache.
  React.useEffect(() => {
    for (const contact of SAMPLE_CONTACTS) {
      router.prefetch(`/people/${contact.id}`);
    }
  }, [router]);

  const handleSelect = React.useCallback(
    (id: string) => {
      router.push(`/people/${id}`);
    },
    [router],
  );

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
              Tap any face to open their profile.
            </p>
          </div>
          <GlassPill tone="info">{SAMPLE_CONTACTS.length}</GlassPill>
        </div>
      </header>
    </main>
  );
}
