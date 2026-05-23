"use client";

import { load } from "@apple/mapkit-loader";
import * as React from "react";

import type { Contact } from "@/types/contact";

interface AppleMapProps {
  /**
   * Contacts to drop pins for. Each contact with a `meetingPlace` becomes
   * a MarkerAnnotation; contacts without a place are ignored.
   */
  contacts: Contact[];
  /**
   * Called when a user taps a pin. The argument is the contact ID for
   * the selected annotation. The parent can render a callout card.
   */
  onSelectContact?: (contactId: string) => void;
}

type Status =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "not-configured"; message: string }
  | { kind: "error"; message: string };

/**
 * Renders Apple's native MapKit JS with one iOS-style `MarkerAnnotation`
 * per contact. Authorization is fetched lazily from `/api/mapkit/token`
 * so the component degrades gracefully when MapKit env vars are missing.
 */
export function AppleMap({ contacts, onSelectContact }: AppleMapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<unknown>(null);
  const [status, setStatus] = React.useState<Status>({ kind: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    const containerEl = containerRef.current;
    if (!containerEl) return;

    async function init() {
      try {
        const token = await fetchToken();
        if (cancelled) return;

        const mapkit = await load({
          token,
          libraries: ["map", "annotations"],
        });
        if (cancelled) return;

        const annotations = contacts
          .filter((c) => c.meetingPlace)
          .map((c) => {
            const place = c.meetingPlace!;
            const coordinate = new mapkit.Coordinate(
              place.latitude,
              place.longitude,
            );
            const annotation = new mapkit.MarkerAnnotation(coordinate, {
              title: c.nickname ?? c.name,
              subtitle: place.label,
              color: "#0a84ff",
              glyphColor: "#ffffff",
              glyphText: initialsFor(c.nickname ?? c.name),
              selected: false,
            });
            (annotation as { data?: unknown }).data = { contactId: c.id };
            annotation.addEventListener("select", () => {
              onSelectContact?.(c.id);
            });
            return annotation;
          });

        const map = new mapkit.Map(containerEl, {
          colorScheme: prefersDark()
            ? mapkit.Map.ColorSchemes.Dark
            : mapkit.Map.ColorSchemes.Light,
          showsCompass: mapkit.FeatureVisibility.Adaptive,
          showsZoomControl: false,
          showsMapTypeControl: false,
          showsScale: mapkit.FeatureVisibility.Hidden,
          isRotationEnabled: false,
          showsUserLocationControl: false,
          padding: new mapkit.Padding({
            top: 24,
            right: 24,
            bottom: 120,
            left: 24,
          }),
        });

        if (annotations.length > 0) {
          map.showItems(annotations, {
            animate: true,
            padding: new mapkit.Padding({
              top: 32,
              right: 32,
              bottom: 140,
              left: 32,
            }),
          });
        }

        mapRef.current = map;
        if (!cancelled) setStatus({ kind: "ready" });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof MapKitConfigMissingError) {
          setStatus({ kind: "not-configured", message: err.message });
        } else {
          console.error("[AppleMap] init failed", err);
          setStatus({
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Could not load Apple Maps.",
          });
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      const existing = mapRef.current as { destroy?: () => void } | null;
      if (existing?.destroy) existing.destroy();
      mapRef.current = null;
    };
  }, [contacts, onSelectContact]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900">
      <div ref={containerRef} className="h-full w-full" />
      {status.kind !== "ready" && (
        <MapOverlay status={status} />
      )}
    </div>
  );
}

function MapOverlay({ status }: { status: Status }) {
  if (status.kind === "ready") return null;
  const title =
    status.kind === "loading"
      ? "Loading map…"
      : status.kind === "not-configured"
        ? "Map not configured yet"
        : "Couldn’t load the map";
  const body =
    status.kind === "loading"
      ? "Asking Apple for a fresh authorization token."
      : "message" in status
        ? status.message
        : "Please try again in a moment.";
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-sm rounded-3xl border border-white/40 bg-white/70 p-5 text-center backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/70">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {body}
        </p>
      </div>
    </div>
  );
}

class MapKitConfigMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MapKitConfigMissingError";
  }
}

/**
 * Fetch a short-lived MapKit JS token from our own backend. A 503 means
 * credentials aren't configured yet — surface that as an empty state
 * rather than a generic error.
 */
async function fetchToken(): Promise<string> {
  const response = await fetch("/api/mapkit/token", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (response.status === 503) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new MapKitConfigMissingError(
      body?.message ??
        "MapKit credentials are not configured. Set MAPKIT_TEAM_ID, MAPKIT_KEY_ID, and MAPKIT_PRIVATE_KEY.",
    );
  }
  if (!response.ok) {
    throw new Error(`Token request failed (HTTP ${response.status}).`);
  }
  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Token response was empty.");
  }
  return data.token;
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}
