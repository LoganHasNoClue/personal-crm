import type { Contact, ContactSource } from "@/types/contact";

/**
 * Stock-photo avatar URL. Pravatar serves deterministic placeholder
 * portraits when seeded by the contact ID — perfect for mock UIs that
 * need to look human without using real PII.
 */
function photoFor(id: string): string {
  return `https://i.pravatar.cc/200?u=${encodeURIComponent(id)}`;
}

/**
 * Helpers so we don't repeat ISO timestamps. Dates are all in the past
 * so the "last contacted" feed renders nicely.
 */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

/**
 * In-memory placeholder contacts used by the UI until we wire up a real
 * data store. Spread out geographically so the map page has interesting
 * pins to render. None of this is committed PII — they're stock first
 * names plus the name of the meeting place.
 */
export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "c_alex",
    name: "Alex Chen",
    nickname: "Alex",
    headline: "Climbing partner · loves tacos",
    context: "College roommate",
    notes: "Loves climbing, always down for tacos. Birthday in March.",
    meetingPlace: { label: "Berkeley, CA", latitude: 37.8716, longitude: -122.273 },
    photoUrl: photoFor("c_alex"),
    source: "apple-contacts",
    tags: ["college", "climbing"],
    profiles: {
      phone: "+1 (510) 555-0142",
      linkedin: "https://www.linkedin.com/in/alex-chen-sample",
    },
    mutualConnectionIds: ["c_priya", "c_sofia"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(12),
    createdAt: daysAgo(800),
    updatedAt: daysAgo(12),
  },
  {
    id: "c_priya",
    name: "Priya Patel",
    headline: "Founder, paper-goods startup",
    context: "Met at a design meetup",
    notes: "Working on a stationery startup. Coffee in Greenpoint.",
    meetingPlace: { label: "Brooklyn, NY", latitude: 40.7282, longitude: -73.9442 },
    photoUrl: photoFor("c_priya"),
    source: "linkedin",
    tags: ["founder", "design", "nyc"],
    profiles: {
      email: "priya@example.com",
      linkedin: "https://www.linkedin.com/in/priya-patel-sample",
    },
    mutualConnectionIds: ["c_alex", "c_jacqueline", "c_amelia"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(84),
    createdAt: daysAgo(500),
    updatedAt: daysAgo(84),
  },
  {
    id: "c_marco",
    name: "Marco Rossi",
    headline: "Surfs every Sunday",
    context: "Hostel friend in Lisbon, 2023",
    notes: "Has a guest room in Bairro Alto. Always good wine recs.",
    meetingPlace: { label: "Lisbon, Portugal", latitude: 38.7223, longitude: -9.1393 },
    photoUrl: photoFor("c_marco"),
    source: "instagram",
    tags: ["travel", "surf"],
    profiles: { instagram: "marco.rossi" },
    mutualConnectionIds: ["c_amelia", "c_haruki"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(200),
    createdAt: daysAgo(1100),
    updatedAt: daysAgo(200),
  },
  {
    id: "c_sofia",
    name: "Sofia Garcia",
    headline: "Senior PM · payments",
    context: "Work — design team",
    notes: "Direct, fast, great at user research.",
    meetingPlace: { label: "Mexico City, MX", latitude: 19.4326, longitude: -99.1332 },
    photoUrl: photoFor("c_sofia"),
    source: "linkedin",
    tags: ["work", "pm"],
    profiles: {
      email: "sofia@example.com",
      linkedin: "https://www.linkedin.com/in/sofia-garcia-sample",
    },
    mutualConnectionIds: ["c_alex", "c_jacqueline", "c_kenji"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(13),
    createdAt: daysAgo(420),
    updatedAt: daysAgo(13),
  },
  {
    id: "c_haruki",
    name: "Haruki Tanaka",
    headline: "Hardware eng · loves jazz",
    context: "Conference in Tokyo",
    notes: "Knows every great jazz bar in Shimokitazawa.",
    meetingPlace: { label: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503 },
    photoUrl: photoFor("c_haruki"),
    source: "linkedin",
    tags: ["engineer", "jazz"],
    profiles: {
      linkedin: "https://www.linkedin.com/in/haruki-tanaka-sample",
    },
    mutualConnectionIds: ["c_marco", "c_kenji"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(120),
    createdAt: daysAgo(600),
    updatedAt: daysAgo(120),
  },
  {
    id: "c_amelia",
    name: "Amelia Wright",
    headline: "Editor · indie publishing",
    context: "Bookstore friend",
    notes: "Recommends excellent fiction. Birthday in October.",
    meetingPlace: { label: "London, UK", latitude: 51.5074, longitude: -0.1278 },
    photoUrl: photoFor("c_amelia"),
    source: "manual",
    tags: ["books", "uk"],
    profiles: { instagram: "amelia.reads" },
    mutualConnectionIds: ["c_priya", "c_marco", "c_jacqueline"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(82),
    createdAt: daysAgo(1400),
    updatedAt: daysAgo(82),
  },
  // -------------------------------------------------------------------------
  // Investor / founder cluster — used by the "who knows VCs" Nexus prompt.
  // -------------------------------------------------------------------------
  {
    id: "c_jacqueline",
    name: "Jacqueline Moss",
    headline: "Partner @ Northstar Capital",
    context: "Intro from Priya at NY Tech Week",
    notes: "Active in fintech & devtools. Best to email; not on socials much.",
    meetingPlace: { label: "New York, NY", latitude: 40.7128, longitude: -74.006 },
    photoUrl: photoFor("c_jacqueline"),
    source: "linkedin",
    tags: ["investor", "vc", "fintech"],
    profiles: {
      email: "jacqueline@northstar.example",
      linkedin: "https://www.linkedin.com/in/jacqueline-moss-sample",
    },
    mutualConnectionIds: ["c_priya", "c_sofia", "c_amelia", "c_devon"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(45),
    createdAt: daysAgo(300),
    updatedAt: daysAgo(45),
  },
  {
    id: "c_devon",
    name: "Devon Park",
    headline: "Solo GP @ Patchwork Ventures",
    context: "Met at SaaStr afterparty",
    notes: "Writes small checks, very founder-friendly. Loves climbing.",
    meetingPlace: { label: "San Francisco, CA", latitude: 37.7749, longitude: -122.4194 },
    photoUrl: photoFor("c_devon"),
    source: "linkedin",
    tags: ["investor", "vc", "solo-gp"],
    profiles: {
      linkedin: "https://www.linkedin.com/in/devon-park-sample",
    },
    mutualConnectionIds: ["c_jacqueline", "c_kenji", "c_alex"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(28),
    createdAt: daysAgo(220),
    updatedAt: daysAgo(28),
  },
  {
    id: "c_kenji",
    name: "Kenji Park",
    headline: "Cofounder, dev tools startup",
    context: "Worked together at Stripe",
    notes: "Currently raising a seed round. Wants warm intros to seed VCs.",
    meetingPlace: { label: "San Francisco, CA", latitude: 37.7849, longitude: -122.4294 },
    photoUrl: photoFor("c_kenji"),
    source: "apple-contacts",
    tags: ["founder", "devtools"],
    profiles: {
      phone: "+1 (415) 555-0188",
      linkedin: "https://www.linkedin.com/in/kenji-park-sample",
    },
    mutualConnectionIds: ["c_devon", "c_sofia", "c_haruki"],
    checkInCadenceDays: 14,
    lastContactedAt: daysAgo(6),
    createdAt: daysAgo(950),
    updatedAt: daysAgo(6),
  },
  {
    id: "c_nora",
    name: "Nora Adebayo",
    headline: "Founder · climate analytics",
    context: "Climate Week panel",
    notes: "Building tooling for emissions reporting. Sharp, fast.",
    meetingPlace: { label: "Lagos, Nigeria", latitude: 6.5244, longitude: 3.3792 },
    photoUrl: photoFor("c_nora"),
    source: "linkedin",
    tags: ["founder", "climate"],
    profiles: {
      linkedin: "https://www.linkedin.com/in/nora-adebayo-sample",
    },
    mutualConnectionIds: ["c_jacqueline", "c_marco"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(38),
    createdAt: daysAgo(260),
    updatedAt: daysAgo(38),
  },
  // -------------------------------------------------------------------------
  // Friends / family — these power the "iMessage check-in" feed.
  // -------------------------------------------------------------------------
  {
    id: "c_mom",
    name: "Mom",
    headline: "❤️",
    notes: "Call on Sundays.",
    photoUrl: photoFor("c_mom"),
    source: "apple-contacts",
    tags: ["family"],
    profiles: { phone: "+1 (555) 555-0101", imessage: "mom@example.com" },
    mutualConnectionIds: ["c_dad", "c_sis"],
    checkInCadenceDays: 7,
    lastContactedAt: daysAgo(3),
    createdAt: daysAgo(2000),
    updatedAt: daysAgo(3),
  },
  {
    id: "c_dad",
    name: "Dad",
    headline: "Tinkerer-in-chief",
    photoUrl: photoFor("c_dad"),
    source: "apple-contacts",
    tags: ["family"],
    profiles: { phone: "+1 (555) 555-0102" },
    mutualConnectionIds: ["c_mom", "c_sis"],
    checkInCadenceDays: 14,
    lastContactedAt: daysAgo(11),
    createdAt: daysAgo(2000),
    updatedAt: daysAgo(11),
  },
  {
    id: "c_sis",
    name: "Maya",
    headline: "Sister · vet student",
    photoUrl: photoFor("c_sis"),
    source: "imessage",
    tags: ["family"],
    profiles: { imessage: "+1 (555) 555-0103", instagram: "maya.vet" },
    mutualConnectionIds: ["c_mom", "c_dad"],
    checkInCadenceDays: 7,
    lastContactedAt: daysAgo(2),
    createdAt: daysAgo(1800),
    updatedAt: daysAgo(2),
  },
  // -------------------------------------------------------------------------
  // Misc — fills out the "imported via Apple Contacts" feed.
  // -------------------------------------------------------------------------
  {
    id: "c_jordan",
    name: "Jordan Lee",
    headline: "Soccer team forward",
    context: "Sunday league",
    photoUrl: photoFor("c_jordan"),
    source: "imessage",
    tags: ["soccer"],
    profiles: { imessage: "+1 (555) 555-0188" },
    mutualConnectionIds: ["c_kenji"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(40),
    createdAt: daysAgo(420),
    updatedAt: daysAgo(40),
  },
  {
    id: "c_rose",
    name: "Rose Müller",
    headline: "Choreographer · Berlin",
    context: "Met at Burning Man, 2024",
    photoUrl: photoFor("c_rose"),
    meetingPlace: { label: "Berlin, Germany", latitude: 52.52, longitude: 13.405 },
    source: "instagram",
    tags: ["arts", "berlin"],
    profiles: { instagram: "rose.dances" },
    mutualConnectionIds: ["c_amelia"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(160),
    createdAt: daysAgo(620),
    updatedAt: daysAgo(160),
  },
  {
    id: "c_ben",
    name: "Ben Hassan",
    headline: "Lawyer · sometimes runner",
    context: "Met at the marathon expo",
    meetingPlace: { label: "Chicago, IL", latitude: 41.8781, longitude: -87.6298 },
    photoUrl: photoFor("c_ben"),
    source: "linkedin",
    tags: ["running", "chicago"],
    profiles: {
      linkedin: "https://www.linkedin.com/in/ben-hassan-sample",
    },
    mutualConnectionIds: ["c_jordan"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(55),
    createdAt: daysAgo(380),
    updatedAt: daysAgo(55),
  },
];

/** Convenient lookup helper used across pages. */
export function findSampleContact(id: string): Contact | undefined {
  return SAMPLE_CONTACTS.find((contact) => contact.id === id);
}

/**
 * Days since the user last logged a touchpoint with this person. `null`
 * when there is no recorded interaction yet.
 */
export function daysSinceLastContact(contact: Contact): number | null {
  if (!contact.lastContactedAt) return null;
  const then = new Date(contact.lastContactedAt).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

/**
 * "Catch up due" priority. Lower is more urgent. Returns null when the
 * contact has no cadence set or hasn't been contacted yet (so the UI
 * can omit them from the feed).
 */
export function checkInUrgency(contact: Contact): number | null {
  if (!contact.checkInCadenceDays) return null;
  const since = daysSinceLastContact(contact);
  if (since === null) return null;
  return since - contact.checkInCadenceDays;
}

/** Pretty label for a source platform. */
export function sourceLabel(source?: ContactSource): string {
  switch (source) {
    case "apple-contacts":
      return "Apple Contacts";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "imessage":
      return "iMessage";
    default:
      return "Added manually";
  }
}
