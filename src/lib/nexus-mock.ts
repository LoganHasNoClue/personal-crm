import {
  SAMPLE_CONTACTS,
  daysSinceLastContact,
  findSampleContact,
} from "./sample-contacts";
import type { Contact } from "@/types/contact";

/**
 * A single message in a Nexus conversation. The assistant variant may
 * carry a *structured* payload so the UI can render bullets, numbered
 * lists, and contact references richly — matching the inspiration's
 * numbered-recommendation style.
 */
export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text?: string;
      payload?: NexusAnswer;
    };

/** Structured assistant response. */
export interface NexusAnswer {
  /** Optional small header pill, e.g. "Asking about Joshua". */
  tag?: string;
  /** Short framing paragraph displayed above the cards. */
  intro: string;
  /** Numbered cards with a title and bullets. */
  cards: NexusCard[];
  /** Optional inline contact references shown at the bottom. */
  references?: ContactReference[];
  /** Optional follow-up prompts the user can tap to ask. */
  followUps?: string[];
}

export interface NexusCard {
  title: string;
  bullets: string[];
}

export interface ContactReference {
  contactId: string;
  reason: string;
}

let messageCounter = 0;
const makeId = (prefix: string) => {
  messageCounter += 1;
  return `${prefix}_${messageCounter}_${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * Generate a mock Nexus reply. Uses very light pattern matching so the
 * demo feels responsive and contextual without actually running an LLM.
 */
export function generateMockResponse(
  query: string,
  contact: Contact | null,
): ChatMessage {
  const q = query.toLowerCase();

  // 1) Investor / intro task
  if (
    /\b(investor|vc|venture|raise|fundrais|seed|series\s?a)\b/.test(q)
  ) {
    const investors = SAMPLE_CONTACTS.filter((c) =>
      (c.tags ?? []).some((t) => ["investor", "vc", "solo-gp"].includes(t)),
    );
    const refs: ContactReference[] = investors.map((inv) => {
      const intros = (inv.mutualConnectionIds ?? [])
        .map((id) => findSampleContact(id))
        .filter((c): c is Contact => Boolean(c));
      const introVia = intros[0];
      return {
        contactId: inv.id,
        reason: introVia
          ? `Could be intro'd via ${introVia.nickname ?? introVia.name}`
          : "Direct relationship",
      };
    });
    return {
      id: makeId("a"),
      role: "assistant",
      payload: {
        tag: "Agent task",
        intro: `You know ${investors.length} investors directly, and several more are one degree away. Here's how I'd approach an intro:`,
        cards: [
          {
            title: "Closest, warmest path",
            bullets: investors.slice(0, 2).map(
              (inv) =>
                `${inv.nickname ?? inv.name} — ${inv.headline ?? "investor"} (${
                  inv.meetingPlace?.label ?? "unknown city"
                }). Last contacted ${formatLastContact(inv)}.`,
            ),
          },
          {
            title: "Who can vouch for you",
            bullets: [
              "Priya Patel knows Jacqueline well — strong intro candidate.",
              "Sofia Garcia and Devon Park were on a panel together last year.",
              "Kenji Park is mid-raise himself and would happily compare notes.",
            ],
          },
          {
            title: "What I'd ask each for",
            bullets: [
              "A 60-second context message before the intro lands.",
              "Permission to mention them in the subject line.",
              "Their take on whether your stage / sector fits.",
            ],
          },
        ],
        references: refs.slice(0, 4),
        followUps: [
          "Draft the intro request to Priya",
          "Find an investor I haven't met yet",
          "Who in NYC could intro me to seed VCs?",
        ],
      },
    };
  }

  // 2) Contact-specific (e.g. /chat/c_alex, or asking "what do you know about Alex")
  if (contact) {
    return contactDeepDive(contact);
  }

  // 3) "Who knows X" graph queries
  const whoKnows = q.match(/who knows ([\w\s-]+)/);
  if (whoKnows) {
    const target = whoKnows[1]!.trim();
    const match = SAMPLE_CONTACTS.find((c) =>
      (c.nickname ?? c.name).toLowerCase().includes(target.toLowerCase()),
    );
    if (match) return contactDeepDive(match);
  }

  // 4) Default — friendly fallback that explains what Nexus does
  return {
    id: makeId("a"),
    role: "assistant",
    payload: {
      intro:
        "I'm a relationship agent — I can answer questions across your network, draft intro emails, suggest catch-ups, and pull in info about people you haven't met yet. Try one of these:",
      cards: [
        {
          title: "Things I'm good at today",
          bullets: [
            "Finding warm paths to a person, role, or company.",
            "Summarising who someone is, when you met, and what you talked about.",
            "Reminding you who you've been neglecting.",
          ],
        },
      ],
      followUps: [
        "Who do I know who knows VCs?",
        "Who should I catch up with this week?",
        "What do I know about Alex Chen?",
      ],
    },
  };
}

