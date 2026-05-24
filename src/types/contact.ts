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

/**
 * Where a contact originally came from. Used by the import flow and the
 * Source pill on a contact's detail screen.
 */
export type ContactSource =
  | "apple-contacts"
  | "linkedin"
  | "instagram"
  | "imessage"
  | "audio"
  | "manual";

/**
 * Loose category tags ("investor", "designer", "family"). Free-form so
 * users can invent their own; we ship a starter palette in sample data.
 */
export type ContactTag = string;

export interface ContactProfiles {
  /** LinkedIn vanity URL or full URL. */
  linkedin?: string;
  /** Instagram @handle (no leading `@`). */
  instagram?: string;
  /** Phone number, free-form. */
  phone?: string;
  /** Email. */
  email?: string;
  /** iMessage handle / Apple ID. */
  imessage?: string;
}

/**
 * A "fact" about someone's current project — target price, traction,
 * funding ask, team size, etc. Free-form label/value so the UI can
 * render any number of these as a clean key/value list.
 */
export interface ProjectDetail {
  label: string;
  value: string;
}

/**
 * What someone is currently building. Populated by the audio-import
 * flow (see `src/lib/audio-extract.ts`) and shown as its own section
 * on the contact detail page.
 */
export interface CurrentProject {
  /** Project / product name. */
  name: string;
  /** One- or two-line elevator pitch. */
  description?: string;
  /** Capabilities / angles — rendered as a pill list. */
  features?: string[];
  /** Business or status facts — rendered as a key/value list. */
  details?: ProjectDetail[];
}

export interface Contact {
  id: ContactId;
  name: string;
  /** Optional preferred nickname / display name. */
  nickname?: string;
  /** Short bio / job title shown under the name on the detail page. */
  headline?: string;
  /** How we met / context (e.g. "college roommate", "work — design team"). */
  context?: string;
  /** Free-form notes the user wants to remember about this person. */
  notes?: string;
  /** Where you met them. Drives the map pin. */
  meetingPlace?: MeetingPlace;
  /** Optional remote avatar URL. Falls back to gradient initials. */
  photoUrl?: string;
  /** Imported from which platform. Defaults to "manual" when missing. */
  source?: ContactSource;
  /** Loose categorical tags — drives search filters and chat agents. */
  tags?: ContactTag[];
  /** Reachability / social profiles. */
  profiles?: ContactProfiles;
  /** What they're currently building — populated by the audio import. */
  currentProject?: CurrentProject;
  /** Aspirational goals or "what they want to do next". */
  aspirations?: string;
  /**
   * IDs of other contacts this person also knows. Bidirectional edges in
   * the "who knows who" graph; v1 keeps this denormalized for simplicity.
   */
  mutualConnectionIds?: ContactId[];
  /** Suggested check-in cadence, in days. Drives the "catch up due" rail. */
  checkInCadenceDays?: number;
  /** ISO 8601 timestamp of the last logged interaction. */
  lastContactedAt?: string;
  /** ISO 8601 timestamp the contact was first added. */
  createdAt: string;
  /** ISO 8601 timestamp the contact was last updated. */
  updatedAt: string;
}
