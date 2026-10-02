import { describe, expect, it } from "vitest";
import { filterRoutes, changeLines } from "./route-filters";
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
        filterRoutes(rows, { lines: ["C2"], destination: "13200" }),
        Date.parse("2026-10-03T07:00:00+02:00"),
      ).map((r) => r.id),
    ).toEqual(["match"]);
  });
  it("combina línea y llegada máxima", () => {
    expect(
      filterTimetable([train("one", "C1"), train("two", "C2")], {
        date: "2026-10-03",
        destination: "13200",
        lines: ["C2"],
        mode: "arrive",
        time: "09:00",
      }).map((r) => r.id),
    ).toEqual(["two"]);
  });
  it("limpia destinos incompatibles solo al cambiar explícitamente de línea", () => {
    const rows = [train("one", "C1", "13405"), train("two", "C2")];
    expect(
      changeLines(rows, { lines: ["C1"], destination: "13405" }, ["C2"]),
    ).toEqual({ lines: ["C2"], destination: "" });
    expect(
      changeLines(rows, { lines: ["C2"], destination: "13200" }, []),
    ).toEqual({
      lines: [],
      destination: "13200",
    });
  });
});

it("combina líneas y vacío acepta todas sin perder destino", () => {
  const rows = [train("a", "C1"), train("b", "C2"), train("c", "C3")];
  expect(
    filterRoutes(rows, { lines: ["C1", "C2"], destination: "13200" }).map(
      (r) => r.id,
    ),
  ).toEqual(["a", "b"]);
  expect(filterRoutes(rows, { lines: [], destination: "13200" })).toHaveLength(
    3,
  );
  expect(
    changeLines([], { lines: ["C2"], destination: "13200" }, []).destination,
  ).toBe("13200");
});
