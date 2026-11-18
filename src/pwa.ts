export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  // The dev server must never serve a cached shell over fresh code, so the
  // service worker is production-only. The published build is installable.
  if (!import.meta.env.PROD) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installation support varies by browser and embedding context; the app
      // stays fully usable without a service worker.
    });
  });
}
