import { optionName } from "./option-name";
import { test, expect } from "./configured-test";
test("instalación nativa a petición, descarte y ayuda", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await page.getByRole("listitem").first().waitFor();
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(e, {
      prompt: async () => {
        document.documentElement.dataset.prompts = String(
          Number(document.documentElement.dataset.prompts || 0) + 1,
        );
      },
      userChoice: Promise.resolve({ outcome: "dismissed" }),
    });
    window.dispatchEvent(e);
  });
  await expect(
    page.getByRole("button", { name: "Instalar", exact: true }),
  ).toBeVisible();
  expect(await page.locator("html").getAttribute("data-prompts")).toBeNull();
  await page.getByRole("button", { name: "Instalar", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-prompts", "1");
  await expect(page.locator(".install-invitation")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".install-invitation")).toHaveCount(0);
  await page.getByRole("button", { name: "Cómo instalar la app" }).click();
  await expect(
    page.getByText(
      "Puedes consultar sin conexión las estaciones que hayas guardado al abrirlas.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar ayuda" }).focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Cómo instalar la app" }),
  ).toBeFocused();
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.locator(".install-area")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Instalar", exact: true }),
  ).toHaveCount(0);
});
test("guía iOS, cierre con almacenamiento bloqueado y manifiesto", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "userAgent", { value: "iPhone" });
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.includes("install-dismissed")) throw Error("blocked");
      return original.call(this, key, value);
    };
  });
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await page.getByRole("button", { name: "Instalar", exact: true }).click();
  await expect(page.getByText(/En iPhone o iPad/)).toBeVisible();
  await page.getByRole("button", { name: "Cerrar ayuda" }).click();
  await page.getByRole("button", { name: "Ahora no" }).click();
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13200"));
  await expect(page.locator(".install-invitation")).toHaveCount(0);
  const response = await page.request.get("/manifest.webmanifest");
  const m = await response.json();
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBe("./");
  for (const icon of m.icons)
    expect((await page.request.get("/" + icon.src)).ok()).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("rechazo vencido, error nativo y standalone", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.addInitScript(() =>
    localStorage.setItem("mejorcercanias.install-dismissed-until.v1", "1"),
  );
  await page.goto("/");
  await page.getByLabel("¿Desde dónde sales?").fill(optionName("13400"));
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(e, {
      prompt: async () => {
        throw Error("unavailable");
      },
      userChoice: Promise.resolve({ outcome: "dismissed" }),
    });
    window.dispatchEvent(e);
  });
  const install = page.getByRole("button", { name: "Instalar", exact: true });
  await expect(install).toBeVisible();
  expect((await install.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await install.click();
  await expect(
    page.getByText(
      "Puedes consultar sin conexión las estaciones que hayas guardado al abrirlas.",
    ),
  ).toBeVisible();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "standalone", { value: true }),
  );
  await page.reload();
  await expect(page.locator(".install-area")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Instalar", exact: true }),
  ).toHaveCount(0);
});
