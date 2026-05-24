import { Sparkles } from "lucide-react";

import { EmberChat } from "@/components/chat/EmberChat";
import { IconButton, NavBar } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "Ember",
};

interface SearchParams {
  q?: string;
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const { t } = await getT();
  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title={t("chat.title")}
        subtitle={t("chat.subtitle")}
        trailing={
          <IconButton variant="tinted" size="md" label={t("chat.aboutAria")}>
            <Sparkles />
          </IconButton>
        }
      />
      <EmberChat initialQuery={q} />
    </main>
  );
}
