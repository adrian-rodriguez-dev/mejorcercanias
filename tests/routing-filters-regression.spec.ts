import { test, expect } from "./configured-test";
import fixture from "./fixtures/manifest.json" with { type: "json" };
import station from "./fixtures/stations/13400.json" with { type: "json" };

test("routing oculta una sola línea, limpia la selección y repara nombres de núcleos", async ({
  page,
}) => {
  const version = "cccccccccccccccc";
  await page.clock.install({ time: new Date("2026-10-03T07:00:00+02:00") });
  await page.route("**/data/renfe/current.json", (r) =>
    r.fulfill({
      json: { schemaVersion: 1, version, manifest: `${version}/manifest.json` },
    }),
  );
  await page.route(`**/${version}/manifest.json`, (r) =>
    r.fulfill({
      json: {
        ...fixture,
        version,
        routingNetworks: ["bilbao"],
        networks: [
          ...fixture.networks,
          ...[
            ["cadiz", "CÃ¡diz"],
            ["valencia", "ValÃ¨ncia"],
            ["leon", "LeÃ³n"],
          ].map(([id, name]) => ({ ...fixture.networks[0], id, name })),
        ],
      },
    }),
  );
  await page.route(`**/${version}/13400.json`, (r) =>
    r.fulfill({ json: { ...station, version } }),
  );
  await page.route(`**/${version}/routing-bilbao.json`, (r) =>
    r.fulfill({
      json: {
        schemaVersion: 1,
        version,
        network: "bilbao",
        nodes: {
          "13400": { stationId: "13400", name: "Barakaldo" },
          "13405": { stationId: "13405", name: "Santurtzi" },
        },
        groups: { "13400": ["13400"], "13405": ["13405"] },
        calendars: [["2026-10-03", "2026-10-04"]],
        trips: [
          {
            id: "direct",
            route: "a",
            line: "C1",
            calendar: 0,
            calls: [
              ["13400", 28800, 28800, 0, 0],
              ["13405", 30000, 30000, 0, 0],
            ],
          },
        ],
        transfers: [],
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".departures > li").first()).toBeVisible();
  const bar = page.getByRole("group", { name: /Filtrar por líneas/ });
  await bar.getByRole("button", { name: "C2", exact: true }).click();
  await page.getByLabel("Destino", { exact: true }).fill("Santurtzi");
  await expect(bar).toHaveCount(0);
  await expect(page.locator(".departures > li").first()).toContainText("08:20");
  await expect(page.getByText("Directo", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("table")).toContainText("08:20");
  await page
    .getByRole("button", { name: "Borrar destino", exact: true })
    .click();
  await expect(bar.getByRole("button")).toHaveCount(2);
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page
    .getByRole("button", { name: "Cambiar núcleo", exact: true })
    .click();
  await page.getByLabel("Núcleo de Cercanías", { exact: true }).click();
  for (const name of ["Cádiz", "València", "León"]) {
    await expect(page.getByRole("option", { name, exact: true })).toBeVisible();
  }
});
