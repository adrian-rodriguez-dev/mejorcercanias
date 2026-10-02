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
