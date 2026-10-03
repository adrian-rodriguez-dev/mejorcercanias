import { stations } from "./data/stations";
import { networks } from "./data/networks";
const optionName = (id: string) =>
  stations.find((s) => s.id === id)?.name ??
  networks().find((n) => n.id === id)?.name ??
  id;
const choose = async (el: HTMLElement, id: string) => {
  fireEvent.change(el, { target: { value: optionName(id) } });
};
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { STORAGE_KEY } from "./preference";
import type { ScheduleProvider, StationSchedule } from "./data/types";

const now = Date.parse("2026-10-02T10:00:00+02:00");
const clock = () => now;
const schedule = (
  id: string,
  destination = "Destino de prueba",
): StationSchedule => ({
  stationId: id,
  source: "demo",
  departures: [
    {
      id: "train",
      line: "C1",
      destination,
      scheduledAt: "2026-10-02T10:05:00+02:00",
    },
  ],
});
const provider: ScheduleProvider = { load: async (id) => schedule(id) };
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mejorcercanias.network.v1", "bilbao");
  localStorage.setItem(STORAGE_KEY, "13400");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("panel de estación", () => {
  it("selecciona, guarda y restaura sin volver a pedir datos", async () => {
    const view = render(<App provider={provider} clock={clock} />);
    expect(screen.getByLabelText("¿Desde dónde sales?")).toHaveValue(
      optionName("13400"),
    );
    await choose(
      screen.getByRole("combobox", { name: "¿Desde dónde sales?" }),
      "13400",
    );
    expect(await screen.findByText("Destino de prueba")).toBeVisible();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("13400");
    view.unmount();
    render(<App provider={provider} clock={clock} />);
    expect(await screen.findByText("Destino de prueba")).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "¿Desde dónde sales?" }),
    ).toHaveValue(optionName("13400"));
    expect(
      screen.getByText("Horarios ficticios. No los uses para viajar."),
    ).toBeVisible();
  });
  it("exige asistente con estación obsoleta y permite continuar sin almacenamiento", async () => {
    localStorage.setItem(STORAGE_KEY, "obsolete");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("blocked");
    });
    render(<App provider={provider} clock={clock} />);
    const user = userEvent.setup();
    await choose(screen.getByLabelText("Núcleo de Cercanías"), "bilbao");
    await user.click(screen.getByText("Continuar"));
    await choose(screen.getByLabelText("Estación de origen"), "13400");
    await user.click(screen.getByText("Continuar"));
    await user.click(screen.getByText("Ver mis trenes"));
    expect(await screen.findByText("Destino de prueba")).toBeVisible();
    expect(screen.getByText(/No podemos guardar/)).toBeVisible();
  });
  it("muestra error, permite reintentar y muestra vacío", async () => {
    localStorage.setItem(STORAGE_KEY, "13400");
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        stationId: "13400",
        source: "demo",
        departures: [],
      });
    render(<App provider={{ load }} clock={clock} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Reintentar" }),
    );
    expect(await screen.findByText("No hay próximas salidas.")).toBeVisible();
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("descarta respuestas de una selección anterior", async () => {
    let resolveOld!: (s: StationSchedule) => void;
    const load = vi.fn((id: string) =>
      id === "13400"
        ? new Promise<StationSchedule>((resolve) => {
            resolveOld = resolve;
          })
        : Promise.resolve(schedule(id, "Nuevo destino")),
    );
    render(<App provider={{ load }} clock={clock} />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "¿Desde dónde sales?" }),
      {
        target: { value: optionName("13400") },
      },
    );
    expect(screen.getByText("Preparando tu panel…")).toBeVisible();
    fireEvent.change(
      screen.getByRole("combobox", { name: "¿Desde dónde sales?" }),
      {
        target: { value: optionName("13200") },
      },
    );
    expect(await screen.findByText("Nuevo destino")).toBeVisible();
    await act(async () => resolveOld(schedule("13400", "Destino antiguo")));
    expect(screen.queryByText("Destino antiguo")).not.toBeInTheDocument();
  });
  it("actualiza la cuenta atrás y elimina salidas al volver a la pestaña", async () => {
    let current = now;
    const mutableClock = () => current;
    localStorage.setItem(STORAGE_KEY, "13400");
    render(<App provider={provider} clock={mutableClock} />);
    await screen.findByText("Destino de prueba");
    current += 6 * 60000;
    fireEvent(document, new Event("visibilitychange"));
    await waitFor(() =>
      expect(screen.getByText("No hay próximas salidas.")).toBeVisible(),
    );
  });
});

it("vuelve al asistente si leer las preferencias falla", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw Error("blocked");
  });
  render(<App provider={provider} clock={clock} />);
  expect(screen.getByLabelText("Núcleo de Cercanías")).toBeVisible();
});
