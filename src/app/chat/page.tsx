import { Sparkles } from "lucide-react";

import { EmberChat } from "@/components/chat/EmberChat";
import { IconButton, NavBar } from "@/components/ui";

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
  return (
    <main className="app-shell mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-10 sm:max-w-lg sm:pt-14">
      <NavBar
        title="Ember"
        subtitle="Your friendship sidekick"
        trailing={
          <IconButton variant="tinted" size="md" label="About Ember">
            <Sparkles />
          </IconButton>
        }
      />
      <EmberChat initialQuery={q} />
    </main>
  );
}
