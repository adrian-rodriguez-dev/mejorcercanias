import { test, expect } from "./configured-test";
import { optionName } from "./option-name";

test("actualización voluntaria al volver y preferencias conservadas", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-03T10:00:00+02:00") });
  let newer = false,
    requests = 0;
  await page.route("**/app-version.json", (r) => {
    requests++;
    return newer ? r.fulfill({ json: { version: "next-release" } }) : r.abort();
  });
  await page.goto("/");
  await page.getByLabel("Destino", { exact: true }).fill(optionName("13200"));
  await expect(page.locator(".update-notice")).toHaveCount(0);
  const initialRequests = requests;
  newer = true;
  await page.clock.fastForward(60001);
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.getByText("Nueva versión disponible")).toBeVisible();
  await expect(page.getByLabel("Destino", { exact: true })).toHaveValue(
    optionName("13200"),
  );
  expect(requests).toBe(initialRequests + 1);
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  expect(requests).toBe(initialRequests + 1);
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(page.getByLabel("Destino", { exact: true })).toHaveValue(
    optionName("13200"),
  );
  await expect(page.getByLabel("¿Desde dónde sales?")).toHaveValue(
    optionName("13400"),
  );
});
