import { useEffect, useState } from "react";
import { updateApplication } from "../platform/offline";

export function UpdateNotice() {
  const [version, setVersion] = useState("");
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (!import.meta.env.PROD && import.meta.env.MODE !== "e2e") return;
    let next = 0,
      busy = false,
      stopped = false;
    const controller = new AbortController();
    const check = async () => {
      if (
        stopped ||
        busy ||
        document.visibilityState === "hidden" ||
        Date.now() < next
      )
        return;
      busy = true;
      next = Date.now() + 60000;
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}app-version.json`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(10000),
            ]),
          },
        );
        if (!response.ok) return;
        const data = await response.json();
        if (
          !stopped &&
          typeof data.version === "string" &&
          /^[a-zA-Z0-9-]{1,80}$/.test(data.version)
        ) {
          setVersion(
            data.version === import.meta.env.VITE_APP_VERSION
              ? ""
              : data.version,
          );
        }
      } catch {
        /* Offline or a partial deployment must not interrupt a journey. */
      } finally {
        busy = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 300000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("online", check);
    return () => {
      stopped = true;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
    };
  }, []);
  return version ? (
    <div className="update-notice" role="status">
      <span>Nueva versión disponible</span>
      <button
        disabled={updating}
        onClick={() => {
          setUpdating(true);
          void updateApplication();
        }}
      >
        {updating ? "Actualizando…" : "Actualizar"}
      </button>
    </div>
  ) : null;
}
