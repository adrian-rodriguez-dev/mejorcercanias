import { networks } from "./data/networks";
import { stations, demoStationIds } from "./data/stations";
export const STORAGE_KEY = "mejorcercanias.station.v1";
export function readStation(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const id = stored ? (demoStationIds[stored] ?? stored) : null;
    return stations.some((s) => s.id === id) ? id! : "";
  } catch {
    return "";
  }
}
export function saveStation(id: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, id);
    return true;
  } catch {
    return false;
  }
}

export const JOURNEY_KEY = "mejorcercanias.journey.v1";
export interface Journey {
  stationId: string;
  destination: string;
  lines: string[];
}
export function linesForStations(
  origin: string,
  destination: string,
): string[] {
  const originLines = stations.find((s) => s.id === origin)?.lines ?? [];
  const destinationLines =
    stations.find((s) => s.id === destination)?.lines ?? [];
  return originLines.filter(
    (line) => !destination || destinationLines.includes(line),
  );
}
export function normalizeJourney(value: unknown): Journey {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const stationId =
    typeof data.stationId === "string" &&
    stations.some((s) => s.id === data.stationId)
      ? data.stationId
      : "";
  const destination =
    stationId &&
    data.destination !== stationId &&
    typeof data.destination === "string" &&
    stations.some(
      (s) =>
        s.id === data.destination &&
        s.network === stations.find((o) => o.id === stationId)?.network,
    )
      ? data.destination
      : "";
  const available = linesForStations(stationId, destination);
  const lines =
    available.length > 1 && Array.isArray(data.lines)
      ? [
          ...new Set(
            data.lines.filter(
              (line): line is string =>
                typeof line === "string" && available.includes(line),
            ),
          ),
        ]
      : [];
  return { stationId, destination, lines };
}
export function readJourney(): Journey {
  try {
    const stored = localStorage.getItem(JOURNEY_KEY);
    if (stored) {
      const journey = normalizeJourney(JSON.parse(stored));
      if (journey.stationId) return journey;
    }
  } catch {
    /* Fall back to the existing station preference. */
  }
  return normalizeJourney({ stationId: readStation() });
}
export function saveJourney(journey: Journey): boolean {
  try {
    localStorage.setItem(
      JOURNEY_KEY,
      JSON.stringify(normalizeJourney(journey)),
    );
    return saveStation(journey.stationId);
  } catch {
    return false;
  }
}

export const NETWORK_KEY = "mejorcercanias.network.v1";
export function readNetwork(): string {
  try {
    const id = localStorage.getItem(NETWORK_KEY);
    return networks().some((n) => n.id === id) ? id! : "";
  } catch {
    return "";
  }
}
export function saveNetwork(id: string): boolean {
  try {
    localStorage.setItem(NETWORK_KEY, id);
    return true;
  } catch {
    return false;
  }
}
