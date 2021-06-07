'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "827ea55e6969c27f12fb62478948b63f",
"index.html": "96028d05e76a6598966f44c2fc78c0ca",
"/": "96028d05e76a6598966f44c2fc78c0ca",
"main.dart.js": "2c3ed7b87e4b90fd76e97080dba232e4",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "bd8f35b4958003533992aa764c952a2e",
"assets/AssetManifest.json": "0e890036747a1d5133b44a1e79b6dac0",
"assets/NOTICES": "1e5979b3806b6547573f696aabb8d703",
"assets/FontManifest.json": "36947c416e1151474d8b23db275d0826",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/gmail_black.svg": "e3c80e2b2449d0162c762a2b5961b380",
"assets/assets/gmail.svg": "deda33aea2bfa9216df4b9abc2d17698",
"assets/assets/instagram.svg": "fc23b90236f87b11147810f35f4c5293",
"assets/assets/facebook_black.svg": "422e766543a3850de8db1f049775a1e9",
"assets/assets/img.jpg": "8e60a0b4c7622d2f627488b85a385fb4",
"assets/assets/warmac.png": "734962ad17076bf46b02c494a686611d",
"assets/assets/facebook.svg": "4241a9e49abf7a415e715b95e399182d",
"assets/assets/A.svg": "aba6165f5411dee712925d11f928f750",
"assets/assets/linkedin.svg": "bb771fecc80fd18fbebf6328391d3884",
"assets/assets/linkedin_black.svg": "e1a35f8bbf387adddedd9b732aba03ab",
"assets/assets/organic_kreation.png": "8566d98892b2f82528e7fa250cfa7883",
"assets/assets/instagram_black.svg": "0fad70dc012c2adfe022370582ba2513",
"assets/assets/fonts/Europa/Europa-Regular.ttf": "23c0fcab84d99da0de762de7e220a6e1",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Regular.ttf": "88f8f3ec14cacfac8a7266977e569ec5",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-ExtraBold.ttf": "36fb58c48197fda62900a23dbac8db68",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Bold.ttf": "f5ae33e0fc0c3d498f3ad1c620a7800c",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Italic.ttf": "9924dbe0cb725cb20f653d19c37aa5f1",
"assets/assets/arancia_films.jpeg": "54d8cc37fe2611faa1a267b9ba3d58fd",
"assets/assets/bg.png": "b7ddc3a12ed9d4a2140b0b6b2651d745"
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
