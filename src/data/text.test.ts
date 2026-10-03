import { it, expect } from "vitest";
import { stationLabel } from "./text";
it("repara acentos de catálogos anteriores sin cambiar texto válido", () => {
  for (const [bad, good] of [
    ["San MamÃ©s", "San Mamés"],
    ["OrduÃ±a", "Orduña"],
    ["AutonomÃ\u00ada", "Autonomía"],
    ["TrÃ¡paga", "Trápaga"],
    ["San MamÃƒÂ©s", "San Mamés"],
    ["Málaga – San MamÃ©s", "Málaga – San Mamés"],
    ["Ã‘ora", "Ñora"],
  ])
    expect(stationLabel(bad)).toBe(good);
  for (const name of [
    "Málaga",
    "València",
    "Iñarratxu",
    "San Mamés",
    "Peñota",
    "Ã",
    "東京",
  ])
    expect(stationLabel(name)).toBe(name);
});
