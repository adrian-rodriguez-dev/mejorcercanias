// Adapted from gerardcl/renfe-cli router.rs, revision 938db1536b7e.
// Copyright (c) 2019, @gerardcl. BSD-3-Clause: public/licenses/renfe-cli.txt.
import { DateTime } from "luxon";
export type Call = [string, number, number, number, number];
export interface RoutingTrip {
  id: string;
  route: string;
  line: string;
  calendar: number;
  calls: Call[];
}
export interface Transfer {
  from: string;
  to: string;
  seconds: number | null;
  estimated?: boolean;
  from_route_id?: string;
  to_route_id?: string;
  from_trip_id?: string;
  to_trip_id?: string;
}
export interface Graph {
  schemaVersion: number;
  version: string;
  network: string;
  nodes: Record<string, { stationId: string; name: string }>;
  groups: Record<string, string[]>;
  trips: RoutingTrip[];
  calendars: string[][];
  transfers: Transfer[];
}
export interface Leg {
  tripId: string;
  route: string;
  line: string;
  from: string;
  to: string;
  departure: number;
  arrival: number;
  change?: { from: string; to: string; seconds: number; estimated: boolean };
}
export interface Journey {
  legs: Leg[];
}
type Label = { arrival: number; legs: Leg[] };
type ActiveTrip = RoutingTrip & { serviceId: string };
const MAX_LEGS = 4,
  DEFAULT_TRANSFER = 300,
  PENALTY = 900,
  MAX_DURATION = 86400;
const last = (label: Label) => label.legs.at(-1)!;
const start = (j: Journey) => j.legs[0].departure;
const end = (j: Journey) => j.legs.at(-1)!.arrival;
const score = (j: Journey) => end(j) - start(j) + (j.legs.length - 1) * PENALTY;

// Exact trip rules outrank route rules; equally specific conflicting rules fail closed.
export function changeRule(
  rules: Transfer[],
  previous: Leg,
  trip: RoutingTrip,
  node: string,
): Transfer | undefined {
  const matches = rules.filter(
    (r) =>
      r.from === previous.to &&
      r.to === node &&
      (!r.from_route_id || r.from_route_id === previous.route) &&
      (!r.to_route_id || r.to_route_id === trip.route) &&
      (!r.from_trip_id ||
        r.from_trip_id ===
          previous.tripId.slice(0, previous.tripId.lastIndexOf("@"))) &&
      (!r.to_trip_id || r.to_trip_id === trip.id),
  );
  const rank = (r: Transfer) =>
    4 * (Number(!!r.from_trip_id) + Number(!!r.to_trip_id)) +
    Number(!!r.from_route_id) +
    Number(!!r.to_route_id);
  if (!matches.length)
    return node === previous.to
      ? { from: node, to: node, seconds: DEFAULT_TRANSFER }
      : undefined;
  const max = Math.max(...matches.map(rank));
  const best = matches.filter((r) => rank(r) === max);
  return {
    ...best[0],
    seconds: best.some((r) => r.seconds === null)
      ? null
      : Math.max(...best.map((r) => r.seconds!)),
  };
}

function keep(
  labels: Map<string, Map<string, Label>>,
  node: string,
  candidate: Label,
) {
  // Keeping the incoming trip identity avoids losing a later arrival with a permitted connection.
  const key = last(candidate).tripId;
  const existing = labels.get(node) ?? new Map<string, Label>();
  if (!existing.has(key) || existing.get(key)!.arrival > candidate.arrival)
    existing.set(key, candidate);
  labels.set(node, existing);
}

