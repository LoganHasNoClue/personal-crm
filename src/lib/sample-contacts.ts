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
 * Local avatar URL. Points at `/public/avatars/<id>.<ext>`. Defaults to
 * `.jpg`; pass `"png"` for contacts whose real photo was dropped in as
 * a PNG (the format LinkedIn typically serves). If the file doesn't
 * exist yet, the <img> 404s and Avatar.tsx's onError fallback paints
 * gradient initials — so it's safe to set even before a real photo is
 * dropped in. See public/avatars/README.md.
 */
function localPhoto(
  id: string,
  ext: "jpg" | "png" | "webp" = "jpg",
): string {
  return `/avatars/${id}.${ext}`;
}

/** Quick LinkedIn search URL — drop-in until you have the real profile slug. */
function linkedinSearch(name: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`;
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
  // -------------------------------------------------------------------------
  // Fresh LinkedIn connections — added today. Photos default to local
  // /avatars/<id>.jpg with a graceful fallback to initials.
  // -------------------------------------------------------------------------
  {
    id: "c_waris",
    name: "Mohammad Waris Ansari",
    nickname: "Waris",
    headline: "Founder, Dabloo Studios · filmmaker & visual artist",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_waris", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "founder", "creative", "filmmaker"],
    profiles: { linkedin: linkedinSearch("Mohammad Waris Ansari") },
    checkInCadenceDays: 120,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_prudhvi",
    name: "Prudhvi Gadiraju",
    headline: "Senior SWE / Tech Lead @ Thumbtack · building Magic Ring on the side",
    context: "Met at the Easel × Jen meetup; connected on LinkedIn",
    notes:
      "Day job is tech lead at Thumbtack; he's the one building Magic Ring on the side. Potential investment or partnership opportunity.",
    currentProject: {
      name: "Magic Ring",
      description: "Voice-activated smart ring with NFC + IMU sensors.",
      features: ["Voice notes", "Smart-home control", "Contact sharing"],
      details: [
        { label: "Target price", value: "$349" },
        { label: "Bootstrapped", value: "~$50k" },
        {
          label: "Funding status",
          value: "Seeking pre-seed to fund a 1,000-unit manufacturing run",
        },
      ],
    },
    photoUrl: localPhoto("c_prudhvi", "png"),
    source: "linkedin",
    tags: [
      "linkedin-met",
      "engineer",
      "thumbtack",
      "founder",
      "hardware",
      "wearable",
      "easel-meetup",
    ],
    profiles: { linkedin: linkedinSearch("Prudhvi Gadiraju") },
    mutualConnectionIds: ["c_charlie_lin", "c_neil"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_yang",
    name: "Yang Xie",
    headline: "Building artificial super intelligence",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_yang", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "ai", "founder"],
    profiles: { linkedin: linkedinSearch("Yang Xie") },
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_jaskaran",
    name: "Jaskaran Singh Kohli",
    nickname: "Jaskaran",
    headline: "Senior Developer @ Connor Group · AI-driven digital transformation",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_jaskaran", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "engineer", "ai"],
    profiles: { linkedin: linkedinSearch("Jaskaran Singh Kohli") },
    checkInCadenceDays: 120,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_marco_wielgus",
    name: "Marco Wielgus",
    headline: "Student · Università Cattolica del Sacro Cuore",
    context: "Connected on LinkedIn",
    notes: "Might be the same person as Marco (LA) building Dynamic Calendar — confirm?",
    meetingPlace: { label: "Milan, Italy", latitude: 45.4642, longitude: 9.19 },
    photoUrl: localPhoto("c_marco_wielgus", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "student", "italy"],
    profiles: { linkedin: linkedinSearch("Marco Wielgus") },
    checkInCadenceDays: 180,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_sharvari",
    name: "Sharvari Gangamwar",
    headline: "Santa Clara University · open to work",
    context: "Connected on LinkedIn",
    meetingPlace: { label: "Santa Clara, CA", latitude: 37.3541, longitude: -121.9552 },
    photoUrl: localPhoto("c_sharvari", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "scu", "student", "open-to-work"],
    profiles: { linkedin: linkedinSearch("Sharvari Gangamwar") },
    mutualConnectionIds: ["c_nirvisha", "c_bhoomika", "c_scu_ai_group"],
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_nirvisha",
    name: "Nirvisha Sriram",
    headline: "MS CS @ SCU · Python · Cloud · AI/ML · ex-Cognizant",
    context: "Connected on LinkedIn",
    meetingPlace: { label: "Santa Clara, CA", latitude: 37.3541, longitude: -121.9552 },
    photoUrl: localPhoto("c_nirvisha", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "scu", "ai", "engineer", "open-to-work"],
    profiles: { linkedin: linkedinSearch("Nirvisha Sriram") },
    mutualConnectionIds: ["c_sharvari", "c_bhoomika", "c_scu_ai_group"],
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_bhoomika",
    name: "Bhoomika Ganapuram",
    headline: "Former SWE Intern @ EPAM · SCU student",
    context: "Connected on LinkedIn",
    meetingPlace: { label: "Santa Clara, CA", latitude: 37.3541, longitude: -121.9552 },
    photoUrl: localPhoto("c_bhoomika", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "scu", "engineer", "open-to-work"],
    profiles: { linkedin: linkedinSearch("Bhoomika Ganapuram") },
    mutualConnectionIds: ["c_sharvari", "c_nirvisha", "c_scu_ai_group"],
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_sanjana",
    name: "Sanjana Hiremath",
    headline: "AI Engineer · LLM fine-tuning & RAG · ex-SAP",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_sanjana", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "ai", "engineer"],
    profiles: { linkedin: linkedinSearch("Sanjana Hiremath") },
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_lyn",
    name: "Lyn Zhang",
    headline: "GTM @ Neo Browser · Umich · Chicago Booth",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_lyn", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "gtm", "founder-community"],
    profiles: { linkedin: linkedinSearch("Lyn Zhang") },
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_steven",
    name: "Steven Sung",
    headline: "Data Infra Engineer · ex-Meta",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_steven", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "engineer", "data", "open-to-work"],
    profiles: { linkedin: linkedinSearch("Steven Sung") },
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_charlie_lin",
    name: "Charlie Lin",
    headline: "Co-founder @ Jen · ex-Palantir AI / Google · Blackstone · Bain",
    context: "Met at the Easel × Jen meetup; connected on LinkedIn",
    notes:
      "Wore a Royal Oak — works at Jen as co-founder. Previously led AI work at Palantir (telecom side), and earlier was at Google, Blackstone, and Bain. Worth a real conversation — could open doors.",
    meetingPlace: { label: "San Francisco, CA", latitude: 37.7749, longitude: -122.4194 },
    photoUrl: localPhoto("c_charlie_lin", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "founder", "ai", "easel-meetup", "investor-adjacent"],
    profiles: { linkedin: linkedinSearch("Charlie Lin") },
    mutualConnectionIds: ["c_neil", "c_shibo", "c_prudhvi"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(0),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "c_yana",
    name: "Yana Zhao",
    headline: "AI Product Lead · health tech · ex-TikTok, Abbott",
    context: "Connected on LinkedIn",
    photoUrl: localPhoto("c_yana", "png"),
    source: "linkedin",
    tags: ["linkedin-met", "pm", "ai", "health"],
    profiles: { linkedin: linkedinSearch("Yana Zhao") },
    checkInCadenceDays: 90,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  // -------------------------------------------------------------------------
  // Captured by voice memo at the Easel × Jen meetup. Source = "audio" so
  // the import-source pill reflects how they actually entered the CRM.
  // -------------------------------------------------------------------------
  {
    id: "c_marco_audio",
    name: "Marco",
    headline: "Building a dynamic agent-driven calendar",
    context: "Met at the Easel × Jen meetup",
    notes:
      "Italian, based in LA. Possibly the same person as Marco Wielgus — confirm.",
    currentProject: {
      name: "Dynamic Calendar with Agents",
      description: "Automatically adjusts schedules based on task load.",
      features: ["Automated email coordination (planned)"],
      details: [
        { label: "Team", value: "From Italy, based in LA" },
        { label: "Co-builder", value: "Anton" },
      ],
    },
    meetingPlace: { label: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437 },
    photoUrl: localPhoto("c_marco_audio"),
    source: "audio",
    tags: ["audio-import", "founder", "italy", "la", "ai", "easel-meetup"],
    mutualConnectionIds: ["c_anton", "c_marco_wielgus"],
    checkInCadenceDays: 45,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_anton",
    name: "Anton",
    headline: "Co-building a dynamic agent-driven calendar",
    context: "Met at the Easel × Jen meetup",
    notes: "Italian, based in LA.",
    currentProject: {
      name: "Dynamic Calendar with Agents",
      description: "Automatically adjusts schedules based on task load.",
      features: ["Automated email coordination (planned)"],
      details: [
        { label: "Team", value: "From Italy, based in LA" },
        { label: "Co-builder", value: "Marco" },
      ],
    },
    meetingPlace: { label: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437 },
    photoUrl: localPhoto("c_anton"),
    source: "audio",
    tags: ["audio-import", "founder", "italy", "la", "ai", "easel-meetup"],
    mutualConnectionIds: ["c_marco_audio"],
    checkInCadenceDays: 45,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_pumica",
    name: "Pumica",
    headline: "Building a mental-health companion",
    context: "Met at the Easel × Jen meetup",
    currentProject: {
      name: "Mental Health Companion",
      description:
        "Therapy alternative for people who can't afford expensive mental-health support.",
      details: [
        {
          label: "Concept",
          value:
            "Built on the Japanese kintsugi idea — turning broken experiences into gold",
        },
        {
          label: "Purpose",
          value: "Helps users process experiences into learning opportunities",
        },
      ],
    },
    photoUrl: localPhoto("c_pumica"),
    source: "audio",
    tags: ["audio-import", "founder", "wellness", "ai", "easel-meetup"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_neil",
    name: "Neil",
    headline: "Jen AI intern (eng + GTM) · Super Parent founder",
    context: "Met at the Easel × Jen meetup",
    notes: "Canadian. Interning at Jen across engineering and GTM.",
    currentProject: {
      name: "Super Parent",
      description: "Recently launched product.",
      details: [{ label: "Traction", value: "20 DAU" }],
    },
    photoUrl: localPhoto("c_neil"),
    source: "audio",
    tags: ["audio-import", "founder", "jen", "easel-meetup", "canada"],
    mutualConnectionIds: ["c_charlie_lin", "c_shibo"],
    checkInCadenceDays: 30,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_shibo",
    name: "Shibo",
    headline: "PR for Easel / Jen · Bay Area",
    context: "Met at the Easel × Jen meetup",
    notes: "Handles PR for Easel and Jen — good intro point for either org.",
    meetingPlace: { label: "San Francisco, CA", latitude: 37.7749, longitude: -122.4194 },
    photoUrl: localPhoto("c_shibo"),
    source: "audio",
    tags: ["audio-import", "pr", "easel-meetup", "jen"],
    mutualConnectionIds: ["c_charlie_lin", "c_neil"],
    checkInCadenceDays: 60,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  // -------------------------------------------------------------------------
  // Unnamed audio-memo entries — descriptive placeholders so the project
  // info isn't lost. Edit the `name` field once you remember who they are.
  // -------------------------------------------------------------------------
  {
    id: "c_scu_ai_group",
    name: "SCU AI students (group)",
    headline: "Santa Clara University students · various AI projects",
    context: "Met at the Easel × Jen meetup",
    notes:
      "Group placeholder — Sharvari, Nirvisha, and Bhoomika are part of this cluster. Split this entry once you have individual names.",
    currentProject: {
      name: "Various AI projects",
      description:
        "Multiple SCU students working on a range of AI projects. Mix of student-led research and side projects.",
    },
    meetingPlace: { label: "Santa Clara, CA", latitude: 37.3541, longitude: -121.9552 },
    photoUrl: localPhoto("c_scu_ai_group"),
    source: "audio",
    tags: ["audio-import", "scu", "ai", "easel-meetup", "needs-name"],
    mutualConnectionIds: ["c_sharvari", "c_nirvisha", "c_bhoomika"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_easel_winner_ar",
    name: "Easel hackathon winner",
    headline: "Previous Easel hackathon winner · building a kids' AR app",
    context: "Met at the Easel × Jen meetup",
    currentProject: {
      name: "Kids' AR imagination app",
      description:
        "AR app for kids focused on imagination and play. Won a previous Easel hackathon.",
    },
    photoUrl: localPhoto("c_easel_winner_ar"),
    source: "audio",
    tags: ["audio-import", "founder", "ar", "kids", "easel-meetup", "needs-name"],
    checkInCadenceDays: 90,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_pet_health_founder",
    name: "Pet-health founder",
    headline: "Founder · pet-health diagnostic",
    context: "Met at the Easel × Jen meetup",
    notes: "Finance background — career-switched into pet health.",
    currentProject: {
      name: "Pet-health diagnostic app",
      description: "Diagnostic app for pet health.",
    },
    photoUrl: localPhoto("c_pet_health_founder"),
    source: "audio",
    tags: ["audio-import", "founder", "pet", "health", "easel-meetup", "needs-name"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_chat_history_founder",
    name: "Chat-history tool founder",
    headline: "Building a cross-LLM chat-history organizer",
    context: "Met at the Easel × Jen meetup",
    notes: "Pain point a lot of LLM power-users feel.",
    currentProject: {
      name: "Chat-history organization tool",
      description:
        "Organizes your chat history when switching between LLMs (ChatGPT, Claude, Gemini, etc.).",
    },
    photoUrl: localPhoto("c_chat_history_founder"),
    source: "audio",
    tags: ["audio-import", "founder", "ai", "tooling", "easel-meetup", "needs-name"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "c_telegram_planner_founder",
    name: "Telegram group-planning founder",
    headline: "Building a group-planning agent for Telegram",
    context: "Met at the Easel × Jen meetup",
    currentProject: {
      name: "Group-planning agent for Telegram",
      description: "Agent that helps groups coordinate plans inside Telegram.",
    },
    photoUrl: localPhoto("c_telegram_planner_founder"),
    source: "audio",
    tags: ["audio-import", "founder", "ai", "telegram", "easel-meetup", "needs-name"],
    checkInCadenceDays: 120,
    lastContactedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
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
    case "audio":
      return "Voice memo";
    default:
      return "Added manually";
  }
}
