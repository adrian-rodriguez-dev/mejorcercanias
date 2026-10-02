import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Timetable } from "./Timetable";
import type { StationSchedule } from "./data/types";
const now = Date.parse("2026-10-02T18:00:00+02:00");
const schedule = (day: string): StationSchedule => ({
  stationId: "13400",
  source: "renfe-gtfs",
  availability: "available",
  destinations: ["13200"],
  departures: [
    {
      id: day,
      line: "C1",
      destination: "Bilbao-Abando",
      scheduledAt: `${day}T08:35:00+02:00`,
      arrivals: [{ stationId: "13200", at: `${day}T08:57:00+02:00` }],
    },
  ],
});
describe("consulta por fecha", () => {
  it("muestra todo el día, aplica atajo mañana y permite volver al horario completo", async () => {
    const user = userEvent.setup();
    render(
      <Timetable
        stationId="13400"
        now={now}
        loader={async (_id, day) => schedule(day)}
      />,
    );
    expect(await screen.findByText("08:35")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Mañana a Bilbao/ }));
    expect(
      await screen.findByText(/Última salida que llega a tiempo: 08:35/),
    ).toBeVisible();
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-10-03");
    expect(screen.getByLabelText("Hora")).toHaveValue("09:00");
    await user.click(screen.getByRole("button", { name: "Ver todo el día" }));
    expect(screen.getByLabelText("Destino directo")).toHaveValue("");
    expect(screen.getByLabelText("Consultar")).toHaveValue("all");
  });
  it("descarta fecha anterior al completar tarde una carga", async () => {
    let finish!: (s: StationSchedule) => void;
    const loader = vi.fn((_id: string, day: string) =>
      day === "2026-10-02"
        ? new Promise<StationSchedule>((r) => {
            finish = r;
          })
        : Promise.resolve(schedule(day)),
    );
    render(<Timetable stationId="13400" now={now} loader={loader} />);
    fireEvent.click(screen.getByRole("button", { name: "Mañana" }));
    await screen.findByText("08:35");
    await act(async () =>
      finish({ ...schedule("2026-10-02"), departures: [] }),
    );
    expect(screen.getByText("08:35")).toBeVisible();
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-10-03");
  });
  it("distingue datos no publicados de error de red y permite reintentar", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ...schedule("2026-10-02"),
        departures: [],
        availability: "unpublished",
      });
    render(<Timetable stationId="13400" now={now} loader={loader} />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Reintentar horario" }),
    );
    expect(await screen.findByText(/Horario aún no publicado/)).toBeVisible();
  });
});
