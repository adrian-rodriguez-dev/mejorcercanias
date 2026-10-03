import { manifest, type Network } from "./snapshot";
import { stationLabel } from "./text";
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
  ).map((network) => ({ ...network, name: stationLabel(network.name) }));
}
export const networkForStation = (id: string) =>
  networks().find(
    (n) => n.id === manifest.stations.find((s) => s.id === id)?.network,
  );
export const coverageFor = (id: string) =>
  networkForStation(id)?.coverageDates ?? manifest.coverageDates;
export function lineInk(color: string) {
  const [r, g, b] = color.match(/.{2}/g)!.map((v) => {
    const c = parseInt(v, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05)
    ? "#000000"
    : "#ffffff";
}
export function lineStyle(networkId: string, line: string) {
  const color =
    networks().find((n) => n.id === networkId)?.colors[line] ?? "789B88";
  return { backgroundColor: "#" + color, color: lineInk(color) };
}