function findOne(
  trips: ActiveTrip[],
  rules: Transfer[],
  origin: string[],
  destination: Set<string>,
  departure: number,
  lines: string[],
): Journey | undefined {
  let previous = new Map<string, Map<string, Label>>(
    origin.map((s) => [
      s,
      new Map([["origin", { arrival: departure, legs: [] }]]),
    ]),
  );
  const candidates: Journey[] = [];
  for (let round = 0; round < MAX_LEGS; round++) {
    const current = new Map<string, Map<string, Label>>();
    const inbound = new Map<string, Label[]>();
    for (const [node, values] of previous) {
      const targets = new Set([
        node,
        ...rules
          .filter((r) => r.from === node && r.seconds !== null)
          .map((r) => r.to),
      ]);
      for (const target of targets)
        inbound.set(target, [
          ...(inbound.get(target) ?? []),
          ...values.values(),
        ]);
    }
    for (const trip of trips) {
      if (round === 0 && lines.length && !lines.includes(trip.line)) continue;
      let boarded: Label | undefined;
      for (const call of trip.calls) {
        const [node, arrival, dep, pickup, dropoff] = call;
        if (boarded && arrival - departure <= MAX_DURATION) {
          const leg = { ...last(boarded), to: node, arrival };
          const label = { arrival, legs: [...boarded.legs.slice(0, -1), leg] };
          if (dropoff === 0) {
            keep(current, node, label);
            if (destination.has(node)) candidates.push({ legs: label.legs });
          }
        }
        if (boarded || pickup !== 0 || dep - departure > MAX_DURATION) continue;
        for (const label of inbound.get(node) ?? []) {
          if (round === 0) {
            if (!origin.includes(node) || dep !== departure) continue;
          } else if (last(label).tripId === trip.serviceId) continue;
          const rule =
            round === 0
              ? undefined
              : changeRule(rules, last(label), trip, node);
          if (
            round > 0 &&
            (!rule ||
              rule.seconds === null ||
              label.arrival + rule.seconds > dep)
          )
            continue;
          const leg: Leg = {
            tripId: trip.serviceId,
            route: trip.route,
            line: trip.line,
            from: node,
            to: node,
            departure: dep,
            arrival: dep,
          };
          if (rule)
            leg.change = {
              from: rule.from,
              to: rule.to,
              seconds: rule.seconds!,
              estimated: !!rule.estimated,
            };
          boarded = { arrival: dep, legs: [...label.legs, leg] };
          break;
        }
      }
    }
    if (!current.size) break;
    previous = current;
  }
  return candidates.sort((a, b) => score(a) - score(b) || end(a) - end(b))[0];
}

export function findJourneys(
  graph: Graph,
  origin: string,
  destination: string,
  day: string,
  lines: string[] = [],
): Journey[] {
  if (
    origin === destination ||
    !graph.groups[origin] ||
    !graph.groups[destination]
  )
    return [];
  const midnight = DateTime.fromISO(day, { zone: "Europe/Madrid" }).startOf(
    "day",
  );
  const lower = midnight.toSeconds(),
    upper = midnight.plus({ days: 1 }).toSeconds();
  const trips: ActiveTrip[] = [];
  const bases = new Map<string, number>();
  for (let offset = -2; offset <= 2; offset++) {
    const d = midnight.plus({ days: offset });
    bases.set(
      d.toISODate()!,
      d.set({ hour: 12 }).minus({ hours: 12 }).toSeconds(),
    );
  }
  for (const t of graph.trips)
    for (const d of graph.calendars[t.calendar]) {
      const base = bases.get(d);
      if (base === undefined) continue;
      if (
        base + t.calls.at(-1)![1] < lower ||
        base + t.calls[0][2] > upper + MAX_DURATION
      )
        continue;
      trips.push({
        ...t,
        serviceId: `${t.id}@${d}`,
        calls: t.calls.map((c) => [c[0], base + c[1], base + c[2], c[3], c[4]]),
      });
    }
  const origins = graph.groups[origin],
    targets = new Set(graph.groups[destination]);
  const departures = [
    ...new Set(
      trips
        .filter((t) => !lines.length || lines.includes(t.line))
        .flatMap((t) =>
          t.calls
            .slice(0, -1)
            .filter(
              (c) =>
                origins.includes(c[0]) &&
                c[3] === 0 &&
                c[2] >= lower &&
                c[2] < upper,
            )
            .map((c) => c[2]),
        ),
    ),
  ].sort((a, b) => a - b);
  const journeys = departures.flatMap((d) => {
    const j = findOne(trips, graph.transfers, origins, targets, d, lines);
    return j ? [j] : [];
  });
  return journeys.filter(
    (j, i) =>
      !journeys.some(
        (other, k) =>
          k !== i &&
          start(other) >= start(j) &&
          end(other) <= end(j) &&
          other.legs.length <= j.legs.length &&
          (start(other) > start(j) ||
            end(other) < end(j) ||
            other.legs.length < j.legs.length),
      ),
  );
}
