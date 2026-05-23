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
  // Investor / founder cluster — used by the "who knows VCs" Ember prompt.
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
  // -------------------------------------------------------------------------
  // Closer friends — the people the "who should I check in on?" prompt should
  // surface. Long histories, varied cadences, a mix of overdue & current.
  // -------------------------------------------------------------------------
  {
    id: "c_zoe",
    name: "Zoe Martin",
    nickname: "Zo",
    headline: "Best friend since 9th grade",
    context: "Grew up two blocks apart",
    notes: "Annual road trip in July. Always ask about her sister.",
    meetingPlace: { label: "San Diego, CA", latitude: 32.7157, longitude: -117.1611 },
    photoUrl: photoFor("c_zoe"),
    source: "imessage",
    tags: ["best-friend", "home"],
    profiles: {
      phone: "+1 (619) 555-0144",
      instagram: "zoe.makes.things",
      imessage: "+1 (619) 555-0144",
    },
    mutualConnectionIds: ["c_dylan", "c_eli", "c_park"],
    checkInCadenceDays: 14,
    lastContactedAt: daysAgo(9),
    createdAt: daysAgo(2400),
    updatedAt: daysAgo(9),
  },
  {
    id: "c_eli",
    name: "Eli Wong",
    headline: "Partner ❤️",
    context: "Met at a friend's housewarming",
    notes: "Loves a slow morning. Anniversary in June.",
    meetingPlace: { label: "San Francisco, CA", latitude: 37.7649, longitude: -122.4294 },
    photoUrl: photoFor("c_eli"),
    source: "apple-contacts",
    tags: ["partner"],
    profiles: {
      phone: "+1 (415) 555-0123",
      imessage: "+1 (415) 555-0123",
      instagram: "eli.wong",
    },
    mutualConnectionIds: ["c_zoe", "c_alex", "c_kenji"],
    checkInCadenceDays: 1,
    lastContactedAt: daysAgo(0),
    createdAt: daysAgo(1100),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_park",
    name: "Mr. Park",
    headline: "High-school English teacher",
    context: "Stayed in touch after graduation",
    notes: "Birthday in September. Send him a book each year.",
    meetingPlace: { label: "Seattle, WA", latitude: 47.6062, longitude: -122.3321 },
    photoUrl: photoFor("c_park"),
    source: "manual",
    tags: ["mentor", "friend"],
    profiles: { email: "park@example.com" },
    mutualConnectionIds: ["c_zoe"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(180),
    createdAt: daysAgo(2200),
    updatedAt: daysAgo(180),
  },
  {
    id: "c_dylan",
    name: "Dylan Reyes",
    headline: "Climbing buddy · Zo's brother",
    context: "Zoe introduced us in college",
    notes: "Trad climber. Spends summers in Indian Creek.",
    meetingPlace: { label: "Salt Lake City, UT", latitude: 40.7608, longitude: -111.891 },
    photoUrl: photoFor("c_dylan"),
    source: "imessage",
    tags: ["climbing", "friend"],
    profiles: { imessage: "+1 (801) 555-0177", instagram: "dyl.climbs" },
    mutualConnectionIds: ["c_zoe", "c_alex"],
    checkInCadenceDays: 45,
    lastContactedAt: daysAgo(70),
    createdAt: daysAgo(1300),
    updatedAt: daysAgo(70),
  },
  {
    id: "c_simone",
    name: "Simone Laurent",
    headline: "Long-distance bestie · Paris",
    context: "College roommate junior year",
    notes: "Translator. Visits SF every other year.",
    meetingPlace: { label: "Paris, France", latitude: 48.8566, longitude: 2.3522 },
    photoUrl: photoFor("c_simone"),
    source: "manual",
    tags: ["college", "best-friend"],
    profiles: {
      email: "simone@example.com",
      instagram: "simone.in.paris",
    },
    mutualConnectionIds: ["c_alex", "c_sofia"],
    checkInCadenceDays: 21,
    lastContactedAt: daysAgo(38),
    createdAt: daysAgo(1900),
    updatedAt: daysAgo(38),
  },
  {
    id: "c_aria",
    name: "Aria Sandoval",
    headline: "Burning Man camp lead",
    context: "Camp Beanstalk, 2023",
    notes: "Plans the spring desert trip. Owns the loudest soundsystem.",
    meetingPlace: { label: "Oakland, CA", latitude: 37.8044, longitude: -122.2712 },
    photoUrl: photoFor("c_aria"),
    source: "instagram",
    tags: ["arts", "playa"],
    profiles: { instagram: "aria.builds" },
    mutualConnectionIds: ["c_rose"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(140),
    createdAt: daysAgo(720),
    updatedAt: daysAgo(140),
  },
  // -------------------------------------------------------------------------
  // Old / loose-tie friends — the people the check-in agent should flag.
  // -------------------------------------------------------------------------
  {
    id: "c_mei",
    name: "Mei Chen",
    headline: "Barista turned friend",
    context: "Coffee shop on 5th",
    notes: "Painter. Studio show every spring.",
    meetingPlace: { label: "Brooklyn, NY", latitude: 40.6892, longitude: -73.9442 },
    photoUrl: photoFor("c_mei"),
    source: "instagram",
    tags: ["arts", "nyc"],
    profiles: { instagram: "mei.paints" },
    mutualConnectionIds: ["c_priya"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(110),
    createdAt: daysAgo(500),
    updatedAt: daysAgo(110),
  },
  {
    id: "c_omar",
    name: "Omar Diallo",
    headline: "Neighbor · cooks the best jollof",
    context: "Down the hall",
    notes: "Has two kids. Always brings food when we host.",
    meetingPlace: { label: "Brooklyn, NY", latitude: 40.7282, longitude: -73.9542 },
    photoUrl: photoFor("c_omar"),
    source: "apple-contacts",
    tags: ["neighbor"],
    profiles: { phone: "+1 (718) 555-0166" },
    mutualConnectionIds: ["c_mei"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(22),
    createdAt: daysAgo(360),
    updatedAt: daysAgo(22),
  },
  {
    id: "c_lila",
    name: "Lila Brooks",
    headline: "Yoga teacher · Boulder",
    context: "Tuesday vinyasa class",
    notes: "Hosts retreats in the spring. Allergic to peanuts.",
    meetingPlace: { label: "Boulder, CO", latitude: 40.015, longitude: -105.2705 },
    photoUrl: photoFor("c_lila"),
    source: "instagram",
    tags: ["wellness"],
    profiles: { instagram: "lila.flows" },
    mutualConnectionIds: [],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(95),
    createdAt: daysAgo(540),
    updatedAt: daysAgo(95),
  },
  {
    id: "c_kai",
    name: "Kai Akana",
    headline: "Surfs at Pipeline · easy laugh",
    context: "Met surfing in Oahu",
    notes: "Has a guest room near Ehukai. Loves shave ice.",
    meetingPlace: { label: "Honolulu, HI", latitude: 21.3069, longitude: -157.8583 },
    photoUrl: photoFor("c_kai"),
    source: "instagram",
    tags: ["surf", "travel"],
    profiles: { instagram: "kai.akana" },
    mutualConnectionIds: ["c_marco"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(150),
    createdAt: daysAgo(900),
    updatedAt: daysAgo(150),
  },
  {
    id: "c_tomas",
    name: "Tomás Álvarez",
    headline: "Tango fanatic · Buenos Aires",
    context: "Backpacking, 2022",
    notes: "Slept on his couch for a week. Owes him a postcard.",
    meetingPlace: { label: "Buenos Aires, Argentina", latitude: -34.6037, longitude: -58.3816 },
    photoUrl: photoFor("c_tomas"),
    source: "instagram",
    tags: ["travel"],
    profiles: { instagram: "tomas.tango" },
    mutualConnectionIds: ["c_marco"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(220),
    createdAt: daysAgo(1300),
    updatedAt: daysAgo(220),
  },
  // -------------------------------------------------------------------------
  // Coworkers — current + former. Provide work-cluster signal for the agent.
  // -------------------------------------------------------------------------
  {
    id: "c_riya",
    name: "Riya Sharma",
    headline: "Engineering manager · Bangalore",
    context: "Worked together at Stripe",
    notes: "Best 1:1s of my career. Visits SF in May.",
    meetingPlace: { label: "Bangalore, India", latitude: 12.9716, longitude: 77.5946 },
    photoUrl: photoFor("c_riya"),
    source: "linkedin",
    tags: ["work", "mentor"],
    profiles: {
      email: "riya@example.com",
      linkedin: "https://www.linkedin.com/in/riya-sharma-sample",
    },
    mutualConnectionIds: ["c_kenji", "c_sofia"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(72),
    createdAt: daysAgo(1500),
    updatedAt: daysAgo(72),
  },
  {
    id: "c_vikram",
    name: "Vikram Singh",
    headline: "Former coworker · now in Vancouver",
    context: "Stripe — comms team",
    notes: "Got married last spring. Trying to plan a trip up.",
    meetingPlace: { label: "Vancouver, BC", latitude: 49.2827, longitude: -123.1207 },
    photoUrl: photoFor("c_vikram"),
    source: "linkedin",
    tags: ["work"],
    profiles: {
      linkedin: "https://www.linkedin.com/in/vikram-singh-sample",
    },
    mutualConnectionIds: ["c_kenji", "c_riya"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(180),
    createdAt: daysAgo(1000),
    updatedAt: daysAgo(180),
  },
  // -------------------------------------------------------------------------
  // Family — add one more so it doesn't feel sparse.
  // -------------------------------------------------------------------------
  {
    id: "c_gma",
    name: "Grandma Rose",
    headline: "Calls on Sundays · best baker",
    photoUrl: photoFor("c_gma"),
    source: "apple-contacts",
    tags: ["family"],
    profiles: { phone: "+1 (555) 555-0199" },
    mutualConnectionIds: ["c_mom", "c_dad"],
    checkInCadenceDays: 7,
    lastContactedAt: daysAgo(5),
    createdAt: daysAgo(3000),
    updatedAt: daysAgo(5),
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
