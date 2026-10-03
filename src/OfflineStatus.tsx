import { useEffect, useState } from "react";
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
export function OfflineStatus({
  validTo,
  fallback = false,
}: {
  validTo: string;
  fallback?: boolean;
}) {
  const online = useOnline();
  return !online || fallback ? (
    <p className="offline-status" role="status">
      Sin conexión · Horarios guardados hasta{" "}
      {validTo.split("-").reverse().join("/")}
    </p>
  ) : null;
}
