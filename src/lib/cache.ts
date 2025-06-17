import { THEME_ID, THEME_VERSION } from "./generated";

const CACHE_NAME = "funscript-cache";
const SVG_CACHE_NAME = "funscript-svg-cache";
const MAX_CACHE_AGE_HOURS = 8;

export function clearExpiredCache(forceClearSvg = false) {
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
  if (age > MAX_CACHE_AGE_HOURS * 3600e3 || cacheHash !== CACHE_HASH) {
    window.caches.delete(CACHE_NAME);
    window.caches.delete(SVG_CACHE_NAME);
  }
}

export async function getCached(
  url: string,
  cacheName: "funscript-cache" | "funscript-svg-cache",
  create?: (url: string) => Promise<Response | null>,
): Promise<Response | null> {
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
