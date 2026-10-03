import { coverageFor } from "./networks";
import { DateTime } from "luxon";
import {
  manifest,
  preparedFiles,
  checkSnapshot,
  type Manifest,
} from "./snapshot";
import { stations, stationName } from "./stations";
import { localDay, ZONE } from "./time";
import type { Departure, ScheduleProvider, StationSchedule } from "./types";
export { manifest };
export type Pattern = [
  string,
  string,
  string,
  number,
  number,
  [string, number][],
];
export interface StationFile {
  version: string;
  stationId: string;
  patterns: Pattern[];
}
export const addDays = (day: string, count: number) =>
  DateTime.fromISO(day, { zone: ZONE }).plus({ days: count }).toISODate()!;
export const dateTitle = (day: string) =>
  DateTime.fromISO(day, { zone: ZONE })
    .setLocale("es")
    .toFormat("cccc, d 'de' LLLL");
export const gtfsInstant = (day: string, seconds: number) =>
  DateTime.fromISO(day, { zone: ZONE })
    .set({ hour: 12 })
    .minus({ hours: 12 })
    .plus({ seconds })
    .toISO()!;
export function resolveDay(
  file: StationFile,
  day: string,
  calendars: string[][] = manifest.calendars,
  coverage: string[] = manifest.coverageDates,
): StationSchedule {
  if (!coverage.includes(day))
    return {
      stationId: file.stationId,
      source: "renfe-gtfs",
      departures: [],
      availability: "unpublished",
    };
  const departures: Departure[] = [];
  const destinations = new Set<string>();
  const lower = addDays(day, -2),
    upper = addDays(day, 1);
  for (const [
    id,
    line,
    terminal,
    seconds,
    calendarId,
    calls,
  ] of file.patterns) {
    calls.forEach(([stop]) => destinations.add(stop));
    for (const serviceDay of calendars[calendarId]) {
      if (serviceDay < lower || serviceDay > upper) continue;
      const at = gtfsInstant(serviceDay, seconds);
      if (localDay(Date.parse(at)) !== day) continue;
      departures.push({
        id: `${id}-${serviceDay}`,
        line,
        destination: stationName(terminal),
        scheduledAt: at,
        arrivals: calls.map(([stationId, sec]) => ({
          stationId,
          at: gtfsInstant(serviceDay, sec),
        })),
      });
    }
  }
  return {
    stationId: file.stationId,
    source: "renfe-gtfs",
    availability: "available",
    destinations: [...destinations],
    departures: departures.sort(
      (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
    ),
  };
}
async function loadFile(
  stationId: string,
  signal: AbortSignal,
  snapshot: Manifest = manifest,
): Promise<StationFile> {
  const cached = preparedFiles.get(`${snapshot.version}/${stationId}`);
  if (cached) return cached as StationFile;
  if (!stations.some((s) => s.id === stationId))
    throw new Error("Unknown station");
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/renfe/${snapshot.version}/${stationId}.json`,
    { signal },
  );
  if (!response.ok) {
    if (response.status === 404) void checkSnapshot(stationId);
    throw new Error("Unable to load station");
  }
  const file = (await response.json()) as StationFile;
  if (
    file.version !== snapshot.version ||
    file.stationId !== stationId ||
    !Array.isArray(file.patterns)
  )
    throw new Error("Invalid dataset");
  return file;
}
export async function loadDay(
  stationId: string,
  day: string,
  signal: AbortSignal,
): Promise<StationSchedule> {
  const snapshot = manifest;
  const coverage = coverageFor(stationId);
  if (!coverage.includes(day))
    return {
      stationId,
      source: "renfe-gtfs",
      departures: [],
      availability: "unpublished",
    };
  return resolveDay(
    await loadFile(stationId, signal, snapshot),
    day,
    snapshot.calendars,
    coverage,
  );
}
export const renfeProvider: ScheduleProvider = {
  async load(stationId, now, signal) {
    const day = localDay(now);
    const snapshot = manifest;
    const coverage = coverageFor(stationId);
    if (!coverage.includes(day))
      return {
        stationId,
        source: "renfe-gtfs",
        departures: [],
        availability: "unpublished",
      };
    const file = await loadFile(stationId, signal, snapshot);
    const today = resolveDay(file, day, snapshot.calendars, coverage);
    const tomorrow = resolveDay(
      file,
      addDays(day, 1),
      snapshot.calendars,
      coverage,
    );
    return {
      ...today,
      departures: [...today.departures, ...tomorrow.departures],
    };
  },
};
