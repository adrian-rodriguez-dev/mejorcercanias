import { arrivalAt } from "./arrival";
import type { Departure } from "./types";
export interface RouteFilter {
  lines: string[];
  destination: string;
}
export const emptyRouteFilter: RouteFilter = { lines: [], destination: "" };
export function filterRoutes(rows: Departure[], filter: RouteFilter) {
  return rows.filter(
    (row) =>
      (!filter.lines.length || filter.lines.includes(row.line)) &&
      (!filter.destination || Boolean(arrivalAt(row, filter.destination))),
  );
}
export function routeDestinations(rows: Departure[], lines: string[]) {
  return [
    ...new Set(
      rows
        .filter((row) => !lines.length || lines.includes(row.line))
        .flatMap((row) => row.arrivals?.map((a) => a.stationId) ?? []),
    ),
  ];
}
export function changeLines(
  rows: Departure[],
  filter: RouteFilter,
  lines: string[],
): RouteFilter {
  return {
    lines,
    destination:
      !lines.length ||
      !rows.length ||
      routeDestinations(rows, lines).includes(filter.destination)
        ? filter.destination
        : "",
  };
}
