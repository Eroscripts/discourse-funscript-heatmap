import { THEME_ID, THEME_VERSION } from "./generated";

// src/lib/cache.ts
var CACHE_NAME = "funscript-cache";
var SVG_CACHE_NAME = "funscript-svg-cache";
var MAX_CACHE_AGE_HOURS = 8;
function clearExpiredCache(forceClearSvg = false) {
  const CACHE_HASH = `${THEME_ID}-${THEME_VERSION}`;
  const cacheAge = localStorage.getItem("funscript-cache-age");
  const cacheHash = localStorage.getItem("funscript-cache-hash");
  if (!cacheAge)
    localStorage.setItem("funscript-cache-age", Date.now().toString());
  if (!cacheHash) localStorage.setItem("funscript-cache-hash", CACHE_HASH);
  if (!cacheAge || !cacheHash) return;
  if (forceClearSvg) {
    window.caches.delete(SVG_CACHE_NAME);
  }
  let age = !cacheAge ? 0 : Date.now() - new Date(cacheAge).getTime();
  if (age > MAX_CACHE_AGE_HOURS * 3600000 || cacheHash !== CACHE_HASH) {
    window.caches.delete(CACHE_NAME);
    window.caches.delete(SVG_CACHE_NAME);
  }
}
async function getCached(url, cacheName, create) {
  const cache = await window.caches.open(cacheName);
  const cachedResponse = await cache.match(url);
  if (cachedResponse) return cachedResponse;
  if (!create) return null;
  const response = await create(url);
  if (!response) return null;
  if (!response.ok) {
    console.error(`Failed to fetch: ${url}`);
    return null;
  }
  await cache.put(url, response.clone());
  return response;
}
export { getCached, clearExpiredCache };
