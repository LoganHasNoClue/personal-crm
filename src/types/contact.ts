/**
 * Shared domain types for the relationship CRM.
 *
 * These are intentionally minimal right now — they'll grow as we build
 * features like check-in reminders, life events, tags, and so on.
 */

export type ContactId = string;

/** Geographic coordinate, in WGS-84 decimal degrees. */
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * The place where you met a contact. We store both a human label
 * ("Dolores Park, San Francisco") and coordinates so the map page can
 * drop a pin without re-geocoding on every render.
 */
export interface MeetingPlace extends GeoCoordinate {
  /** Short, human-readable description, e.g. "Brooklyn, NY". */
  label: string;
}

export interface Contact {
  id: ContactId;
  name: string;
  /** Optional preferred nickname / display name. */
  nickname?: string;
  /** How we met / context (e.g. "college roommate", "work — design team"). */
  context?: string;
  /** Free-form notes the user wants to remember about this person. */
  notes?: string;
  /** Where you met them. Drives the map pin. */
  meetingPlace?: MeetingPlace;
  /** ISO 8601 timestamp of the last logged interaction. */
  lastContactedAt?: string;
  /** ISO 8601 timestamp the contact was created. */
  createdAt: string;
  /** ISO 8601 timestamp the contact was last updated. */
  updatedAt: string;
}
