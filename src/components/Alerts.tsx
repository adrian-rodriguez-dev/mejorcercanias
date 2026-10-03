import { useEffect, useRef, useState } from "react";
import { parseAlerts, alertScope, type Alert } from "../data/alerts";
export function useAlerts() {
  const [state, setState] = useState<{
    status: "loading" | "available" | "unavailable";
    alerts: Alert[];
  }>({ status: "loading", alerts: [] });
  useEffect(() => {
    let alive = true,
      next = 0,
      inflight = false;
    const controller = new AbortController();
    const update = async () => {
      if (
        inflight ||
        Date.now() < next ||
        document.visibilityState === "hidden"
      )
        return;
      next = Date.now() + 60000;
      inflight = true;
      try {
        const url =
          import.meta.env.VITE_ALERTS_URL ||
          "https://gtfsrt.renfe.com/alerts.json";
        const r = await fetch(url, {
          cache: "no-store",
          credentials: "omit",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        });
        if (!r.ok) throw Error("No alerts");
        const alerts = parseAlerts(await r.json(), Date.now());
        if (alive) setState({ status: "available", alerts });
      } catch {
        if (alive) setState({ status: "unavailable", alerts: [] });
      } finally {
        inflight = false;
      }
    };
    void update();
    const timer = setInterval(() => void update(), 60000);
    const visible = () => void update();
    document.addEventListener("visibilitychange", visible);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return state;
}
export function AlertIndicator({
  alerts,
  status,
}: {
  alerts: Alert[];
  status: "loading" | "available" | "unavailable";
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    (button.current && !button.current.disabled
      ? button.current
      : document.getElementById("station")
    )?.focus();
  };
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open)
      dialog.current.showModal();
  }, [open]);
  return (
    <>
      <button
        ref={button}
        className={`alert-indicator${alerts.length ? " has-incidents" : ""}`}
        disabled={!alerts.length}
        aria-label={
          alerts.length
            ? `Incidencias: ${alerts.map((a) => a.text).join(". ")}`
            : status === "available"
              ? "Sin avisos publicados para esta consulta"
              : "Incidencias: consulta no disponible"
        }
        title={alerts[0]?.text}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
          <path d="M9 20a3 3 0 0 0 6 0" />
        </svg>
        {alerts.length > 0 && (
          <span className="alert-count" aria-hidden="true">
            {alerts.length > 99 ? "99+" : alerts.length}
          </span>
        )}
      </button>
      <dialog
        ref={dialog}
        className="alerts-dialog"
        aria-labelledby="alerts-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <header>
          <h2 id="alerts-title">Incidencias y avisos</h2>
          <button className="text-button" onClick={close}>
            Cerrar
          </button>
        </header>
        {!alerts.length && (
          <p>Los avisos ya no están activos o no se pueden verificar.</p>
        )}
        {alerts.map((a) => (
          <article key={a.id}>
            <p>{a.text}</p>
            <p>
              <small>Afectación publicada: {alertScope(a)}</small>
            </p>
            <small>
              {a.periods.length
                ? a.periods
                    .map(
                      (p) =>
                        `${p.start ? new Date(p.start).toLocaleString("es", { timeZone: "Europe/Madrid" }) : "Inicio no indicado"} → ${p.end ? new Date(p.end).toLocaleString("es", { timeZone: "Europe/Madrid" }) : "Sin fin publicado"}`,
                    )
                    .join("; ")
                : "Sin período publicado"}
            </small>
            <p>
              <small>
                Fuente: Renfe · Actualizado{" "}
                {new Date(a.timestamp).toLocaleString("es", {
                  timeZone: "Europe/Madrid",
                })}
              </small>
            </p>
          </article>
        ))}
      </dialog>
    </>
  );
}
