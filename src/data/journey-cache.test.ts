import { it, expect } from "vitest";
import { JourneyCache, journeyKey } from "./journey-cache";
it("keys include snapshot, network, direction, date and canonical filters", () => {
  const args = ["v1", "bilbao", "A", "B", "2026-10-03"] as const;
  const key = journeyKey(...args, ["C2", "C1"]);
  expect(key).toBe(journeyKey(...args, ["C1", "C2", "C1"]));
  expect(key).not.toBe(
    journeyKey("v2", "bilbao", "A", "B", "2026-10-03", ["C1", "C2"]),
  );
  expect(key).not.toBe(
    journeyKey("v1", "other", "A", "B", "2026-10-03", ["C1", "C2"]),
  );
  expect(key).not.toBe(
    journeyKey("v1", "bilbao", "B", "A", "2026-10-03", ["C1", "C2"]),
  );
  expect(key).not.toBe(
    journeyKey("v1", "bilbao", "A", "B", "2026-10-04", ["C1", "C2"]),
  );
  expect(key).not.toBe(journeyKey(...args, ["C1"]));
});
it("reuses empty results and evicts the least recently used query", () => {
  const cache = new JourneyCache(2);
  const value: never[] = [];
  cache.set("a", value);
  cache.set("b", []);
  expect(cache.get("a")).toBe(value);
  cache.set("c", []);
  expect(cache.get("b")).toBeUndefined();
  expect(cache.get("a")).toBe(value);
  cache.set("a", []);
  cache.set("d", []);
  expect(cache.get("c")).toBeUndefined();
});
