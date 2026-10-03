export function registerOffline() {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })
      .catch(() => {});
  }
}

export async function updateApplication() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await Promise.race([
          registration.update().catch(() => {}),
          new Promise((r) => setTimeout(r, 5000)),
        ]);
        if (registration.waiting) {
          await new Promise<void>((resolve) => {
            const finish = () => {
              clearTimeout(timer);
              navigator.serviceWorker.removeEventListener(
                "controllerchange",
                finish,
              );
              resolve();
            };
            const timer = setTimeout(finish, 5000);
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              finish,
            );
            registration.waiting!.postMessage({ type: "ACTIVATE_UPDATE" });
          });
        }
      }
    } catch {
      /* Reload remains usable if SW support is unavailable. */
    }
  }
  window.location.reload();
}
