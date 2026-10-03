import { test, expect } from "./configured-test";
import fixture from "./fixtures/manifest.json" with { type: "json" };
import station from "./fixtures/stations/13400.json" with { type: "json" };
import AxeBuilder from "@axe-core/playwright";
const version = "bbbbbbbbbbbbbbbb";
test("destino calcula, despliega horarios y respeta el cambio peatonal", async ({
  page,
}) => {
  let workers = 0;
  page.on("worker", () => {
    workers++;
  });
  await page.clock.install({ time: new Date("2026-10-03T07:00:00+02:00") });
  const nodes = {
    "13400": { stationId: "13400", name: "Barakaldo" },
    "13208": { stationId: "13208", name: "San Mamés" },
    "13200": { stationId: "13200", name: "Bilbao-Abando" },
    walk: { stationId: "13208", name: "Otro andén" },
  };
  const graph = {
    schemaVersion: 1,
    version,
    network: "bilbao",
    nodes,
    groups: { "13400": ["13400"], "13208": ["13208"], "13200": ["13200"] },
    calendars: [["2026-10-03", "2026-10-04"]],
    trips: [
      {
        id: "first",
        route: "a",
        line: "C1",
        calendar: 0,
        calls: [
          ["13400", 28800, 28800, 0, 0],
          ["13208", 29400, 29400, 0, 0],
        ],
      },
      {
        id: "too-early",
        route: "b",
        line: "C2",
        calendar: 0,
        calls: [
          ["walk", 29700, 29700, 0, 0],
          ["13200", 30000, 30000, 0, 0],
        ],
      },
      {
        id: "connection",
        mode: "bus",
        route: "b",
        line: "C2",
        calendar: 0,
        calls: [
          ["walk", 30000, 30000, 0, 0],
          ["13200", 30600, 30600, 0, 0],
        ],
      },
    ],
    transfers: [{ from: "13208", to: "walk", seconds: 600, estimated: true }],
  };
  await page.route("**/data/renfe/current.json", (r) =>
    r.fulfill({
      json: { schemaVersion: 1, version, manifest: `${version}/manifest.json` },
    }),
  );
  await page.route(`**/${version}/manifest.json`, (r) =>
    r.fulfill({ json: { ...fixture, version, routingNetworks: ["bilbao"] } }),
  );
  await page.route(`**/${version}/13400.json`, (r) =>
    r.fulfill({ json: { ...station, version } }),
  );
  await page.route(`**/${version}/routing-bilbao.json`, (r) =>
    r.fulfill({ json: graph }),
  );
  await page.goto("/");
  await expect(page.locator(".departures > li").first()).toBeVisible();
  await page.getByLabel("Destino", { exact: true }).fill("Bilbao-Abando");
  await expect(page.locator(".journey-detail").first()).toContainText(
    "1 transbordo",
  );
  const first = page.locator(".departures > li").first();
  await expect(first.locator(".train-arrival time")).toHaveText("08:30");
  await first.locator("summary").click();
  await expect(first.locator(".journey-detail")).toHaveAttribute("open", "");
  await expect(first.locator(".journey-detail")).toContainText("08:10");
  await expect(first.locator(".journey-detail")).toContainText("08:20");
  await expect(first.locator(".journey-detail")).toContainText("A pie");
  await expect(first.locator(".journey-detail")).toContainText("Autobús");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
    ).violations.map((v) => v.id),
  ).toEqual([]);
  const initialWorkers = workers;
  expect(initialWorkers).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.locator(".schedule-table")).toContainText("1 transbordo");
  expect(workers).toBe(initialWorkers);
  await page.getByLabel("Fecha", { exact: true }).fill("2027-01-01");
  await expect(
    page.getByText("Horario aún no publicado para esta fecha.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await page.getByLabel("Destino", { exact: true }).fill("San Mamés");
  await page
    .getByRole("button", { name: "Borrar destino", exact: true })
    .click();
  await expect(page.locator(".journey-detail")).toHaveCount(0);
  await expect(page.locator(".departures > li").first()).toBeVisible();
});
