// service-worker.js

let urls = ["/",
  "/index", "/datos",
  "/estilos.css", "/imgs/icono.png",
  "/imgs/icono-128.png",
  "/imgs/icono-512.png",
  "/imgs/pokemon.png"


];

let cacheName = "pokemonCacheV1";
async function precache() {
  let cache = await caches.open(cacheName);
  await cache.addAll(urls);
}

//precache
self.addEventListener("install", function (e) {
  e.waitUntil(precache());
});

self.addEventListener('fetch', event => {
  event.respondWith(getFromCache(event.request));
});


async function getFromCache(request) {
  try {
    // Check if the URL uses the chrome-extension scheme or other unsupported schemes
    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request); // Simply fetch the request but don't cache it
    }

    let cache = await caches.open(cacheName);
    let response = await cache.match(request);

    if (response) {
      return response; // Return the cached response if it exists
    } else {
      let respuesta = await fetch(request);
      if (respuesta && respuesta.ok) {
        cache.put(request, respuesta.clone()); // Cache the fetched response
      }
      return respuesta;
    }
  } catch (error) {
    console.error("Error in getFromCache:", error);
    // Optionally return a fallback response
    return new Response("Network error", { status: 500 });
  }
}

