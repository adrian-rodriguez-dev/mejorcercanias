import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./configured-test";
test("accesibilidad del panel, desplegable, tabla y texto ampliado", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date("2026-10-03T10:00:00+02:00") });
  await page.goto("/");
  await expect(page.locator(".departures li")).toHaveCount(8);
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
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
  await expect(page.getByRole("table")).toBeVisible();
  await audit();
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: `work/a11y-table-${info.project.name}.png` });
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const input = page.getByLabel("Destino", { exact: true });
  await input.focus();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toBeFocused();
  await page
    .getByRole("button", { name: "Borrar destino", exact: true })
    .click();
  await expect(input).toBeFocused();
  await page.screenshot({ path: `work/a11y-board-${info.project.name}.png` });
  for (const locator of [
    ".board-tabs button",
    ".line-bar button",
    ".swap-stations",
    ".clear-selection",
  ]) {
    for (const b of await page.locator(locator).all()) {
      const box = await b.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  }
});
test("asistente accesible", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.removeItem("mejorcercanias.network.v1"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Elige tu núcleo" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});
