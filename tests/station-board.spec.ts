import { optionName } from "./option-name";
import { expect, test } from "./configured-test";

test("elegir estación, recordar y cambiar sin formularios adicionales", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await expect(page.getByLabel("¿Desde dónde sales?")).toHaveValue(
    optionName("13400"),
  );
  await expect(page.locator(".board .demo-notice")).toHaveCount(0);
  await expect(page.locator(".board .schedule-provenance")).toHaveCount(0);
  await expect(
    page.getByText(
      "Horario programado · Sin información de retrasos en tiempo real",
    ),
  ).toBeVisible();
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await expect(page.getByLabel("¿Desde dónde sales?")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(20);
  await expect(page.locator(".board-top, .clock")).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("¿Desde dónde sales?")).toHaveValue(
    optionName("13400"),
  );
  await expect(page.getByRole("listitem")).toHaveCount(20);
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13101"));
  await expect(page.getByLabel("¿Desde dónde sales?")).toBeVisible();
  await expect(page.locator(".departures .line").first()).toHaveText("C3");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await expect(page.getByRole("listitem")).toHaveCount(20);
  const sizes = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: innerWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  const firstTrain = await page.getByRole("listitem").first().boundingBox();
  expect(firstTrain!.y + firstTrain!.height).toBeLessThan(
    page.viewportSize()!.height,
  );
  await page.screenshot({
    path: `work/preview-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("error de red y reintento en el navegador", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.route("**/data/renfe/*/13400.json", (route) => route.abort());
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
  await page.unroute("**/data/renfe/*/13400.json");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(20);
});
