import { DateTime } from "luxon";
import { demoStations as stations } from "./stations";
import { ZONE } from "./time";
import type { DemoPattern, ScheduleProvider, StationSchedule } from "./types";

export function materialize(
  stationId: string,
  patterns: DemoPattern[],
  now: number,
): StationSchedule {
  const today = DateTime.fromMillis(now, { zone: ZONE }).startOf("day");
  const departures = [0, 1].flatMap((day) =>
    patterns.flatMap((p, route) => {
      // Set wall-clock hour after calendar-day arithmetic to preserve DST boundaries.
      const start = today
        .plus({ days: day })
        .set({ hour: 6 })
        .plus({ minutes: p.offset });
      const end = today.plus({ days: day }).set({ hour: 23 });
      const rows = [];
      for (let at = start; at < end; at = at.plus({ minutes: p.every })) {
        rows.push({
          id: `${stationId}-${route}-${at.toMillis()}`,
          line: p.line,
          destination: p.destination,
          scheduledAt: at.toISO()!,
        });
      }
      return rows;
    }),
  );
  return { stationId, source: "demo", departures };
}

function isPatterns(value: unknown): value is DemoPattern[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p.line === "string" &&
        typeof p.destination === "string" &&
        Number.isInteger(p.offset) &&
        p.offset >= 0 &&
        p.offset < 60 &&
        Number.isInteger(p.every) &&
        p.every > 0 &&
        p.every <= 120,
    )
  );
}

export const demoProvider: ScheduleProvider = {
  async load(stationId, now, signal) {
    if (!stations.some((s) => s.id === stationId))
      throw new Error("Estación desconocida");
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/demo/${stationId}.json`,
      { signal },
    );
    if (!response.ok) throw new Error("No se pudo cargar el horario");
    const patterns: unknown = await response.json();
    if (!isPatterns(patterns)) throw new Error("Horario no válido");
    return materialize(stationId, patterns, now);
  },
};
