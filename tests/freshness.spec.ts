import { test, expect } from "@playwright/test";
import fixture from "./fixtures/manifest.json" with { type: "json" };
import station from "./fixtures/stations/13400.json" with { type: "json" };
test("adopta nueva versión conservando trayecto, fecha y hora", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  let version = fixture.version;
  await page.route("**/data/renfe/current.json", (r) =>
    r.fulfill({
      json: { schemaVersion: 1, version, manifest: `${version}/manifest.json` },
    }),
  );
  await page.route("**/data/renfe/aaaaaaaaaaaaaaaa/manifest.json", (r) =>
    r.fulfill({ json: { ...fixture, version: "aaaaaaaaaaaaaaaa" } }),
  );
  await page.route("**/data/renfe/aaaaaaaaaaaaaaaa/13400.json", (r) =>
    r.fulfill({ json: { ...station, version: "aaaaaaaaaaaaaaaa" } }),
  );
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13400");
  await page.getByLabel("Destino directo").selectOption("13200");
  await page.getByRole("button", { name: "C2", exact: true }).click();
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await page.getByRole("button", { name: "Mañana", exact: true }).click();
  await page.locator(".route-filters summary").click();
  await page.getByLabel("Consultar").selectOption("arrive");
  await page.getByLabel("Hora", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Ver trenes", exact: true }).click();
  version = "aaaaaaaaaaaaaaaa";
  const response = page.waitForResponse(
    "**/data/renfe/aaaaaaaaaaaaaaaa/13400.json",
  );
  await page.clock.fastForward(3600000);
  await response;
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-03");
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  await expect(
    page.getByRole("button", { name: "C2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".route-filter-summary")).toContainText("09:00");
});
