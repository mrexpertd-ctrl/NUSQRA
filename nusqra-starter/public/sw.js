const CACHE_NAME = 'nusqra-assets-v3';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('nusqra-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function offlinePage() {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NUSQRA</title>
    <body style="background:#fcfaf5;color:#103e31;font:16px system-ui;padding:24px">
    <h1>NUSQRA</h1><p>Reconnect to the internet and try again.</p>
    <p lang="ar" dir="rtl">أعد الاتصال بالإنترنت وحاول مرة أخرى.</p>
    <a href="/">Try again / حاول مرة أخرى</a></body></html>`, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // A cached document may reference bundles removed by a newer deployment.
    event.respondWith(fetch(request, { cache: 'no-cache' }).catch(offlinePage));
    return;
  }

  if (!url.pathname.startsWith('/assets/') ||
      !['script', 'style', 'image', 'font'].includes(request.destination)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME).catch(() => null);
    const cached = await cache?.match(request).catch(() => undefined);
    if (cached) return cached;
    const response = await fetch(request);
    const type = response.headers.get('Content-Type') || '';
    if (cache && response.ok && !type.includes('text/html')) {
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  })());
});
