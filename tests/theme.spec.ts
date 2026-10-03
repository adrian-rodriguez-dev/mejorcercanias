import { test, expect } from "./configured-test";
import AxeBuilder from "@axe-core/playwright";
test("luna y sol alternan, conservan preferencia y contraste", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-03T10:00:00+02:00") });
  await page.goto("/");
  await expect(page.locator(".departures > li")).toHaveCount(20);
  const moon = page.getByRole("button", { name: "Activar modo oscuro" });
  await expect(moon).toBeVisible();
  const themeBox = await moon.boundingBox();
  await expect(page.locator(".alert-indicator")).toHaveCount(0);
  expect(themeBox!.width).toBeGreaterThanOrEqual(44);
  await moon.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Activar modo claro" }),
  ).toBeVisible();
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  await audit();
  await page.getByLabel("Destino", { exact: true }).click();
  await audit();
  await page.getByLabel("Destino", { exact: true }).press("Escape");
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await audit();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByLabel("¿Desde dónde sales?")).toHaveValue(/Barakaldo/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/theme-dark-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activar modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await audit();
  await page.screenshot({
    path: `work/theme-light-${info.project.name}.png`,
    fullPage: true,
  });
  await expect(page.getByText("Probar paletas")).toHaveCount(0);
});
test("el tema funciona sin almacenamiento", async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem,
      set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "mejorcercanias.theme.v1") throw Error("blocked");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "mejorcercanias.theme.v1") throw Error("blocked");
      set.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Activar modo oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Activar modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
