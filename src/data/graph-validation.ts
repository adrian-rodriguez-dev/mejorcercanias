import type { Graph } from "./router";
export function validGraph(
  value: unknown,
  version: string,
  network: string,
): value is Graph {
  const g = value as Graph;
  return (
    !!g &&
    g.schemaVersion === 1 &&
    g.version === version &&
    g.network === network &&
    typeof g.nodes === "object" &&
    g.nodes !== null &&
    !Array.isArray(g.nodes) &&
    Object.values(g.nodes).every(
      (n) =>
        !!n && typeof n.stationId === "string" && typeof n.name === "string",
    ) &&
    typeof g.groups === "object" &&
    g.groups !== null &&
    !Array.isArray(g.groups) &&
    Array.isArray(g.calendars) &&
    g.calendars.every(
      (c) =>
        Array.isArray(c) &&
        c.every((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)),
    ) &&
    Object.values(g.groups).every(
      (nodes) =>
        Array.isArray(nodes) &&
        nodes.length > 0 &&
        nodes.every((n) => typeof n === "string" && Object.hasOwn(g.nodes, n)),
    ) &&
    Array.isArray(g.trips) &&
    g.trips.every(
      (t) =>
        !!t &&
        typeof t.id === "string" &&
        typeof t.route === "string" &&
        typeof t.line === "string" &&
        (t.mode === undefined || t.mode === "train" || t.mode === "bus") &&
        Number.isInteger(t.calendar) &&
        !!g.calendars[t.calendar] &&
        Array.isArray(t.calls) &&
        t.calls.length > 1 &&
        t.calls.every(
          (c, i) =>
            Array.isArray(c) &&
            c.length === 5 &&
            typeof c[0] === "string" &&
            Object.hasOwn(g.nodes, c[0]) &&
            Number.isFinite(c[1]) &&
            c[1] >= 0 &&
            Number.isFinite(c[2]) &&
            c[2] >= c[1] &&
            c[2] < 172800 &&
            [0, 1, 2, 3].includes(c[3]) &&
            [0, 1, 2, 3].includes(c[4]) &&
            (i === 0 || c[1] >= t.calls[i - 1][2]),
        ),
    ) &&
    Array.isArray(g.transfers) &&
    g.transfers.every(
      (t) =>
        !!t &&
        typeof t.from === "string" &&
        Object.hasOwn(g.nodes, t.from) &&
        typeof t.to === "string" &&
        Object.hasOwn(g.nodes, t.to) &&
        (t.estimated === undefined || typeof t.estimated === "boolean") &&
        [t.from_route_id, t.to_route_id, t.from_trip_id, t.to_trip_id].every(
          (id) => id === undefined || typeof id === "string",
        ) &&
        (t.seconds === null || (Number.isInteger(t.seconds) && t.seconds >= 0)),
    )
  );
}
