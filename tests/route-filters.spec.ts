import { test, expect } from "./configured-test";
test("multiselección, botón completo y ninguna equivale a todas", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13400");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  const bar = page.getByRole("group", { name: /Filtrar por líneas/ });
  const b = (name: string) => bar.getByRole("button", { name, exact: true });
  await expect(bar.getByRole("button")).toHaveCount(2);
  await expect(bar.getByRole("button", { name: "Todas" })).toHaveCount(0);
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(bar.getByRole("button", { name: /C3/ })).toHaveCount(0);
  const bg = () => b("C2").evaluate((e) => getComputedStyle(e).backgroundColor);
  const dark = await bg();
  await b("C2").focus();
  await page.keyboard.press("Enter");
  await expect(b("C2")).toHaveAttribute("aria-pressed", "true");
  expect(await bg()).not.toBe(dark);
  await page.getByLabel("Destino directo").selectOption("13200");
  expect(await page.locator(".departures .line").allTextContents()).toEqual(
    Array(8).fill("C2"),
  );
  await b("C1").click();
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(2);
  expect(
    new Set(await page.locator(".departures .line").allTextContents()),
  ).toEqual(new Set(["C1", "C2"]));
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  const boxes = await Promise.all(
    (await bar.getByRole("button").all()).map((x) => x.boundingBox()),
  );
  for (const box of boxes) {
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.y).toBe(boxes[0]!.y);
  }
  const train = await page.getByRole("listitem").first().boundingBox();
  expect(train!.y + train!.height).toBeLessThan(page.viewportSize()!.height);
  await page.screenshot({
    path: `work/multi-line-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(2);
  await b("C1").click();
  await b("C2").click();
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(0);
  expect(await bg()).toBe(dark);
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  await page.getByLabel("Fecha").fill("2026-11-15");
  await b("C2").click();
  await expect(b("C2")).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(/Horario aún no publicado para esta fecha/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await page.getByLabel("¿Desde dónde sales?").selectOption("13200");
  await b("C1").click();
  await b("C2").click();
  await page.getByLabel("Destino directo").selectOption("13405");
  await page
    .getByRole("button", { name: "Intercambiar origen y destino" })
    .click();
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
