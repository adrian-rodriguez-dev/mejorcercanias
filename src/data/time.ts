import { DateTime } from "luxon";
import type { Departure } from "./types";
export const ZONE = "Europe/Madrid";
export const localDay = (now: number) =>
  DateTime.fromMillis(now, { zone: ZONE }).toISODate()!;
export const clockTime = (now: number) =>
  DateTime.fromMillis(now, { zone: ZONE }).toFormat("HH:mm");
export const dayLabel = (at: number, now: number) => {
  const date = DateTime.fromMillis(at, { zone: ZONE });
  const today = DateTime.fromMillis(now, { zone: ZONE });
  if (date.hasSame(today, "day")) return "Hoy";
  return date.hasSame(today.plus({ days: 1 }), "day")
    ? "Mañana"
    : date.toFormat("dd/LL");
};
export function upcoming(departures: Departure[], now: number, limit = 20) {
  return departures
    .filter((d) => Date.parse(d.scheduledAt) >= now)
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))
    .slice(0, limit)
    .map((d) => ({
      ...d,
      minutes: Math.ceil((Date.parse(d.scheduledAt) - now) / 60000),
    }));
}
