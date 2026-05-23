import Link from "next/link";

import { TouchButton } from "@/components/TouchButton";

export const metadata = {
  title: "Contacts",
};

export default function ContactsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-10 pb-8 sm:max-w-lg sm:pt-16">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex h-11 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <span aria-hidden>&larr;</span> Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Contacts
        </h1>
        <p className="text-sm text-muted-foreground">
          Your people will live here.
        </p>
      </header>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border p-8 text-center">
        <span aria-hidden className="text-3xl">
          &#x1F44B;
        </span>
        <p className="text-base font-medium">No contacts yet</p>
        <p className="text-sm text-muted-foreground">
          We&apos;re still wiring up storage. Once the database is connected,
          you&apos;ll be able to add the people you want to keep in touch with.
        </p>
        <TouchButton variant="secondary" disabled>
          Add contact (coming soon)
        </TouchButton>
      </div>
    </main>
  );
}
