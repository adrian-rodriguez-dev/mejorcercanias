import { beforeEach, it, expect, vi } from "vitest";
import fixture from "../../tests/fixtures/manifest.json";
beforeEach(() => vi.resetModules());
const response = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;
it("adopta catálogo y estación juntos, respeta intervalo y no descarga estación con igual hash", async () => {
  const s = await import("./snapshot");
  const candidate = { ...fixture, version: "aaaaaaaaaaaaaaaa" };
  let finish!: (r: Response) => void;
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      response({
        schemaVersion: 1,
        version: candidate.version,
        manifest: `${candidate.version}/manifest.json`,
      }),
    )
    .mockResolvedValueOnce(response(candidate))
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    );
  const checking = s.checkSnapshot("13400", 1000, fetcher);
  await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  expect(s.manifest.version).toBe(fixture.version);
  finish(
    response({ version: candidate.version, stationId: "13400", patterns: [] }),
  );
  await checking;
  expect(s.manifest.version).toBe(candidate.version);
  await s.checkSnapshot("13400", 2000, fetcher);
  expect(fetcher).toHaveBeenCalledTimes(3);
  fetcher.mockResolvedValueOnce(
    response({
      schemaVersion: 1,
      version: candidate.version,
      manifest: `${candidate.version}/manifest.json`,
      checkedAt: "2026-10-03T10:00:00Z",
    }),
  );
  await s.checkSnapshot("13400", 3601000, fetcher);
  expect(fetcher).toHaveBeenCalledTimes(4);
  expect(s.manifest.checkedAt).toBe("2026-10-03T10:00:00Z");
});
it("fallo o esquema incompatible conserva snapshot con backoff", async () => {
  const s = await import("./snapshot");
  const fetcher = vi.fn().mockRejectedValue(Error("offline"));
  await s.checkSnapshot("13400", 1000, fetcher);
  expect(s.manifest.version).toBe(fixture.version);
  expect(s.refreshError).toBe(true);
  await s.checkSnapshot("13400", 299999, fetcher);
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockResolvedValueOnce(response({ schemaVersion: 99 }));
  await s.checkSnapshot("13400", 301001, fetcher);
  expect(s.manifest.version).toBe(fixture.version);
});
it("rechaza catálogo inválido y permite avisar de estaciones retiradas", async () => {
  const s = await import("./snapshot");
  expect(s.validManifest({ ...fixture, stations: [] })).toBe(false);
  const candidate = {
    ...fixture,
    version: "bbbbbbbbbbbbbbbb",
    stations: fixture.stations.filter((x) => x.id !== "13400"),
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      response({
        schemaVersion: 1,
        version: candidate.version,
        manifest: `${candidate.version}/manifest.json`,
      }),
    )
    .mockResolvedValueOnce(response(candidate));
  await s.checkSnapshot("13400", 1000, fetcher);
  expect(s.stations.some((x) => x.id === "13400")).toBe(false);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
