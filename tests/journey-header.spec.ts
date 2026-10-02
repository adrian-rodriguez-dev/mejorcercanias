import { test, expect } from "@playwright/test";
test("cabecera única e intercambio conserva día, hora y preferencia", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?");
  const destination = page.getByLabel("Destino directo");
  const swap = page.getByRole("button", {
    name: "Intercambiar origen y destino",
  });
  await expect(page.locator(".station-card")).toHaveCount(0);
  await expect(page.locator(".board #station")).toHaveCount(1);
  await expect(swap).toBeDisabled();
  await origin.selectOption("13405");
  await destination.selectOption("13200");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await swap.focus();
  await page.keyboard.press("Enter");
  await expect(origin).toHaveValue("13200");
  await expect(destination).toHaveValue("13405");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(
    await page.locator(".departures .destination strong").allTextContents(),
  ).toEqual(Array(8).fill("Santurtzi"));
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await page.getByRole("button", { name: "Mañana", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.locator(".route-filters summary").click();
  await page.getByLabel("Consultar").selectOption("arrive");
  await page.getByLabel("Hora", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Ver trenes", exact: true }).click();
  await swap.click();
  await expect(origin).toHaveValue("13405");
  await expect(destination).toHaveValue("13200");
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-03");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator(".route-filter-summary")).toContainText(
    "Llegar antes de 09:00",
  );
  const arrivals = await page
    .locator("tbody tr td:last-child time")
    .allTextContents();
  expect(arrivals.length).toBeGreaterThan(0);
  expect(arrivals.every((t) => t <= "09:00")).toBe(true);
  await page.screenshot({
    path: `work/header-${info.project.name}.png`,
    fullPage: true,
  });
  for (const control of [origin, destination, swap])
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await destination.selectOption("");
  await expect(swap).toBeDisabled();
  await expect(page.locator(".route-filter-summary")).not.toContainText(
    "Llegar antes",
  );
  await destination.selectOption("13101");
  await expect(
    page.getByText(/No hay trenes que coincidan con esta consulta/),
  ).toBeVisible();
  await page.reload();
  await expect(origin).toHaveValue("13405");
  await expect(destination).toHaveValue("");
});
