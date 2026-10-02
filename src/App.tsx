import { useEffect, useState } from "react";
import { demoProvider } from "./data/demo";
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
  provider = demoProvider,
  clock = systemClock,
}: {
  provider?: ScheduleProvider;
  clock?: () => number;
}) {
  const [stationId, setStationId] = useState(readStation);
  const [saved, setSaved] = useState(true);
  const [now, setNow] = useState(clock);
  const [retry, setRetry] = useState(0);
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
      ? upcoming(current.schedule!.departures, now)
      : [];
  const choose = (id: string) => {
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
        <section className="intro">
          <p className="eyebrow">TU TRAYECTO DE CADA DÍA</p>
          <h1>
            Tu estación.
            <br />
            <span>De un vistazo.</span>
          </h1>
          <p>Elige una vez. La próxima, tus trenes estarán aquí.</p>
        </section>
        <div className="workspace">
          <aside className="station-card">
            <p className="eyebrow">01 / TU PUNTO DE PARTIDA</p>
            <label htmlFor="station">¿Desde dónde sales?</label>
            <select
              id="station"
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
            <div className="preference" role="status">
              {station ? (
                saved ? (
                  <>✓ Recordaremos esta estación en este dispositivo.</>
                ) : (
                  <>
                    No podemos guardar tu estación. Se mantendrá durante esta
                    visita.
                  </>
                )
              ) : (
                <>Sin registro. Solo tu estación habitual.</>
              )}
            </div>
            <div className="route-art" aria-hidden="true">
              <span>C1</span>
              <i />
              <span>C2</span>
              <i />
              <span>C3</span>
            </div>
            <h2>Abre. Mira. Y en marcha.</h2>
            <p className="aside-copy">
              Tu próximo tren, sin volver a rellenar el mismo formulario.
            </p>
            <div className="network-note">
              BILBAO / BIZKAIA
              <span>Primera versión · 5 estaciones de muestra</span>
            </div>
          </aside>
          <section className="board" aria-labelledby="board-title">
            <div className="board-top">
              <div>
                <p className="eyebrow">02 / PRÓXIMAS SALIDAS</p>
                <h2 id="board-title">
                  {station?.name ?? "Tu próximo tren empieza aquí"}
                </h2>
              </div>
              <div className="clock">
                <strong>{clockTime(now)}</strong>
                <span>Hora de Bilbao</span>
              </div>
            </div>
            <div className="demo-notice">
              <span className="demo-tag">DEMO</span>
              <span>Horarios ficticios. No los uses para viajar.</span>
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
            ) : rows.length === 0 ? (
              <div className="empty" role="status">
                <h3>No hay próximas salidas.</h3>
                <p>No hay más trenes en el horario disponible.</p>
              </div>
            ) : (
              <>
                <div className="table-heading" aria-hidden="true">
                  <span>LÍNEA / DESTINO</span>
                  <span>HORA</span>
                  <span>SALE EN</span>
                </div>
                <ol className="departures" aria-label="Próximos trenes">
                  {rows.map((d, index) => (
                    <li key={d.id} className={index === 0 ? "next-train" : ""}>
                      <div className="destination">
                        <span className={`line line-${d.line.toLowerCase()}`}>
                          {d.line}
                        </span>
                        <div>
                          <strong>{d.destination}</strong>
                          <span>
                            {index === 0 ? "Próximo tren · " : ""}
                            {dayLabel(Date.parse(d.scheduledAt), now)} · Horario
                            de ejemplo
                          </span>
                        </div>
                      </div>
                      <time dateTime={d.scheduledAt}>
                        {clockTime(Date.parse(d.scheduledAt))}
                      </time>
                      <div className="countdown">
                        <strong>{d.minutes === 0 ? "Ahora" : d.minutes}</strong>
                        {d.minutes > 0 && <span> min</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <div className="board-footer">
              <span>
                <span className="dot" /> Cuenta atrás automática
              </span>
              <span>Datos de demostración</span>
            </div>
          </section>
        </div>
        <div className="below-board">
          <span>Tu estación se guarda solo en este navegador.</span>
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
