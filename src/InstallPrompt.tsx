import { useEffect, useRef, useState } from "react";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const KEY = "mejorcercanias.install-dismissed-until.v1";
const standalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
const ios = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export function InstallPrompt({ ready }: { ready: boolean }) {
  const [installed, setInstalled] = useState(standalone);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);
  const [until, setUntil] = useState(() => {
    try {
      return Number(localStorage.getItem(KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const [now, setNow] = useState(Date.now);
  const pending = useRef<InstallEvent | null>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      pending.current = event as InstallEvent;
      setAvailable(true);
    };
    const done = () => {
      setInstalled(true);
      pending.current = null;
      setAvailable(false);
      setHelp(false);
    };
    const mode = window.matchMedia?.("(display-mode: standalone)");
    const modeChange = () => setInstalled(standalone());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    mode?.addEventListener("change", modeChange);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", done);
      mode?.removeEventListener("change", modeChange);
    };
  }, []);
  const dismiss = () => {
    const next = Date.now() + 30 * 86400000;
    setUntil(next);
    try {
      localStorage.setItem(KEY, String(next));
    } catch {
      /* Session state still suppresses the invitation. */
    }
  };
  const install = async () => {
    if (busy) return;
    const event = pending.current;
    if (!event) {
      setHelp(true);
      return;
    }
    pending.current = null;
    setAvailable(false);
    setBusy(true);
    try {
      await event.prompt();
      const result = await event.userChoice;
      if (result.outcome === "dismissed") dismiss();
      else setUntil(Infinity);
    } catch {
      setHelp(true);
    } finally {
      setBusy(false);
    }
  };
  const closeHelp = () => {
    setHelp(false);
    helpButton.current?.focus();
  };
  if (installed) return null;
  return (
    <section className="install-area" aria-label="Instalación de la app">
      {ready && now >= until && (available || ios()) && (
        <div className="install-invitation">
          <span>Tu tren, desde la pantalla de inicio</span>
          <button className="light-button" disabled={busy} onClick={install}>
            Instalar
          </button>
          <button className="text-button" onClick={dismiss}>
            Ahora no
          </button>
        </div>
      )}
      <button
        className="text-button"
        ref={helpButton}
        onClick={() => setHelp(!help)}
        aria-expanded={help}
      >
        Cómo instalar la app
      </button>
      {help && (
        <div
          className="install-help"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeHelp();
          }}
        >
          <p>
            {ios()
              ? "En iPhone o iPad, abre Compartir y elige Añadir a pantalla de inicio. Si no aparece, abre esta página en Safari."
              : "En el menú de tu navegador busca Instalar aplicación o Añadir a pantalla de inicio. Si estás dentro de otra app, abre esta página en Chrome, Edge o Safari."}
          </p>
          <p>Necesitas conexión para consultar horarios.</p>
          {available && (
            <button className="light-button" disabled={busy} onClick={install}>
              Instalar
            </button>
          )}
          <button className="text-button" onClick={closeHelp}>
            Cerrar ayuda
          </button>
        </div>
      )}
    </section>
  );
}
