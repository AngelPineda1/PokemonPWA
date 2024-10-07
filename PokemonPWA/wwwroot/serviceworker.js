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
  event.respondWith(cacheFirst(event.request));
});


async function cacheFirst(request) {
  try {

    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request);
    }

    let cache = await caches.open(cacheName);
    let response = await cache.match(request);

    if (response) {
      return response;
    } else {
      let respuesta = await fetch(request);
      if (respuesta && respuesta.ok) {
        cache.put(request, respuesta.clone());
      }
      return respuesta;
    }
  } catch (error) {
    console.error("Error in getFromCache:", error);

    return new Response("Network error", { status: 500 });
  }
}

async function cacheOnly(request) {
  try {

    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request);
    }

    let cache = await caches.open(cacheName);
    let response = await cache.match(request);

    if (response) {
      return response;
    } else {
      return new Response("No se econtro en cahce");
    }
  } catch (error) {
    console.error("Error in getFromCache:", error);

    return new Response("Network error", { status: 500 });
  }
}


async function networkFirst(request) {
  let cache = await caches.open(cacheName);

  try {

    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request);
    }
    let respuesta = await fetch(request);
    cache.put(request, respuesta.clone());
    return respuesta;

  } catch (error) {
    let response = await cache.match(request);

    if (response) {
      return response;
    } else {

      console.error(error);
    }
  }
}

async function staleWhileRevalidate(request) {
  try {

    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request);
    }
    let cache = await caches.open(cacheName);
    let response = await cache.match(request);

    let r = fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    })
    return response || r;
  } catch (error) {
    console.error(error);
  }  
}

let channel = new BroadcastChannel("refreshChannel");

async function staleThenRevalidate(request) {
  try {

    if (request.url.startsWith('chrome-extension://')) {
      return fetch(request);
    }
    let cache = await caches.open(cacheName);
    let response = await cache.match(request);
    if (response) {

      fetch(request).then(async (res) => {
        let networkResponse = await fetch(request);
        let cacheData = await response.text();
        let networkData = await networkResponse.clone().text();

        if (cacheData != networkData) {
          cache.put(request, networkResponse.clone());

          channel.postMessage({
            Url: request.url,Data:networkData
          });


        }
        

      });

      return response.clone();
    } else {
      return networkFirst(request);
    }

    let r = fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    })
    return response || r;
  } catch (error) {
    console.error(error);
  }
}
