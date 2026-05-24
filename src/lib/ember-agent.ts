import "server-only";

import OpenAI from "openai";
import type {
  FunctionTool,
  ResponseInputItem,
  ResponseStreamEvent,
  Tool,
} from "openai/resources/responses/responses";

import { env } from "./env";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import {
  SAMPLE_CONTACTS,
  checkInUrgency,
  daysSinceLastContact,
  findSampleContact,
  sourceLabel,
} from "./sample-contacts";
import type { Contact } from "@/types/contact";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export interface EmberMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streamed event surface for the chat client. Each event is a single
 * JSON object that the API route forwards as one NDJSON line.
 */
export type EmberStreamEvent =
  | { type: "delta"; text: string }
  | { type: "tool_start"; tool: ToolName; label: string }
  | { type: "tool_end"; tool: ToolName; label: string }
  | { type: "references"; contactIds: string[] }
  | { type: "done" }
  | { type: "error"; message: string };

export type ToolName =
  | "web_search"
  | "lookup_contact"
  | "list_overdue_contacts"
  | "find_mutual_connections";

export class EmberAgentConfigError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "EmberAgentConfigError";
  }
}

/* -------------------------------------------------------------------------- */
/* OpenAI client                                                              */
/* -------------------------------------------------------------------------- */

function client(): OpenAI {
  const apiKey = env.openaiApiKey();
  if (!apiKey) {
    throw new EmberAgentConfigError(
      "Ember is not configured. Set OPENAI_API_KEY in your environment " +
        "(see .env.example).",
    );
  }
  return new OpenAI({ apiKey });
}

const MODEL = "gpt-4o-mini";
const MAX_TOOL_TURNS = 6;

/* -------------------------------------------------------------------------- */
/* Tool definitions (custom function tools)                                   */
/* -------------------------------------------------------------------------- */

const LOOKUP_CONTACT_TOOL: FunctionTool = {
  type: "function",
  name: "lookup_contact",
  description:
    "Fetch the full record for one contact in the user's network. " +
    "Use this when you need details that aren't in the system summary " +
    "(notes, current project, aspirations, profiles, mutual " +
    "connections, exact dates). Accepts either an `id` (preferred) or " +
    "a fuzzy `name` lookup. Returns null if no match.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: {
        type: ["string", "null"],
        description:
          "Exact contact id (e.g. 'c_alex'). Use null if you only have a name.",
      },
      name: {
        type: ["string", "null"],
        description:
          "Fuzzy first / full name (e.g. 'Alex' or 'Alex Chen'). Use null if you have the id.",
      },
    },
    required: ["id", "name"],
  },
};

const LIST_OVERDUE_TOOL: FunctionTool = {
  type: "function",
  name: "list_overdue_contacts",
  description:
    "Return the contacts the user is overdue to check in on, sorted by " +
    "how overdue they are. Use this whenever the user wants to know who " +
    "to reach out to, who to catch up with, or who they've been " +
    "neglecting.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      limit: {
        type: "integer",
        description: "Maximum number of contacts to return (default 8).",
      },
    },
    required: ["limit"],
  },
};

const FIND_MUTUALS_TOOL: FunctionTool = {
  type: "function",
  name: "find_mutual_connections",
  description:
    "Given a contact id, return their mutual connections in the user's " +
    "network — i.e. the other people the user knows who also know this " +
    "person. Use when answering 'who could intro me to X' or building a " +
    "warm path to someone.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      contact_id: { type: "string" },
    },
    required: ["contact_id"],
  },
};

const TOOLS: Tool[] = [
  { type: "web_search" },
  LOOKUP_CONTACT_TOOL,
  LIST_OVERDUE_TOOL,
  FIND_MUTUALS_TOOL,
];

/* -------------------------------------------------------------------------- */
/* Tool execution                                                             */
/* -------------------------------------------------------------------------- */

