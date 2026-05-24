"use client";

import { load } from "@apple/mapkit-loader";
import * as React from "react";

import type { Contact } from "@/types/contact";

interface AppleMapProps {
  /**
   * Contacts to drop pins for. Each contact with a `meetingPlace` becomes
   * a custom photo-bubble annotation; contacts without a place are
   * silently skipped.
   */
  contacts: Contact[];
  /**
   * Called when a user taps a pin. The argument is the contact ID for
   * the selected annotation. The parent can render a callout card.
   */
  onSelectContact?: (contactId: string) => void;
  /**
   * Color scheme override. By default we follow `prefers-color-scheme`.
   */
  colorScheme?: "light" | "dark" | "auto";
}

type Status =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "not-configured"; message: string }
  | { kind: "error"; message: string };

/**
 * Apple-native MapKit JS map with custom DOM annotations that look like
 * the photo bubbles in the inspiration (Mesh-style). MapKit handles the
 * clustering math; we just provide a factory function for the DOM.
 *
 * Authorization is fetched lazily from `/api/mapkit/token` so the
 * component degrades gracefully when MapKit env vars are missing.
 */
export function AppleMap({
  contacts,
  onSelectContact,
  colorScheme = "auto",
}: AppleMapProps) {
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

        const resolvedScheme =
          colorScheme === "auto"
            ? prefersDark()
              ? mapkit.Map.ColorSchemes.Dark
              : mapkit.Map.ColorSchemes.Light
            : colorScheme === "dark"
              ? mapkit.Map.ColorSchemes.Dark
              : mapkit.Map.ColorSchemes.Light;

        const map = new mapkit.Map(containerEl, {
          colorScheme: resolvedScheme,
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

        const annotations = contacts
          .filter((c) => c.meetingPlace)
          .map((c) => {
            const place = c.meetingPlace!;
            const coordinate = new mapkit.Coordinate(
              place.latitude,
              place.longitude,
            );
            const display = c.nickname ?? c.name;
            const annotation = new mapkit.Annotation(
              coordinate,
              () =>
                buildPhotoBubble(c, (ev) => {
                  // The DOM click is the source of truth on touch + desktop
                  // (MapKit's own `select` event is unreliable for custom
                  // factory annotations, so we wire our own handler here).
                  ev.stopPropagation();
                  ev.preventDefault();
                  onSelectContact?.(c.id);
                }),
              {
                title: display,
                subtitle: place.label,
                anchorOffset: new DOMPoint(0, -8),
                displayPriority: 750,
                clusteringIdentifier: "contacts",
              },
            );
            (annotation as { data?: unknown }).data = { contactId: c.id };
            annotation.addEventListener("select", () => {
              onSelectContact?.(c.id);
            });
            return annotation;
          });

        // Provide a custom cluster annotation factory so groups also use
        // the Mesh-style bubble look (avatar stack + count badge).
        map.annotationForCluster = (clusterAnnotation: unknown) => {
          const cluster = clusterAnnotation as {
            coordinate: unknown;
            memberAnnotations: Array<{
              data?: { contactId?: string };
            }>;
          };
          const members = cluster.memberAnnotations
            .map((m) => contacts.find((c) => c.id === m.data?.contactId))
            .filter((c): c is Contact => Boolean(c));
          const clusterAnno = new mapkit.Annotation(
            cluster.coordinate as never,
            () =>
              buildClusterBubble(members, (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                // Zoom in so the underlying photo bubbles separate into
                // individually tappable contacts.
                const targetMembers = cluster.memberAnnotations as unknown as
                  | unknown[]
                  | undefined;
                if (targetMembers && targetMembers.length > 0) {
                  (
                    map as {
                      showItems: (
                        items: unknown[],
                        opts: unknown,
                      ) => void;
                    }
                  ).showItems(targetMembers, {
                    animate: true,
                    padding: new mapkit.Padding({
                      top: 120,
                      right: 48,
                      bottom: 240,
                      left: 48,
                    }),
                  });
                }
              }),
            {
              displayPriority: 1000,
              anchorOffset: new DOMPoint(0, -8),
            },
          );
          return clusterAnno;
        };

        if (annotations.length > 0) {
          map.showItems(annotations, {
            animate: true,
            padding: new mapkit.Padding({
              top: 80,
              right: 32,
              bottom: 200,
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
  }, [contacts, onSelectContact, colorScheme]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <div ref={containerRef} className="h-full w-full" />
      {status.kind !== "ready" && <MapOverlay status={status} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DOM annotation builders                                                    */
/* -------------------------------------------------------------------------- */

const BUBBLE_SIZE = 48;

function buildPhotoBubble(
  contact: Contact,
  onClick: (event: MouseEvent) => void,
): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "crm-photo-pin";
  el.setAttribute(
    "aria-label",
    `Open ${contact.nickname ?? contact.name}'s profile`,
  );
  el.style.cssText = bubbleBaseStyle();

  const inner = document.createElement("div");
  // Block the inner from swallowing pointer events — we want them to bubble
  // up to the button so the click handler fires reliably on mobile and
  // desktop.
  inner.style.cssText = `${bubbleInnerStyle()};pointer-events:none;`;

  if (contact.photoUrl) {
    const img = document.createElement("img");
    img.src = contact.photoUrl;
    img.alt = "";
    img.loading = "lazy";
    img.draggable = false;
    img.style.cssText =
      "width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;";
    img.onerror = () => {
      img.replaceWith(makeInitialsTile(contact));
    };
    inner.appendChild(img);
  } else {
    inner.appendChild(makeInitialsTile(contact));
  }

  el.appendChild(inner);
  el.addEventListener("click", onClick);
  return el;
}

function makeInitialsTile(contact: Contact): HTMLElement {
  const tile = document.createElement("div");
  const initials = initialsFor(contact.nickname ?? contact.name);
  const gradient = pickGradientCss(contact.id);
  tile.textContent = initials;
  tile.style.cssText = [
    "width:100%",
    "height:100%",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif",
    "font-weight:600",
    "font-size:15px",
    "color:rgba(15,23,42,0.85)",
    `background-image:${gradient}`,
  ].join(";");
  return tile;
}

function buildClusterBubble(
  members: Contact[],
  onClick: (event: MouseEvent) => void,
): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute(
    "aria-label",
    `Expand ${members.length} contacts at this location`,
  );
  el.style.cssText = clusterContainerStyle();
  el.addEventListener("click", onClick);

  const stack = document.createElement("div");
  stack.style.cssText = clusterStackStyle();

  // Up to 3 overlapped avatars
  const preview = members.slice(0, 3);
  preview.forEach((m, i) => {
    const slot = document.createElement("div");
    slot.style.cssText = [
      `width:${BUBBLE_SIZE - 6}px`,
      `height:${BUBBLE_SIZE - 6}px`,
      "border-radius:9999px",
      "overflow:hidden",
      "background:linear-gradient(135deg,#e2e8f0,#cbd5e1)",
      "border:2px solid rgba(255,255,255,0.95)",
      "box-shadow:0 2px 8px rgba(15,23,42,0.25)",
      `margin-left:${i === 0 ? "0" : "-18px"}`,
      `z-index:${10 - i}`,
      "position:relative",
    ].join(";");

    if (m.photoUrl) {
      const img = document.createElement("img");
      img.src = m.photoUrl;
      img.alt = "";
      img.loading = "lazy";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
      img.onerror = () => img.replaceWith(makeInitialsTile(m));
      slot.appendChild(img);
    } else {
      slot.appendChild(makeInitialsTile(m));
    }
    stack.appendChild(slot);
  });

  el.appendChild(stack);

  // Count badge
  const badge = document.createElement("div");
  badge.textContent = String(members.length);
  badge.style.cssText = [
    "position:absolute",
    "right:-6px",
    "bottom:-6px",
    "min-width:22px",
    "height:22px",
    "padding:0 6px",
    "border-radius:11px",
    "background:rgba(15,23,42,0.85)",
    "color:#fff",
    "font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,sans-serif",
    "font-weight:600",
    "font-size:11px",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "border:1.5px solid rgba(255,255,255,0.95)",
    "backdrop-filter:blur(8px) saturate(150%)",
    "-webkit-backdrop-filter:blur(8px) saturate(150%)",
  ].join(";");
  el.appendChild(badge);

  return el;
}

/* -------------------------------------------------------------------------- */
/* Styling helpers                                                            */
/* -------------------------------------------------------------------------- */

function bubbleBaseStyle(): string {
  return [
    `width:${BUBBLE_SIZE}px`,
    `height:${BUBBLE_SIZE}px`,
    "position:relative",
    "transform:translate(-50%,-100%)",
    "cursor:pointer",
    "transition:transform 0.15s ease-out",
    "padding:0",
    "border:0",
    "background:transparent",
    "outline:none",
    "-webkit-tap-highlight-color:transparent",
    "appearance:none",
    "-webkit-appearance:none",
  ].join(";");
}

function bubbleInnerStyle(): string {
  return [
    "width:100%",
    "height:100%",
    "border-radius:9999px",
    "overflow:hidden",
    "border:3px solid rgba(255,255,255,0.95)",
    "box-shadow:0 4px 14px rgba(15,23,42,0.35),0 2px 4px rgba(15,23,42,0.2)",
    "background:linear-gradient(135deg,#e2e8f0,#cbd5e1)",
  ].join(";");
}

function clusterContainerStyle(): string {
  return [
    "position:relative",
    "transform:translate(-50%,-100%)",
    "cursor:pointer",
    "filter:drop-shadow(0 6px 18px rgba(15,23,42,0.3))",
    "padding:0",
    "border:0",
    "background:transparent",
    "outline:none",
    "-webkit-tap-highlight-color:transparent",
    "appearance:none",
    "-webkit-appearance:none",
  ].join(";");
}

function clusterStackStyle(): string {
  return ["display:flex", "align-items:center"].join(";");
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const GRADIENT_CSS = [
  "linear-gradient(135deg,#7dd3fc,#a78bfa)",
  "linear-gradient(135deg,#6ee7b7,#22d3ee)",
  "linear-gradient(135deg,#f9a8d4,#c084fc)",
  "linear-gradient(135deg,#fcd34d,#fb7185)",
  "linear-gradient(135deg,#5eead4,#818cf8)",
  "linear-gradient(135deg,#f0abfc,#38bdf8)",
  "linear-gradient(135deg,#bef264,#34d399)",
  "linear-gradient(135deg,#fdba74,#f472b6)",
];

function pickGradientCss(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENT_CSS[hash % GRADIENT_CSS.length]!;
}

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function MapOverlay({ status }: { status: Status }) {
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
  if (!data.token) throw new Error("Token response was empty.");
  return data.token;
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}
