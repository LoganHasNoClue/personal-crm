import type { Contact } from "@/types/contact";

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
    context: "College roommate",
    notes: "Loves climbing, always down for tacos.",
    meetingPlace: {
      label: "Berkeley, CA",
      latitude: 37.8716,
      longitude: -122.273,
    },
    lastContactedAt: "2026-04-12T19:30:00.000Z",
    createdAt: "2024-09-01T15:00:00.000Z",
    updatedAt: "2026-04-12T19:30:00.000Z",
  },
  {
    id: "c_priya",
    name: "Priya Patel",
    context: "Met at a design meetup",
    notes: "Working on a stationery startup. Coffee in Greenpoint.",
    meetingPlace: {
      label: "Brooklyn, NY",
      latitude: 40.7282,
      longitude: -73.9442,
    },
    lastContactedAt: "2026-02-28T22:10:00.000Z",
    createdAt: "2025-06-18T18:00:00.000Z",
    updatedAt: "2026-02-28T22:10:00.000Z",
  },
  {
    id: "c_marco",
    name: "Marco Rossi",
    context: "Hostel friend in Lisbon, 2023",
    notes: "Surfs every Sunday. Has a guest room in Bairro Alto.",
    meetingPlace: {
      label: "Lisbon, Portugal",
      latitude: 38.7223,
      longitude: -9.1393,
    },
    lastContactedAt: "2025-11-14T09:00:00.000Z",
    createdAt: "2023-07-22T12:00:00.000Z",
    updatedAt: "2025-11-14T09:00:00.000Z",
  },
  {
    id: "c_sofia",
    name: "Sofia Garcia",
    context: "Work — design team",
    notes: "Direct, fast, great at user research.",
    meetingPlace: {
      label: "Mexico City, MX",
      latitude: 19.4326,
      longitude: -99.1332,
    },
    lastContactedAt: "2026-05-10T16:00:00.000Z",
    createdAt: "2025-03-05T17:00:00.000Z",
    updatedAt: "2026-05-10T16:00:00.000Z",
  },
  {
    id: "c_haruki",
    name: "Haruki Tanaka",
    context: "Conference in Tokyo",
    notes: "Hardware engineer. Loves jazz bars in Shimokitazawa.",
    meetingPlace: {
      label: "Tokyo, Japan",
      latitude: 35.6762,
      longitude: 139.6503,
    },
    lastContactedAt: "2026-01-20T08:00:00.000Z",
    createdAt: "2024-10-30T11:00:00.000Z",
    updatedAt: "2026-01-20T08:00:00.000Z",
  },
  {
    id: "c_amelia",
    name: "Amelia Wright",
    context: "Bookstore friend",
    notes: "Recommends excellent fiction. Birthday in October.",
    meetingPlace: {
      label: "London, UK",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastContactedAt: "2026-03-02T18:00:00.000Z",
    createdAt: "2022-04-14T13:00:00.000Z",
    updatedAt: "2026-03-02T18:00:00.000Z",
  },
];

/** Convenient lookup helper used by the map page. */
export function findSampleContact(id: string): Contact | undefined {
  return SAMPLE_CONTACTS.find((contact) => contact.id === id);
}
