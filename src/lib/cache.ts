const CACHE_NAME = "funscript-cache";
const MAX_CACHE_AGE_HOURS = 8;
const CACHE_HASH = "1";

export async function clearCache() {
  await window.caches.delete(CACHE_NAME);

  // legacy
  localStorage.removeItem("funscript-cache-info");
}

export function clearExpiredCache() {
  const cacheAge = localStorage.getItem("funscript-cache-age");
  const cacheHash = localStorage.getItem("funscript-cache-hash");
  if (!cacheAge)
    localStorage.setItem("funscript-cache-age", Date.now().toString());
  if (!cacheHash) localStorage.setItem("funscript-cache-hash", CACHE_HASH);
  if (!cacheAge || !cacheHash) return clearCache();

  let age = !cacheAge ? 0 : Date.now() - new Date(cacheAge).getTime();
  if (age > MAX_CACHE_AGE_HOURS * 60 * 60 * 1000 || cacheHash !== CACHE_HASH) {
    clearCache();
  }
}

export async function getCached(
  url: string,
  create?: (url: string) => Promise<Response | null>,
): Promise<Response | null> {
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
