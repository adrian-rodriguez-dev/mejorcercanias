import { optionName } from "./option-name";
import { test, expect } from "./configured-test";
const now = Date.parse("2026-10-02T10:00:00+02:00");
test("indicador condicional, detalle accesible, retirada y fallo", async ({
  page,
}, info) => {
  await page.clock.install({ time: new Date(now) });
  let entities: unknown[] = [];
  let fail = false;
  await page.route("https://gtfsrt.renfe.com/alerts.json", (r) =>
    fail
      ? r.abort()
      : r.fulfill({
          json: {
            header: { timestamp: String((now + 60000) / 1000) },
            entity: entities,
          },
        }),
  );
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await page.getByRole("listitem").first().waitFor();
  await expect(page.locator(".masthead .alert-indicator")).toBeDisabled();
  entities = [
    {
      id: "test",
      alert: {
        informedEntity: [{ routeId: "60T0001C1" }],
        descriptionText: {
          translation: [
            {
              language: "es",
              text: "Aviso oficial de prueba: obras en la línea. ".repeat(15),
            },
          ],
        },
      },
    },
  ];
  await page.clock.fastForward(60000);
  const button = page.getByRole("button", {
    name: /Incidencias: Aviso oficial/,
  });
  await expect(button).toBeVisible();
  expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const headerBox = (await page.locator(".masthead").boundingBox())!;
  const panelBox = (await page.locator(".board").boundingBox())!;
  const noticeBox = (await page.locator(".install-invitation").boundingBox())!;
  expect(Math.round(noticeBox.y - headerBox.y - headerBox.height)).toBe(8);
  expect(noticeBox.height).toBeLessThanOrEqual(48);
  expect(Math.round(panelBox.y - noticeBox.y - noticeBox.height)).toBe(8);
  await expect(page.locator(".brand img")).toBeVisible();
  await page.getByRole("button", { name: "Ahora no", exact: true }).click();
  const compactBox = (await page.locator(".board").boundingBox())!;
  expect(Math.round(compactBox.y - headerBox.y - headerBox.height)).toBe(8);
  const first = (await page.getByRole("listitem").first().boundingBox())!;
  expect(first.y + first.height).toBeLessThan(page.viewportSize()!.height);
  await page.screenshot({
    path: `work/alerts-${info.project.name}.png`,
    fullPage: true,
  });
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await button.click();
  entities = [];
  await page.clock.fastForward(60000);
  await expect(page.getByText(/Los avisos ya no están activos/)).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(page.getByLabel("¿Desde dónde sales?")).toBeFocused();
  await expect(page.locator(".masthead .alert-indicator")).toBeDisabled();
  fail = true;
  await page.clock.fastForward(60000);
  await expect(page.getByText("· Avisos no disponibles")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Incidencias: consulta no disponible" }),
  ).toBeDisabled();
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
