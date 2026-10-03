import { DateTime } from "luxon";
import type { Departure } from "./types";
import { filterRoutes, type RouteFilter } from "./route-filters";
import { stations } from "./stations";
import { localDay, ZONE } from "./time";
const ROUTES: Record<string, string> = {
  "60T0001C1": "C1",
  "60T0002C1": "C1",
  "60T0003C2": "C2",
  "60T0004C2": "C2",
  "60T0005C3": "C3",
  "60T0006C3": "C3",
  "60T0023C3": "C3",
  "60T0024C3": "C3",
};
export const ALERT_MAX_AGE = 300000;
interface Selector {
  routeId?: string;
  stopId?: string;
  agencyId?: string;
  trip?: unknown;
}
export interface Alert {
  id: string;
  text: string;
  selectors: Selector[];
  periods: { start?: number; end?: number }[];
  impact: string;
  timestamp: number;
}
interface RawAlert {
  activePeriod?: { start?: string; end?: string }[];
  informedEntity?: Selector[];
  descriptionText?: { translation: { text: string; language?: string }[] };
  headerText?: { translation: { text: string; language?: string }[] };
  effect?: string;
}
export function parseAlerts(raw: unknown, now: number): Alert[] {
  const feed = raw as {
    header?: { timestamp?: string; incrementality?: string | number };
    entity?: { id: string; isDeleted?: boolean; alert?: RawAlert }[];
  };
  const timestamp = Number(feed?.header?.timestamp) * 1000;
  if (
    !Number.isFinite(timestamp) ||
    now - timestamp > ALERT_MAX_AGE ||
    timestamp > now + 60000 ||
    ![undefined, 0, "FULL_DATASET"].includes(feed.header?.incrementality) ||
    !Array.isArray(feed.entity)
  )
    throw Error("Unverifiable alert feed");
  return feed.entity.flatMap((e) => {
    if (e.isDeleted || !e.alert) return [];
    const a = e.alert,
      translations =
        a.descriptionText?.translation ?? a.headerText?.translation ?? [];
    const text = (
      translations.find((t) => t.language === "es") ?? translations[0]
    )?.text;
    if (!text || !Array.isArray(a.informedEntity)) return [];
    const selectors = a.informedEntity.filter(
      (s) =>
        !s.trip &&
        (!s.routeId || Boolean(ROUTES[s.routeId])) &&
        (!s.stopId || stations.some((x) => x.id === s.stopId)) &&
        Boolean(s.routeId || s.stopId),
    );
    if (!selectors.length) return [];
    const periods = (a.activePeriod ?? []).map((p) => ({
      start: p.start === undefined ? undefined : Number(p.start) * 1000,
      end: p.end === undefined ? undefined : Number(p.end) * 1000,
    }));
    if (
      periods.some(
        (p) =>
          (p.start !== undefined && !Number.isFinite(p.start)) ||
          (p.end !== undefined && !Number.isFinite(p.end)) ||
          (p.start !== undefined && p.end !== undefined && p.start >= p.end),
      )
    )
      return [];
    return [
      {
        id: e.id,
        text,
        selectors,
        periods,
        impact: a.effect ?? "UNKNOWN_EFFECT",
        timestamp,
      },
    ];
  });
}
export function relevantAlerts(
  alerts: Alert[],
  origin: string,
  filter: RouteFilter,
  date: string,
  departures: Departure[],
  now: number,
): Alert[] {
  if (stations.find((s) => s.id === origin)?.network !== "bilbao") return [];
  const station = stations.find((s) => s.id === origin);
  if (!station) return [];
  const destination = stations.find((s) => s.id === filter.destination);
  const lines = station.lines.filter(
    (l) =>
      (!filter.lines.length || filter.lines.includes(l)) &&
      (!destination || destination.lines.includes(l)),
  );
  const stops = new Set([origin, filter.destination].filter(Boolean));
  for (const train of filterRoutes(departures, filter)) {
    for (const stop of train.arrivals ?? []) {
      stops.add(stop.stationId);
      if (stop.stationId === filter.destination) break;
    }
  }
  const today = localDay(now),
    future = date !== today;
  const dayStart = DateTime.fromISO(date, { zone: ZONE }).toMillis(),
    dayEnd = DateTime.fromISO(date, { zone: ZONE })
      .plus({ days: 1 })
      .toMillis();
  return alerts.filter(
    (a) =>
      now - a.timestamp <= ALERT_MAX_AGE &&
      a.selectors.some(
        (s) =>
          (!s.routeId || lines.includes(ROUTES[s.routeId])) &&
          (!s.stopId || stops.has(s.stopId)),
      ) &&
      (a.periods.length
        ? a.periods.some((p) =>
            future
              ? p.start !== undefined &&
                p.end !== undefined &&
                p.start < dayEnd &&
                p.end > dayStart
              : (p.start ?? -Infinity) <= now && (p.end ?? Infinity) > now,
          )
        : !future),
  );
}

export function alertScope(alert: Alert): string {
  const lines = [
    ...new Set(
      alert.selectors.flatMap((s) => (s.routeId ? [ROUTES[s.routeId]] : [])),
    ),
  ];
  const stops = [
    ...new Set(
      alert.selectors.flatMap((s) =>
        s.stopId
          ? [stations.find((x) => x.id === s.stopId)?.name ?? s.stopId]
          : [],
      ),
    ),
  ];
  return [...lines, ...stops].join(" · ");
}
export function alertPriority(alert: Alert): number {
  return (
    (
      {
        NO_SERVICE: 0,
        SIGNIFICANT_DELAYS: 1,
        REDUCED_SERVICE: 2,
        DETOUR: 3,
        ACCESSIBILITY_ISSUE: 4,
      } as Record<string, number>
    )[alert.impact] ?? 5
  );
}