const TOOL_LABELS = {
  en: {
    lookedUp: (name: string) => `Looked up ${name}`,
    lookedUpMiss: (name: string) => `Looked up ${name} (no match)`,
    foundOverdue: (n: number) =>
      `Found ${n} overdue contact${n === 1 ? "" : "s"}`,
    foundMutuals: (n: number, name: string) =>
      `Found ${n} mutual${n === 1 ? "" : "s"} for ${name}`,
    noMutuals: "No mutuals (unknown contact)",
    unknownTool: (name: string) => `Unknown tool: ${name}`,
    looking: (name: string) => `Looking up ${name}`,
    scanning: "Scanning who's overdue",
    findingMutuals: (name: string) => `Finding mutuals for ${name}`,
    searchingWeb: "Searching the web",
    searchedWeb: "Searched the web",
    running: (n: string) => `Running ${n}`,
  },
  zh: {
    lookedUp: (name: string) => `已查看 ${name} 的资料`,
    lookedUpMiss: (name: string) => `未找到 ${name}`,
    foundOverdue: (n: number) => `找到 ${n} 位该联络的朋友`,
    foundMutuals: (n: number, name: string) =>
      `为 ${name} 找到 ${n} 位共同好友`,
    noMutuals: "未找到共同好友（联系人不存在）",
    unknownTool: (name: string) => `未知工具：${name}`,
    looking: (name: string) => `正在查看 ${name}`,
    scanning: "正在梳理谁该联络了",
    findingMutuals: (name: string) => `正在为 ${name} 查找共同好友`,
    searchingWeb: "正在联网搜索",
    searchedWeb: "已联网搜索",
    running: (n: string) => `正在运行 ${n}`,
  },
} satisfies Record<Locale, Record<string, unknown>>;

function runFunctionTool(
  name: string,
  rawArgs: string,
  locale: Locale,
): { output: unknown; label: string; contactIds: string[] } {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    // Fall through with empty args; tool can decide what to do.
  }
  const L = TOOL_LABELS[locale];

  switch (name) {
    case "lookup_contact": {
      const id = typeof args.id === "string" ? args.id : null;
      const nameArg = typeof args.name === "string" ? args.name : null;
      const contact = id
        ? findSampleContact(id)
        : nameArg
          ? findContactByName(nameArg)
          : undefined;
      return {
        output: contact ? serializeFullContact(contact) : null,
        label: contact
          ? L.lookedUp(contact.nickname ?? contact.name)
          : L.lookedUpMiss(nameArg ?? id ?? "—"),
        contactIds: contact ? [contact.id] : [],
      };
    }
    case "list_overdue_contacts": {
      const limitArg = typeof args.limit === "number" ? args.limit : 8;
      const limit = Math.max(1, Math.min(20, Math.floor(limitArg)));
      const overdue = SAMPLE_CONTACTS.map((c) => ({
        contact: c,
        urgency: checkInUrgency(c),
      }))
        .filter(
          (item): item is { contact: Contact; urgency: number } =>
            item.urgency !== null && item.urgency > 0,
        )
        .sort((a, b) => b.urgency - a.urgency)
        .slice(0, limit)
        .map(({ contact, urgency }) => ({
          id: contact.id,
          name: contact.nickname ?? contact.name,
          headline: contact.headline ?? null,
          last_contact_days_ago: daysSinceLastContact(contact),
          cadence_days: contact.checkInCadenceDays ?? null,
          days_overdue: urgency,
          location: contact.meetingPlace?.label ?? null,
          tags: contact.tags ?? [],
        }));
      return {
        output: { count: overdue.length, contacts: overdue },
        label: L.foundOverdue(overdue.length),
        contactIds: overdue.map((o) => o.id),
      };
    }
    case "find_mutual_connections": {
      const id =
        typeof args.contact_id === "string" ? args.contact_id : "";
      const target = findSampleContact(id);
      if (!target) {
        return {
          output: { error: `No contact with id "${id}".` },
          label: L.noMutuals,
          contactIds: [],
        };
      }
      const mutuals = (target.mutualConnectionIds ?? [])
        .map((mid) => findSampleContact(mid))
        .filter((c): c is Contact => Boolean(c))
        .map((c) => ({
          id: c.id,
          name: c.nickname ?? c.name,
          headline: c.headline ?? null,
          location: c.meetingPlace?.label ?? null,
          relationship: c.context ?? null,
        }));
      return {
        output: {
          target: { id: target.id, name: target.nickname ?? target.name },
          mutuals,
        },
        label: L.foundMutuals(mutuals.length, target.nickname ?? target.name),
        contactIds: mutuals.map((m) => m.id),
      };
    }
    default:
      return {
        output: { error: `Unknown function tool: ${name}` },
        label: L.unknownTool(name),
        contactIds: [],
      };
  }
}

