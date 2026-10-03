import { readStored, storeData } from "./offline-store";
import { coverageFor } from "./networks";
import { DateTime } from "luxon";
import {
  manifest,
  preparedFiles,
  checkSnapshot,
  type Manifest,
} from "./snapshot";
import { stationName } from "./stations";
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
export function validStationFile(
  value: unknown,
  stationId: string,
  snapshot: Manifest,
): value is StationFile {
  const f = value as StationFile;
  return Boolean(
    f &&
    f.version === snapshot.version &&
    f.stationId === stationId &&
    Array.isArray(f.patterns) &&
    f.patterns.every(
      (p) =>
        Array.isArray(p) &&
        p.length === 6 &&
        typeof p[0] === "string" &&
        typeof p[1] === "string" &&
        typeof p[2] === "string" &&
        Number.isFinite(p[3]) &&
        p[3] >= 0 &&
        Number.isInteger(p[4]) &&
        !!snapshot.calendars[p[4]] &&
        Array.isArray(p[5]) &&
        p[5].every(
          (c) =>
            Array.isArray(c) &&
            typeof c[0] === "string" &&
            Number.isFinite(c[1]) &&
            c[1] >= p[3],
        ),
    ),
  );
}
async function loadFile(
  stationId: string,
  signal: AbortSignal,
  snapshot: Manifest = manifest,
): Promise<{ file: StationFile; offline: boolean }> {
  const key = `${snapshot.version}/${stationId}`;
  if (!snapshot.stations.some((s) => s.id === stationId))
    throw new Error("Unknown station");
  const prepared = preparedFiles.get(key);
  if (validStationFile(prepared, stationId, snapshot)) {
    await storeData(key, prepared);
    if (manifest.version === snapshot.version) await storeData("manifest", snapshot);
    return { file: prepared, offline: !navigator.onLine };
  }
  const saved = await readStored(key);
  if (validStationFile(saved, stationId, snapshot))
    return { file: saved, offline: !navigator.onLine };
  if (!navigator.onLine) throw new Error("Station not saved");
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/renfe/${key}.json`,
    {
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    },
  );
  if (!response.ok) {
    if (response.status === 404) void checkSnapshot(stationId);
    throw new Error("Unable to load station");
  }
  const file: unknown = await response.json();
  if (!validStationFile(file, stationId, snapshot))
    throw new Error("Invalid dataset");
  await storeData(key, file);
  if (manifest.version === snapshot.version) await storeData("manifest", snapshot);
  return { file, offline: false };
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
  const { file, offline } = await loadFile(stationId, signal, snapshot);
  return { ...resolveDay(file, day, snapshot.calendars, coverage), offline };
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
    const { file, offline } = await loadFile(stationId, signal, snapshot);
    const today = resolveDay(file, day, snapshot.calendars, coverage);
    const tomorrow = resolveDay(
      file,
      addDays(day, 1),
      snapshot.calendars,
      coverage,
    );
    return {
      ...today,
      offline,
      departures: [...today.departures, ...tomorrow.departures],
    };
  },
};
