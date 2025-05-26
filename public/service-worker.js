importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "document" ||
      request.destination === "script" ||
      request.destination === "style",
    new workbox.strategies.NetworkFirst({ cacheName: "app-shell" })
  );

  workbox.routing.registerRoute(
    ({ request, url }) =>
      url.origin === "https://story-api.dicoding.dev" &&
      url.pathname.startsWith("/images/stories/") &&
      request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "story-images",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
      fetchOptions: {
        mode: "no-cors",
      },
    })
  );

  workbox.routing.registerRoute(
    new RegExp("https://story-api.dicoding.dev/v1"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 3,
    })
  );
}

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const { title, options } = data;

  event.waitUntil(
    self.registration.getNotifications().then((notifications) => {
      const alreadyShown = notifications.find(
        (n) => n.title === title && n.body === options?.body
      );
      if (!alreadyShown) {
        return self.registration.showNotification(title, options);
      }
    })
  );
});
