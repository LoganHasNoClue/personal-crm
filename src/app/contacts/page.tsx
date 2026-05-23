import Link from "next/link";

import { GlassButton, GlassCard, GlassPill } from "@/components/glass";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";

export const metadata = {
  title: "Contacts",
};

export default function ContactsPage() {
  const contacts = [...SAMPLE_CONTACTS].sort((a, b) =>
    (a.nickname ?? a.name).localeCompare(b.nickname ?? b.name),
  );

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-8 sm:max-w-lg sm:pt-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex h-11 w-fit items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <span aria-hidden>&larr;</span> Home
        </Link>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
          <GlassPill tone="info">{contacts.length} people</GlassPill>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Your people will live here. Sample data shown until storage is wired
          up.
        </p>
      </header>

      <GlassCard padding="none">
        <ul className="flex flex-col divide-y divide-white/40 dark:divide-white/10">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <div className="flex min-h-16 items-center gap-3 px-5 py-3">
                <Avatar name={contact.nickname ?? contact.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {contact.nickname ?? contact.name}
                  </p>
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {contact.context ?? "—"}
                  </p>
                </div>
                {contact.meetingPlace && (
                  <span className="hidden shrink-0 text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
                    {contact.meetingPlace.label}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassButton variant="primary" disabled className="w-full">
        Add contact (coming soon)
      </GlassButton>
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
