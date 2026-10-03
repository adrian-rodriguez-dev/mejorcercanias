const cacheName = () =>
  `mejorcercanias-data:${new URL(import.meta.env.BASE_URL, location.href).pathname}:v1`;
const url = (key: string) =>
  new URL(`offline/${key}`, new URL(import.meta.env.BASE_URL, location.href))
    .href;
export async function readStored(key: string): Promise<unknown> {
  try {
    return await (
      await (await caches.open(cacheName())).match(url(key))
    )?.json();
  } catch {
    return undefined;
  }
}
let writes = Promise.resolve();
export function storeData(key: string, value: unknown): Promise<void> {
  // Serialize writes and eviction so simultaneous station loads cannot exceed the limit.
  writes = writes.then(async () => {
    try {
      const cache = await caches.open(cacheName());
      await cache.delete(url(key));
      await cache.put(
        url(key),
        new Response(JSON.stringify(value), {
          headers: { "Content-Type": "application/json" },
        }),
      );
      const entries = (await cache.keys()).filter((r) =>
        /\/offline\/[a-f0-9]{16}\//.test(r.url),
      );
      const versions = [
        ...new Set(entries.map((r) => r.url.split("/").at(-2)!)),
      ];
      const keep = versions.slice(-2);
      const current = entries.filter((r) =>
        keep.includes(r.url.split("/").at(-2)!),
      );
      const remove = [
        ...entries.filter((r) => !keep.includes(r.url.split("/").at(-2)!)),
        ...current.slice(0, -12),
      ];
      await Promise.all(remove.map((r) => cache.delete(r)));
    } catch {
      /* Online operation must work with storage blocked or full. */
    }
  });
  return writes;
}
