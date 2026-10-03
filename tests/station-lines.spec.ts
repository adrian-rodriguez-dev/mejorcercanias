import { test, expect } from "./configured-test";
test("barra solo con varias líneas compatibles y sin filtros ocultos", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?");
  const destination = page.getByLabel("Destino directo");
  const bar = page.getByRole("group", { name: /Filtrar por líneas/ });
  await origin.selectOption("13400");
  await expect(bar.getByRole("button")).toHaveCount(2);
  await bar.getByRole("button", { name: "C2", exact: true }).click();
  await destination.selectOption("13405");
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(await page.locator(".departures .line").allTextContents()).toEqual(
    Array(8).fill("C1"),
  );
  await page.screenshot({
    path: `work/station-lines-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("table")).toBeVisible();
  await destination.selectOption("");
  await expect(bar.getByRole("button")).toHaveCount(2);
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.getByLabel("Fecha").fill("2026-11-15");
  await expect(bar.getByRole("button")).toHaveCount(2);
  await destination.selectOption("13101");
  await expect(bar).toHaveCount(0);
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await origin.selectOption("13405");
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await origin.selectOption("13200");
  await expect(bar.getByRole("button")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
