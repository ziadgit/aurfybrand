/* Aurfy Signal Studio — app-shell service worker.
 * Only same-origin GET requests are cached. Signal data is never fetched from a
 * server in this prototype, so nothing here invents fresh signals offline.
 */
const VERSION = "aurfy-shell-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/examples/marlow-fen.jpg",
  "/examples/halcyon-swim.jpg",
  "/examples/fernway-grocers.jpg",
  "/logos/marlow-fen.svg",
  "/logos/halcyon-swim.svg",
  "/logos/fernway-grocers.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(SHELL_URLS.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const isAsset = (url) =>
  url.pathname.startsWith("/assets/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/examples/") ||
  url.pathname.startsWith("/logos/") ||
  url.pathname === "/manifest.webmanifest";

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put("/index.html", fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match("/index.html")) ||
            (await cache.match("/")) ||
            new Response(
              "<!doctype html><meta charset=utf-8><title>Aurfy Studio is offline</title><body style=\"font-family:system-ui;padding:2rem;background:#F8F5EE;color:#191830\"><h1>Aurfy Studio is offline</h1><p>The app shell was not cached yet. Reconnect once to load the studio.</p></body>",
              { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 200 },
            )
          );
        }
      })(),
    );
    return;
  }

  if (!isAsset(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => undefined);
      const response = cached || (await network);
      return response || new Response("Offline", { status: 503 });
    })(),
  );
});
