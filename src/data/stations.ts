import type { Station } from "./types";
export const stations: Station[] = [
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
