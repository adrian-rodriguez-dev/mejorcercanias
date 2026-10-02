import { test, expect } from "@playwright/test";
test("barra visible de líneas, colores, filtros y accesibilidad móvil", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13400");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  const bar = page.getByRole("group", { name: "Filtrar por línea" });
  const button = (name: string) =>
    bar.getByRole("button", { name, exact: true });
  await expect(bar.getByRole("button")).toHaveCount(4);
  await expect(
    page.getByRole("combobox", { name: "Línea", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".route-filters")).toHaveCount(0);
  await expect(button("Todas")).toHaveAttribute("aria-pressed", "true");
  await expect(bar.getByRole("button", { name: /C3/ })).toBeDisabled();
  await button("C2").focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Destino directo").selectOption("13200");
  await expect(button("C2")).toHaveAttribute("aria-pressed", "true");
  await button("C2").click();
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  expect(await page.locator(".departures .line").allTextContents()).toEqual(
    Array(8).fill("C2"),
  );
  const boxes = await Promise.all(
    (await bar.getByRole("button").all()).map((b) => b.boundingBox()),
  );
  for (const b of boxes) {
    expect(b!.height).toBeGreaterThanOrEqual(44);
    expect(b!.width).toBeGreaterThanOrEqual(44);
    expect(b!.y).toBe(boxes[0]!.y);
  }
  const train = await page.getByRole("listitem").first().boundingBox();
  expect(train!.y + train!.height).toBeLessThan(page.viewportSize()!.height);
  expect(
    await page
      .locator(".line-bar .line-c2")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe(
    await page
      .locator(".departures .line-c2")
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  );
  await page.screenshot({
    path: `work/line-bar-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(button("C2")).toHaveAttribute("aria-pressed", "true");
  await page.locator(".route-filters summary").click();
  await page.getByLabel("Consultar").selectOption("arrive");
  await page.getByLabel("Hora", { exact: true }).fill("09:00");
  await page.getByRole("button", { name: "Ver trenes", exact: true }).click();
  await button("Todas").click();
  await expect(page.getByLabel("Destino directo")).toHaveValue("13200");
  await expect(page.locator(".route-filter-summary")).toContainText(
    "Llegar antes de 09:00",
  );
  await page.getByLabel("Fecha").fill("2026-11-15");
  await button("C2").click();
  await expect(button("C2")).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(/Horario aún no publicado para esta fecha/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await button("C1").click();
  await page.getByLabel("Destino directo").selectOption("13403");
  await button("C2").click();
  await expect(page.getByLabel("Destino directo")).toHaveValue("");
  await page.getByLabel("¿Desde dónde sales?").selectOption("13101");
  await expect(button("Todas")).toHaveAttribute("aria-pressed", "true");
  await expect(button("C3")).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
