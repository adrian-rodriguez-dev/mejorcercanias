import { describe, expect, it } from "vitest";
import { arrivalAt, arrivalDayLabel } from "./arrival";
import { filterRoutes } from "./route-filters";
import type { Departure } from "./types";
const train: Departure = {
  id: "night",
  line: "C1",
  destination: "Santurtzi",
  terminalId: "13405",
  scheduledAt: "2026-10-02T23:58:00+02:00",
  arrivals: [
    { stationId: "13403", at: "2026-10-03T00:08:00+02:00" },
    { stationId: "13405", at: "2026-10-03T00:15:00+02:00" },
  ],
};
describe("llegada a la parada elegida", () => {
  it("usa la parada intermedia y cambia con el destino", () => {
    expect(arrivalAt(train, "13403")).toContain("00:08");
    expect(arrivalAt(train, "13405")).toContain("00:15");
    expect(arrivalAt(train, "")).toContain("00:15");
    expect(arrivalAt({ ...train, terminalId: "13403" }, "")).toContain("00:08");
    expect(
      arrivalAt({ ...train, arrivals: train.arrivals!.slice(0, 1) }, ""),
    ).toBeUndefined();
    expect(arrivalAt(train, "13200")).toBeUndefined();
  });
  it("no inventa llegadas ausentes, inválidas o anteriores a la salida", () => {
    for (const at of ["", "invalid", "2026-10-02T23:00:00+02:00"]) {
      const bad = { ...train, arrivals: [{ stationId: "13403", at }] };
      expect(filterRoutes([bad], { lines: [], destination: "13403" })).toEqual(
        [],
      );
    }
    expect(
      arrivalAt({ ...train, arrivals: undefined }, "13403"),
    ).toBeUndefined();
  });
  it("señala el cambio de día en hora de Bilbao, también con cambio horario", () => {
    expect(arrivalDayLabel(train.scheduledAt, arrivalAt(train, "13403")!)).toBe(
      "+1 día",
    );
    expect(
      arrivalDayLabel("2026-10-25T00:10:00+02:00", "2026-10-25T03:10:00+01:00"),
    ).toBe("");
    expect(
      arrivalDayLabel("2026-10-24T23:58:00+02:00", "2026-10-25T03:10:00+01:00"),
    ).toBe("+1 día");
  });
});
