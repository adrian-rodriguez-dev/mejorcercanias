import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  JOURNEY_KEY,
  STORAGE_KEY,
  readJourney,
  saveJourney,
} from "./preference";
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
it("restaura trayecto completo y selecciones vacías", () => {
  const journey = {
    stationId: "13400",
    destination: "13200",
    lines: ["C1", "C2"],
  };
  expect(saveJourney(journey)).toBe(true);
  expect(readJourney()).toEqual(journey);
  saveJourney({ ...journey, destination: "", lines: [] });
  expect(readJourney()).toEqual({ ...journey, destination: "", lines: [] });
});
it("migra origen y tolera datos corruptos o incompatibles", () => {
  localStorage.setItem(STORAGE_KEY, "demo-barakaldo");
  localStorage.setItem(JOURNEY_KEY, "broken");
  expect(readJourney()).toEqual({
    stationId: "13400",
    destination: "",
    lines: [],
  });
  localStorage.setItem(
    JOURNEY_KEY,
    JSON.stringify({ stationId: "13400", destination: "13405", lines: ["C2"] }),
  );
  expect(readJourney()).toEqual({
    stationId: "13400",
    destination: "13405",
    lines: [],
  });
  localStorage.setItem(
    JOURNEY_KEY,
    JSON.stringify({
      stationId: "13400",
      destination: 123,
      lines: ["C2", "C2", false, "C3"],
    }),
  );
  expect(readJourney()).toEqual({
    stationId: "13400",
    destination: "",
    lines: ["C2"],
  });
});
it("tolera almacenamiento bloqueado", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error("blocked");
  });
  expect(readJourney()).toEqual({ stationId: "", destination: "", lines: [] });
  expect(saveJourney({ stationId: "13400", destination: "", lines: [] })).toBe(
    false,
  );
});

it('un núcleo inexistente no se restaura',async()=>{
 const {readNetwork,NETWORK_KEY}=await import('./preference');
 localStorage.setItem(NETWORK_KEY,'inexistente');
 expect(readNetwork()).toBe('');
});
