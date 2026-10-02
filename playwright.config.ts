import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1100 },
        timezoneId: "America/New_York",
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        viewport: { width: 360, height: 800 },
        timezoneId: "Europe/Madrid",
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
