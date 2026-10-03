import { test, expect } from "./configured-test";

test("campos y opciones visibles al enfocar y reducir el viewport", async ({
  page,
}, info) => {
  await page.goto("/");
  const field = page.getByLabel("Destino", { exact: true });
  const before = await field.boundingBox();
  await field.click();
  if (info.project.name === "desktop") {
    await expect
      .poll(async () => (await field.boundingBox())!.y)
      .toBe(before!.y);
    return;
  }
  await expect
    .poll(async () => Math.round((await field.boundingBox())!.y))
    .toBe(12);
  // Emulate the visual viewport shrinking above a software keyboard. Desktop
  // Chromium does not open a real phone keyboard in automated tests.
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, "height", {
      configurable: true,
      value: 300,
    });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect
    .poll(async () => (await page.getByRole("listbox").boundingBox())!.height)
    .toBeLessThanOrEqual(224);
  for (let i = 0; i < 15; i++) await field.press("ArrowDown");
  await expect
    .poll(async () => Math.round((await field.boundingBox())!.y))
    .toBe(12);
  await expect
    .poll(async () => {
      const box = (await page.getByRole("listbox").boundingBox())!;
      return box.y + box.height;
    })
    .toBeLessThan(300);
  await field.fill("san ma");
  await page.getByRole("option", { name: "San Mamés", exact: true }).click();
  await expect(field).toHaveValue("San Mamés");
  await page
    .getByRole("button", { name: "Cambiar núcleo", exact: true })
    .click();
  const network = page.getByLabel("Núcleo de Cercanías", { exact: true });
  await network.click();
  await expect
    .poll(async () => Math.round((await network.boundingBox())!.y))
    .toBe(12);
  await expect(
    page.getByRole("option", { name: "Bilbao", exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await network.fill("Bilbao");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByLabel("Estación de origen", { exact: true }),
  ).toBeVisible();
});
