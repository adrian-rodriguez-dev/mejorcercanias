import { it, expect } from "vitest";
import { manifest } from "./snapshot";
import { networks } from "./networks";

it("repara nombres de núcleos de snapshots antiguos sin alterar los datos", () => {
  const previous = manifest.networks;
  const names = [
    "CÃ¡diz",
    "ValÃ¨ncia",
    "LeÃ³n",
    "MÃ¡laga",
    "San SebastiÃ¡n",
    "Bilbao",
  ];
  manifest.networks = names.map((name) => ({ ...previous![0], name }));
  try {
    expect(networks().map((n) => n.name)).toEqual([
      "Cádiz",
      "València",
      "León",
      "Málaga",
      "San Sebastián",
      "Bilbao",
    ]);
    expect(manifest.networks.map((n) => n.name)).toEqual(names);
  } finally {
    manifest.networks = previous;
  }
});