function contactDeepDive(contact: Contact): ChatMessage {
  const display = contact.nickname ?? contact.name;
  const mutuals = (contact.mutualConnectionIds ?? [])
    .map((id) => findSampleContact(id))
    .filter((c): c is Contact => Boolean(c));

  const lastContactString = formatLastContact(contact);

  return {
    id: makeId("a"),
    role: "assistant",
    payload: {
      tag: `Asking about ${display}`,
      intro: `Here's what I have on ${display}, with everything I'd consider before you reach out next:`,
      cards: [
        {
          title: "How you know each other",
          bullets: [
            contact.context ?? "Source: " + (contact.source ?? "manual"),
            contact.meetingPlace
              ? `Met in ${contact.meetingPlace.label}.`
              : "No meeting location on file.",
            `Last touch: ${lastContactString}.`,
          ],
        },
        {
          title: "Why they're interesting",
          bullets: [
            contact.headline ?? "No headline on file yet.",
            (contact.tags?.length ?? 0) > 0
              ? `Tags: ${contact.tags!.join(", ")}.`
              : "No tags assigned.",
            contact.notes ?? "No notes — worth jotting some down after you talk.",
          ],
        },
        {
          title: "Who you both know",
          bullets:
            mutuals.length > 0
              ? mutuals.map(
                  (m) =>
                    `${m.nickname ?? m.name} — ${
                      m.headline ?? m.meetingPlace?.label ?? "in your network"
                    }`,
                )
              : ["No mutuals yet — could be a chance to introduce people."],
        },
      ],
      references: mutuals.slice(0, 3).map((m) => ({
        contactId: m.id,
        reason: "Mutual connection",
      })),
      followUps: [
        `Draft a check-in message for ${display}`,
        `Find what ${display} has been posting lately`,
        `Who else in my network does similar work?`,
      ],
    },
  };
}

function formatLastContact(contact: Contact): string {
  const since = daysSinceLastContact(contact);
  if (since === null) return "never";
  if (since === 0) return "today";
  if (since === 1) return "yesterday";
  if (since < 14) return `${since} days ago`;
  if (since < 60) return `${Math.round(since / 7)} weeks ago`;
  return `${Math.round(since / 30)} months ago`;
}

/** Greet the user with an opening message. */
export function nexusOpener(contact: Contact | null): ChatMessage {
  if (contact) {
    const display = contact.nickname ?? contact.name;
    return {
      id: makeId("a"),
      role: "assistant",
      text: `Hey — ask me anything about ${display}. I can summarise your history, suggest a check-in message, or pull in fresh info from their public profiles.`,
    };
  }
  return {
    id: makeId("a"),
    role: "assistant",
    text: "Hey, I'm Nexus. Ask me about anyone in your network — or give me an agent task, like \"find me a path to a seed VC\" or \"who should I catch up with this week?\"",
  };
}

export function makeUserMessage(text: string): ChatMessage {
  return { id: makeId("u"), role: "user", text };
}
