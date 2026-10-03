import { expect, it } from "vitest";
import { validGraph } from "./graph-validation";
const graph = {
  schemaVersion: 1,
  version: "test",
  network: "test",
  nodes: { a: { stationId: "a", name: "A" }, b: { stationId: "b", name: "B" } },
  groups: { a: ["a"], b: ["b"] },
  calendars: [["2026-10-03"]],
  trips: [
    {
      id: "trip",
      route: "route",
      line: "C1",
      calendar: 0,
      calls: [
        ["a", 0, 0, 0, 0],
        ["b", 60, 60, 0, 0],
      ],
    },
  ],
  transfers: [{ from: "a", to: "b", seconds: 60 }],
};
it("accepts the complete routing contract", () =>
  expect(validGraph(graph, "test", "test")).toBe(true));
it.each([
  null,
  {},
  { ...graph, nodes: [] },
  { ...graph, nodes: { a: null } },
  { ...graph, trips: [null] },
  { ...graph, transfers: [null] },
  { ...graph, groups: { a: ["toString"] } },
  {
    ...graph,
    transfers: [{ from: "a", to: "b", seconds: 60, estimated: "yes" }],
  },
  {
    ...graph,
    transfers: [{ from: "a", to: "b", seconds: 60, from_trip_id: 4 }],
  },
  {
    ...graph,
    trips: [
      {
        ...graph.trips[0],
        calls: [
          ["a", 0, 0, 0, 0],
          ["b", -1, 60, 0, 0],
        ],
      },
    ],
  },
])("rejects malformed JSON without throwing (%#)", (value) => {
  expect(validGraph(value, "test", "test")).toBe(false);
});
