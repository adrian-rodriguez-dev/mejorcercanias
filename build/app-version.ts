import { randomUUID } from "node:crypto";
import type { Plugin } from "vite";

export function appVersion(): Plugin {
  const version = randomUUID();
  return {
    name: "app-version",
    config: () => ({
      define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) },
    }),
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "app-version.json",
        source: JSON.stringify({ version }),
      });
    },
  };
}
