import { DateTime } from "luxon";
import { ZONE } from "./time";
import type { Departure } from "./types";
export type TimeMode = "all" | "depart" | "arrive";
export interface TimetableFilter {
  date: string;
  destination: string;
  mode: TimeMode;
  time: string;
}
export function filterTimetable(rows: Departure[], filter: TimetableFilter) {
  const limit = DateTime.fromISO(`${filter.date}T${filter.time || "00:00"}`, {
    zone: ZONE,
  }).toMillis();
  return rows
    .flatMap((row) => {
      const arrival = row.arrivals?.find(
        (a) => a.stationId === filter.destination,
      );
      if (filter.destination && !arrival) return [];
      if (filter.mode === "depart" && Date.parse(row.scheduledAt) < limit)
        return [];
      if (
        filter.mode === "arrive" &&
        (!arrival || Date.parse(arrival.at) > limit)
      )
        return [];
      return [{ ...row, arrivalAt: arrival?.at }];
    })
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
}
