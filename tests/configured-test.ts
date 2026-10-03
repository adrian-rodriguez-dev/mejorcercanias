import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("test.configured")) {
        localStorage.setItem("mejorcercanias.network.v1", "bilbao");
        localStorage.setItem("mejorcercanias.station.v1", "13400");
        localStorage.setItem("test.configured", "1");
      }
    });
    await use(page);
  },
});
export { expect };
