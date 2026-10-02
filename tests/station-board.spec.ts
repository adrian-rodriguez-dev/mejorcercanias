import { expect, test } from "@playwright/test";

test("elegir estación, recordar y cambiar sin formularios adicionales", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await expect(page.getByRole("combobox")).toHaveValue("");
  await expect(
    page.getByText("Horarios ficticios. No los uses para viajar."),
  ).toBeVisible();
  await page.getByRole("combobox").selectOption("demo-barakaldo");
  await expect(
    page.getByRole("heading", { name: "Barakaldo", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await expect(page.locator(".clock strong")).toHaveText("10:00");
  await page.reload();
  await expect(page.getByRole("combobox")).toHaveValue("demo-barakaldo");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await page.getByRole("combobox").selectOption("demo-amurrio");
  await expect(
    page.getByRole("heading", { name: "Amurrio", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".departures .line").first()).toHaveText("C3");
  await page.getByRole("combobox").selectOption("demo-barakaldo");
  await expect(page.getByRole("listitem")).toHaveCount(8);
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
  await page.goto("/");
  await page.route("**/data/demo/demo-barakaldo.json", (route) =>
    route.abort(),
  );
  await page.getByRole("combobox").selectOption("demo-barakaldo");
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
  await page.unroute("**/data/demo/demo-barakaldo.json");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(8);
});
