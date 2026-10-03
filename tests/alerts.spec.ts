import { test, expect } from "./configured-test";
import fixture from "./fixtures/manifest.json" with { type: "json" };
import station from "./fixtures/stations/13400.json" with { type: "json" };

test("cabecera sin campana ni consultas de incidencias, incluso con núcleo largo", async ({
  page,
}) => {
  let alertRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("alerts")) alertRequests++;
  });
  const version = "dddddddddddddddd";
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
        networks: fixture.networks.map((n) => ({
          ...n,
          name: n.id === "bilbao" ? "Rodalies de Catalunya" : n.name,
        })),
      },
    }),
  );
  await page.route(`**/${version}/13400.json`, (r) =>
    r.fulfill({ json: { ...station, version } }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Cambiar núcleo" }),
  ).toContainText("Rodalies de Catalunya");
  await expect(page.locator(".alert-indicator")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Activar modo oscuro" }),
  ).toBeVisible();
  expect(alertRequests).toBe(0);
  const brand = (await page.locator(".brand").boundingBox())!;
  const actions = (await page.locator(".masthead-actions").boundingBox())!;
  expect(actions.y).toBeLessThan(brand.y + brand.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
