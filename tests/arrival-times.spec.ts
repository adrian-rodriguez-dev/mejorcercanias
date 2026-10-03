import {optionName} from './option-name';
import { test, expect } from "./configured-test";
import manifest from "./fixtures/manifest.json" with { type: "json" };
test("llegada intermedia, medianoche, cambio, inversión y eliminación", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T23:50:00+02:00") });
  const calendar = manifest.calendars.findIndex((days) =>
    days.includes("2026-10-02"),
  );
  await page.route("**/data/renfe/*/13400.json", (route) =>
    route.fulfill({
      json: {
        version: manifest.version,
        stationId: "13400",
        patterns: [
          [
            "night",
            "C1",
            "13405",
            86280,
            calendar,
            [
              ["13403", 86880],
              ["13405", 87300],
            ],
          ],
        ],
      },
    }),
  );
  await page.route("**/data/renfe/*/13405.json", (route) =>
    route.fulfill({
      json: {
        version: manifest.version,
        stationId: "13405",
        patterns: [
          [
            "return",
            "C1",
            "13200",
            86280,
            calendar,
            [
              ["13400", 87600],
              ["13200", 88500],
            ],
          ],
        ],
      },
    }),
  );
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?");
  const destination = page.getByLabel("Destino", {exact:true});
  await origin.fill(optionName("13400"));
  await expect(page.getByRole("listitem").first()).toBeVisible();
  await expect(page.locator(".train-arrival time").first()).toHaveText("00:15");
  await destination.fill(optionName("13403"));
  const first = page.getByRole("listitem").first();
  await expect(first.locator(".destination strong")).toHaveText("Portugalete");
  await expect(first.locator(".train-arrival time")).toHaveText("00:08");
  await expect(first.locator(".arrival-day")).toHaveText("+1 día");
  await expect(first.locator(".train-departure time")).toHaveText("23:58");
  await expect(first.locator(".countdown strong")).toHaveText("8");
  await destination.fill(optionName("13405"));
  await expect(first.locator(".train-arrival time")).toHaveText("00:15");
  await expect(first).not.toContainText("Programado");
  await expect(first.locator(".destination .train-times")).toHaveCount(1);
  const nameBox = (await first.locator(".destination strong").boundingBox())!;
  const timeBox = (await first.locator(".train-times").boundingBox())!;
  expect(timeBox.y).toBeGreaterThanOrEqual(nameBox.y + nameBox.height);
  const box = (await first.boundingBox())!;
  expect(box.y + box.height).toBeLessThan(page.viewportSize()!.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/arrivals-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(
    page.locator("tbody tr").first().locator("td:last-child time"),
  ).toHaveText("00:15");
  await expect(page.locator("tbody tr").first()).toContainText("+1 día");
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Intercambiar origen y destino" })
    .click();
  await expect(origin).toHaveValue(optionName("13405"));
  await expect(destination).toHaveValue(optionName("13400"));
  await expect(first.locator(".train-arrival time")).toHaveText("00:20");
  await destination.fill(optionName(""));
  await expect(page.locator(".train-arrival time").first()).toHaveText("00:35");
});

test("hora grande desde 60 minutos y transición automática", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T23:49:59+02:00") });
  await page.clock.pauseAt(new Date("2026-10-02T23:50:00+02:00"));
  const calendar = manifest.calendars.findIndex((days) =>
    days.includes("2026-10-02"),
  );
  await page.route("**/data/renfe/*/13400.json", (route) =>
    route.fulfill({
      json: {
        version: manifest.version,
        stationId: "13400",
        patterns: [59, 60, 61].map((minutes) => [
          String(minutes),
          "C1",
          "13405",
          85800 + minutes * 60,
          calendar,
          [["13405", 85800 + minutes * 60 + 900]],
        ]),
      },
    }),
  );
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await page.getByLabel("Destino", {exact:true}).fill(optionName("13405"));
  const rows = page.locator(".departures li");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).locator(".countdown")).toHaveText("59 min");
  await expect(rows.nth(1).locator(".countdown")).toHaveText("00:50");
  await expect(rows.nth(2).locator(".countdown")).toHaveText("00:51");
  await expect(rows.nth(1).locator(".departure-day")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/compact-rows-${info.project.name}.png`,
    fullPage: true,
  });
  await page.clock.fastForward(61000);
  await expect(rows.nth(1).locator(".countdown")).toHaveText("59 min");
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await page.screenshot({
    path: `work/compact-table-${info.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

