// Service Worker — Super App Sekolah Terpadu (Ultra-Resilient & Instant Launch)
const CACHE_NAME = 'superapp-sekolah-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching core assets individually...');
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Optional pre-cache miss for:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan sentuh request non-GET atau request ke Google Apps Script / WhatsApp
  if (req.method !== 'GET' || url.hostname.includes('script.google.com') || url.hostname.includes('api.whatsapp.com')) {
    return;
  }

  // Navigasi halaman (HTML document): Gunakan Cache-First + Background Revalidate
  // agar PWA di HP TERBUKA INSTAN DALAM <50ms tanpa menunggu jaringan atau layar putih!
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req) || await caches.match('/') || await caches.match('/index.html');
        
        // Background fetch untuk update cache terbaru jika online
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch((err) => {
          console.warn('[SW] Background revalidate offline/failed:', err);
          return null;
        });

        // Jika cache sudah ada di HP, buka aplikasi seketika!
        if (cached) {
          return cached;
        }

        // Jika baru pertama kali diinstal/dibuka, tunggu jaringan
        const res = await fetchPromise;
        if (res) return res;

        // Fallback jika benar-benar offline tanpa cache sama sekali
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Super App Offline</title></head><body style="font-family:sans-serif;padding:30px;text-align:center;"><h2>Super App Sekolah</h2><p>Sedang menghubungkan ke server...</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:8px;background:#1e40af;color:white;border:none;">Muat Ulang</button></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return;
  }

  // Untuk aset lainnya (gambar, ikon, CSS, JS), gunakan Cache-First dengan Network Fallback
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        return cachedRes;
      }
      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch((err) => {
        console.warn('[SW] Fetch failed for:', req.url, err);
      });
    })
  );
});

// Listener notifikasi pengingat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
