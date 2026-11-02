// Service Worker — Super App Sekolah Terpadu (Network-First Navigation & Offline Resilience)
const CACHE_NAME = 'superapp-sekolah-v5';
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
            console.log('[SW] Clearing old cache version:', key);
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
  if (req.method !== 'GET' || url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com') || url.hostname.includes('api.whatsapp.com')) {
    return;
  }

  // Navigasi Halaman HTML: Gunakan Network-First agar pembaruan GitHub / Vercel langsung tampil di HP
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 1. Coba ambil halaman terbaru dari Vercel/Internet dengan batas waktu 3.5 detik
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const networkRes = await fetch(req, { signal: controller.signal });
          clearTimeout(timer);

          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            return networkRes;
          }
        } catch (err) {
          console.warn('[SW] Jaringan lambat/offline, memuat dari cache lokal...', err);
        }

        // 2. Jika offline atau timeout, buka dari cache lokal
        const cached = await caches.match(req) || await caches.match('/') || await caches.match('/index.html');
        if (cached) return cached;

        // 3. Fallback darurat jika benar-benar belum pernah ter-cache
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Super App Offline</title></head><body style="font-family:sans-serif;padding:30px;text-align:center;"><h2>Super App Sekolah Terpadu</h2><p>Aplikasi sedang dalam mode offline. Silakan periksa koneksi internet Anda.</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:8px;background:#1e40af;color:white;border:none;cursor:pointer;">Muat Ulang</button></body></html>',
          { headers: { 'Content-Type': 'text/html;charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // Untuk aset statis (gambar ikon, manifest): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch((err) => {
        console.warn('[SW] Fetch failed for:', req.url, err);
      });

      return cachedRes || fetchPromise;
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
