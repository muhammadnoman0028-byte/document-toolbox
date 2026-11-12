const CACHE_NAME = "docxhub-app-v3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/styles/main.css",
  "./src/scripts/main.js",
  "./src/pages/home.html",
  "./src/pages/docx-to-pdf.html",
  "./src/pages/pdf-to-docx.html",
  "./src/pages/image-compressor.html",
  "./src/pages/pdf-compressor.html",
  "./src/pages/docx-compressor.html",
  "./public/icons/icon.svg",
  "./public/icons/icon-192.png",
  "./public/icons/icon-512.png",
  "./public/icons/icon-512-maskable.png",
  "./public/libs/pdf-lib.min.js",
  "./public/libs/jszip.min.js",
  "./public/libs/mammoth.browser.min.js",
  "./public/libs/html2pdf.bundle.min.js",
  "./public/libs/pdf.min.js",
  "./public/libs/pdf.worker.min.js",
  "./public/libs/docx.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
