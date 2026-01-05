/* sw.js - TechFilled monorepo service worker
   Goal: avoid stale cached Hub/JS that can break monetization links.
*/

const CACHE_VERSION = "tf-v20260105";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).catch(() => null));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k.startsWith("tf-v20260105") ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

// Network-first for HTML; cache for assets as a fallback.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle our GitHub Pages path
  if (!url.pathname.startsWith("/techfilled/")) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (e) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
      return fresh;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
