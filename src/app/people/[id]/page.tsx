import {
  AtSign,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Avatar,
  IconButton,
  InstagramIcon,
  LinkedInIcon,
  ListRow,
  NavBar,
  Section,
} from "@/components/ui";
import { GlassCard, GlassPill } from "@/components/glass";
import {
  SAMPLE_CONTACTS,
  daysSinceLastContact,
  findSampleContact,
  sourceLabel,
} from "@/lib/sample-contacts";
import { formatRelativeLong } from "@/lib/time";
import type { Contact } from "@/types/contact";

/**
 * Pre-render every contact statically. With real data we'd swap this for
 * server-driven lookups, but it keeps the build fast and the navigation
 * snappy while we're on mock data.
 */
export function generateStaticParams() {
  return SAMPLE_CONTACTS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = findSampleContact(id);
  return { title: contact ? contact.nickname ?? contact.name : "Contact" };
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = findSampleContact(id);
  if (!contact) notFound();

  const display = contact.nickname ?? contact.name;
  const since = daysSinceLastContact(contact);
  const mutuals = (contact.mutualConnectionIds ?? [])
    .map((mid) => findSampleContact(mid))
    .filter((c): c is Contact => Boolean(c));

  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        back={{ href: "/people", label: "People" }}
        title=""
        trailing={
          <IconButton variant="tinted" size="md" label="More actions">
            <Sparkles />
          </IconButton>
        }
      />

      {/* Hero card with avatar, name, and headline. */}
      <GlassCard padding="lg" className="flex flex-col items-center gap-3">
        <Avatar
          name={display}
          src={contact.photoUrl}
          seed={contact.id}
          size="2xl"
          ring
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {display}
          </h1>
          {contact.headline && (
            <p className="text-[15px] text-zinc-600 dark:text-zinc-300">
              {contact.headline}
            </p>
          )}
          {contact.meetingPlace && (
            <p className="inline-flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              <MapPin className="size-3.5" />
              {contact.meetingPlace.label}
            </p>
          )}
        </div>
        {(contact.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {contact.tags!.map((tag) => (
              <GlassPill key={tag}>{tag}</GlassPill>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Quick action row — primary touchpoints. */}
      <div className="grid grid-cols-4 gap-2">
        <ActionTile
          icon={<Phone className="size-5" />}
          label="Call"
          enabled={Boolean(contact.profiles?.phone)}
        />
        <ActionTile
          icon={<MessageCircle className="size-5" />}
          label="Message"
          enabled={Boolean(
            contact.profiles?.imessage ?? contact.profiles?.phone,
          )}
        />
        <ActionTile
          icon={<Mail className="size-5" />}
          label="Email"
          enabled={Boolean(contact.profiles?.email)}
        />
        <ActionTile
          icon={<Sparkles className="size-5" />}
          label="Ask Nexus"
          href={`/chat/${contact.id}`}
          enabled
        />
      </div>

      <Section header="About">
        {contact.context && (
          <ListRow title="How you met" value={contact.context} />
        )}
        <ListRow
          title="Last contacted"
          value={formatRelativeLong(contact.lastContactedAt)}
        />
        {contact.checkInCadenceDays && (
          <ListRow
            title="Check-in cadence"
            value={`Every ${contact.checkInCadenceDays}d`}
            subtitle={
              since !== null && since > contact.checkInCadenceDays
                ? `Overdue by ${since - contact.checkInCadenceDays}d`
                : undefined
            }
          />
        )}
        <ListRow title="Source" value={sourceLabel(contact.source)} />
      </Section>

      {contact.notes && (
        <Section header="Notes">
          <div className="px-4 py-3 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
            {contact.notes}
          </div>
        </Section>
      )}

      {hasAnyProfile(contact) && (
        <Section header="Connected on">
          {contact.profiles?.phone && (
            <ListRow
              leading={<MiniIcon><Phone className="size-4" /></MiniIcon>}
              title="Phone"
              value={contact.profiles.phone}
            />
          )}
          {contact.profiles?.imessage && (
            <ListRow
              leading={<MiniIcon><AtSign className="size-4" /></MiniIcon>}
              title="iMessage"
              value={contact.profiles.imessage}
            />
          )}
          {contact.profiles?.email && (
            <ListRow
              leading={<MiniIcon><Mail className="size-4" /></MiniIcon>}
              title="Email"
              value={contact.profiles.email}
            />
          )}
          {contact.profiles?.linkedin && (
            <ListRow
              leading={
                <MiniIcon>
                  <LinkedInIcon className="size-4" />
                </MiniIcon>
              }
              title="LinkedIn"
              value="View"
              chevron
            />
          )}
          {contact.profiles?.instagram && (
            <ListRow
              leading={
                <MiniIcon>
                  <InstagramIcon className="size-4" />
                </MiniIcon>
              }
              title="Instagram"
              value={`@${contact.profiles.instagram}`}
            />
          )}
        </Section>
      )}

      {mutuals.length > 0 && (
        <Section
          header="Mutual connections"
          footer={`${mutuals.length} people you both know.`}
        >
          {mutuals.map((m) => (
            <ListRow
              key={m.id}
              as="link"
              href={`/people/${m.id}`}
              leading={
                <Avatar
                  name={m.nickname ?? m.name}
                  src={m.photoUrl}
                  seed={m.id}
                  size="sm"
                />
              }
              title={m.nickname ?? m.name}
              subtitle={m.headline ?? m.meetingPlace?.label}
              chevron
            />
          ))}
        </Section>
      )}

      <Link href={`/chat/${contact.id}`} className="contents">
        <button
          type="button"
          className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] active:scale-[0.98] transition-transform"
        >
          <Sparkles className="size-4" />
          Ask Nexus about {display}
        </button>
      </Link>
    </main>
  );
}

function ActionTile({
  icon,
  label,
  enabled,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border backdrop-blur-2xl backdrop-saturate-150 transition-colors ${
        enabled
          ? "bg-white/55 border-white/40 text-zinc-900 hover:bg-white/70 active:bg-white/85 dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/[0.1]"
          : "bg-white/30 border-white/30 text-zinc-400 dark:bg-white/[0.03] dark:border-white/5 dark:text-zinc-500 opacity-60"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </div>
  );
  if (enabled && href) {
    return (
      <Link href={href} aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" disabled={!enabled} aria-label={label} className="contents">
      {inner}
    </button>
  );
}

function MiniIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-zinc-900/8 text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
      {children}
    </span>
  );
}

function hasAnyProfile(contact: Contact): boolean {
  return Boolean(
    contact.profiles &&
      (contact.profiles.phone ||
        contact.profiles.email ||
        contact.profiles.imessage ||
        contact.profiles.linkedin ||
        contact.profiles.instagram),
  );
}
