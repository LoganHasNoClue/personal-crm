"use client";

import { ArrowUp, Globe, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Avatar, ChatBubble, ThinkingDots } from "@/components/ui";
import { generateMockResponse, emberOpener } from "@/lib/ember-mock";
import { findSampleContact } from "@/lib/sample-contacts";
import type { Contact } from "@/types/contact";

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

type ToolName =
  | "web_search"
  | "lookup_contact"
  | "list_overdue_contacts"
  | "find_mutual_connections";

interface ToolEvent {
  id: string;
  tool: ToolName;
  label: string;
  /** Running until the matching `tool_end` arrives. */
  status: "running" | "done";
}

type AssistantMessage = {
  id: string;
  role: "assistant";
  text: string;
  toolEvents: ToolEvent[];
  references: string[];
  streaming: boolean;
  source: "live" | "mock" | "opener";
  error?: string;
};

type UserMessage = { id: string; role: "user"; text: string };

type ChatMessage = UserMessage | AssistantMessage;

interface EmberChatProps {
  contact?: Contact | null;
  initialQuery?: string;
}

/* -------------------------------------------------------------------------- */
/* Tiny ID helper                                                             */
/* -------------------------------------------------------------------------- */

let counter = 0;
const makeId = (prefix: string) => {
  counter += 1;
  return `${prefix}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
};

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function EmberChat({ contact = null, initialQuery }: EmberChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    const opener = emberOpener(contact ?? null);
    return [
      {
        id: opener.id,
        role: "assistant",
        text: opener.text ?? "",
        toolEvents: [],
        references: [],
        streaming: false,
        source: "opener",
      },
    ];
  });
  const [input, setInput] = React.useState(initialQuery ?? "");
  const [sending, setSending] = React.useState(false);
  const scrollAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const submittedInitial = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // Mirror the live messages into a ref so async callbacks always see
  // the latest history without rebuilding the callback on every keystroke.
  const messagesRef = React.useRef(messages);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const updateAssistant = React.useCallback(
    (id: string, updater: (m: AssistantMessage) => AssistantMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "assistant" && m.id === id ? updater(m) : m,
        ),
      );
    },
    [],
  );

  const handleEvent = React.useCallback(
    (line: string, placeholderId: string) => {
      let evt: StreamEvent;
      try {
        evt = JSON.parse(line) as StreamEvent;
      } catch {
        return;
      }

      switch (evt.type) {
        case "delta":
          updateAssistant(placeholderId, (m) => ({
            ...m,
            text: m.text + evt.text,
          }));
          break;
        case "tool_start":
          updateAssistant(placeholderId, (m) => ({
            ...m,
            toolEvents: [
              ...m.toolEvents,
              {
                id: makeId("t"),
                tool: evt.tool,
                label: evt.label,
                status: "running",
              },
            ],
          }));
          break;
        case "tool_end":
          updateAssistant(placeholderId, (m) => {
            const idx = [...m.toolEvents]
              .reverse()
              .findIndex(
                (t) => t.tool === evt.tool && t.status === "running",
              );
            if (idx === -1) {
              return {
                ...m,
                toolEvents: [
                  ...m.toolEvents,
                  {
                    id: makeId("t"),
                    tool: evt.tool,
                    label: evt.label,
                    status: "done",
                  },
                ],
              };
            }
            const realIdx = m.toolEvents.length - 1 - idx;
            const next = m.toolEvents.slice();
            next[realIdx] = {
              ...next[realIdx]!,
              label: evt.label,
              status: "done",
            };
            return { ...m, toolEvents: next };
          });
          break;
        case "references":
          updateAssistant(placeholderId, (m) => ({
            ...m,
            references: dedup([...m.references, ...evt.contactIds]),
          }));
          break;
        case "done":
          updateAssistant(placeholderId, (m) => ({
            ...m,
            streaming: false,
          }));
          break;
        case "error":
          updateAssistant(placeholderId, (m) => ({
            ...m,
            streaming: false,
            error: evt.message,
          }));
          break;
      }
    },
    [updateAssistant],
  );

  const consumeStream = React.useCallback(
    async (body: ReadableStream<Uint8Array>, placeholderId: string) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl = buffer.indexOf("\n");
        while (nl !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (line) handleEvent(line, placeholderId);
          nl = buffer.indexOf("\n");
        }
      }
      const tail = buffer.trim();
      if (tail) handleEvent(tail, placeholderId);
    },
    [handleEvent],
  );

  const runMockFallback = React.useCallback(
    async (placeholderId: string, query: string, c: Contact | null) => {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));
      const mock = generateMockResponse(query, c);
      const payload = mock.role === "assistant" ? mock.payload : undefined;
      const text = payload
        ? renderMockAsMarkdown(payload)
        : mock.role === "assistant"
          ? (mock.text ?? "")
          : "";
      const refs: string[] =
        payload?.references?.map((r: { contactId: string }) => r.contactId) ??
        [];
      updateAssistant(placeholderId, (m) => ({
        ...m,
        text,
        references: dedup([...m.references, ...refs]),
        streaming: false,
        source: "mock",
      }));
    },
    [updateAssistant],
  );

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setInput("");
      setSending(true);

      const userMsg: UserMessage = {
        id: makeId("u"),
        role: "user",
        text: trimmed,
      };
      const placeholderId = makeId("a");
      const placeholder: AssistantMessage = {
        id: placeholderId,
        role: "assistant",
        text: "",
        toolEvents: [],
        references: [],
        streaming: true,
        source: "live",
      };
      setMessages((prev) => [...prev, userMsg, placeholder]);

      const history = [...messagesRef.current, userMsg]
        .filter((m) => !(m.role === "assistant" && m.source === "opener"))
        .map((m) => ({ role: m.role, content: m.text }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ember/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            contactId: contact?.id ?? null,
          }),
          signal: controller.signal,
        });

        if (res.status === 503) {
          await runMockFallback(placeholderId, trimmed, contact ?? null);
          return;
        }
        if (!res.ok || !res.body) {
          throw new Error(`Ember API returned HTTP ${res.status}.`);
        }

        await consumeStream(res.body, placeholderId);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong reaching Ember.";
        console.error("[ember-chat] stream failed", err);
        updateAssistant(placeholderId, (m) => ({
          ...m,
          streaming: false,
          error: message,
        }));
      } finally {
        abortRef.current = null;
        setSending(false);
      }
    },
    [contact, sending, consumeStream, runMockFallback, updateAssistant],
  );

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  React.useEffect(() => {
    if (!initialQuery || submittedInitial.current) return;
    submittedInitial.current = true;
    void sendMessage(initialQuery);
  }, [initialQuery, sendMessage]);

  // Listen for follow-up chip presses (existing custom event pattern).
  React.useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      void sendMessage(detail);
    }
    window.addEventListener("ember-followup", handle as EventListener);
    return () =>
      window.removeEventListener("ember-followup", handle as EventListener);
  }, [sendMessage]);

  // Abort any in-flight request when the component unmounts.
  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant");
  const lastIsStreamingEmpty =
    lastAssistant?.streaming === true &&
    lastAssistant.text.length === 0 &&
    lastAssistant.toolEvents.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 pb-40">
        {messages.map((msg) => (
          <MessageView key={msg.id} message={msg} contact={contact} />
        ))}
        {lastIsStreamingEmpty && (
          <ThinkingPill contact={contact} />
        )}
        <div ref={scrollAnchorRef} />
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => void sendMessage(input)}
        disabled={sending}
        placeholder={
          contact
            ? `Ask about ${contact.nickname ?? contact.name}…`
            : "Ask Ember anything…"
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stream event types (mirror server)                                         */
/* -------------------------------------------------------------------------- */

type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "tool_start"; tool: ToolName; label: string }
  | { type: "tool_end"; tool: ToolName; label: string }
  | { type: "references"; contactIds: string[] }
  | { type: "done" }
  | { type: "error"; message: string };

/* -------------------------------------------------------------------------- */
/* Message rendering                                                          */
/* -------------------------------------------------------------------------- */

function MessageView({
  message,
  contact,
}: {
  message: ChatMessage;
  contact: Contact | null;
}) {
  if (message.role === "user") {
    return <ChatBubble role="user">{message.text}</ChatBubble>;
  }

  // Assistant message — render tool chips above the bubble, then the
  // markdown body, then any referenced contact cards.
  const visibleText = message.text.replace(/\[ref:c_[a-z0-9_]+\]/gi, "").trim();
  const showBubble =
    visibleText.length > 0 || (message.streaming && message.toolEvents.length > 0);

  return (
    <div className="flex w-full flex-col gap-2">
      {message.toolEvents.length > 0 && (
        <div className="-mx-1 flex flex-wrap gap-1.5 self-start pl-1">
          {message.toolEvents.map((t) => (
            <ToolChip key={t.id} event={t} />
          ))}
        </div>
      )}

      {showBubble && (
        <ChatBubble role="assistant" className="!justify-start">
          <Markdown text={visibleText || "…"} />
          {message.streaming && visibleText.length > 0 && (
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current" />
          )}
        </ChatBubble>
      )}

      {!message.streaming && message.error && (
        <ChatBubble role="assistant" className="!justify-start">
          <p className="text-zinc-700 dark:text-zinc-300">
            <span className="font-medium text-rose-600 dark:text-rose-400">
              Couldn&apos;t reach Ember.
            </span>{" "}
            {message.error}
          </p>
        </ChatBubble>
      )}

      {message.references.length > 0 && (
        <ReferenceList contactIds={message.references} />
      )}

      {!message.streaming &&
        message.source !== "opener" &&
        message.source === "mock" && (
          <p className="pl-2 text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Showing offline reply · set OPENAI_API_KEY for the live agent
          </p>
        )}

      {!message.streaming && contact === null && message === undefined && null}
    </div>
  );
}

function ThinkingPill({ contact }: { contact: Contact | null }) {
  return (
    <div className="flex items-center gap-2 self-start rounded-3xl border border-white/40 bg-white/55 px-3.5 py-2.5 text-[14px] text-zinc-600 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
      <ThinkingDots />
      <span>
        {contact
          ? `Asking Ember about ${contact.nickname ?? contact.name}`
          : "Ember is thinking"}
      </span>
    </div>
  );
}

function ToolChip({ event }: { event: ToolEvent }) {
  const Icon = ICON_FOR_TOOL[event.tool] ?? Sparkles;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/65 px-2.5 py-1 text-[12px] font-medium text-zinc-700 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 ${
        event.status === "running" ? "animate-pulse" : ""
      }`}
    >
      <Icon className="size-3.5" />
      <span>{event.label}</span>
    </span>
  );
}

