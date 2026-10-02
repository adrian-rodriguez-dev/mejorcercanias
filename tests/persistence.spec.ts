import { test, expect } from "@playwright/test";
test("recuerda destino, multiselección, inversión y vaciado", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-02T10:00:00+02:00") });
  await page.goto("/");
  const origin = page.getByLabel("¿Desde dónde sales?");
  const destination = page.getByLabel("Destino directo");
  const bar = page.getByRole("group", { name: /Filtrar por líneas/ });
  await origin.selectOption("13400");
  await destination.selectOption("13200");
  await bar.getByRole("button", { name: "C1", exact: true }).click();
  await bar.getByRole("button", { name: "C2", exact: true }).click();
  await page.reload();
  await expect(origin).toHaveValue("13400");
  await expect(destination).toHaveValue("13200");
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(2);
  await page
    .getByRole("button", { name: "Horario completo", exact: true })
    .click();
  await bar.getByRole("button", { name: "C1", exact: true }).click();
  await page
    .getByRole("button", { name: "Intercambiar origen y destino" })
    .click();
  await page.reload();
  await expect(origin).toHaveValue("13200");
  await expect(destination).toHaveValue("13400");
  await expect(
    bar.getByRole("button", { name: "C2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("listitem")).toHaveCount(8);
  expect(await page.locator(".departures .line").allTextContents()).toEqual(
    Array(8).fill("C2"),
  );
  await destination.selectOption("");
  await bar.getByRole("button", { name: "C2", exact: true }).click();
  await page.reload();
  await expect(destination).toHaveValue("");
  await expect(bar.locator('[aria-pressed="true"]')).toHaveCount(0);
});
