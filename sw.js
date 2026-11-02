const CACHE_NAME = 'anak-hebat-v3';
const ASSETS = [
  './manifest.json',
  './icon.svg',
  './logo-pemkot.svg',
  './logo-sekolah.svg'
];

// 1. Install Event: simpan aset dasar & langsung aktif tanpa menunggu tab ditutup
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: bersihkan cache versi lama & langsung klaim semua client
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event:
// - Untuk Halaman Web (index.html / root / navigation): STRATEGI NETWORK-FIRST!
//   Selalu ambil versi terbaru dari server jika online. Jika offline, baru pakai cache!
//   Dengan cara ini, setiap kali ada update aplikasi, pengguna LANGSUNG mendapatkan versi terbaru
//   tanpa harus reset data atau bersihkan cache browser!
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Jangan sentuh request ke Google Apps Script atau domain eksternal
  if (url.origin !== self.origin || e.request.url.includes('script.google.com')) {
    return;
  }

  // Khusus dokumen HTML / navigasi utama: NETWORK FIRST!
  const isHtml = e.request.mode === 'navigate' || 
                 e.request.destination === 'document' || 
                 url.pathname.endsWith('index.html') || 
                 url.pathname === '/' || 
                 url.pathname === '';

  if (isHtml) {
    e.respondWith(
      fetch(e.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(e.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Untuk aset statis (gambar, manifest, dll): Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then((cachedRes) => {
      const fetchPromise = fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      }).catch(() => {});

      return cachedRes || fetchPromise;
    })
  );
});

// Tangani klik pada notifikasi di bilah notifikasi HP Android
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
        return clients.openWindow('./');
      }
    })
  );
});

// Tangani event push (jika ada pesan push di latar belakang)
self.addEventListener('push', (event) => {
  let data = { title: '7 Kebiasaan Anak Hebat', body: 'Waktunya cek pembiasaan karakter hari ini!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.svg',
      badge: './icon.svg',
      vibrate: [200, 100, 200]
    })
  );
});
