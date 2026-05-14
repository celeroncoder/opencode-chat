const CACHE = "opencode-chat-v1";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        const deletions = [];
        for (const key of keys) {
          if (key !== CACHE) {
            deletions.push(caches.delete(key));
          }
        }
        return Promise.all(deletions);
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).catch(() =>
      caches.match(req).then((cached) => cached || caches.match("/")),
    ),
  );
});
