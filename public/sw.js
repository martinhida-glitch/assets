const CACHE = "altoque-premium-v4-push-20260804";
const PUBLIC_CORE = ["/", "/login", "/register", "/manifest.webmanifest", "/altoque-logo.svg", "/icon-192.png"];
const CACHEABLE_PATHS = new Set(PUBLIC_CORE);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PUBLIC_CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search || !CACHEABLE_PATHS.has(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    }),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "Tenés una novedad en ALTOQUE." };
  }

  const title = data.title || "ALTOQUE";
  const options = {
    body: data.body || "Tenés una novedad en ALTOQUE.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "altoque-notification",
    renotify: true,
    vibrate: [120, 60, 120],
    data: {
      href: data.href || "/app/notifications",
      notificationId: data.notificationId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href || "/app/notifications";
  const target = new URL(href, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin) {
          if ("navigate" in client) await client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
