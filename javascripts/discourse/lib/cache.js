// src/lib/cache.ts
var CACHE_NAME = "funscript-cache";
var MAX_CACHE_AGE_HOURS = 8;
var CACHE_HASH = "2";
async function clearCache() {
  await window.caches.delete(CACHE_NAME);
  localStorage.removeItem("funscript-cache-info");
}
function clearExpiredCache() {
  const cacheAge = localStorage.getItem("funscript-cache-age");
  const cacheHash = localStorage.getItem("funscript-cache-hash");
  if (!cacheAge)
    localStorage.setItem("funscript-cache-age", Date.now().toString());
  if (!cacheHash) localStorage.setItem("funscript-cache-hash", CACHE_HASH);
  if (!cacheAge || !cacheHash) return clearCache();
  let age = !cacheAge ? 0 : Date.now() - new Date(cacheAge).getTime();
  if (age > MAX_CACHE_AGE_HOURS * 3600000 || cacheHash !== CACHE_HASH) {
    clearCache();
  }
}
async function getCached(url, create) {
  const cache = await window.caches.open(CACHE_NAME);
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
export { getCached, clearExpiredCache, clearCache };
