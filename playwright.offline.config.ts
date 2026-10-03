import { defineConfig } from "@playwright/test";
export default defineConfig({
  outputDir: "test-results/offline",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/offline", open: "never" }],
  ],
  testDir: "./tests",
  testMatch: "offline-production.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4176/mejorcercanias/",
    viewport: { width: 360, height: 800 },
    timezoneId: "Europe/Madrid",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/test-preview.mjs",
    url: "http://127.0.0.1:4176/mejorcercanias/",
    reuseExistingServer: false,
  },
});
