import initial from "./renfe-manifest.json";
import type { Station } from "./types";
export type Manifest = Omit<
  typeof initial,
  "downloadedAt" | "checkedAt" | "publishedAt"
> & {
  downloadedAt?: string | null;
  checkedAt?: string | null;
  publishedAt?: string | null;
};
export let manifest: Manifest = initial;
const catalog = (m: Manifest): Station[] =>
  m.stations.map((s) => ({
    ...s,
    name: s.id === "13200" ? "Bilbao-Abando" : s.name,
  }));
export let stations = catalog(manifest);
let revision = 0,
  nextCheck = 0,
  checking = false;
const listeners = new Set<() => void>();
export const subscribeSnapshot = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const snapshotRevision = () => revision;
const emit = () => {
  revision++;
  listeners.forEach((fn) => fn());
};
export let refreshError = false;
export const preparedFiles = new Map<string, unknown>();
const validDate = (s: unknown) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s));
export function validManifest(value: unknown): value is Manifest {
  const m = value as Manifest;
  if (
    !m ||
    m.schemaVersion !== 1 ||
    !/^[a-f0-9]{16}$/.test(m.version) ||
    !validDate(m.validFrom) ||
    !validDate(m.validTo) ||
    m.validFrom > m.validTo ||
    !Array.isArray(m.coverageDates) ||
    !m.coverageDates.length ||
    !m.coverageDates.every(validDate) ||
    !Array.isArray(m.calendars) ||
    !m.calendars.every((c) => Array.isArray(c) && c.every(validDate)) ||
    !Array.isArray(m.stations) ||
    !m.stations.length
  )
    return false;
  return (
    m.coverageDates[0] === m.validFrom &&
    m.coverageDates.at(-1) === m.validTo &&
    new Set(m.stations.map((s) => s.id)).size === m.stations.length &&
    m.stations.every(
      (s) =>
        /^\d+$/.test(s.id) &&
        typeof s.name === "string" &&
        s.network === "bilbao" &&
        Array.isArray(s.lines) &&
        s.lines.every((l) => ["C1", "C2", "C3"].includes(l)),
    )
  );
}
export async function checkSnapshot(
  stationId: string,
  now = Date.now(),
  fetcher: typeof fetch = fetch,
): Promise<void> {
  if (checking || now < nextCheck) return;
  checking = true;
  nextCheck = now + 300000;
  try {
    const base = `${import.meta.env.BASE_URL}data/renfe/`;
    const pointerResponse = await fetcher(base + "current.json", {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!pointerResponse.ok) throw Error("No version metadata");
    const pointer = await pointerResponse.json();
    if (
      pointer.schemaVersion !== 1 ||
      !/^[a-f0-9]{16}$/.test(pointer.version) ||
      pointer.manifest !== `${pointer.version}/manifest.json`
    )
      throw Error("Unsupported version metadata");
    if (pointer.version === manifest.version) {
      manifest = {
        ...manifest,
        checkedAt: pointer.checkedAt ?? manifest.checkedAt,
        publishedAt: pointer.publishedAt ?? manifest.publishedAt,
      };
    } else {
      const response = await fetcher(base + pointer.manifest, {
        cache: "no-cache",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw Error("No manifest");
      const candidate = await response.json();
      if (!validManifest(candidate) || candidate.version !== pointer.version)
        throw Error("Unsupported snapshot");
      let file: unknown;
      if (stationId && candidate.stations.some((s) => s.id === stationId)) {
        const r = await fetcher(
          `${base}${candidate.version}/${stationId}.json`,
          { signal: AbortSignal.timeout(15000) },
        );
        if (!r.ok) throw Error("No station in new snapshot");
        file = await r.json();
        const f = file as {
          version: string;
          stationId: string;
          patterns: unknown[];
        };
        if (
          f.version !== candidate.version ||
          f.stationId !== stationId ||
          !Array.isArray(f.patterns)
        )
          throw Error("Invalid station snapshot");
      }
      preparedFiles.clear();
      if (file) preparedFiles.set(`${candidate.version}/${stationId}`, file);
      manifest = candidate;
      stations = catalog(candidate);
    }
    refreshError = false;
    nextCheck = now + 3600000;
    emit();
  } catch {
    refreshError = true;
    emit();
  } finally {
    checking = false;
  }
}
