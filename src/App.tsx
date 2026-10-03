import { OfflineStatus, useOnline } from "./OfflineStatus";
import { EditableSelect } from "./EditableSelect";
import { Onboarding } from "./Onboarding";
import { networks, lineStyle } from "./data/networks";
import { readNetwork, saveNetwork } from "./preference";
import { useAlerts, AlertIndicator } from "./Alerts";
import { relevantAlerts, alertPriority } from "./data/alerts";
import {
  checkSnapshot,
  subscribeSnapshot,
  snapshotRevision,
  refreshError,
} from "./data/snapshot";
import { InstallPrompt } from "./InstallPrompt";
import { UpdateNotice } from "./UpdateNotice";
import { arrivalAt, arrivalDayLabel } from "./data/arrival";
import { useEffect, useState, useSyncExternalStore } from "react";
import { renfeProvider, manifest } from "./data/renfe";
import { Timetable } from "./Timetable";
import { LineBar } from "./LineBar";
import {
  emptyRouteFilter,
  filterRoutes,
  type RouteFilter,
} from "./data/route-filters";
import { stations } from "./data/stations";
import { clockTime, dayLabel, localDay, upcoming } from "./data/time";
import type {
  Departure,
  ScheduleProvider,
  StationSchedule,
} from "./data/types";
import {
  readJourney,
  saveJourney,
  linesForStations,
  normalizeJourney,
} from "./preference";

