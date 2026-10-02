import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === "e2e"
      ? [
          {
            name: "fixture-data",
            configureServer(server: import("vite").ViteDevServer) {
              server.middlewares.use((req, res, next) => {
                const match = req.url?.match(
                  /^\/data\/renfe\/([a-f0-9]{16})\/(\d+)\.json$/,
                );
                if (match) {
                  try {
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                      readFileSync(
                        resolve(`tests/fixtures/stations/${match[2]}.json`),
                      ),
                    );
                    return;
                  } catch {}
                }
                if (req.url?.startsWith("/data/renfe/current.json")) {
                  res.statusCode = 503;
                  res.end();
                  return;
                }
                next();
              });
            },
          },
        ]
      : []),
  ],
  resolve: {
    alias:
      mode === "e2e" || mode === "test"
        ? [
            {
              find: /\.\/renfe-manifest\.json$/,
              replacement: resolve("tests/fixtures/manifest.json"),
            },
          ]
        : [],
  },
  base: "./",
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