function findContactByName(name: string): Contact | undefined {
  const needle = name.toLowerCase().trim();
  return SAMPLE_CONTACTS.find((c) => {
    const display = (c.nickname ?? c.name).toLowerCase();
    const full = c.name.toLowerCase();
    return display.includes(needle) || full.includes(needle);
  });
}

function serializeFullContact(c: Contact): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    nickname: c.nickname ?? null,
    headline: c.headline ?? null,
    context: c.context ?? null,
    notes: c.notes ?? null,
    location: c.meetingPlace?.label ?? null,
    source: sourceLabel(c.source),
    tags: c.tags ?? [],
    profiles: c.profiles ?? {},
    current_project: c.currentProject ?? null,
    aspirations: c.aspirations ?? null,
    mutual_connections: (c.mutualConnectionIds ?? [])
      .map((id) => findSampleContact(id))
      .filter((m): m is Contact => Boolean(m))
      .map((m) => ({
        id: m.id,
        name: m.nickname ?? m.name,
        headline: m.headline ?? null,
      })),
    last_contacted_days_ago: daysSinceLastContact(c),
    check_in_cadence_days: c.checkInCadenceDays ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* System prompt                                                              */
/* -------------------------------------------------------------------------- */

const LANGUAGE_DIRECTIVE: Record<Locale, string> = {
  en: "Reply in English. Keep tone warm and concrete.",
  zh:
    "CRITICAL OUTPUT LANGUAGE: Simplified Chinese (简体中文). " +
    "ALL of your output text MUST be written in Simplified Chinese, including " +
    "list items, headings, and explanations — even when the user writes to " +
    "you in English. Do NOT translate or change proper nouns, brand names, " +
    "place names, contact names, or API/tool names — leave those in their " +
    "original script. Tone: warm, concrete, never sycophantic. If you are " +
    "about to produce English prose, stop and rewrite it in Chinese.",
};

