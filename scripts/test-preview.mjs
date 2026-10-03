// Local test server for the production build, including a simulated new SW release.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
let revision = "";
createServer(async (req, res) => {
  if (req.url === "/__test/revision" && req.method === "POST") {
    revision = revision ? "" : "test-new-release";
    res.end("ok");
    return;
  }
  const path = new URL(req.url, "http://localhost").pathname;
  if (!path.startsWith("/mejorcercanias/")) {
    res.writeHead(404).end();
    return;
  }
  const relative =
    decodeURIComponent(path.slice("/mejorcercanias/".length)) || "index.html";
  const file = resolve(root, relative);
  if (!file.startsWith(root + "/") && !file.startsWith(root + "\\")) {
    res.writeHead(403).end();
    return;
  }
  try {
    let data = await readFile(file);
    if (revision && relative === "sw.js")
      data = Buffer.from(
        data
          .toString()
          .replace(/const VERSION = [^;]+;/, `const VERSION = "${revision}";`),
      );
    if (revision && relative === "app-version.json")
      data = Buffer.from(JSON.stringify({ version: revision }));
    if (revision && relative === "index.html")
      data = Buffer.from(
        data
          .toString()
          .replace(
            /name="app-version" content="[^"]+"/,
            `name="app-version" content="${revision}"`,
          ),
      );
    res
      .writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".webmanifest": "application/manifest+json",
          }[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      })
      .end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(4176, "127.0.0.1");
