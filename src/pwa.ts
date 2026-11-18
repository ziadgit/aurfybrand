export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // The Enter live preview is served by Vite's dev server, which loads
  // /src/main.tsx directly. Skip the worker there so hot updates never compete
  // with a cached shell. Every compiled build uses hashed /assets/* entry
  // points, including Enter's development-mode build, and does register.
  const servedByDevServer = Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]")).some((script) =>
    script.src.includes("/src/main.tsx"),
  );
  if (servedByDevServer) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installation support varies by browser and embedding context; the app
      // stays fully usable without a service worker.
    });
  });
}
