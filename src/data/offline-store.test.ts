import { afterEach, expect, it, vi } from "vitest";
import { readStored, storeData } from "./offline-store";
afterEach(() => vi.unstubAllGlobals());
it("acota archivos a doce y dos versiones sin borrar el manifiesto", async () => {
  const data = new Map<string, Response>();
  const key = (r: string | Request) => (typeof r === "string" ? r : r.url);
  vi.stubGlobal("caches", {
    open: async () => ({
      delete: async (r: string | Request) => data.delete(key(r)),
      put: async (r: string, v: Response) => {
        data.set(r, v);
      },
      match: async (r: string) => data.get(r)?.clone(),
      keys: async () => [...data.keys()].map((url) => new Request(url)),
    }),
  });
  await storeData("manifest", { version: "a" });
  for (let i = 0; i < 14; i++)
    await storeData(`aaaaaaaaaaaaaaaa/${i}`, { stationId: i });
  expect(data.size).toBe(13);
  expect(await readStored("aaaaaaaaaaaaaaaa/0")).toBeUndefined();
  expect(await readStored("aaaaaaaaaaaaaaaa/13")).toEqual({ stationId: 13 });
  await storeData("bbbbbbbbbbbbbbbb/1", {});
  await storeData("cccccccccccccccc/1", {});
  expect([...data.keys()].some((k) => k.includes("aaaaaaaaaaaaaaaa"))).toBe(
    false,
  );
  expect(await readStored("manifest")).toEqual({ version: "a" });
});
it("almacenamiento bloqueado no rechaza la consulta", async () => {
  vi.stubGlobal("caches", {
    open: async () => {
      throw Error("denied");
    },
  });
  await expect(storeData("manifest", {})).resolves.toBeUndefined();
  expect(await readStored("manifest")).toBeUndefined();
});
