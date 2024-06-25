/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

const DB_NAME = 'graphql-cache-db';
const DB_TABLE = 'graphql-cache';

self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

async function handleGraphQLRequest(request) {
  const requestBody = await readRequestBody(request.clone());
  const cacheKey = await generateCacheKey(requestBody);
  if (!navigator.onLine) {
    const cachedData = await getCachedDataFromIndexedDB(cacheKey);
    const response = new Response(JSON.stringify(cachedData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } else {
    const response = await fetch(request);
    if (response.ok) {
      const type = requestBody?.query?.split(' ')?.[0];
      if (type === 'mutation') {
        console.log('mutation');
      } else {
        const responseData = await response.clone().json();
        await saveDataToIndexedDB(cacheKey, responseData);
      }
    }
    return response;
  }
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const reader = request.body.getReader();
    const chunks = [];
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          const text = new TextDecoder().decode(chunks[0]);
          resolve(JSON.parse(text));
        } else {
          chunks.push(value);
          read();
        }
      });
    }
    read();
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
}

async function generateCacheKey(requestBody) {
  const requestString = JSON.stringify(requestBody);
  return hashString(requestString);
}

async function saveDataToIndexedDB(key, data) {
  const db = await openDatabase();
  const transaction = db.transaction(DB_TABLE, 'readwrite');
  const store = transaction.objectStore(DB_TABLE);

  return new Promise((resolve, reject) => {
    const request = store.put(data, key);

    request.onerror = (event) => {
      reject(`Error saving data to IndexedDB: ${event.target.error}`);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

async function getCachedDataFromIndexedDB(key) {
  const db = await openDatabase();
  const transaction = db.transaction(DB_TABLE, 'readonly');
  const store = transaction.objectStore(DB_TABLE);

  return new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onerror = (event) => {
      reject(`Error getting data from IndexedDB: ${event.target.error}`);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      reject(`Error opening database: ${event.target.error}`);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(DB_TABLE);
    };
  });
}

function isGraphQLRequest(request) {
  return request.url.includes('/graphql');
}

// ---------- EVENTS ---------- //

self.addEventListener('fetch', (event) => {
  const request = event.request.clone();

  if (isGraphQLRequest(request)) {
    event.respondWith(handleGraphQLRequest(request));
  } else {
    event.respondWith(fetch(event.request));
  }
});
