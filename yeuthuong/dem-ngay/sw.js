self.addEventListener('install', (event) => {
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => caches.delete(key)));
        }).then(() => {
            return self.clients.claim();
        })
    );
});
self.addEventListener('fetch', (event) => {
    // Không dùng cache nữa, luôn fetch qua mạng
});
