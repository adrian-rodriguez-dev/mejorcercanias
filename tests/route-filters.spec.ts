import { test, expect } from "@playwright/test";
test("filtros compactos compartidos, destino intermedio y uso móvil", async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13400");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  const details = page.locator(".route-filters");
  await expect(details).not.toHaveAttribute("open", "");
  const summary = details.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("combobox", { name: "Línea", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Línea", exact: true })
    .selectOption("C2");
  await page.getByLabel("Destino directo").selectOption("13200");
  await page.screenshot({
    path: `work/filters-open-${testInfo.project.name}.png`,
    fullPage: true,
  });
  for (const locator of [
    summary,
    page.getByRole("combobox", { name: "Línea", exact: true }),
    page.getByLabel("Destino directo"),
    page.getByRole("button", { name: "Ver trenes", exact: true }),
  ]) {
    const box = await locator.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole("button", { name: "Ver trenes", exact: true }).click();
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("C2");
  expect(await page.locator(".departures .line").allTextContents()).toEqual(
    Array(8).fill("C2"),
  );
  const train = await page.getByRole("listitem").first().boundingBox();
  expect(train!.y + train!.height).toBeLessThan(page.viewportSize()!.height);
  await page.screenshot({
    path: `work/filters-closed-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator(".route-filter-summary")).toContainText("C2");
  await page.locator(".route-filters summary").click();
  await expect(
    page.getByRole("combobox", { name: "Línea", exact: true }),
  ).toHaveValue("C2");
  await page.getByLabel("Consultar").selectOption("arrive");
  await page.getByLabel("Hora", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Ver trenes", exact: true }).click();
  await expect(page.locator(".route-filter-summary")).toContainText(
    "Llegar antes de 09:00",
  );
  expect(
    (await page.locator("tbody .line").allTextContents()).every(
      (l) => l === "C2",
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/filters-timetable-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await page.locator(".route-filters summary").click();
  await page
    .getByRole("button", { name: "Quitar filtros", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Línea", exact: true })
    .selectOption("C1");
  await page.getByLabel("Destino directo").selectOption("13403");
  await page
    .getByRole("combobox", { name: "Línea", exact: true })
    .selectOption("C2");
  await expect(page.getByLabel("Destino directo")).toHaveValue("");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13101");
  await expect(page.locator(".route-filter-summary")).toHaveText(
    "Todas las líneas",
  );
  const sizes = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    innerWidth,
  ]);
  expect(sizes[0]).toBeLessThanOrEqual(sizes[1]);
});
