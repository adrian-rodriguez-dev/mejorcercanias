import { useEffect, useRef, useState } from "react";
import { parseAlerts, alertScope, type Alert } from "./data/alerts";
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
export function AlertIndicator({ alerts }: { alerts: Alert[] }) {
  const dialog = useRef<HTMLDialogElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    (button.current ?? document.getElementById("station"))?.focus();
  };
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open)
      dialog.current.showModal();
  }, [open]);
  if (!alerts.length && !open) return null;
  return (
    <>
      {alerts.length > 0 && (
        <button
          ref={button}
          className="alert-indicator"
          aria-label={`Incidencias: ${alerts.map((a) => a.text).join(". ")}`}
          title={alerts[0].text}
          onClick={() => setOpen(true)}
        >
          ⚠ {alerts.length === 1 ? "Aviso" : `${alerts.length} avisos`}
        </button>
      )}
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
