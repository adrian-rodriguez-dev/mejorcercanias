import { DateTime } from "luxon";
import type { Departure } from "./types";
import { localDay } from "./time";
export function arrivalAt(
  train: Departure,
  destination: string,
): string | undefined {
  const target = destination || train.terminalId;
  if (!target) return undefined;
  const at = train.arrivals?.find((stop) => stop.stationId === target)?.at;
  return at &&
    Number.isFinite(Date.parse(at)) &&
    Date.parse(at) >= Date.parse(train.scheduledAt)
    ? at
    : undefined;
}
export function arrivalDayLabel(departure: string, arrival: string): string {
  const days = DateTime.fromISO(localDay(Date.parse(arrival))).diff(
    DateTime.fromISO(localDay(Date.parse(departure))),
    "days",
  ).days;
  return days > 0 ? `+${days} ${days === 1 ? "día" : "días"}` : "";
}
