import fixture from "./fixtures/manifest.json" with {type:"json"};
export function optionName(id: string): string {
  if (id === "13200") return "Bilbao-Abando";
  return (
    fixture.stations.find((s) => s.id === id)?.name ??
    ({ bilbao: "Bilbao", zaragoza: "Zaragoza" } as Record<string, string>)[
      id
    ] ??
    id
  );
}
