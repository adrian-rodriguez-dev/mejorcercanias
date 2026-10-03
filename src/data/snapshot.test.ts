import { beforeEach, it, expect, vi } from "vitest";
import fixture from "../../tests/fixtures/manifest.json";
beforeEach(() => vi.resetModules());
const response = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;
it("adopta catálogo y estación juntos, respeta intervalo y no descarga estación con igual hash", async () => {
  const s = await import("./snapshot");
  const candidate = {
    ...fixture,
    version: "aaaaaaaaaaaaaaaa",
    stations: fixture.stations.map((s) =>
      s.id === "13400" ? { ...s, name: "San MamÃ©s" } : s,
    ),
  };
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
  expect(s.stations.find((x) => x.id === "13400")?.name).toBe("San Mamés");
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

it("rechaza núcleos con colores ausentes, también en redes grandes", async () => {
  const { validManifest } = await import("./snapshot");
  expect(validManifest(fixture)).toBe(true);
  expect(
    validManifest({
      ...fixture,
      networks: [
        {
          ...fixture.networks[0],
          lines: ["C1", "C2", "C3", "C4", "C5", "C6", "C7"],
        },
      ],
    }),
  ).toBe(false);
  expect(
    validManifest({
      ...fixture,
      networks: [{ ...fixture.networks[0], colors: {} }],
    }),
  ).toBe(false);
});

it("acepta redes grandes y variantes Rodalies sin perder validación", async () => {
  const { validManifest } = await import("./snapshot");
  const lines = [
    "R1",
    "R2",
    "R2N",
    "R2S",
    "R3",
    "R4",
    "R7",
    "R8",
    "RG1",
    "RT1",
    "RL3",
    "R11",
  ];
  const n = {
    ...fixture.networks[0],
    id: "rodalies",
    lines,
    colors: Object.fromEntries(lines.map((l) => [l, "123456"])),
  };
  const m = {
    ...fixture,
    networks: [n],
    stations: [{ id: "rodalies-1", name: "Sants", network: "rodalies", lines }],
  };
  expect(validManifest(m)).toBe(true);
  expect(
    validManifest({
      ...m,
      stations: [{ ...m.stations[0], lines: ["INVALID"] }],
    }),
  ).toBe(false);
});
