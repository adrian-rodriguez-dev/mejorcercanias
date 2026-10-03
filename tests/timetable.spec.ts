import { test, expect } from "./configured-test";
test("mañana a Bilbao antes de las nueve y cambio de fecha", async ({
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
  await page.getByRole("button", { name: /Mañana a Bilbao/ }).click();
  await expect(
    page.getByText(/Última salida que llega a tiempo/),
  ).toBeVisible();
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-03");
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  const arrivals = await page
    .locator("tbody tr td:last-child time")
    .allTextContents();
  expect(arrivals.length).toBeGreaterThan(0);
  expect(arrivals.every((time) => time <= "09:00")).toBe(true);
  await page.screenshot({
    path: `work/timetable-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const size = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    innerWidth,
  ]);
  expect(size[0]).toBeLessThanOrEqual(size[1]);
  await page.getByRole("button", { name: "Ver todo el día" }).click();
  expect(await page.locator("tbody tr").count()).toBeGreaterThan(
    arrivals.length,
  );
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
