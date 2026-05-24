"use client";

import { MapPin, Network } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import { AppleMap } from "@/components/map/AppleMap";
import { MindMap } from "@/components/mindmap/MindMap";
import { IconButton } from "@/components/ui";
import { useT } from "@/lib/i18n/client";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";

type ViewMode = "location" | "mind";

/**
 * Full-bleed map screen. Two views share the same chrome:
 *  - "location" → Apple MapKit JS with photo-bubble pins
 *  - "mind"     → a force-directed "who knows who" graph of mutuals
 *
 * The floating header has a segmented control to flip between them.
 * Both views call back into `handleSelect` on tap → contact profile.
 */
export function MapView() {
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = React.useState<ViewMode>("location");

  // Prefetch every contact route so navigation from a node/pin tap
  // feels instant. Each contact route is statically generated, so this
  // just warms Next's client-side cache.
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

  const title = mode === "location" ? t("map.title") : t("map.mind.title");
  const subtitle =
    mode === "location" ? t("map.subtitle") : t("map.mind.subtitle");

  return (
    <main className="app-shell app-shell--full relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        {mode === "location" ? (
          <AppleMap
            contacts={SAMPLE_CONTACTS}
            onSelectContact={handleSelect}
          />
        ) : (
          <MindMap
            contacts={SAMPLE_CONTACTS}
            onSelectContact={handleSelect}
          />
        )}
      </div>

      {/* Floating top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[22px] border border-white/40 bg-white/60 px-3 py-2 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-zinc-900/55 sm:max-w-lg">
          <Link href="/people" aria-label={t("common.back")} className="contents">
            <IconButton variant="ghost" size="sm" label={t("common.back")}>
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
              {title}
            </p>
            <p className="truncate text-[12px] text-zinc-500 dark:text-zinc-300">
              {subtitle}
            </p>
          </div>
          <GlassPill tone="info">{SAMPLE_CONTACTS.length}</GlassPill>
        </div>

        {/* Segmented control — Apple-style pill with a sliding indicator. */}
        <div
          className="pointer-events-auto inline-flex rounded-full border border-white/40 bg-white/65 p-1 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-zinc-900/55"
          role="tablist"
          aria-label={t("map.view.toggleAria")}
        >
          <SegmentButton
            active={mode === "location"}
            onClick={() => setMode("location")}
            icon={<MapPin className="size-[15px]" />}
            label={t("map.view.location")}
          />
          <SegmentButton
            active={mode === "mind"}
            onClick={() => setMode("mind")}
            icon={<Network className="size-[15px]" />}
            label={t("map.view.mind")}
          />
        </div>
      </header>
    </main>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-900 px-3 text-[13px] font-semibold text-white shadow-[0_4px_12px_-6px_rgba(15,23,42,0.5)] dark:bg-white dark:text-zinc-900"
          : "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
