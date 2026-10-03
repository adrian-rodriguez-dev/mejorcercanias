import { describe, it, expect } from "vitest";
import {
  findJourneys,
  type Graph,
  type RoutingTrip,
  type Transfer,
} from "./router";
const trip = (
  id: string,
  calls: [string, number, number?, number?][],
  line = "C1",
): RoutingTrip => ({
  id,
  route: id,
  line,
  calendar: 0,
  calls: calls.map(([s, t, p = 0, d = 0]) => [s, t, t, p, d]),
});
function graph(trips: RoutingTrip[], transfers: Transfer[] = []): Graph {
  const ids = [...new Set(trips.flatMap((t) => t.calls.map((c) => c[0])))];
  return {
    schemaVersion: 1,
    version: "test",
    network: "test",
    trips,
    transfers,
    calendars: [["2026-10-03"]],
    nodes: Object.fromEntries(ids.map((s) => [s, { stationId: s, name: s }])),
    groups: Object.fromEntries(ids.map((s) => [s, [s]])),
  };
}
const run = (g: Graph, a = "A", b = "D", lines: string[] = []) =>
  findJourneys(g, a, b, "2026-10-03", lines);
describe("renfe-cli round-based routing adaptation", () => {
  it("finds up to three changes and refuses a fourth", () => {
    const trips = [
      trip("1", [
        ["A", 1000],
        ["B", 1600],
      ]),
      trip("2", [
        ["B", 2000],
        ["C", 2500],
      ]),
      trip("3", [
        ["C", 2900],
        ["D", 3500],
      ]),
      trip("4", [
        ["D", 3900],
        ["E", 4300],
      ]),
      trip("5", [
        ["E", 4700],
        ["F", 5000],
      ]),
    ];
    expect(run(graph(trips), "A", "E")[0].legs).toHaveLength(4);
    expect(run(graph(trips), "A", "F")).toEqual([]);
  });
  it("rejects a missed connection and boards the later train", () => {
    const g = graph([
      trip("a", [
        ["A", 1000],
        ["B", 1600],
      ]),
      trip("fast", [
        ["B", 1700],
        ["D", 2000],
      ]),
      trip("later", [
        ["B", 1900],
        ["D", 2200],
      ]),
    ]);
    expect(run(g)[0].legs[1].tripId).toContain("later");
  });
  it("prefers direct travel when a change saves little time", () => {
    const g = graph([
      trip("direct", [
        ["A", 1000],
        ["D", 3000],
      ]),
      trip("a", [
        ["A", 1000],
        ["B", 1500],
      ]),
      trip("b", [
        ["B", 1800],
        ["D", 2300],
      ]),
    ]);
    expect(run(g)[0].legs).toHaveLength(1);
  });
  it("retains true departure times and removes dominated slower departures", () => {
    const g = graph([
      trip("slow", [
        ["A", 1000],
        ["D", 3000],
      ]),
      trip("fast", [
        ["A", 1100],
        ["D", 2900],
      ]),
    ]);
    expect(run(g)).toHaveLength(1);
    expect(run(g)[0].legs[0].tripId).toContain("fast");
  });
  it("respects forbidden and route-qualified transfers", () => {
    const trips = [
      trip("a", [
        ["A", 1000],
        ["B", 1600],
      ]),
      trip("b", [
        ["B", 2000],
        ["D", 2500],
      ]),
    ];
    expect(run(graph(trips, [{ from: "B", to: "B", seconds: null }]))).toEqual(
      [],
    );
    expect(
      run(
        graph(trips, [
          { from: "B", to: "B", seconds: null, to_route_id: "other" },
        ]),
      ),
    ).toHaveLength(1);
    expect(
      run(
        graph(trips, [
          {
            from: "B",
            to: "B",
            seconds: 500,
            from_route_id: "a",
            to_route_id: "b",
          },
        ]),
      ),
    ).toEqual([]);
  });
  it("preserves later labels whose incoming trip permits onward travel", () => {
    const g = graph(
      [
        trip("early", [
          ["A", 1000],
          ["B", 1500],
        ]),
        trip("allowed", [
          ["A", 1000],
          ["B", 1600],
        ]),
        trip("next", [
          ["B", 2000],
          ["D", 2500],
        ]),
      ],
      [{ from: "B", to: "B", seconds: null, from_trip_id: "early" }],
    );
    expect(run(g)[0].legs[0].tripId).toContain("allowed");
  });
  it("enforces walking between split nodes while origin selection accepts both", () => {
    const g = graph(
      [
        trip("a", [
          ["A", 1000],
          ["X1", 1600],
        ]),
        trip("early", [
          ["X2", 1900],
          ["D", 2000],
        ]),
        trip("b", [
          ["X2", 2200],
          ["D", 2500],
        ]),
      ],
      [{ from: "X1", to: "X2", seconds: 600, estimated: true }],
    );
    g.groups.X = ["X1", "X2"];
    expect(run(g)[0].legs[1].tripId).toContain("b");
    expect(run(g)[0].legs[1].change?.estimated).toBe(true);
    expect(run(g, "X", "D")[0].legs).toHaveLength(1);
  });
  it("does not board or alight at prohibited stops but can stay on the train", () => {
    const g = graph([
      trip("a", [
        ["A", 1000, 1],
        ["B", 1100],
        ["D", 1200],
      ]),
    ]);
    expect(run(g)).toEqual([]);
    const stay = graph([
      trip("a", [
        ["A", 1000],
        ["B", 1100, 1, 1],
        ["D", 1200],
      ]),
    ]);
    expect(run(stay, "A", "B")).toEqual([]);
    expect(run(stay)).toHaveLength(1);
  });
  it("applies selected lines only to the first train", () => {
    const g = graph([
      trip(
        "a",
        [
          ["A", 1000],
          ["B", 1500],
        ],
        "C1",
      ),
      trip(
        "b",
        [
          ["B", 2000],
          ["D", 2500],
        ],
        "C2",
      ),
    ]);
    expect(run(g, "A", "D", ["C1"])).toHaveLength(1);
    expect(run(g, "A", "D", ["C2"])).toEqual([]);
  });
  it("includes previous-service-day times above 24h without inventing service", () => {
    const g = graph([
      trip("night", [
        ["A", 87000],
        ["D", 88000],
      ]),
    ]);
    g.calendars = [["2026-10-02"]];
    expect(run(g)).toHaveLength(1);
    expect(findJourneys(g, "A", "D", "2026-10-04")).toEqual([]);
  });
});
