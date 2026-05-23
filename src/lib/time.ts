/**
 * Lightweight relative-time formatter — avoids pulling in a date lib for
 * a single use case. Returns short tokens like "3d" / "5w" / "2mo" that
 * match the iOS "Last contacted 3d ago" treatment.
 */
export function formatRelative(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const delta = Math.max(0, Math.round((Date.now() - then) / 1000));
  const minutes = Math.round(delta / 60);
  const hours = Math.round(delta / 3600);
  const days = Math.round(delta / 86400);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  if (delta < 60) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 14) return `${days}d`;
  if (weeks < 8) return `${weeks}w`;
  return `${months}mo`;
}

/** Long-form variant — "3 days ago", "Last week", "Just now". */
export function formatRelativeLong(iso?: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never";
  const delta = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (delta < 60) return "Just now";
  const minutes = Math.round(delta / 60);
  if (minutes < 60) return plural(minutes, "minute") + " ago";
  const hours = Math.round(delta / 3600);
  if (hours < 24) return plural(hours, "hour") + " ago";
  const days = Math.round(delta / 86400);
  if (days === 1) return "Yesterday";
  if (days < 14) return plural(days, "day") + " ago";
  const weeks = Math.round(days / 7);
  if (weeks < 8) return plural(weeks, "week") + " ago";
  const months = Math.round(days / 30);
  return plural(months, "month") + " ago";
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}
