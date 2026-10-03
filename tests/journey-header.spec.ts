import { optionName } from "./option-name";
import { test, expect } from "./configured-test";
test("cabecera única e intercambio conserva día, hora y preferencia", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?");
  const destination = page.getByLabel("Destino", { exact: true });
  const swap = page.getByRole("button", {
    name: "Intercambiar origen y destino",
  });
  await expect(page.locator(".station-card")).toHaveCount(0);
  await expect(page.locator(".board #station")).toHaveCount(1);
  await expect(swap).toBeDisabled();
  await origin.fill(optionName("13405"));
  await destination.fill(optionName("13200"));
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await swap.focus();
  await page.keyboard.press("Enter");
  await expect(origin).toHaveValue(optionName("13200"));
  await expect(destination).toHaveValue(optionName("13405"));
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(
    await page.locator(".departures .destination strong").allTextContents(),
  ).toEqual(Array(8).fill("Santurtzi"));
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Día siguiente", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await swap.click();
  await expect(origin).toHaveValue(optionName("13405"));
  await expect(destination).toHaveValue(optionName("13200"));
  await expect(page.getByLabel("Fecha")).toHaveValue("2026-10-03");
  await expect(page.getByRole("table")).toBeVisible();
  const arrivals = await page
    .locator("tbody tr td:last-child time")
    .allTextContents();
  expect(arrivals.length).toBeGreaterThan(0);
  expect(arrivals.some((t) => t > "09:00")).toBe(true);
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
  await destination.fill(optionName(""));
  await expect(swap).toBeDisabled();
  await destination.fill(optionName("13101"));
  await expect(
    page.getByText(/No hay trenes que coincidan con esta consulta/),
  ).toBeVisible();
  await page.reload();
  await expect(origin).toHaveValue(optionName("13405"));
  await expect(destination).toHaveValue(optionName("13101"));
});
