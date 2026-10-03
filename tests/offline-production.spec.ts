import { test, expect } from "@playwright/test";
import manifest from "../src/data/renfe-manifest.json" with { type: "json" };
const coverage = manifest.networks.find(
  (n) => n.id === "bilbao",
)!.coverageDates;
const serviceDay = coverage[Math.min(2, coverage.length - 1)];
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(serviceDay + "T06:00:00+02:00") });
  await page.addInitScript(() => {
    if (!localStorage.getItem("test.offline")) {
      localStorage.setItem("mejorcercanias.network.v1", "bilbao");
      localStorage.setItem(
        "mejorcercanias.journey.v1",
        JSON.stringify({ stationId: "13400", destination: "", lines: [] }),
      );
      localStorage.setItem("test.offline", "1");
    }
  });
});
test("reapertura offline, horarios por fecha, ausencia de estación y caducidad", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await expect(page.locator(".departures li")).toHaveCount(20);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".departures li")).toHaveCount(20);
  await expect(page.locator(".offline-status")).toContainText("Sin conexión");
  expect(
    await page.evaluate(async () => {
      try {
        await fetch("./app-version.json", { cache: "no-store" });
        return true;
      } catch {
        return false;
      }
    }),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(page.locator(".schedule-table tbody tr").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Día siguiente", exact: true })
    .click();
  await expect(page.locator(".schedule-table tbody tr").first()).toBeVisible();
  await page.getByLabel("Fecha", { exact: true }).fill("2099-01-01");
  await expect(
    page.getByText(/Horario aún no publicado para esta fecha/),
  ).toBeVisible();
  await expect(page.locator(".schedule-table")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Próximos trenes", exact: true })
    .click();
  await page.getByLabel("¿Desde dónde sales?").fill("Bilbao-Abando");
  await expect(
    page.getByText("Esta estación no está guardada.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".departures li")).toHaveCount(0);
  await context.setOffline(false);
  await expect(page.locator(".departures li")).toHaveCount(20);
});
test("worker nuevo espera el gesto y conserva preferencias al actualizar", async ({
  page,
  request,
}) => {
  await page.goto("./");
  await expect(page.locator(".departures li")).toHaveCount(20);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.evaluate(() => {
    sessionStorage.setItem("loaded", "yes");
    document.documentElement.dataset.beforeUpdate = "yes";
  });
  await request.post("/__test/revision");
  try {
    await page.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      await r!.update();
    });
    await page.waitForFunction(
      async () => !!(await navigator.serviceWorker.getRegistration())?.waiting,
    );
    await page.clock.fastForward(60001);
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect(
      page.getByRole("button", { name: "Actualizar", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "data-before-update",
      "yes",
    );
    await page.getByRole("button", { name: "Actualizar", exact: true }).click();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-before-update",
      "yes",
    );
    await expect(page.getByLabel("¿Desde dónde sales?")).toHaveValue(
      /Barakaldo/,
    );
    await page.waitForFunction(
      async () => !(await navigator.serviceWorker.getRegistration())?.waiting,
    );
  } finally {
    await request.post("/__test/revision");
  }
});

test("ruta real con transbordo, detalle y recálculo offline en app instalada", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  await page.goto("./");
  await page.getByLabel("¿Desde dónde sales?").fill("Santurtzi");
  await page.getByLabel("Destino", { exact: true }).fill("Muskiz");
  const detail = page.locator(".departures > li .journey-detail").first();
  await expect(detail).toBeVisible({ timeout: 20000 });
  await expect(detail.locator("summary")).toContainText("1 transbordo");
  await detail.locator("summary").click();
  await expect(detail).toContainText("C1");
  await expect(detail).toContainText("C2");
  await expect(detail.locator(".journey-change")).toContainText("Espera");
  await expect(detail.locator(".journey-stop time")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "work/routing-mobile.png", fullPage: true });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(detail).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".offline-status")).toContainText("Sin conexión");
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await expect(
    page.locator(".schedule-table .journey-detail").first(),
  ).toBeVisible({ timeout: 15000 });
  await context.setOffline(false);
});

for (const sample of [
  {
    network: "Madrid",
    origin: "Madrid-Aeropuerto T4",
    destination: "Humanes",
    lines: ["C1", "C5"],
  },
  {
    network: "Rodalies de Catalunya",
    origin: "Mataró",
    destination: "Sabadell Centre",
    lines: ["R1", "R4"],
  },
])
  test(`red real ${sample.network}: selección, transbordos y móvil`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto("./");
    await page.getByRole("button", { name: "Cambiar núcleo" }).click();
    await page
      .getByLabel("Núcleo de Cercanías", { exact: true })
      .fill(sample.network);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page
      .getByLabel("Estación de origen", { exact: true })
      .fill(sample.origin);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page
      .getByLabel("Estación de destino opcional", { exact: true })
      .fill(sample.destination);
    await page
      .getByRole("button", { name: "Ver mis trenes", exact: true })
      .click();
    await expect(page.getByText(/^Horarios incompletos:/)).toBeVisible();
    const detail = page.locator(".departures > li .journey-detail").first();
    await expect(detail).toBeVisible({ timeout: 25000 });
    await detail.locator("summary").click();
    for (const line of sample.lines) await expect(detail).toContainText(line);
    await expect(detail).toContainText(/\d{2}:\d{2}/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByLabel("Destino", { exact: true }).fill("");
    await page
      .getByLabel("¿Desde dónde sales?")
      .fill(
        sample.network === "Madrid"
          ? "Madrid-Atocha Cercanías"
          : "Barcelona-Sants",
      );
    await expect(page.locator(".line-bar button")).toHaveCount(
      sample.network === "Madrid" ? 9 : 11,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `work/${sample.network === "Madrid" ? "madrid" : "rodalies"}-mobile.png`,
      fullPage: true,
    });
  });
