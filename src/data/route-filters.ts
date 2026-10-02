import type { Departure } from "./types";
export interface RouteFilter {
  line: string;
  destination: string;
}
export const emptyRouteFilter: RouteFilter = { line: "", destination: "" };
export function filterRoutes(rows: Departure[], filter: RouteFilter) {
  return rows.filter(
    (row) =>
      (!filter.line || row.line === filter.line) &&
      (!filter.destination ||
        row.arrivals?.some((a) => a.stationId === filter.destination)),
  );
}
export function routeDestinations(rows: Departure[], line: string) {
  return [
    ...new Set(
      rows
        .filter((row) => !line || row.line === line)
        .flatMap((row) => row.arrivals?.map((a) => a.stationId) ?? []),
    ),
  ];
}
export function changeLine(
  rows: Departure[],
  filter: RouteFilter,
  line: string,
): RouteFilter {
  return {
    line,
    destination: routeDestinations(rows, line).includes(filter.destination)
      ? filter.destination
      : "",
  };
}
