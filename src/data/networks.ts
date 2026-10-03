import { manifest, type Network } from "./snapshot";
export function networks(): Network[] {
  return (
    manifest.networks ?? [
      {
        id: "bilbao",
        name: "Bilbao",
        lines: ["C1", "C2", "C3"],
        colors: { C1: "E5232C", C2: "0F9D4B", C3: "5AAFE4" },
        coverageDates: manifest.coverageDates,
        validFrom: manifest.validFrom,
        validTo: manifest.validTo,
      },
    ]
  );
}
export const networkForStation = (id: string) =>
  networks().find(
    (n) => n.id === manifest.stations.find((s) => s.id === id)?.network,
  );
export const coverageFor = (id: string) =>
  networkForStation(id)?.coverageDates ?? manifest.coverageDates;
export function lineStyle(networkId: string, line: string) {
  const color =
    networks().find((n) => n.id === networkId)?.colors[line] ?? "789B88";
  return { backgroundColor: "#" + color, color: "#101a16" };
}
