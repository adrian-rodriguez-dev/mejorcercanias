import { describe, it, expect } from "vitest";
import { parseAlerts, relevantAlerts } from "./alerts";
const now = Date.parse("2026-10-02T10:00:00+02:00");
const entity = (id: string, selectors: unknown[], periods: unknown[] = []) => ({
  id,
  alert: {
    informedEntity: selectors,
    activePeriod: periods,
    descriptionText: { translation: [{ language: "es", text: id }] },
  },
});
const feed = (entity: unknown[]) => ({
  header: { timestamp: String(now / 1000) },
  entity,
});
const filter = { lines: [], destination: "13200" };
describe("avisos oficiales", () => {
  it("no mezcla C1 de Madrid con Bilbao y respeta trayecto/intermedias", () => {
    const alerts = parseAlerts(
      feed([
        entity("madrid", [{ routeId: "10T0001C1" }]),
        entity("bilbao", [{ routeId: "60T0001C1" }]),
        entity("intermedia", [{ stopId: "13208" }]),
        entity("otra", [{ stopId: "13101" }]),
      ]),
      now,
    );
    const trains = [
      {
        id: "t",
        line: "C1",
        destination: "Abando",
        scheduledAt: new Date(now + 60000).toISOString(),
        arrivals: [
          { stationId: "13208", at: new Date(now + 120000).toISOString() },
          { stationId: "13200", at: new Date(now + 180000).toISOString() },
        ],
      },
    ];
    expect(
      relevantAlerts(alerts, "13400", filter, "2026-10-02", trains, now).map(
        (a) => a.id,
      ),
    ).toEqual(["bilbao", "intermedia"]);
    expect(
      relevantAlerts(
        alerts,
        "13400",
        { ...filter, lines: ["C2"] },
        "2026-10-02",
        [],
        now,
      ),
    ).toEqual([]);
  });
  it("retira expirados y no convierte un aviso abierto en predicción de mañana", () => {
    const alerts = parseAlerts(
      feed([
        entity(
          "abierto",
          [{ routeId: "60T0001C1" }],
          [{ start: String(now / 1000 - 60) }],
        ),
        entity(
          "terminado",
          [{ routeId: "60T0001C1" }],
          [{ end: String(now / 1000) }],
        ),
        entity(
          "mañana",
          [{ routeId: "60T0001C1" }],
          [
            {
              start: String(now / 1000 + 86400),
              end: String(now / 1000 + 90000),
            },
          ],
        ),
      ]),
      now,
    );
    expect(
      relevantAlerts(alerts, "13400", filter, "2026-10-02", [], now).map(
        (a) => a.id,
      ),
    ).toEqual(["abierto"]);
    expect(
      relevantAlerts(alerts, "13400", filter, "2026-10-03", [], now).map(
        (a) => a.id,
      ),
    ).toEqual(["mañana"]);
    expect(
      relevantAlerts(alerts, "13400", filter, "2026-10-02", [], now + 300001),
    ).toEqual([]);
  });
  it("feed completo vacío retira; delta y feed antiguo son no verificables", () => {
    expect(parseAlerts(feed([]), now)).toEqual([]);
    expect(() =>
      parseAlerts(
        {
          ...feed([]),
          header: {
            timestamp: String(now / 1000),
            incrementality: "DIFFERENTIAL",
          },
        },
        now,
      ),
    ).toThrow();
    expect(() => parseAlerts(feed([]), now + 300001)).toThrow();
  });
});
it("mantiene avisos generales explícitos de Bilbao y múltiples avisos de accesibilidad",()=>{
 const general=[{routeId:"60T0001C1"},{routeId:"60T0003C2"},{routeId:"60T0005C3"}];
 const alerts=parseAlerts(feed([entity("general",general),entity("accesibilidad",general)]),now);
 expect(relevantAlerts(alerts,"13101",{lines:[],destination:""},"2026-10-02",[],now).map(a=>a.id)).toEqual(["general","accesibilidad"]);
 expect(relevantAlerts(alerts,"13400",{lines:["C2"],destination:"13200"},"2026-10-02",[],now)).toHaveLength(2);
});
