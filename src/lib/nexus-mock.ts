import {
  SAMPLE_CONTACTS,
  checkInUrgency,
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

  // 2) Friendship check-in: "who should I check in on", "catch up",
  //    "haven't talked to", "reach out". Lean warm + actionable.
  if (
    /\b(check.?in|catch.?up|reach out|haven'?t (talked|spoken|seen|heard)|been neglect|been ignoring|miss(ed|ing)? )/i.test(
      query,
    )
  ) {
    const overdue = [...SAMPLE_CONTACTS]
      .map((c) => ({ contact: c, urgency: checkInUrgency(c) }))
      .filter(
        (item): item is { contact: Contact; urgency: number } =>
          item.urgency !== null && item.urgency > 0,
      )
      .sort((a, b) => b.urgency - a.urgency);

    const top = overdue.slice(0, 5).map((o) => o.contact);
    const refs: ContactReference[] = top.map((c) => ({
      contactId: c.id,
      reason: `Last touch ${formatLastContact(c)}`,
    }));

    if (top.length === 0) {
      return {
        id: makeId("a"),
        role: "assistant",
        payload: {
          tag: "Check-ins",
          intro:
            "You're actually pretty on top of things right now — nobody's overdue based on their cadence. Want me to flag a few people you haven't talked to in a long time anyway?",
          cards: [
            {
              title: "What I'd do next",
              bullets: [
                "Pick one person you miss and send a no-pressure note.",
                "Set a cadence for anyone marked \"manual\" — they slip the most.",
                "Add a birthday or two so I can give you a heads-up.",
              ],
            },
          ],
          followUps: [
            "Show me the people I haven't talked to in a while",
            "Who haven't I seen in person this year?",
            "Help me plan a coffee for this weekend",
          ],
        },
      };
    }

    return {
      id: makeId("a"),
      role: "assistant",
      payload: {
        tag: "Check-ins",
        intro: `Here are ${top.length} friends I'd nudge first — sorted by how overdue you are based on the cadence you set for each.`,
        cards: [
          {
            title: "Reach out this week",
            bullets: top.slice(0, 3).map((c) => {
              const name = c.nickname ?? c.name;
              const last = formatLastContact(c);
              return `${name} — last touch ${last}. ${suggestNudge(c)}`;
            }),
          },
          {
            title: "On your radar (less urgent)",
            bullets:
              top.length > 3
                ? top.slice(3).map((c) => {
                    const name = c.nickname ?? c.name;
                    const last = formatLastContact(c);
                    return `${name} — ${last}. ${
                      c.meetingPlace ? `In ${c.meetingPlace.label}.` : "No location on file."
                    }`;
                  })
                : ["Nobody else is overdue right now."],
          },
          {
            title: "How I'd actually send it",
            bullets: [
              "Lead with a memory, not a question. Curiosity > obligation.",
              "Suggest a concrete next step (coffee, call, FaceTime) and a real date.",
              "Keep it under two sentences if it's been a while — easier to reply to.",
            ],
          },
        ],
        references: refs.slice(0, 4),
        followUps: top
          .slice(0, 3)
          .map((c) => `Draft a check-in message for ${c.nickname ?? c.name}`)
          .concat(["Who haven't I seen in person this year?"]),
      },
    };
  }

  // 3) Contact-specific (e.g. /chat/c_alex, or asking "what do you know about Alex")
  if (contact) {
    return contactDeepDive(contact);
  }

  // 4) "Who knows X" graph queries
  const whoKnows = q.match(/who knows ([\w\s-]+)/);
  if (whoKnows) {
    const target = whoKnows[1]!.trim();
    const match = SAMPLE_CONTACTS.find((c) =>
      (c.nickname ?? c.name).toLowerCase().includes(target.toLowerCase()),
    );
    if (match) return contactDeepDive(match);
  }

  // 5) Default — friendly fallback that explains what Nexus does
  return {
    id: makeId("a"),
    role: "assistant",
    payload: {
      intro:
        "I'm a relationship agent — I can help you stay in touch, answer questions across your network, draft intro emails, and pull in info about people you haven't met yet. Try one of these:",
      cards: [
        {
          title: "Things I'm good at today",
          bullets: [
            "Reminding you which friends you haven't talked to in a while.",
            "Summarising who someone is, when you met, and what you talked about.",
            "Finding warm paths to a person, role, or company.",
          ],
        },
      ],
      followUps: [
        "Who should I check in on?",
        "What do I know about Alex Chen?",
        "Who haven't I seen in person this year?",
      ],
    },
  };
}

/** A small, situation-aware nudge for the check-in card. */
function suggestNudge(c: Contact): string {
  const tags = c.tags ?? [];
  if (tags.includes("family")) return "Pick up the phone today.";
  if (tags.includes("partner")) return "Plan something for this weekend.";
  if (tags.includes("best-friend")) return "Send a memory + a real date.";
  if (tags.includes("travel"))
    return "A postcard or a 'still owe you a visit' voice memo.";
  if (tags.includes("work") || tags.includes("mentor"))
    return "Share a quick win or ask for advice — easy opener.";
  if (tags.includes("neighbor")) return "Knock with coffee.";
  return "Send a low-pressure 'thinking of you' text.";
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
