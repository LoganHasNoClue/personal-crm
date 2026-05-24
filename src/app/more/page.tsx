import {
  BookOpen,
  Gift,
  HelpCircle,
  LifeBuoy,
  Link as LinkIcon,
  Map as MapIcon,
  Settings,
} from "lucide-react";

import { ListRow, NavBar, Section } from "@/components/ui";
import { GlassCard } from "@/components/glass";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "More",
};

export default async function MorePage() {
  const { t } = await getT();
  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title={t("more.title")}
        subtitle={t("chat.subtitle")}
        trailing={<LanguageToggle />}
      />

      <GlassCard padding="lg" className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-rose-400 text-white shadow-[0_6px_18px_-6px_rgba(244,114,182,0.6)]">
            <Gift className="size-5" />
          </span>
          <div className="flex flex-col">
            <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              {t("more.pro.title")}
            </p>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-300">
              {t("more.pro.subtitle")}
            </p>
          </div>
        </div>
      </GlassCard>

      <Section header={t("more.section.network")}>
        <ListRow
          as="link"
          href="/more/integrations"
          leading={
            <Tile>
              <LinkIcon className="size-4" />
            </Tile>
          }
          title={t("more.integrations")}
          subtitle="Apple, LinkedIn, Instagram, iMessage"
          chevron
        />
        <ListRow
          as="link"
          href="/map"
          leading={
            <Tile tone="info">
              <MapIcon className="size-4" />
            </Tile>
          }
          title={t("more.mapItem")}
          subtitle={t("map.subtitle")}
          chevron
        />
      </Section>

      <Section header={t("more.section.account")}>
        <ListRow
          as="link"
          href="/more/settings"
          leading={
            <Tile>
              <Settings className="size-4" />
            </Tile>
          }
          title={t("more.settings")}
          chevron
        />
        <ListRow
          as="button"
          leading={
            <Tile>
              <BookOpen className="size-4" />
            </Tile>
          }
          title={t("more.library")}
          chevron
        />
        <ListRow
          as="button"
          leading={
            <Tile>
              <LifeBuoy className="size-4" />
            </Tile>
          }
          title={t("more.invite")}
          chevron
        />
        <ListRow
          as="button"
          leading={
            <Tile>
              <HelpCircle className="size-4" />
            </Tile>
          }
          title={t("more.help")}
          chevron
        />
      </Section>

      <p className="px-1 pb-4 text-center text-[12px] text-zinc-400 dark:text-zinc-500">
        v0.1 — mock data only. Nothing is sent anywhere.
      </p>
    </main>
  );
}

function Tile({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "info";
  children: React.ReactNode;
}) {
  const palette =
    tone === "info"
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
      : "bg-zinc-900/8 text-zinc-700 dark:bg-white/10 dark:text-zinc-200";
  return (
    <span
      className={`flex size-8 items-center justify-center rounded-lg ${palette}`}
    >
      {children}
    </span>
  );
}
