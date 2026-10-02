import type { Station } from "./types";
import { stations } from "./snapshot";
export { stations } from "./snapshot";
export const stationName = (id: string) =>
  stations.find((s) => s.id === id)?.name ?? id;
export const demoStationIds: Record<string, string> = {
  "demo-barakaldo": "13400",
  "demo-abando": "13200",
  "demo-portugalete": "13403",
  "demo-santurtzi": "13405",
  "demo-amurrio": "13101",
};
export const demoStations: Station[] = [
  {
    id: "demo-barakaldo",
    name: "Barakaldo",
    network: "bilbao",
    lines: ["C1", "C2"],
  },
  {
    id: "demo-abando",
    name: "Bilbao-Abando",
    network: "bilbao",
    lines: ["C1", "C2", "C3"],
  },
  {
    id: "demo-portugalete",
    name: "Portugalete",
    network: "bilbao",
    lines: ["C1"],
  },
  { id: "demo-santurtzi", name: "Santurtzi", network: "bilbao", lines: ["C1"] },
  { id: "demo-amurrio", name: "Amurrio", network: "bilbao", lines: ["C3"] },
];
