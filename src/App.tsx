import { arrivalAt, arrivalDayLabel } from "./data/arrival";
import { useEffect, useState } from "react";
import { renfeProvider, manifest } from "./data/renfe";
import { Timetable } from "./Timetable";
import { LineBar } from "./LineBar";
import {
  changeLines,
  emptyRouteFilter,
  filterRoutes,
} from "./data/route-filters";
import { stations } from "./data/stations";
import { clockTime, dayLabel, localDay, upcoming } from "./data/time";
import type { ScheduleProvider, StationSchedule } from "./data/types";
import { readStation, saveStation } from "./preference";

type LoadState = {
  stationId: string;
  status: "loading" | "error" | "ready";
  schedule?: StationSchedule;
};
const systemClock = () => Date.now();

export function App({
  provider = renfeProvider,
  clock = systemClock,
}: {
  provider?: ScheduleProvider;
  clock?: () => number;
}) {
  const [stationId, setStationId] = useState(readStation);
  const [saved, setSaved] = useState(true);
  const [now, setNow] = useState(clock);
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<"next" | "day">("next");
  const [routeFilter, setRouteFilter] = useState(emptyRouteFilter);
  const [load, setLoad] = useState<LoadState>({
    stationId: "",
    status: "loading",
  });
  const day = localDay(now);
  const station = stations.find((s) => s.id === stationId);

  useEffect(() => {
    const tick = () => setNow(clock());
    const timer = window.setInterval(tick, 15000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [clock]);

  useEffect(() => {
    if (!stationId) return;
    const controller = new AbortController();
    setLoad({ stationId, status: "loading" });
    provider
      .load(stationId, clock(), controller.signal)
      .then((schedule) => {
        if (controller.signal.aborted) return;
        if (schedule.stationId !== stationId)
          throw new Error("Estación incorrecta");
        setLoad({ stationId, status: "ready", schedule });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoad({ stationId, status: "error" });
      });
    return () => controller.abort();
  }, [stationId, day, retry, provider, clock]);

  const current = load.stationId === stationId ? load : undefined;
  const rows =
    current?.status === "ready"
      ? upcoming(filterRoutes(current.schedule!.departures, routeFilter), now)
      : [];
  const choose = (id: string) => {
    setRouteFilter(emptyRouteFilter);
    setSaved(saveStation(id));
    setStationId(id);
    setNow(clock());
  };

  return (
    <div className={`app${station ? " has-station" : ""}`}>
      <header className="masthead">
        <a href="./" className="brand" aria-label="mejorcercanías, inicio">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <span>
            mejor<span className="brand-light">cercanías</span>
            <small>MENOS BUSCAR. MÁS LLEGAR.</small>
          </span>
        </a>
        <span className="region">
          <span className="dot" /> Cercanías Bilbao
        </span>
      </header>
      <main>
        <div className="workspace">
          <section className="board" aria-label="Panel de trenes">
            <div className="journey-header">
              <label className="origin-field" htmlFor="station">
                <span>Origen</span>
                <select
                  id="station"
                  aria-label="¿Desde dónde sales?"
                  value={stationId}
                  onChange={(e) => choose(e.target.value)}
                >
                  <option value="" disabled>
                    Elige tu estación
                  </option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="swap-stations"
                type="button"
                aria-label="Intercambiar origen y destino"
                title="Intercambiar origen y destino"
                disabled={!stationId || !routeFilter.destination}
                onClick={() => {
                  const nextOrigin = routeFilter.destination;
                  if (!nextOrigin || nextOrigin === stationId) return;
                  setRouteFilter({ ...routeFilter, destination: stationId });
                  setStationId(nextOrigin);
                  setSaved(saveStation(nextOrigin));
                  setNow(clock());
                }}
              >
                ⇅
              </button>
              <label className="destination-field" htmlFor="destination">
                <span>Destino · opcional</span>
                <select
                  id="destination"
                  aria-label="Destino directo"
                  value={routeFilter.destination}
                  disabled={!stationId}
                  onChange={(e) =>
                    setRouteFilter({
                      ...routeFilter,
                      destination: e.target.value,
                    })
                  }
                >
                  <option value="">Todos los destinos</option>
                  {stations
                    .filter((s) => s.id !== stationId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            {!saved && (
              <p className="storage-warning" role="status">
                No podemos guardar tu estación. Se mantendrá durante esta
                visita.
              </p>
            )}
            {station && (
              <nav className="board-tabs" aria-label="Vista de horarios">
                <button
                  aria-pressed={view === "next"}
                  onClick={() => setView("next")}
                >
                  Próximos trenes
                </button>
                <button
                  aria-pressed={view === "day"}
                  onClick={() => setView("day")}
                >
                  Horario completo
                </button>
              </nav>
            )}
            {station && (
              <LineBar
                value={routeFilter.lines}
                available={station.lines}
                onChange={(lines) =>
                  setRouteFilter(
                    changeLines(
                      current?.schedule?.departures ?? [],
                      routeFilter,
                      lines,
                    ),
                  )
                }
              />
            )}
            <div className="demo-notice">
              <span className="demo-tag">
                {current?.schedule?.source === "demo" ? "DEMO" : "RENFE"}
              </span>
              <span>
                {current?.schedule?.source === "demo"
                  ? "Horarios ficticios. No los uses para viajar."
                  : "Horario programado · Sin información de retrasos en tiempo real"}
              </span>
            </div>
            {!station ? (
              <div className="empty">
                <span className="empty-icon" aria-hidden="true">
                  ↗
                </span>
                <h3>Una estación. Todo a mano.</h3>
                <p>Elige tu estación para ver cómo será tu panel de salidas.</p>
                <button
                  className="light-button"
                  onClick={() => document.getElementById("station")?.focus()}
                >
                  Elegir mi estación <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : view === "day" ? (
              <Timetable
                stationId={stationId}
                now={now}
                routeFilter={routeFilter}
                onRouteFilterChange={setRouteFilter}
              />
            ) : !current || current.status === "loading" ? (
              <div className="empty" role="status">
                <h3>Preparando tu panel…</h3>
                <p>Cargando las salidas de {station.name}.</p>
              </div>
            ) : current.status === "error" ? (
              <div className="empty" role="alert">
                <h3>No hemos podido cargar las salidas.</h3>
                <p>
                  Tu estación sigue seleccionada. Puedes intentarlo otra vez.
                </p>
                <button
                  className="light-button"
                  onClick={() => setRetry((n) => n + 1)}
                >
                  Reintentar
                </button>
              </div>
            ) : current.schedule?.availability === "unpublished" ? (
              <div className="empty" role="status">
                <h3>Horario aún no publicado para hoy.</h3>
                <p>
                  Consulta las fechas disponibles en Horario completo. No
                  reutilizamos horarios caducados.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="empty" role="status">
                <h3>No hay próximas salidas.</h3>
                <p>
                  {routeFilter.lines.length > 0 || routeFilter.destination
                    ? "No hay trenes que coincidan con estos filtros. Prueba otra línea o destino."
                    : "No hay más trenes en el horario disponible."}
                </p>
                {(routeFilter.lines.length > 0 || routeFilter.destination) && (
                  <button
                    className="light-button"
                    onClick={() => setRouteFilter(emptyRouteFilter)}
                  >
                    Mostrar todos los trenes
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="table-heading" aria-hidden="true">
                  <span>LÍNEA / DESTINO</span>
                  <span>{routeFilter.destination ? "HORARIO" : "SALIDA"}</span>
                  <span>SALE EN</span>
                </div>
                <ol className="departures" aria-label="Próximos trenes">
                  {rows.map((d, index) => {
                    const arrival = arrivalAt(d, routeFilter.destination);
                    return (
                      <li
                        key={d.id}
                        className={index === 0 ? "next-train" : ""}
                      >
                        <div className="destination">
                          <span className={`line line-${d.line.toLowerCase()}`}>
                            {d.line}
                          </span>
                          <div>
                            <strong>{d.destination}</strong>
                            <span>
                              {index === 0 ? "Próximo tren · " : ""}
                              {dayLabel(Date.parse(d.scheduledAt), now)} ·{" "}
                              {current.schedule?.source === "demo"
                                ? "Horario de ejemplo"
                                : "Programado"}
                            </span>
                          </div>
                        </div>
                        <div className="train-times">
                          {arrival && <small>Salida</small>}
                          <time dateTime={d.scheduledAt}>
                            {clockTime(Date.parse(d.scheduledAt))}
                          </time>
                          {arrival && (
                            <div
                              className="train-arrival"
                              aria-label={`Llegada a ${stations.find((s) => s.id === routeFilter.destination)?.name}`}
                            >
                              <small>Llegada</small>
                              <time dateTime={arrival}>
                                {clockTime(Date.parse(arrival))}
                              </time>
                              {arrivalDayLabel(d.scheduledAt, arrival) && (
                                <small className="arrival-day">
                                  {arrivalDayLabel(d.scheduledAt, arrival)}
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="countdown">
                          <strong>
                            {d.minutes === 0 ? "Ahora" : d.minutes}
                          </strong>
                          {d.minutes > 0 && <span> min</span>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
            <div className="board-footer">
              <span>
                <span className="dot" />{" "}
                {view === "next"
                  ? "Cuenta atrás automática"
                  : "Servicios según fecha"}
              </span>
              <span>
                {current?.schedule?.source === "demo"
                  ? "Datos de demostración"
                  : `Datos: ${manifest.validFrom} → ${manifest.validTo}`}
              </span>
            </div>
          </section>
        </div>
        <div className="below-board">
          <span>
            Tu estación se guarda solo en este navegador. Datos: Renfe Operadora
            · CC BY 4.0.
          </span>
          <a
            href="https://www.renfe.com/es/es/cercanias"
            target="_blank"
            rel="noreferrer"
          >
            Consulta los horarios oficiales en Renfe{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
      <footer className="site-footer">
        <strong>mejorcercanias.es</strong>
        <span>Un proyecto independiente. Sin afiliación con Renfe.</span>
        <span>Hecho para ir al grano.</span>
      </footer>
    </div>
  );
}
