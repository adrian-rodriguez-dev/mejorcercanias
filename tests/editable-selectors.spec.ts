import { test, expect } from "./configured-test";
test("escribir, cancelar texto y borrar destino y origen", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-03T10:00:00+02:00") });
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?"),
    dest = page.getByLabel("Destino directo");
  await dest.click();
  await expect(page.locator('.show-options')).toHaveCount(0);
  await page
    .getByRole("option", { name: "Bilbao-Abando", exact: true })
    .click();
  await expect(page.locator(".train-arrival").first()).toBeVisible();
  await dest.fill("No existe");
  await dest.press("Tab");
  await expect(dest).toHaveValue("Bilbao-Abando");
  await page
    .getByRole("button", { name: "Borrar destino", exact: true })
    .click();
  await expect(dest).toHaveValue("");
  await expect(page.locator(".train-arrival").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Intercambiar origen y destino" }),
  ).toBeDisabled();
  await page.reload();
  await expect(dest).toHaveValue("");
  await dest.fill("san ma");
  await expect(
    page.getByRole("option", { name: "San Mamés", exact: true }),
  ).toBeVisible();
  await dest.press("Enter");
  await expect(page.locator(".train-arrival").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Borrar destino", exact: true })
    .click();
  await expect(page.getByRole("columnheader", { name: "Hora de llegada", exact:true })).toHaveCount(
    1,
  );
  await page
    .getByRole("button", { name: "Borrar origen", exact: true })
    .click();
  await expect(origin).toHaveValue("");
  await expect(page.getByLabel("Núcleo de Cercanías")).toHaveCount(0);
  await expect(page.locator(".departures li")).toHaveCount(0);
  await origin.fill("Santurtzi");
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await expect(page.locator(".departures li").first()).toBeVisible();
  expect(await origin.getAttribute("aria-controls")).toBeTruthy();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/editable-${info.project.name}.png`,
    fullPage: false,
  });
});
