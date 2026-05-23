"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { GlassPill } from "@/components/glass";
import { Avatar, ChatBubble, ThinkingDots } from "@/components/ui";
import {
  type ChatMessage,
  type NexusAnswer,
  generateMockResponse,
  makeUserMessage,
  nexusOpener,
} from "@/lib/nexus-mock";
import { findSampleContact } from "@/lib/sample-contacts";
import type { Contact } from "@/types/contact";

interface NexusChatProps {
  /** Optional contact to scope the chat to. */
  contact?: Contact | null;
  /** Initial prompt to pre-fill or auto-submit (from a search query). */
  initialQuery?: string;
}

/**
 * The Nexus conversation surface. Renders an iMessage-style transcript,
 * a thinking indicator while the (mock) agent "works", and a pinned
 * composer at the bottom of the viewport — above the bottom nav.
 */
export function NexusChat({ contact = null, initialQuery }: NexusChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    nexusOpener(contact ?? null),
  ]);
  const [input, setInput] = React.useState(initialQuery ?? "");
  const [thinking, setThinking] = React.useState(false);
  const [thinkingLabel, setThinkingLabel] = React.useState<string>("");
  const scrollAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const submittedInitial = React.useRef(false);

  const sendMessage = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, makeUserMessage(trimmed)]);
      setInput("");
      setThinking(true);
      setThinkingLabel(
        contact
          ? `Asking Nexus a question about ${contact.nickname ?? contact.name}`
          : "Nexus is thinking",
      );
      // Mock latency to make the "thinking" state visible. Real network
      // would simply replace this `setTimeout`.
      window.setTimeout(
        () => {
          const response = generateMockResponse(trimmed, contact);
          setMessages((prev) => [...prev, response]);
          setThinking(false);
        },
        900 + Math.random() * 700,
      );
    },
    [contact],
  );

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  // Auto-fire the prompt that came in via ?q=…
  React.useEffect(() => {
    if (!initialQuery || submittedInitial.current) return;
    submittedInitial.current = true;
    sendMessage(initialQuery);
  }, [initialQuery, sendMessage]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 pb-40">
        {messages.map((msg) => (
          <MessageView key={msg.id} message={msg} />
        ))}
        {thinking && (
          <div className="flex items-center gap-2 self-start rounded-3xl bg-white/55 px-3.5 py-2.5 text-[14px] text-zinc-600 border border-white/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-300">
            <ThinkingDots />
            <span>{thinkingLabel}</span>
          </div>
        )}
        <div ref={scrollAnchorRef} />
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage(input)}
        placeholder={
          contact
            ? `Ask about ${contact.nickname ?? contact.name}…`
            : "Ask Nexus anything…"
        }
      />
    </div>
  );
}

function MessageView({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return <ChatBubble role="user">{message.text}</ChatBubble>;
  }

  // Assistant: structured payload or simple text
  if (message.payload) {
    return <AssistantAnswer answer={message.payload} />;
  }
  return <ChatBubble role="assistant">{message.text}</ChatBubble>;
}

function AssistantAnswer({ answer }: { answer: NexusAnswer }) {
  return (
    <div className="flex w-full max-w-full flex-col gap-3">
      {answer.tag && (
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
            <Sparkles className="size-4" />
          </span>
          <GlassPill tone="info">{answer.tag}</GlassPill>
        </div>
      )}
      <ChatBubble role="assistant" className="!justify-start">
        <div className="flex flex-col gap-3">
          <p>{answer.intro}</p>
          <ol className="ml-1 flex flex-col gap-3">
            {answer.cards.map((card, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-900/8 text-[12px] font-semibold tabular-nums text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {card.title}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1 text-[14px] text-zinc-700 dark:text-zinc-300">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2">
                        <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-zinc-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </ChatBubble>

      {(answer.references?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2 pl-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            People referenced
          </span>
          <div className="flex flex-col gap-1">
            {answer.references!.map((ref) => {
              const c = findSampleContact(ref.contactId);
              if (!c) return null;
              return (
                <Link
                  key={ref.contactId}
                  href={`/people/${c.id}`}
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-white/40 bg-white/55 px-3 py-2 backdrop-blur-xl backdrop-saturate-150 hover:bg-white/70 dark:bg-white/[0.06] dark:border-white/10 dark:hover:bg-white/[0.1]"
                >
                  <Avatar
                    name={c.nickname ?? c.name}
                    src={c.photoUrl}
                    seed={c.id}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.nickname ?? c.name}
                    </span>
                    <span className="block truncate text-[12px] text-zinc-500 dark:text-zinc-400">
                      {ref.reason}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {(answer.followUps?.length ?? 0) > 0 && (
        <FollowUpRow follows={answer.followUps!} />
      )}
    </div>
  );
}

function FollowUpRow({ follows }: { follows: string[] }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1">
      {follows.map((text, i) => (
        <button
          key={i}
          type="button"
          className="shrink-0 rounded-full border border-white/40 bg-white/55 px-3.5 py-2 text-[13px] text-zinc-800 backdrop-blur-xl backdrop-saturate-150 hover:bg-white/70 active:scale-[0.97] dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/[0.1]"
          onClick={() => {
            // Quick approach: bubble a custom event so the parent
            // Composer can capture and submit it without prop drilling
            // through every render path. The dispatch target is the
            // global window for simplicity in v1.
            const ev = new CustomEvent("nexus-followup", {
              detail: text,
            });
            window.dispatchEvent(ev);
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder: string;
}) {
  // Listen for follow-up taps and submit them directly.
  React.useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      onChange(detail);
      // Allow the value to settle before submitting
      window.setTimeout(() => onSubmit(), 30);
    }
    window.addEventListener("nexus-followup", handle as EventListener);
    return () =>
      window.removeEventListener("nexus-followup", handle as EventListener);
  }, [onChange, onSubmit]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 mx-auto flex w-full max-w-md gap-2 px-3 sm:max-w-lg sm:px-6"
    >
      <div className="pointer-events-auto flex w-full items-end gap-2 rounded-[28px] border border-white/40 bg-white/65 p-1.5 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-zinc-900/65 dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-snug text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={value.trim().length === 0}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_18px_-6px_rgba(99,102,241,0.7)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </form>
  );
}
