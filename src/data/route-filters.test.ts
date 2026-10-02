import { describe, expect, it } from "vitest";
import { filterRoutes, changeLine } from "./route-filters";
import { upcoming } from "./time";
import { filterTimetable } from "./timetable";
import type { Departure } from "./types";
const train = (id: string, line: string, destination = "13200"): Departure => ({
  id,
  line,
  destination: "Terminal",
  scheduledAt: "2026-10-03T08:00:00+02:00",
  arrivals: [{ stationId: destination, at: "2026-10-03T08:30:00+02:00" }],
});
describe("filtros de línea y destino", () => {
  it("filtra antes de limitar a ocho y acepta destino intermedio", () => {
    const rows = [
      ...Array.from({ length: 8 }, (_, i) => train(`${i}`, "C1", "13405")),
      train("match", "C2"),
    ];
    expect(
      upcoming(
        filterRoutes(rows, { line: "C2", destination: "13200" }),
        Date.parse("2026-10-03T07:00:00+02:00"),
      ).map((r) => r.id),
    ).toEqual(["match"]);
  });
  it("combina línea y llegada máxima", () => {
    expect(
      filterTimetable([train("one", "C1"), train("two", "C2")], {
        date: "2026-10-03",
        destination: "13200",
        line: "C2",
        mode: "arrive",
        time: "09:00",
      }).map((r) => r.id),
    ).toEqual(["two"]);
  });
  it("limpia destinos incompatibles solo al cambiar explícitamente de línea", () => {
    const rows = [train("one", "C1", "13405"), train("two", "C2")];
    expect(
      changeLine(rows, { line: "C1", destination: "13405" }, "C2"),
    ).toEqual({ line: "C2", destination: "" });
    expect(changeLine(rows, { line: "C2", destination: "13200" }, "")).toEqual({
      line: "",
      destination: "13200",
    });
  });
});
