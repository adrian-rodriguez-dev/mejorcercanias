import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

export function appVersion(): Plugin {
  const version = randomUUID();
  return {
    name: "app-version",
    transformIndexHtml: () => [{tag:'meta', attrs:{name:'app-version', content:version}, injectTo:'head'}],
    config: () => ({
      define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) },
    }),
    generateBundle(_, bundle) {
      this.emitFile({
        type: "asset",
        fileName: "app-version.json",
        source: JSON.stringify({ version }),
      });
      const resources = [
        "./",
        "index.html",
        "icon.svg",
        "manifest.webmanifest",
        "icons/icon-192.png",
        "icons/icon-512.png",
        ...Object.keys(bundle).filter((p) => /\.(js|css)$/.test(p)),
      ];
      const worker = readFileSync("build/service-worker.js", "utf8")
        .replace("__BUILD_VERSION__", JSON.stringify(version))
        .replace("__PRECACHE__", JSON.stringify(resources));
      this.emitFile({ type: "asset", fileName: "sw.js", source: worker });
    },
  };
}
