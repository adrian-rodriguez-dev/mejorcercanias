const ORIGINS = new Set([
  "https://adrian-rodriguez-dev.github.io",
  "https://mejorcercanias.es",
]);
export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    if (origin && ORIGINS.has(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    if (new URL(request.url).pathname !== "/alerts" || request.method !== "GET")
      return new Response("{}", { status: 404, headers });
    if (origin && !ORIGINS.has(origin))
      return new Response("{}", { status: 403, headers });
    try {
      const r = await fetch("https://gtfsrt.renfe.com/alerts.json", {
        signal: AbortSignal.timeout(8000),
        cf: { cacheTtl: 20, cacheEverything: true },
      });
      if (!r.ok || !r.body) throw Error("upstream");
      const reader = r.body.getReader();
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 524288) {
          await reader.cancel();
          throw Error("size");
        }
        chunks.push(value);
      }
      const body = new Uint8Array(size);
      let offset = 0;
      for (const c of chunks) {
        body.set(c, offset);
        offset += c.length;
      }
      const data = JSON.parse(new TextDecoder().decode(body));
      if (!data.header?.timestamp || !Array.isArray(data.entity))
        throw Error("schema");
      return new Response(JSON.stringify(data), { headers });
    } catch {
      return new Response(
        JSON.stringify({ error: "Fuente de avisos no disponible" }),
        { status: 502, headers },
      );
    }
  },
};
