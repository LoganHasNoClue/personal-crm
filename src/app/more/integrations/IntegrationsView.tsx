"use client";

import { MessageSquareText, Smartphone } from "lucide-react";
import * as React from "react";

import { GlassCard, GlassPill } from "@/components/glass";
import {
  InstagramIcon,
  LinkedInIcon,
  NavBar,
  Section,
} from "@/components/ui";

interface Integration {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Last-synced summary text. */
  syncedNote: string;
  /** Tint applied to the icon tile. */
  tone: string;
  /** Initial toggle state. */
  initialConnected: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "apple-contacts",
    label: "Apple Contacts",
    description:
      "Sync names, numbers, and emails. iCloud-aware so updates flow both ways.",
    icon: Smartphone,
    syncedNote: "Last imported 364 people · 1 hour ago",
    tone: "from-zinc-200 to-zinc-300 text-zinc-800 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-100",
    initialConnected: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description:
      "Pull in headlines, locations, and the who-knows-who graph for warm intros.",
    icon: LinkedInIcon,
    syncedNote: "1,208 connections available to import",
    tone: "from-sky-400 to-sky-600 text-white",
    initialConnected: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Follow handles, profile photos, and recent posts.",
    icon: InstagramIcon,
    syncedNote: "412 handles waiting",
    tone: "from-rose-400 via-fuchsia-500 to-amber-400 text-white",
    initialConnected: false,
  },
  {
    id: "imessage",
    label: "iMessage",
    description:
      "Detect threads to surface check-in reminders. Local-only; nothing leaves your device.",
    icon: MessageSquareText,
    syncedNote: "Awaiting permission",
    tone: "from-emerald-400 to-emerald-600 text-white",
    initialConnected: false,
  },
];

export function IntegrationsView() {
  const [connected, setConnected] = React.useState<Record<string, boolean>>(
    () =>
      INTEGRATIONS.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = item.initialConnected;
        return acc;
      }, {}),
  );

  function toggle(id: string) {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        back={{ href: "/more", label: "More" }}
        title="Integrations"
        subtitle="Wire your accounts into your relationship graph"
      />

      <Section
        footer="None of these are wired up to real platforms yet. Toggling a card simulates connecting / disconnecting."
      >
        {INTEGRATIONS.map((item) => {
          const isOn = connected[item.id] ?? false;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 px-4 py-3.5"
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} shadow-[0_6px_16px_-6px_rgba(15,23,42,0.4)]`}
              >
                <item.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.label}
                  </p>
                  {isOn ? (
                    <GlassPill tone="success">Connected</GlassPill>
                  ) : (
                    <GlassPill>Off</GlassPill>
                  )}
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>
                <p className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">
                  {item.syncedNote}
                </p>
              </div>
              <Toggle
                on={isOn}
                onToggle={() => toggle(item.id)}
                label={`Toggle ${item.label}`}
              />
            </div>
          );
        })}
      </Section>

      <GlassCard padding="md">
        <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            Privacy note —
          </span>{" "}
          When these are real, each platform&apos;s OAuth happens client-side
          and tokens stay encrypted at rest. No raw contact data is shared
          with anyone outside your account.
        </p>
      </GlassCard>
    </main>
  );
}

/** iOS-style switch. ~52×32, snaps with a quick spring on toggle. */
function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border transition-colors ${
        on
          ? "bg-emerald-500 border-emerald-500"
          : "bg-zinc-300 border-zinc-300 dark:bg-zinc-700 dark:border-zinc-700"
      }`}
    >
      <span
        className={`size-7 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
