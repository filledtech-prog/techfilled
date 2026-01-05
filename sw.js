/* sw.js — TechFilled monorepo service worker (Hub)
   Version: 20260106
   Purpose: prevent stale caching while NEVER intercepting external affiliate links.
*/
const CACHE_VERSION = "tf-hub-20260106";
const CACHE_NAME = `${CACHE_VERSION}-static`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (!k.startsWith(CACHE_VERSION)) return caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 🚫 Never handle cross-origin requests (Gumroad, affiliate networks)
  if (url.origin !== self.location.origin) return;

  // Only handle our GitHub Pages scope
  if (!url.pathname.startsWith("/techfilled/")) return;

  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const fresh = await fetch(req);
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
    } catch (_) {}
    return fresh;
  })());
});