function buildInstructions(
  focusContact: Contact | null,
  locale: Locale,
): string {
  const today = new Date().toISOString().slice(0, 10);
  const network = SAMPLE_CONTACTS.map((c) => {
    const display = c.nickname ?? c.name;
    const since = daysSinceLastContact(c);
    const sinceText =
      since === null
        ? "never"
        : since === 0
          ? "today"
          : since === 1
            ? "1d ago"
            : since < 60
              ? `${since}d ago`
              : `${Math.round(since / 30)}mo ago`;
    const parts = [
      `${c.id}: ${display}`,
      c.headline ?? null,
      c.meetingPlace?.label ?? null,
      `last ${sinceText}`,
      c.tags && c.tags.length > 0 ? `tags:${c.tags.join(",")}` : null,
    ].filter(Boolean);
    return `- ${parts.join(" | ")}`;
  }).join("\n");

  const focus = focusContact
    ? `\n\nFOCUS CONTACT: The user is asking about ${focusContact.nickname ?? focusContact.name} (id: ${focusContact.id}). Default to giving information and suggestions about this person unless they explicitly ask about someone else.`
    : "";

  return [
    "You are **Ember**, the in-app AI agent inside Perso — a personal relationship CRM for friendships and personal networks.",
    "Your job is to help the user remember the people in their life, stay in touch warmly, and find paths through their network. Tone: warm, concrete, never sycophantic. Default to short, scannable replies.",
    "",
    `LANGUAGE: ${LANGUAGE_DIRECTIVE[locale]}`,
    "",
    "STYLE GUIDE",
    '- Use simple markdown: short paragraphs, **bold names**, and bullet lists where helpful. Avoid headings deeper than `##`.',
    "- When you reference someone the user knows, write their name in bold and immediately after it include their id in this exact form: `[ref:c_alex]` — this lets the UI render a tappable card. Only reference contacts that exist in the network list below.",
    "- When you draft a message, put it in a markdown code block so it's easy to copy.",
    "- When citing facts you found via web_search, link them inline with markdown.",
    "- Be specific. 'Reach out to Alex' is bad. 'Send Alex a memory + a coffee date this weekend' is good.",
    "",
    "TOOLS",
    "- **web_search**: use it whenever the user asks about news, current events, public profiles, jobs, companies, papers, or anything you wouldn't otherwise know about a specific person.",
    "- **lookup_contact**: fetches the full record (notes, project, aspirations, profiles, mutuals) for one person. Always call this before drafting a message for someone — the network summary below is intentionally compact.",
    "- **list_overdue_contacts**: pulls everyone the user is overdue to check in on. Use this for 'who should I check in on' / 'who am I behind on'.",
    "- **find_mutual_connections**: pulls the user's mutual edges for a given contact id. Use for 'who could intro me to X' or building warm paths.",
    "- Call tools in parallel when it speeds things up.",
    "",
    "PRIVACY",
    "- Do not invent contacts. Only reference people from the network summary or web_search results.",
    "- If asked about someone outside the user's network, say so plainly, then offer to research them with web_search.",
    "",
    `Today is ${today}. The user has ${SAMPLE_CONTACTS.length} contacts in their network.${focus}`,
    "",
    "NETWORK SUMMARY (compact one-line-per-contact):",
    network,
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Agent loop                                                                 */
/* -------------------------------------------------------------------------- */

interface PendingFunctionCall {
  callId: string;
  name: string;
  arguments: string;
  itemId: string;
}

export interface RunEmberOptions {
  messages: EmberMessage[];
  contact?: Contact | null;
  /** Active app locale. Drives the language Ember replies in. */
  locale?: Locale;
  signal?: AbortSignal;
}

/**
 * Drive the Ember agent. Streams events via the async iterator.
 *
 * Implementation: we call the Responses API with `stream: true`, watch
 * for function-call output items, run them locally, then call the
 * Responses API again with `previous_response_id` + the function call
 * outputs. Loop until the model produces a final assistant message
 * without pending function calls.
 */
export async function* runEmberAgent(
  options: RunEmberOptions,
): AsyncGenerator<EmberStreamEvent, void, unknown> {
  const openai = client();
  const focus = options.contact ?? null;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const instructions = buildInstructions(focus, locale);

  // Build the initial input from the chat history. Responses API accepts
  // `{role, content}` items directly.
  let input: ResponseInputItem[] = options.messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  // GPT-4o-mini tends to match the user's last input language, which
  // overrides the system instruction when the user types in a different
  // language than the active app locale. We append a fresh language
  // reminder as the last item so it appears most recently in context.
  if (locale === "zh" && input.length > 0) {
    input.push({
      role: "user",
      content:
        "（系统提示：无论上面的用户消息用什么语言写，你的回复必须全部使用简体中文。专有名词、人名、品牌名可保留原文。）",
    });
  }

  let previousResponseId: string | undefined;
  const referencedContactIds = new Set<string>();

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn += 1) {
    const stream = await openai.responses.create(
      {
        model: MODEL,
        instructions: turn === 0 ? instructions : null,
        previous_response_id: previousResponseId ?? null,
        input,
        tools: TOOLS,
        stream: true,
        store: true,
      },
      { signal: options.signal },
    );

    const pending: PendingFunctionCall[] = [];
    const itemById = new Map<string, { name?: string; callId?: string }>();
    let responseId: string | undefined;
    let activeWebSearch = false;
    let bufferedText = "";

    for await (const event of stream as AsyncIterable<ResponseStreamEvent>) {
      switch (event.type) {
        case "response.created":
        case "response.in_progress": {
          // capture the id so we can chain follow-up calls
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const id = (event as any).response?.id;
          if (typeof id === "string") responseId = id;
          break;
        }
        case "response.output_text.delta": {
          const delta = (event as { delta?: string }).delta ?? "";
          if (delta) {
            bufferedText += delta;
            yield { type: "delta", text: delta };
          }
          break;
        }
        case "response.output_item.added": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const item = (event as any).item as
            | {
                id?: string;
                type?: string;
                name?: string;
                call_id?: string;
              }
            | undefined;
          if (!item || !item.id) break;
          if (item.type === "function_call") {
            itemById.set(item.id, {
              name: item.name,
              callId: item.call_id,
            });
          } else if (item.type === "web_search_call") {
            activeWebSearch = true;
            yield {
              type: "tool_start",
              tool: "web_search",
              label: TOOL_LABELS[locale].searchingWeb,
            };
          }
          break;
        }
        case "response.function_call_arguments.done": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ev = event as any;
          const itemId: string | undefined = ev.item_id;
          const argsString: string =
            typeof ev.arguments === "string" ? ev.arguments : "";
          if (!itemId) break;
          const meta = itemById.get(itemId);
          if (!meta?.name || !meta.callId) break;
          pending.push({
            callId: meta.callId,
            name: meta.name,
            arguments: argsString,
            itemId,
          });
          yield {
            type: "tool_start",
            tool: meta.name as ToolName,
            label: friendlyToolLabel(meta.name, argsString, locale),
          };
          break;
        }
        case "response.web_search_call.completed": {
          if (activeWebSearch) {
            activeWebSearch = false;
            yield {
              type: "tool_end",
              tool: "web_search",
              label: TOOL_LABELS[locale].searchedWeb,
            };
          }
          break;
        }
        case "response.completed": {
          // capture id from final event too, just in case
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const id = (event as any).response?.id;
          if (typeof id === "string") responseId = id;
          break;
        }
        case "response.failed":
        case "error": {
          const ev = event as unknown as {
            response?: { error?: { message?: string } };
            message?: string;
          };
          const msg =
            ev.response?.error?.message ??
            ev.message ??
            "Ember hit an error while thinking.";
          yield { type: "error", message: String(msg) };
          return;
        }
        default:
          // Ignore the rest — content_part, audio, reasoning, etc.
          break;
      }
    }

    // Collect contact references from the final text via the [ref:c_*]
    // markers. The UI will turn each into a tappable card.
    for (const m of bufferedText.matchAll(/\[ref:(c_[a-z0-9_]+)\]/gi)) {
      referencedContactIds.add(m[1]!);
    }

    if (pending.length === 0) {
      // No function calls → final answer reached.
      if (referencedContactIds.size > 0) {
        yield {
          type: "references",
          contactIds: Array.from(referencedContactIds),
        };
      }
      yield { type: "done" };
      return;
    }

    // Run each function call locally and assemble the follow-up input.
    const followUpInput: ResponseInputItem[] = [];
    for (const call of pending) {
      const result = runFunctionTool(call.name, call.arguments, locale);
      yield {
        type: "tool_end",
        tool: call.name as ToolName,
        label: result.label,
      };
      for (const id of result.contactIds) {
        referencedContactIds.add(id);
      }
      followUpInput.push({
        type: "function_call_output",
        call_id: call.callId,
        output: JSON.stringify(result.output),
      });
    }

    // Hand the function outputs back to the model and let it continue.
    input = followUpInput;
    previousResponseId = responseId;
  }

  // Safety: if we burned through the tool-turn budget without a final
  // answer, end the stream gracefully.
  yield {
    type: "error",
    message:
      "Ember used too many tool turns in a row. Try rephrasing the question.",
  };
}

function friendlyToolLabel(
  name: string,
  rawArgs: string,
  locale: Locale,
): string {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    /* ignore */
  }
  const L = TOOL_LABELS[locale];

  switch (name) {
    case "lookup_contact": {
      const id = typeof args.id === "string" ? args.id : null;
      const nameArg = typeof args.name === "string" ? args.name : null;
      const display = id
        ? (findSampleContact(id)?.nickname ??
          findSampleContact(id)?.name ??
          id)
        : (nameArg ?? "—");
      return L.looking(display);
    }
    case "list_overdue_contacts":
      return L.scanning;
    case "find_mutual_connections": {
      const id =
        typeof args.contact_id === "string" ? args.contact_id : null;
      const display = id
        ? (findSampleContact(id)?.nickname ??
          findSampleContact(id)?.name ??
          id)
        : "—";
      return L.findingMutuals(display);
    }
    default:
      return L.running(name);
  }
}
