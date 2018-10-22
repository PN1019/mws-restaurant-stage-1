const staticCacheName = 'restaurant-reviews-v4';

self.addEventListener('install', function(event) {
   console.log("Service Worker installed");
event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
	    './',
        './index.html',
        './restaurant.html',
		'./offline.html',
		'./data/restaurants.json',
        './css/styles.css',
		'./img/1.jpg',
        './img/2.jpg',
        './img/3.jpg',
        './img/4.jpg',
        './img/5.jpg',
        './img/6.jpg',
        './img/7.jpg',
        './img/8.jpg',
        './img/9.jpg',
        './img/10.jpg',
		'./img/marker-icon-2x-red.png',
        './img/marker-shadow.png',
		'./img/offlinegiphy.gif',
		'./img/icons/iconman.png',
		'./img/icons/iconman-48x48.png',
		'./img/icons/iconman-64x64.png',
		'./img/icons/iconman-128x128.png',
		'./img/icons/iconman-256x256.png',
		'./img/icons/iconman-512x512.png',
		'./js/dbhelper.js',
		'./js/main.js',
        './js/restaurant_info.js',
		'./register_sw.js',
		'./serviceworker.js',
		'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
		'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
		 ]);
    })
  );
   console.log("cache successful");
});
// deletes old cache
self.addEventListener('activate', function(event) {
  // console.log("Service Worker activated");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-reviews-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
       console.log("Old cache removed");
    })
  );
});

self.addEventListener('fetch', function(event) {
   //console.log("Service Worker starting fetch");
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        if (response) {
          // console.log("data fetched from cache");
          return response;
        }
        else {
          return fetch(event.request).then(function(networkResponse) {
            // console.log("data fetched from network", event.request.url);
            //cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(function(error) {
            console.log("Unable to fetch data from network", event.request.url, error);
          });
        }
      });
    }).catch(function(error) {
     // console.log("Something went wrong with Service Worker fetch intercept", error);
	 return caches.match('offline.html', error);
	  
    })
  );
});

 