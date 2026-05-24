import { notFound } from "next/navigation";

import { EmberChat } from "@/components/chat/EmberChat";
import { Avatar, NavBar } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { findSampleContact, SAMPLE_CONTACTS } from "@/lib/sample-contacts";

export function generateStaticParams() {
  return SAMPLE_CONTACTS.map((c) => ({ contactId: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const contact = findSampleContact(contactId);
  return {
    title: contact
      ? `Ember · ${contact.nickname ?? contact.name}`
      : "Ember",
  };
}

export default async function ChatAboutPersonPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const contact = findSampleContact(contactId);
  if (!contact) notFound();

  const display = contact.nickname ?? contact.name;
  const { locale } = await getT();
  const aboutTitle = locale === "zh" ? `关于 ${display}` : `About ${display}`;

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        back={{ href: `/people/${contact.id}`, label: display }}
        title={aboutTitle}
        trailing={
          <Avatar
            name={display}
            src={contact.photoUrl}
            seed={contact.id}
            size="md"
            ring
          />
        }
      />
      <EmberChat contact={contact} />
    </main>
  );
}