const ICON_FOR_TOOL: Record<
  ToolName,
  React.ComponentType<{ className?: string }>
> = {
  web_search: Globe,
  lookup_contact: Search,
  list_overdue_contacts: Users,
  find_mutual_connections: Users,
};

function ReferenceList({ contactIds }: { contactIds: string[] }) {
  const contacts = contactIds
    .map((id) => findSampleContact(id))
    .filter((c): c is Contact => Boolean(c));
  if (contacts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 pl-1 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        People referenced
      </span>
      <div className="flex flex-col gap-1.5">
        {contacts.map((c) => (
          <Link
            key={c.id}
            href={`/people/${c.id}`}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-white/40 bg-white/55 px-3 py-2 backdrop-blur-xl backdrop-saturate-150 hover:bg-white/70 active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
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
                {c.headline ??
                  c.meetingPlace?.label ??
                  "Tap to open profile"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Markdown renderer                                                          */
/* -------------------------------------------------------------------------- */

function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-ember text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

const MARKDOWN_COMPONENTS: React.ComponentProps<
  typeof ReactMarkdown
>["components"] = {
  p: (props) => <p className="my-1 first:mt-0 last:mb-0" {...props} />,
  ul: (props) => <ul className="my-1 ml-4 list-disc space-y-1" {...props} />,
  ol: (props) => (
    <ol className="my-1 ml-4 list-decimal space-y-1" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => (
    <strong
      className="font-semibold text-zinc-900 dark:text-white"
      {...props}
    />
  ),
  em: (props) => <em className="italic" {...props} />,
  a: (props) => (
    <a
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
      {...props}
    />
  ),
  code: (props) => {
    const { className, children, ...rest } = props as {
      className?: string;
      children?: React.ReactNode;
    };
    if (className?.includes("language-")) {
      return (
        <pre className="my-2 overflow-x-auto rounded-2xl bg-zinc-900/[0.06] p-3 text-[13px] text-zinc-800 dark:bg-white/[0.06] dark:text-zinc-100">
          <code className={className} {...rest}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className="rounded-md bg-zinc-900/[0.07] px-1 py-0.5 text-[13px] text-zinc-800 dark:bg-white/[0.08] dark:text-zinc-100"
        {...rest}
      >
        {children}
      </code>
    );
  },
  blockquote: (props) => (
    <blockquote
      className="my-2 border-l-2 border-zinc-300 pl-3 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
      {...props}
    />
  ),
  h1: (props) => (
    <h2 className="mt-2 text-[16px] font-semibold" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-2 text-[16px] font-semibold" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-2 text-[15px] font-semibold" {...props} />
  ),
  hr: () => <hr className="my-2 border-zinc-200/70 dark:border-white/10" />,
};

/* -------------------------------------------------------------------------- */
/* Mock → markdown bridge (used in the 503 fallback)                          */
/* -------------------------------------------------------------------------- */

function renderMockAsMarkdown(payload: {
  tag?: string;
  intro: string;
  cards: { title: string; bullets: string[] }[];
  followUps?: string[];
}): string {
  const lines: string[] = [];
  lines.push(payload.intro);
  for (const card of payload.cards) {
    lines.push("");
    lines.push(`**${card.title}**`);
    for (const b of card.bullets) {
      lines.push(`- ${b}`);
    }
  }
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Composer                                                                   */
/* -------------------------------------------------------------------------- */

function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder: string;
}) {
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
          disabled={disabled || value.trim().length === 0}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_6px_18px_-6px_rgba(99,102,241,0.7)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function dedup(ids: string[]): string[] {
  return Array.from(new Set(ids));
}