type LoadState = {
  version?: string;
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
  useSyncExternalStore(subscribeSnapshot, snapshotRevision);
  const version = manifest.version;
  const online = useOnline();
  const [installTarget, setInstallTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const [networkId, setNetworkId] = useState(readNetwork);
  const [editingNetwork, setEditingNetwork] = useState(false);

  const [initialJourney] = useState(readJourney);
  const [stationId, setStationId] = useState(initialJourney.stationId);
  const [setupComplete, setSetupComplete] = useState(() =>
    stations.some(
      (s) => s.id === initialJourney.stationId && s.network === networkId,
    ),
  );
  const needsSetup =
    !networks().some((n) => n.id === networkId) ||
    !setupComplete ||
    (stationId !== "" &&
      !stations.some((s) => s.id === stationId && s.network === networkId));
  const [saved, setSaved] = useState(true);
  const [now, setNow] = useState(clock);
  const [retry, setRetry] = useState(0);
  const alertState = useAlerts();
  const [dayContext, setDayContext] = useState<{
    date: string;
    departures: Departure[];
  }>({ date: localDay(clock()), departures: [] });
  const [view, setView] = useState<"next" | "day">("next");
  const [routeFilter, storeRouteFilter] = useState<RouteFilter>(() => ({
    destination: initialJourney.destination,
    lines: initialJourney.lines,
  }));
  const setRouteFilter = (filter: RouteFilter, origin = stationId) => {
    const { destination, lines } = normalizeJourney({
      stationId: origin,
      ...filter,
    });
    storeRouteFilter({ destination, lines });
  };
  useEffect(() => {
    if (stationId && !needsSetup)
      setSaved(
        saveJourney({ stationId, ...routeFilter }) && saveNetwork(networkId),
      );
  }, [stationId, routeFilter, needsSetup, networkId]);
  const selectedNetwork = networks().find((n) => n.id === networkId);
  const networkStations = stations.filter((s) => s.network === networkId);
  const availableLines = linesForStations(stationId, routeFilter.destination);
  const [load, setLoad] = useState<LoadState>({
    stationId: "",
    status: "loading",
  });
  const day = localDay(now);
  useEffect(() => {
    if (provider !== renfeProvider) return;
    const check = () => {
      if (document.visibilityState !== "hidden") void checkSnapshot(stationId);
    };
    check();
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, 60000);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [stationId, provider]);
  const station = stations.find(
    (s) => s.id === stationId && s.network === networkId,
  );

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
    if (!stationId || needsSetup) return;
    const controller = new AbortController();
    setLoad({ version, stationId, status: "loading" });
    provider
      .load(stationId, clock(), controller.signal)
      .then((schedule) => {
        if (controller.signal.aborted) return;
        if (schedule.stationId !== stationId)
          throw new Error("Estación incorrecta");
        setLoad({ version, stationId, status: "ready", schedule });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoad({ version, stationId, status: "error" });
      });
    return () => controller.abort();
  }, [stationId, day, retry, provider, clock, version, needsSetup, online]);

  const current =
    load.stationId === stationId && load.version === version ? load : undefined;
  const rows =
    current?.status === "ready"
      ? upcoming(filterRoutes(current.schedule!.departures, routeFilter), now)
      : [];
  const alerts = relevantAlerts(
    alertState.alerts,
    stationId,
    routeFilter,
    view === "day" ? dayContext.date : day,
    view === "day"
      ? dayContext.departures
      : (current?.schedule?.departures ?? []),
    now,
  );
  const choose = (id: string) => {
    setRouteFilter(emptyRouteFilter);
    setStationId(id);
    if (!id)
      setSaved(saveJourney({ stationId: "", destination: "", lines: [] }));
    setNow(clock());
  };

  return (
    <div className={`app${station ? " has-station" : ""}`}>
      <header className="masthead">
        <a href="./" className="brand" aria-label="mejorcercanías, inicio">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <span>
            mejor<span className="brand-light">cercanías</span>
            <small>Tu tren en menos de 5 segundos</small>
          </span>
        </a>
        <div className="masthead-actions">
          <button
            className="network-switch"
            aria-label="Cambiar núcleo"
            onClick={() => setEditingNetwork(true)}
          >
            <small>Cercanías</small>
            {selectedNetwork?.name ?? "Núcleo"}{" "}
            <span aria-hidden="true">⌄</span>
          </button>
          <AlertIndicator
            alerts={[...alerts].sort(
              (a, b) => alertPriority(a) - alertPriority(b),
            )}
            status={alertState.status}
          />
        </div>
      </header>
      <UpdateNotice />
      <div className="install-slot" ref={setInstallTarget} />
      <main>
        <div className="workspace">
          {needsSetup || editingNetwork ? (
            <Onboarding
              onCancel={
                !needsSetup ? () => setEditingNetwork(false) : undefined
              }
              onComplete={(network, origin, destination) => {
                setSetupComplete(true);
                setNetworkId(network);
                setStationId(origin);
                storeRouteFilter({ destination, lines: [] });
                setView("next");
                setEditingNetwork(false);
                setNow(clock());
                setSaved(
                  saveJourney({ stationId: origin, destination, lines: [] }) &&
                    saveNetwork(network),
                );
              }}
            />
          ) : (
            <section className="board" aria-label="Panel de trenes">
              <div className="journey-header">
                <label className="origin-field" htmlFor="station">
                  <span>Origen</span>
                  <EditableSelect
                    id="station"
                    label="¿Desde dónde sales?"
                    value={stationId}
                    options={networkStations}
                    onChange={choose}
                    placeholder="Elige tu estación"
                    clearLabel="Borrar origen"
                  />
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
                    setRouteFilter(
                      { ...routeFilter, destination: stationId },
                      nextOrigin,
                    );
                    setStationId(nextOrigin);
                    setNow(clock());
                  }}
                >
                  ⇅
                </button>
                <label className="destination-field" htmlFor="destination">
                  <span>Destino · opcional</span>
                  <EditableSelect
                    id="destination"
                    label="Destino directo"
                    value={routeFilter.destination}
                    options={networkStations.filter((s) => s.id !== stationId)}
                    disabled={!stationId}
                    onChange={(destination) =>
                      setRouteFilter({ ...routeFilter, destination })
                    }
                    placeholder="Todos los destinos"
                    clearLabel="Borrar destino"
                  />
                </label>
              </div>
              {!saved && (
                <p className="storage-warning" role="status">
                  No podemos guardar tu selección. Se mantendrá durante esta
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
                  networkId={networkId}
                  value={routeFilter.lines}
                  available={availableLines}
                  onChange={(lines) =>
                    setRouteFilter({ ...routeFilter, lines })
                  }
                />
              )}

              {station &&
                routeFilter.destination &&
                !stations.some((s) => s.id === routeFilter.destination) && (
                  <p role="status">
                    El destino ya no está en los datos actuales. Elige otro
                    destino.
                  </p>
                )}
              {day > (selectedNetwork?.validTo ?? manifest.validTo) && (
                <p className="storage-warning" role="status">
                  Horario caducado · Actualización pendiente
                </p>
              )}
              {station && view === "next" && (
                <OfflineStatus
                  validTo={selectedNetwork?.validTo ?? manifest.validTo}
                  fallback={current?.schedule?.offline}
                />
              )}
              {!station ? (
                <div className="empty">
                  <span className="empty-icon" aria-hidden="true">
                    ↗
                  </span>
                  <h3>
                    {stationId
                      ? "Tu estación ya no está en los datos actuales. Elige otra."
                      : "Una estación. Todo a mano."}
                  </h3>
                  <p>
                    Elige tu estación para ver cómo será tu panel de salidas.
                  </p>
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
                  onScheduleChange={setDayContext}
                />
              ) : !current || current.status === "loading" ? (
                <div className="empty" role="status">
                  <h3>Preparando tu panel…</h3>
                  <p>Cargando las salidas de {station.name}.</p>
                </div>
              ) : current.status === "error" ? (
                <div className="empty" role="alert">
                  <h3>
                    {online
                      ? "No hemos podido cargar las salidas."
                      : "Esta estación no está guardada."}
                  </h3>
                  <p>
                    {online
                      ? "Tu estación sigue seleccionada. Puedes intentarlo otra vez."
                      : "Conéctate para descargar su horario y consultarlo después sin conexión."}
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
                  {(routeFilter.lines.length > 0 ||
                    routeFilter.destination) && (
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
                            <span
                              style={lineStyle(networkId, d.line)}
                              className={`line line-${d.line.toLowerCase()}`}
                            >
                              {d.line}
                            </span>
                            <div>
                              <strong>{d.destination}</strong>
                              <div className="train-times">
                                <div className="train-departure">
                                  <small>Salida</small>
                                  <time dateTime={d.scheduledAt}>
                                    {clockTime(Date.parse(d.scheduledAt))}
                                  </time>
                                  {localDay(Date.parse(d.scheduledAt)) !==
                                    day && (
                                    <small className="departure-day">
                                      {dayLabel(Date.parse(d.scheduledAt), now)}
                                    </small>
                                  )}
                                </div>
                                {arrival && (
                                  <div
                                    className="train-arrival"
                                    aria-label={`Llegada a ${stations.find((s) => s.id === routeFilter.destination)?.name}`}
                                  >
                                    <small>Llegada</small>
                                    <time dateTime={arrival}>
                                      {clockTime(Date.parse(arrival))}
                                    </time>
                                    {arrivalDayLabel(
                                      d.scheduledAt,
                                      arrival,
                                    ) && (
                                      <small className="arrival-day">
                                        {arrivalDayLabel(
                                          d.scheduledAt,
                                          arrival,
                                        )}
                                      </small>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="countdown">
                            <strong>
                              {Date.parse(d.scheduledAt) - now >=
                              60 * 60 * 1000 ? (
                                <time dateTime={d.scheduledAt}>
                                  {clockTime(Date.parse(d.scheduledAt))}
                                </time>
                              ) : d.minutes === 0 ? (
                                "Ahora"
                              ) : (
                                d.minutes
                              )}
                            </strong>
                            {d.minutes > 0 &&
                              Date.parse(d.scheduledAt) - now <
                                60 * 60 * 1000 && <span> min</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
              <details className="data-status">
                <summary>Datos y actualización</summary>
                <p>
                  Última comprobación de Renfe:{" "}
                  {manifest.checkedAt
                    ? new Date(manifest.checkedAt).toLocaleString("es", {
                        timeZone: "Europe/Madrid",
                      })
                    : "No registrada"}
                  .{" "}
                  {refreshError
                    ? "No se pudo comprobar una nueva versión; se conserva la cargada."
                    : "El móvil recibe JSON compactos, nunca el GTFS completo."}
                </p>
              </details>
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
                    : `Datos: ${selectedNetwork?.validFrom ?? manifest.validFrom} → ${selectedNetwork?.validTo ?? manifest.validTo}`}
                </span>
              </div>
            </section>
          )}
        </div>
        <InstallPrompt headerTarget={installTarget} />
        <div className="below-board">
          <span className="schedule-provenance">
            {current?.schedule?.source === "demo"
              ? "Horarios ficticios. No los uses para viajar."
              : "Horario programado · Sin información de retrasos en tiempo real"}
          </span>
          <span>
            Tu trayecto y líneas se guardan solo en este navegador. Datos: Renfe
            Operadora · CC BY 4.0.
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
