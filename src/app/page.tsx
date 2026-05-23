import Link from "next/link";

import { TouchButton } from "@/components/TouchButton";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-10 pb-8 sm:max-w-lg sm:pt-16">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
          v0 · in development
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          A CRM for the
          <br />
          people in your life.
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Remember names, log catch-ups, and get nudged before too much time
          slips by. Built for phones, because that&apos;s where your people are.
        </p>
      </header>

      <section
        aria-label="Coming soon"
        className="mt-10 flex flex-col gap-3 rounded-3xl border border-border bg-muted/40 p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
            title="One-tap interaction logging"
            description="Capture a coffee, call, or text in seconds — even one-handed."
          />
        </ul>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/contacts" className="contents">
          <TouchButton className="w-full" variant="primary">
            Open contacts
          </TouchButton>
        </Link>
        <Link
          href="/api/health"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Service status
        </Link>
      </div>

      <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
        Built mobile-first. Touch targets are at least 44px.
      </footer>
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
        className="mt-1.5 size-2 shrink-0 rounded-full bg-foreground"
      />
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
    </li>
  );
}
