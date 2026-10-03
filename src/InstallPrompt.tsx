import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
export function InstallPrompt({
  ready,
  headerTarget,
}: {
  ready: boolean;
  headerTarget: HTMLElement | null;
}) {
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
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const openHelp = () => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setHelp(true);
  };
  useEffect(() => {
    if (help) dialog.current?.showModal();
  }, [help]);
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
      openHelp();
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
      openHelp();
    } finally {
      setBusy(false);
    }
  };
  const closeHelp = () => {
    dialog.current?.close();
    setHelp(false);
    (returnFocus.current ?? helpButton.current)?.focus();
  };
  if (installed) return null;
  return (
    <section className="install-area" aria-label="Instalación de la app">
      {headerTarget &&
        createPortal(
          <button
            className="header-install"
            aria-label="Instalar app"
            title="Instalar app"
            disabled={busy}
            onClick={install}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 3H5v18h14v-6M14 2v11m-4-4 4 4 4-4M10 18h4" />
            </svg>
            <span>Instalar</span>
          </button>,
          headerTarget,
        )}
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
        onClick={openHelp}
        aria-expanded={help}
      >
        Cómo instalar la app
      </button>
      {help && (
        <dialog
          ref={dialog}
          className="install-help"
          aria-label="Cómo instalar la app"
          onCancel={(e) => {
            e.preventDefault();
            closeHelp();
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
        </dialog>
      )}
    </section>
  );
}
