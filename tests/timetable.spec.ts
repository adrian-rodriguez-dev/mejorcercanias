import { test, expect } from "./configured-test";
test("tabla de todo el día compacta y cambio de fecha", async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: new Date("2026-10-02T18:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13400");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Destino directo").selectOption("13200");
  await page.getByRole("button", { name: "Día siguiente" }).click();
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-03");
  await expect(page.getByRole("table")).toBeVisible();
  const arrivals = await page
    .locator("tbody tr td:last-child time")
    .allTextContents();
  expect(arrivals.some((time) => time > "09:00")).toBe(true);
  expect(arrivals.some((time) => time < "09:00")).toBe(true);
  await expect(
    page.locator(
      ".date-actions,.date-title,.calendar-help,.route-filters,.filter-summary",
    ),
  ).toHaveCount(0);
  await page.screenshot({
    path: `work/timetable-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const size = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    innerWidth,
  ]);
  expect(size[0]).toBeLessThanOrEqual(size[1]);
  await page.getByRole("button", { name: "Día siguiente" }).click();
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-04");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Fecha").fill("2026-10-12");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Fecha").fill("2026-11-15");
  await expect(
    page.getByText(/Horario aún no publicado para esta fecha/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await expect(page.getByRole("listitem")).toHaveCount(8);
});
