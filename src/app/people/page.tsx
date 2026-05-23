import { ArrowDownAZ, Map as MapIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, IconButton, ListRow, NavBar, Section } from "@/components/ui";
import {
  SAMPLE_CONTACTS,
  daysSinceLastContact,
} from "@/lib/sample-contacts";
import { formatRelative } from "@/lib/time";

export const metadata = {
  title: "People",
};

export default function PeoplePage() {
  // Group by the first letter of the display name — iOS Contacts style.
  const grouped = groupByLetter(
    [...SAMPLE_CONTACTS].sort((a, b) =>
      displayName(a).localeCompare(displayName(b)),
    ),
  );

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title="People"
        subtitle={`${SAMPLE_CONTACTS.length} people · all sources`}
        trailing={
          <>
            <Link href="/map" aria-label="Open map" className="contents">
              <IconButton variant="tinted" size="md" label="Map view">
                <MapIcon />
              </IconButton>
            </Link>
            <IconButton variant="tinted" size="md" label="Sort">
              <ArrowDownAZ />
            </IconButton>
          </>
        }
      />

      {grouped.map(([letter, contacts]) => (
        <Section key={letter} header={letter}>
          {contacts.map((contact) => {
            const since = daysSinceLastContact(contact);
            return (
              <ListRow
                key={contact.id}
                as="link"
                href={`/people/${contact.id}`}
                leading={
                  <Avatar
                    name={displayName(contact)}
                    src={contact.photoUrl}
                    seed={contact.id}
                    size="md"
                  />
                }
                title={displayName(contact)}
                subtitle={
                  contact.meetingPlace?.label ?? contact.headline ?? ""
                }
                value={
                  since !== null ? (
                    <span className="tabular-nums">
                      {formatRelative(contact.lastContactedAt)}
                    </span>
                  ) : undefined
                }
                chevron
              />
            );
          })}
        </Section>
      ))}
    </main>
  );
}

function displayName(c: { name: string; nickname?: string }): string {
  return c.nickname ?? c.name;
}

function groupByLetter<T extends { name: string; nickname?: string }>(
  items: T[],
): Array<[string, T[]]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const letter = (displayName(item)[0] ?? "#").toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
