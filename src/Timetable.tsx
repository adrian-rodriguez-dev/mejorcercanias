import { subscribeSnapshot, snapshotRevision } from "./data/snapshot";
import { arrivalDayLabel } from "./data/arrival";
import { useEffect, useState, useSyncExternalStore } from "react";
import { addDays, dateTitle, loadDay, manifest } from "./data/renfe";
import { stationName } from "./data/stations";
import { RouteFilters } from "./RouteFilters";
import { emptyRouteFilter, type RouteFilter } from "./data/route-filters";
import { clockTime, localDay } from "./data/time";
import { filterTimetable, type TimeMode } from "./data/timetable";
import type { Departure, StationSchedule } from "./data/types";
export function Timetable({
  stationId,
  now,
  loader = loadDay,
  routeFilter,
  onRouteFilterChange,
  onScheduleChange,
}: {
  stationId: string;
  now: number;
  loader?: typeof loadDay;
  routeFilter?: RouteFilter;
  onRouteFilterChange?: (filter: RouteFilter) => void;
  onScheduleChange?: (context: {
    date: string;
    departures: Departure[];
  }) => void;
}) {
  useSyncExternalStore(subscribeSnapshot, snapshotRevision);
  const version = manifest.version;
  const today = localDay(now);
  const [date, setDate] = useState(today);
  const [localFilter, setLocalFilter] = useState(emptyRouteFilter);
  const selected = routeFilter ?? localFilter;
  const setFilter = onRouteFilterChange ?? setLocalFilter;
  const { destination, lines } = selected;
  const [mode, setMode] = useState<TimeMode>("all");
  const [time, setTime] = useState("09:00");
  useEffect(() => {
    if (!destination) setMode("all");
  }, [destination]);
  const [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    data?: StationSchedule;
    error?: boolean;
  }>();
  const key = `${version}/${stationId}/${date}`;
  const current = loaded?.key === key ? loaded : undefined;
  useEffect(() => {
    const controller = new AbortController();
    setLoaded(undefined);
    loader(stationId, date, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLoaded({ key, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ key, error: true });
      });
    return () => controller.abort();
  }, [stationId, date, key, retry, loader]);
  useEffect(() => {
    onScheduleChange?.({ date, departures: current?.data?.departures ?? [] });
  }, [date, current?.data, onScheduleChange]);
  const rows = filterTimetable(current?.data?.departures ?? [], {
    date,
    destination,
    mode,
    time,
    lines,
  });
  const recommended = mode === "arrive" ? rows.at(-1) : undefined;
  const reset = () => {
    setFilter(emptyRouteFilter);
    setMode("all");
    setTime("09:00");
  };
  const shortcut = () => {
    setDate(addDays(today, 1));
    setFilter({ lines: [], destination: "13200" });
    setMode("arrive");
    setTime("09:00");
  };
  return (
    <div className="timetable">
      <div className="date-actions">
        <button onClick={() => setDate(today)} aria-pressed={date === today}>
          Hoy
        </button>
        <button
          onClick={() => setDate(addDays(today, 1))}
          aria-pressed={date === addDays(today, 1)}
        >
          Mañana
        </button>
        <button
          className="quick-plan"
          onClick={shortcut}
          disabled={stationId === "13200"}
        >
          Mañana a Bilbao antes de las 09:00 ↗
        </button>
      </div>
      <div className="date-picker">
        <button
          aria-label="Día anterior"
          onClick={() => setDate(addDays(date, -1))}
        >
          ←
        </button>
        <label>
          Fecha
          <input
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
      </div>
      <h3 className="date-title">{dateTitle(date)}</h3>
      <p className="calendar-help">
        Servicios publicados para esta fecha. Fines de semana y excepciones del
        operador ya aplicados.
      </p>
      <RouteFilters
        showDestination={!onRouteFilterChange}
        rows={current?.data?.departures ?? []}
        value={selected}
        onChange={(filter) => {
          setFilter(filter);
          if (!filter.destination && mode === "arrive") setMode("all");
        }}
        onClear={reset}
        disabled={!current?.data || current.data.availability === "unpublished"}
        extraSummary={
          mode === "all"
            ? undefined
            : `${mode === "arrive" ? "Llegar antes de" : "Salir desde"} ${time}`
        }
      >
        <div className="schedule-filters">
          <label>
            Consultar
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as TimeMode)}
            >
              <option value="all">Todo el día</option>
              <option value="depart">Salir a partir de</option>
              <option value="arrive" disabled={!destination}>
                Llegar antes de
              </option>
            </select>
          </label>
          {mode !== "all" && (
            <label>
              Hora
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  if (e.target.value) setTime(e.target.value);
                }}
              />
            </label>
          )}
        </div>
      </RouteFilters>
      <div className="filter-summary">
        <span>{rows.length} trenes directos</span>
        <button onClick={reset}>Ver todo el día</button>
      </div>
      {!current ? (
        <p role="status" className="schedule-message">
          Cargando horario…
        </p>
      ) : current.error ? (
        <div role="alert" className="schedule-message">
          No se pudo cargar el horario.{" "}
          <button onClick={() => setRetry((n) => n + 1)}>
            Reintentar horario
          </button>
        </div>
      ) : current.data?.availability === "unpublished" ? (
        <p role="status" className="schedule-message">
          Horario aún no publicado para esta fecha. Datos disponibles del{" "}
          {manifest.validFrom} al {manifest.validTo}.
        </p>
      ) : !rows.length ? (
        <p role="status" className="schedule-message">
          No hay trenes que coincidan con esta consulta. Prueba otra hora o
          consulta todo el día.
        </p>
      ) : (
        <>
          {recommended && (
            <div className="recommendation" role="status">
              <strong>
                Última salida que llega a tiempo:{" "}
                {clockTime(Date.parse(recommended.scheduledAt))}
              </strong>
              <span>
                Llegada a {stationName(destination)} a las{" "}
                {clockTime(Date.parse(recommended.arrivalAt!))}. Horario
                programado; deja margen para posibles retrasos.
              </span>
            </div>
          )}
          <table className="schedule-table">
            <caption>
              Horario del {dateTitle(date)} desde {stationName(stationId)}
            </caption>
            <thead>
              <tr>
                <th>Línea</th>
                <th>Destino del tren</th>
                <th>Salida</th>
                {destination && (
                  <th>
                    Llegada
                    <span className="sr-only">
                      {" "}
                      a {stationName(destination)}
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    row.id === recommended?.id ? "recommended-row" : ""
                  }
                >
                  <td>
                    <span className={`line line-${row.line.toLowerCase()}`}>
                      {row.line}
                    </span>
                  </td>
                  <td>
                    {row.destination}
                    {row.id === recommended?.id && (
                      <small>Última opción a tiempo</small>
                    )}
                  </td>
                  <td>
                    <time dateTime={row.scheduledAt}>
                      {clockTime(Date.parse(row.scheduledAt))}
                    </time>
                  </td>
                  {destination && (
                    <td>
                      <time dateTime={row.arrivalAt}>
                        {clockTime(Date.parse(row.arrivalAt!))}
                      </time>
                      {Boolean(
                        arrivalDayLabel(row.scheduledAt, row.arrivalAt!),
                      ) && (
                        <small>
                          {arrivalDayLabel(row.scheduledAt, row.arrivalAt!)}
                        </small>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
