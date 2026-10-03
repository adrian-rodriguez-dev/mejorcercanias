/* Generated for one immutable application build. Data is cached only after validation by the app. */
const VERSION = __BUILD_VERSION__;
const RESOURCES = __PRECACHE__;
const PREFIX = `mejorcercanias-shell:${self.registration.scope}:`;
const SHELL = PREFIX + VERSION;
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      try {
        await cache.addAll(
          RESOURCES.map(
            (p) =>
              new Request(new URL(p, self.registration.scope), {
                cache: "reload",
              }),
          ),
        );
        const html = await (
          await cache.match(new URL("index.html", self.registration.scope))
        ).text();
        if (!html.includes(`name="app-version" content="${VERSION}"`))
          throw Error("Inconsistent deployment");
      } catch (error) {
        await caches.delete(SHELL);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const older = (await caches.keys()).filter(
        (k) => k.startsWith(PREFIX) && k !== SHELL,
      );
      await Promise.all(older.slice(0, -1).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE")
    event.waitUntil(self.skipWaiting());
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url),
    scope = new URL(self.registration.scope);
  if (
    request.method !== "GET" ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  )
    return;
  const path = url.pathname.slice(scope.pathname.length);
  if (
    path === "app-version.json" ||
    path.startsWith("data/") ||
    path === "sw.js"
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) return response;
        } catch {
          /* fall back */
        }
        return (
          (await (
            await caches.open(SHELL)
          ).match(new URL("index.html", scope))) || Response.error()
        );
      })(),
    );
  } else if (RESOURCES.includes(path)) {
    event.respondWith(
      (async () =>
        (await (await caches.open(SHELL)).match(request)) || fetch(request))(),
    );
  }
});
