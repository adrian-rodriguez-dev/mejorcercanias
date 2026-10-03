import { JourneyDetail } from "./JourneyDetail";
import { loadJourneys, routingAvailable } from "../data/routing";
import { OfflineStatus, useOnline } from "./OfflineStatus";
import { networkForStation, lineStyle } from "../data/networks";
import { subscribeSnapshot, snapshotRevision } from "../data/snapshot";
import { arrivalDayLabel } from "../data/arrival";
import { useEffect, useState, useSyncExternalStore } from "react";
import { addDays, dateTitle, loadDay, manifest } from "../data/renfe";
import { stationName } from "../data/stations";
import { emptyRouteFilter, type RouteFilter } from "../data/route-filters";
import { clockTime, localDay } from "../data/time";
import { filterTimetable } from "../data/timetable";
import type { Departure, StationSchedule } from "../data/types";
export function Timetable({
  stationId,
  now,
  loader = loadDay,
  routeFilter,
  onScheduleChange,
  onReturnNow,
}: {
  stationId: string;
  now: number;
  loader?: typeof loadDay;
  routeFilter?: RouteFilter;
  onRouteFilterChange?: (filter: RouteFilter) => void;
  onReturnNow?: () => void;
  onScheduleChange?: (context: {
    date: string;
    departures: Departure[];
  }) => void;
}) {
  useSyncExternalStore(subscribeSnapshot, snapshotRevision);
  const version = manifest.version;
  const online = useOnline();
  const today = localDay(now);
  const [date, setDate] = useState(today);
  const localFilter = emptyRouteFilter;
  const selected = routeFilter ?? localFilter;
  const { destination, lines } = selected;
  const [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    data?: StationSchedule;
    error?: boolean;
  }>();
  const key = `${version}/${stationId}/${date}/${destination}/${lines.join(",")}`;
  const current = loaded?.key === key ? loaded : undefined;
  useEffect(() => {
    const controller = new AbortController();
    setLoaded(undefined);
    (loader === loadDay && destination && routingAvailable(stationId)
      ? loadJourneys(stationId, destination, [date], lines, controller.signal)
      : loader(stationId, date, controller.signal)
    )
      .then((data) => {
        if (!controller.signal.aborted) setLoaded({ key, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ key, error: true });
      });
    return () => controller.abort();
  }, [stationId, date, key, retry, loader, online]);
  useEffect(() => {
    onScheduleChange?.({ date, departures: current?.data?.departures ?? [] });
  }, [date, current?.data, onScheduleChange]);
  const rows = filterTimetable(current?.data?.departures ?? [], {
    date,
    destination,
    mode: "all",
    time: "00:00",
    lines,
  });
  return (
    <div className="timetable">
      <div className="date-picker">
        <button
          aria-label="Día anterior"
          onClick={() => setDate(addDays(date, -1))}
        >
          ←
        </button>
        <label>
          <input
            aria-label="Fecha"
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </label>
        <button
          aria-label="Día siguiente"
          onClick={() => setDate(addDays(date, 1))}
        >
          →
        </button>
        {date !== today && onReturnNow && (
          <button
            className="return-now"
            aria-label="Volver a ahora"
            onClick={onReturnNow}
          >
            Ahora
          </button>
        )}
      </div>
      <OfflineStatus
        validTo={networkForStation(stationId)?.validTo ?? manifest.validTo}
        fallback={current?.data?.offline}
      />
      {!current ? (
        <p role="status" className="schedule-message">
          Cargando horario…
        </p>
      ) : current.error ? (
        <div role="alert" className="schedule-message">
          {online
            ? "No se pudo cargar el horario."
            : "Esta estación no está guardada. Conéctate para descargar su horario."}{" "}
          <button onClick={() => setRetry((n) => n + 1)}>
            Reintentar horario
          </button>
        </div>
      ) : current.data?.availability === "unpublished" ? (
        <p role="status" className="schedule-message">
          Horario aún no publicado para esta fecha. Datos disponibles del{" "}
          {networkForStation(stationId)?.validFrom ?? manifest.validFrom} al{" "}
          {networkForStation(stationId)?.validTo ?? manifest.validTo}.
        </p>
      ) : !rows.length ? (
        <p role="status" className="schedule-message">
          No hay trenes que coincidan con esta consulta. Cambia la fecha o los
          filtros de estación y línea.
        </p>
      ) : (
        <>
          <div
            className="table-scroll"
            role="region"
            aria-label="Tabla de horarios"
            tabIndex={0}
          >
            <table className="schedule-table">
              <caption className="sr-only">
                Horario del {dateTitle(date)} desde {stationName(stationId)}
              </caption>
              <thead>
                <tr>
                  <th>Línea</th>
                  <th>Llegada a</th>
                  <th>Salida</th>
                  <th>Hora de llegada</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span
                        style={lineStyle(
                          networkForStation(stationId)?.id ?? "",
                          row.line,
                        )}
                        className={`line line-${row.line.toLowerCase()}`}
                      >
                        {row.line}
                        {row.mode === "bus" ? " · Bus" : ""}
                      </span>
                    </td>
                    <td
                      title={
                        row.journey
                          ? `Trayecto a ${row.destination}`
                          : `${row.mode === "bus" ? "Autobús" : "Tren"} con destino final ${row.destination}`
                      }
                      aria-label={
                        row.journey
                          ? `Trayecto a ${row.destination}`
                          : `${destination ? stationName(destination) : row.destination}; ${row.mode === "bus" ? "autobús" : "tren"} con destino final ${row.destination}`
                      }
                    >
                      {destination ? stationName(destination) : row.destination}
                      <JourneyDetail
                        departure={row}
                        networkId={networkForStation(stationId)?.id}
                      />
                    </td>
                    <td>
                      <time dateTime={row.scheduledAt}>
                        {clockTime(Date.parse(row.scheduledAt))}
                      </time>
                    </td>
                    {
                      <td>
                        {row.arrivalAt ? (
                          <time dateTime={row.arrivalAt}>
                            {clockTime(Date.parse(row.arrivalAt!))}
                          </time>
                        ) : (
                          <span aria-label="Hora de llegada no disponible">
                            —
                          </span>
                        )}
                        {row.arrivalAt &&
                          Boolean(
                            arrivalDayLabel(row.scheduledAt, row.arrivalAt!),
                          ) && (
                            <small>
                              {arrivalDayLabel(row.scheduledAt, row.arrivalAt!)}
                            </small>
                          )}
                      </td>
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
