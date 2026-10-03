import { JourneyCache, journeyKey } from "./journey-cache";
import { stationName } from "./stations";
import { manifest } from "./snapshot";
import { readStored, storeData } from "./offline-store";
import type { Graph, Journey } from "./router";
import type { StationSchedule } from "./types";
const memory = new Map<string, Graph>();
const results = new JourneyCache();
export function routingAvailable(origin: string) {
  const network = manifest.stations.find((s) => s.id === origin)?.network;
  return !!network && !!manifest.routingNetworks?.includes(network);
}
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
    !!g.nodes &&
    !!g.groups &&
    Array.isArray(g.calendars) &&
    g.calendars.every(
      (c) => Array.isArray(c) && c.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
    ) &&
    Object.values(g.groups).every(
      (nodes) =>
        Array.isArray(nodes) &&
        nodes.length > 0 &&
        nodes.every((n) => !!g.nodes[n]),
    ) &&
    Array.isArray(g.trips) &&
    g.trips.every(
      (t) =>
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
            !!g.nodes[c[0]] &&
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
        !!g.nodes[t.from] &&
        !!g.nodes[t.to] &&
        (t.seconds === null || (Number.isInteger(t.seconds) && t.seconds >= 0)),
    )
  );
}
async function graphFor(origin: string, signal: AbortSignal) {
  const snapshot = manifest;
  const network = snapshot.stations.find((s) => s.id === origin)?.network;
  if (!network) throw Error("Núcleo desconocido");
  const key = `${snapshot.version}/routing-${network}`;
  if (memory.has(key)) return memory.get(key)!;
  const saved = await readStored(key);
  if (validGraph(saved, snapshot.version, network)) {
    memory.set(key, saved);
    return saved;
  }
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/renfe/${key}.json`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]) },
  );
  if (!response.ok) throw Error("No se pudieron descargar las rutas");
  const graph: unknown = await response.json();
  if (!validGraph(graph, snapshot.version, network))
    throw Error("Datos de rutas inválidos");
  memory.set(key, graph);
  await storeData(key, graph);
  return graph;
}
export async function loadJourneys(
  origin: string,
  destination: string,
  days: string[],
  lines: string[],
  signal: AbortSignal,
): Promise<StationSchedule> {
  const snapshot = manifest;
  const coverage =
    snapshot.networks?.find(
      (n) => n.id === snapshot.stations.find((s) => s.id === origin)?.network,
    )?.coverageDates ?? snapshot.coverageDates;
  if (!coverage.includes(days[0]))
    return {
      stationId: origin,
      source: "renfe-gtfs",
      departures: [],
      availability: "unpublished",
    };
  const graph = await graphFor(origin, signal);
  signal.throwIfAborted();
  const activeDays = days.filter((d) => coverage.includes(d));
  const keyFor = (day: string) =>
    journeyKey(
      snapshot.version,
      graph.network,
      origin,
      destination,
      day,
      lines,
    );
  const cached = new Map(
    activeDays.map((day) => [day, results.get(keyFor(day))]),
  );
  const missing = activeDays.filter((day) => cached.get(day) === undefined);
  if (missing.length) {
    const computed = await new Promise<{ day: string; journeys: Journey[] }[]>(
      (resolve, reject) => {
        const worker = new Worker(
          new URL("./routing.worker.ts", import.meta.url),
          {
            type: "module",
          },
        );
        const cleanup = () => {
          worker.terminate();
          signal.removeEventListener("abort", abort);
        };
        const abort = () => {
          cleanup();
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", abort, { once: true });
        worker.onerror = () => {
          cleanup();
          reject(Error("No se pudo calcular la ruta"));
        };
        worker.onmessage = (e) => {
          cleanup();
          e.data.error ? reject(Error(e.data.error)) : resolve(e.data.results);
        };
        worker.postMessage({
          graph,
          origin,
          destination,
          days: missing,
          lines,
        });
      },
    );
    signal.throwIfAborted();
    for (const result of computed) {
      results.set(keyFor(result.day), result.journeys);
      cached.set(result.day, result.journeys);
    }
  }
  signal.throwIfAborted();
  const journeys = activeDays.flatMap((day) => cached.get(day)!);
  const nodeName = (node: string) =>
    graph.nodes[node].stationId === node
      ? stationName(node)
      : graph.nodes[node].name;
  const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
  return {
    stationId: origin,
    source: "renfe-gtfs",
    availability: "available",
    offline: !navigator.onLine,
    departures: journeys.map((j) => {
      const first = j.legs[0],
        last = j.legs.at(-1)!;
      return {
        id: j.legs.map((l) => `${l.tripId}:${l.from}:${l.to}`).join("/"),
        line: first.line,
        mode: first.mode,
        destination:
          snapshot.stations.find((s) => s.id === destination)?.name ??
          destination,
        terminalId: destination,
        scheduledAt: iso(first.departure),
        arrivals: [{ stationId: destination, at: iso(last.arrival) }],
        journey: j.legs.map((l) => ({
          ...l,
          fromName: nodeName(l.from),
          toName: nodeName(l.to),
          change: l.change
            ? {
                ...l.change,
                fromName: nodeName(l.change.from),
                toName: nodeName(l.change.to),
              }
            : undefined,
        })),
      };
    }),
  };
}
