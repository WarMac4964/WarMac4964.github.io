'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "5a69664ee095ca5bcdad4fb84ae9d1de",
"index.html": "c36bb7bd8d473cf864d2ed0995a59727",
"/": "c36bb7bd8d473cf864d2ed0995a59727",
"main.dart.js": "645d0ce9b4e05db78fa7d20e2334021d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "bd8f35b4958003533992aa764c952a2e",
"assets/AssetManifest.json": "2f62f620d6090091c61876270fb8af11",
"assets/NOTICES": "3124e89ab35afff0330202f335f54058",
"assets/FontManifest.json": "f714460608e9a2e155686fe43d09f3c7",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/GitHub_circled.svg": "ac4986234fc08c3d4cbe0c7792cc6593",
"assets/assets/Email_circled.svg": "0cdeab44bcdbfb401b83ddac346e104d",
"assets/assets/editorx.png": "136f6c15fb4d82a74dd15c47f47aec62",
"assets/assets/organickreation.png": "0753e8b1d3df46afac40b98cba2465a7",
"assets/assets/header_profile.png": "199ee4aabba8e650ee6efabf5c305411",
"assets/assets/baatcheet.png": "9a59a82ffb49a2e4911e00c47cc5a812",
"assets/assets/A.svg": "aba6165f5411dee712925d11f928f750",
"assets/assets/Instagram_circled.svg": "1c3f3729533525e4c873b51be7fb84f9",
"assets/assets/LinkedIn_circled.svg": "066a2586cba64dc6de1fb73fdc677fc0",
"assets/assets/Facebook_circled.svg": "49804485a99325c8ddbfda2b7908297a",
"assets/assets/A.png": "e2836a2aa5252de6b81be860afdb8ec8",
"assets/assets/fonts/Europa/Europa-Regular.ttf": "23c0fcab84d99da0de762de7e220a6e1",
"assets/assets/fonts/Sora/static/Sora-ExtraBold.ttf": "23b29030a22fc02a05c8ca5d2cda8bc5",
"assets/assets/fonts/Sora/static/Sora-Bold.ttf": "8b24edfb87ce7942c970dbaeaa73a511",
"assets/assets/fonts/Sora/static/Sora-Regular.ttf": "aa64200d21f88f287becbe3f3cebaf0e",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Regular.ttf": "88f8f3ec14cacfac8a7266977e569ec5",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-ExtraBold.ttf": "36fb58c48197fda62900a23dbac8db68",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Bold.ttf": "f5ae33e0fc0c3d498f3ad1c620a7800c",
"assets/assets/fonts/Libre_Franklin/static/LibreFranklin-Italic.ttf": "9924dbe0cb725cb20f653d19c37aa5f1",
"canvaskit/canvaskit.js": "43fa9e17039a625450b6aba93baf521e",
"canvaskit/profiling/canvaskit.js": "f3bfccc993a1e0bfdd3440af60d99df4",
"canvaskit/profiling/canvaskit.wasm": "a9610cf39260f60fbe7524a785c66101",
"canvaskit/canvaskit.wasm": "04ed3c745ff1dee16504be01f9623498"
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
