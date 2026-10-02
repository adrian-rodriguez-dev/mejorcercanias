import { describe, it, expect } from "vitest";
import { gtfsInstant, resolveDay, type StationFile } from "./renfe";
import { clockTime } from "./time";
import { filterTimetable } from "./timetable";
import { readStation, STORAGE_KEY } from "../preference";
const file: StationFile = {
  version: "test",
  stationId: "13400",
  patterns: [
    ["early", "C1", "13200", 8 * 3600, 0, [["13200", 8 * 3600 + 900]]],
    ["exact", "C1", "13200", 8 * 3600 + 2700, 0, [["13200", 9 * 3600]]],
    ["late", "C1", "13200", 9 * 3600, 0, [["13200", 9 * 3600 + 900]]],
    ["other", "C1", "13405", 8 * 3600 + 3000, 0, [["13405", 9 * 3600]]],
  ],
};
describe("calendario y horario", () => {
  it("selecciona fechas efectivas, no repite el servicio de viernes el sábado", () => {
    expect(
      resolveDay(
        file,
        "2026-10-02",
        [["2026-10-02"]],
        ["2026-10-02", "2026-10-03"],
      ).departures,
    ).toHaveLength(4);
    expect(
      resolveDay(
        file,
        "2026-10-03",
        [["2026-10-02"]],
        ["2026-10-02", "2026-10-03"],
      ).departures,
    ).toHaveLength(0);
    expect(resolveDay(file, "2026-11-01", [], []).availability).toBe(
      "unpublished",
    );
  });
  it("encuentra última salida que llega antes o exactamente al límite", () => {
    const rows = resolveDay(
      file,
      "2026-10-03",
      [["2026-10-03"]],
      ["2026-10-03"],
    ).departures;
    const filtered = filterTimetable(rows, {
      date: "2026-10-03",
      destination: "13200",
      mode: "arrive",
      time: "09:00",
    });
    expect(filtered.map((r) => r.id)).toEqual([
      "early-2026-10-03",
      "exact-2026-10-03",
    ]);
    expect(clockTime(Date.parse(filtered.at(-1)!.scheduledAt))).toBe("08:45");
    expect(
      filterTimetable(rows, {
        date: "2026-10-03",
        destination: "",
        mode: "depart",
        time: "09:00",
      }),
    ).toHaveLength(1);
    expect(
      filterTimetable(rows, {
        date: "2026-10-03",
        destination: "",
        mode: "all",
        time: "09:00",
      }),
    ).toHaveLength(4);
  });
  it("incluye servicio anterior con hora mayor que 24 en su día civil correcto", () => {
    const night: StationFile = {
      ...file,
      patterns: [["night", "C1", "13200", 90600, 0, [["13200", 91200]]]],
    };
    const rows = resolveDay(
      night,
      "2026-10-03",
      [["2026-10-02"]],
      ["2026-10-02", "2026-10-03"],
    ).departures;
    expect(rows).toHaveLength(1);
    expect(clockTime(Date.parse(rows[0].scheduledAt))).toBe("01:10");
  });
  it.each(["2026-03-29", "2026-10-25"])(
    "interpreta tiempo GTFS en el cambio DST %s",
    (day) => {
      expect(clockTime(Date.parse(gtfsInstant(day, 6 * 3600)))).toBe("06:00");
    },
  );
  it("migra favorita de la demo", () => {
    localStorage.setItem(STORAGE_KEY, "demo-barakaldo");
    expect(readStation()).toBe("13400");
    localStorage.clear();
  });
});
