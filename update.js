// Tự động clear cache và reload trang khi có bản cập nhật mới
const CURRENT_VER = '5.0';
if (localStorage.getItem('yt_app_ver') !== CURRENT_VER) {
    localStorage.setItem('yt_app_ver', CURRENT_VER);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }
    if ('caches' in window) {
        caches.keys().then((names) => {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }
    setTimeout(() => {
        window.location.reload(true);
    }, 500);
}
