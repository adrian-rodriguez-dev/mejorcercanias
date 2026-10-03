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
it("uses one estimated minute only for implicit same-point transfers", () => {
  const incoming = trip("a", [
    ["A", 1000],
    ["B", 1600],
  ]);
  const missed = trip("short", [
    ["B", 1659],
    ["D", 1800],
  ]);
  const valid = trip("valid", [
    ["B", 1660],
    ["D", 1900],
  ]);
  const result = run(graph([incoming, missed, valid]))[0];
  expect(result.legs[1].tripId).toContain("valid");
  expect(result.legs[1].change).toMatchObject({ seconds: 60, estimated: true });
  expect(
    run(graph([incoming, valid], [{ from: "B", to: "B", seconds: 480 }])),
  ).toEqual([]);
  expect(
    run(graph([incoming, valid], [{ from: "B", to: "B", seconds: null }])),
  ).toEqual([]);
});

describe("renfe-cli round-based routing adaptation", () => {
  it.each([3600, 3601, 378 * 60])(
    "limits overnight changes to one hour: %i seconds",
    (gap) => {
      const g = graph([
        trip("incoming", [
          ["A", 82800],
          ["B", 84600],
        ]),
        trip("connection", [
          ["B", 84600 + gap],
          ["D", 85200 + gap],
        ]),
      ]);
      expect(run(g)).toHaveLength(gap <= 3600 ? 1 : 0);
    },
  );
  it("counts walking time inside the hour and checks each change", () => {
    const incoming = trip("incoming", [
      ["A", 1000],
      ["B", 1600],
    ]);
    const walk = [{ from: "B", to: "C", seconds: 600 }];
    expect(
      run(
        graph(
          [
            incoming,
            trip("within", [
              ["C", 5200],
              ["D", 5500],
            ]),
          ],
          walk,
        ),
      ),
    ).toHaveLength(1);
    expect(
      run(
        graph(
          [
            incoming,
            trip("over", [
              ["C", 5201],
              ["D", 5500],
            ]),
          ],
          walk,
        ),
      ),
    ).toEqual([]);
    const middle = trip("middle", [
      ["B", 2000],
      ["C", 2500],
    ]);
    expect(
      run(
        graph([
          incoming,
          middle,
          trip("last", [
            ["C", 6101],
            ["D", 6500],
          ]),
        ]),
      ),
    ).toEqual([]);
    expect(
      run(
        graph([
          incoming,
          middle,
          trip("last", [
            ["C", 6100],
            ["D", 6500],
          ]),
        ]),
      ),
    ).toHaveLength(1);
  });
  it("keeps a later valid departure instead of an overnight wait, without limiting time aboard", () => {
    const g = graph([
      trip("early", [
        ["A", 1000],
        ["B", 1600],
      ]),
      trip("later", [
        ["A", 9000],
        ["B", 9600],
      ]),
      trip("connection", [
        ["B", 10000],
        ["D", 15000],
      ]),
    ]);
    const results = run(g);
    expect(results).toHaveLength(1);
    expect(results[0].legs[0].tripId).toContain("later@");
    expect(results[0].legs[1].arrival - results[0].legs[1].departure).toBe(
      5000,
    );
  });
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
        ["B", 1630],
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

it("preserves bus mode through a train-to-bus transfer", () => {
  const g = graph([
    trip(
      "train",
      [
        ["A", 1000],
        ["B", 1600],
      ],
      "R2N",
    ),
    {
      ...trip(
        "bus",
        [
          ["B", 1800],
          ["D", 2400],
        ],
        "R3",
      ),
      mode: "bus",
    },
  ]);
  expect(run(g)[0].legs[1]).toMatchObject({ line: "R3", mode: "bus" });
});

describe("useful transfers and direct alternatives", () => {
  it("never leaves the origin to board the same direct train downstream", () => {
    const g = graph([
      trip(
        "c1",
        [
          ["A", 1000],
          ["B", 1200],
        ],
        "C1",
      ),
      trip(
        "c2",
        [
          ["A", 1100],
          ["B", 1400],
          ["D", 1800],
        ],
        "C2",
      ),
    ]);
    const journeys = run(g);
    expect(journeys).toHaveLength(1);
    expect(journeys[0].legs).toHaveLength(1);
    expect(journeys[0].legs[0].tripId).toContain("c2");
    expect(run(g, "A", "D", ["C1"])).toEqual([]);
  });
  it("rejects a return through another platform of the origin", () => {
    const g = graph([
      trip(
        "out",
        [
          ["A", 1000],
          ["B", 1200],
        ],
        "C3",
      ),
      trip(
        "back",
        [
          ["B", 1300],
          ["A2", 1500],
          ["X", 1700],
        ],
        "C3",
      ),
      trip(
        "next",
        [
          ["X", 1800],
          ["D", 2200],
        ],
        "C2",
      ),
    ]);
    g.groups.A = ["A", "A2"];
    expect(run(g).every((j) => j.legs[0].from === "A2")).toBe(true);
    expect(run(g)).toHaveLength(1);
  });
  it.each([899, 900])(
    "requires at least 15 minutes saved (%i seconds)",
    (saving) => {
      const g = graph([
        trip("first", [
          ["A", 1000],
          ["B", 1200],
        ]),
        trip(
          "connection",
          [
            ["B", 1300],
            ["D", 2000],
          ],
          "C2",
        ),
        trip(
          "direct",
          [
            ["A", 1100],
            ["D", 2000 + saving],
          ],
          "C2",
        ),
      ]);
      const journeys = run(g);
      expect(journeys.some((j) => j.legs.length === 1)).toBe(true);
      expect(journeys.some((j) => j.legs.length > 1)).toBe(saving >= 900);
      if (saving >= 900)
        expect(
          journeys.find((j) => j.legs.length > 1)?.directSavingMinutes,
        ).toBe(15);
    },
  );
  it("keeps both a much faster connection and a direct at the same departure", () => {
    const g = graph([
      trip("first", [
        ["A", 1000],
        ["B", 1200],
      ]),
      trip(
        "connection",
        [
          ["B", 1300],
          ["D", 2000],
        ],
        "C2",
      ),
      trip(
        "direct",
        [
          ["A", 1000],
          ["D", 4000],
        ],
        "C2",
      ),
    ]);
    expect(run(g).map((j) => j.legs.length)).toEqual([1, 2]);
  });
  it("does not compare against a direct that has already departed", () => {
    const g = graph([
      trip(
        "direct",
        [
          ["A", 900],
          ["D", 2000],
        ],
        "C2",
      ),
      trip("first", [
        ["A", 1000],
        ["B", 1200],
      ]),
      trip(
        "connection",
        [
          ["B", 1300],
          ["D", 2200],
        ],
        "C2",
      ),
    ]);
    expect(run(g).some((j) => j.legs.length === 2)).toBe(true);
  });
  it("keeps a useful change to a train that cannot pick up at the origin", () => {
    const g = graph([
      trip("first", [
        ["A", 1000],
        ["B", 1200],
      ]),
      trip(
        "connection",
        [
          ["A", 1100, 1],
          ["B", 1300],
          ["D", 2200],
        ],
        "C2",
      ),
    ]);
    expect(run(g)[0].legs).toHaveLength(2);
  });
});
