'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "3c6d43a108665d09d1bf1ecc712ca636",
"splash/img/light-2x.png": "1ca9a09a8a4b8207f88bac71f2694d66",
"splash/img/light-3x.png": "d994f89b575db592de230bc094b291fe",
"splash/img/dark-3x.png": "d994f89b575db592de230bc094b291fe",
"splash/img/dark-2x.png": "1ca9a09a8a4b8207f88bac71f2694d66",
"splash/img/dark-1x.png": "ceb89b5921893f92e04f9a61a71d1b9a",
"splash/img/light-1x.png": "ceb89b5921893f92e04f9a61a71d1b9a",
"splash/style.css": "d21ce14b0185114da9adc8a75bcce75d",
"index.html": "fc2b5ca93d345fdaa739db26afd3cd2a",
"/": "fc2b5ca93d345fdaa739db26afd3cd2a",
"main.dart.js": "dc85ba03c21a7a6c4832594ea15d81e1",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "aa2ed6e7ef1f8e55e888cc9ceb1bda35",
"assets/AssetManifest.json": "119c9ab69b797443b6c983ff3f4e61f8",
"assets/NOTICES": "5f15ca876f8c08bc8980fb8dddb84946",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/Yomogi-Regular.ttf": "071b309fd2b91ad739a82224c547b950",
"assets/assets/images/blocnotes.png": "ca143923fc425d3913cd1b0a6f443e06",
"assets/assets/images/assistFermo.png": "cb848b5b474adcba4edf0ccc094c55e3",
"assets/assets/images/players_with_logo.png": "64f1990a0229b1783c2587d0b52d7f85",
"assets/assets/images/striker.png": "65e4cdab751fe64f0524bf3dd6d7ffb0",
"assets/assets/images/golfatto.png": "eee1b0a025be36d71151836fb371ede2",
"assets/assets/images/players.png": "792fdc1a148dc9c217cc1bdb18679daf",
"assets/assets/images/wings.png": "1c6e64373ce78dbca512afbb39dbb918",
"assets/assets/images/field.png": "e24e7dfbafdfb96cc86a10583dfa220f",
"assets/assets/images/ammonito.png": "0eebb9b669683fc5c46b84079a38d947",
"assets/assets/images/fullback.png": "d67f45ccbcbee26f61b648ba89786389",
"assets/assets/images/golvittoria.png": "a6df80d903fa0ecc637aed383cc011cd",
"assets/assets/images/gk.png": "a7536d03e985030d320875babe4f2a38",
"assets/assets/images/assistMovimento.png": "eaab11c519287aca07232ec38ad50c86",
"assets/assets/images/golsubito.png": "b280d01d0480cb7041010c7251e874ba",
"assets/assets/images/espulso.png": "87ea94818135df0839f9c0c6a9ae3948",
"assets/assets/images/rigoreSegnato.png": "ce3294cd98a079fb4159dc00256f1d51",
"assets/assets/images/defender.png": "f46d3b17b6389c5469562f8b6dda63ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
