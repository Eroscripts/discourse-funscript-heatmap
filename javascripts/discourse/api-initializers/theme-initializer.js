// @ts-check
import { apiInitializer } from "discourse/lib/api";
import { Funscript } from "../lib/funlib"; 
import { makeSettingsEdits, userSettings } from "../lib/settings";

export default apiInitializer((api) => {
  // Inject user settings UI into preferences page
  api.onPageChange((url) => {
    if (url.startsWith("/u/") && url.includes("/preferences")) {
      setTimeout(() => {
        if (document.getElementById("heatmap-user-settings")) return;
        const preferences = document.querySelector(".user-preferences");
        if (preferences) {
          preferences.appendChild(makeSettingsEdits()); 
        }
      }, 500);
    }
  });
  
  api.decorateCookedElement(
    async (cookedElement) => {
      // Use user setting if present, else theme setting
      const disableHeatmaps = userSettings.disable_heatmaps;
      if (disableHeatmaps) {
        return;
      }
      
      let aa = Array.from(
        cookedElement.querySelectorAll('a[href$=".funscript"]'),
      );

      await Promise.all(
        aa.map(async (a) => {
          if (a.classList.contains("attachment"))
            a.classList.remove("attachment");

          let spanAContainer = document.createElement("span");
          spanAContainer.className = "funscript-link-container";
          a.replaceWith(spanAContainer);
          spanAContainer.append(a);

          if (spanAContainer.nextSibling?.nodeType == 3) {
            spanAContainer.append(spanAContainer.nextSibling);
          }

          const svgUrl = await generateSvgBlobUrl(a.href);
          const img = document.createElement("img");
          img.style.willChange = "opacity"; // improve draw perf
          img.src = svgUrl;
          spanAContainer.append(img);
        }),
      );
    },
    {
      id: "funscript-heatmap", // Unique ID for the decorator
    },
  );
});

const CACHE_INFO_VERSION = 1;
const CACHE_INACTIVITY_HOURS = 8;

async function cleanStorage() {
  const cache = await window.caches.open("funscript-cache");
  let cacheInfo = JSON.parse(
    localStorage.getItem("funscript-cache-info") ||
      `{ version: ${CACHE_INFO_VERSION}, scripts: {}, lastActivity: ${Date.now()} }`,
  );
  if (cacheInfo.version !== CACHE_INFO_VERSION) {
    cacheInfo = { version: CACHE_INFO_VERSION, scripts: {}, lastActivity: Date.now() };
    window.caches.delete("funscript-cache");
  }
  
  // Initialize lastActivity if it doesn't exist
  if (!cacheInfo.lastActivity) {
    cacheInfo.lastActivity = Date.now();
  }
  
  // Check if cache has been inactive for more than 8 hours
  const inactivityHours = (Date.now() - cacheInfo.lastActivity) / 3600e3;
  if (inactivityHours > CACHE_INACTIVITY_HOURS) {
    console.log(`Cache inactive for ${inactivityHours.toFixed(2)} hours, clearing completely`);
    // Clear entire cache
    await window.caches.delete("funscript-cache");
    cacheInfo = { version: CACHE_INFO_VERSION, scripts: {}, lastActivity: Date.now() };
  } else {
    // Update last activity time since we're accessing the cache
    cacheInfo.lastActivity = Date.now();
  }
  
  localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));
}
cleanStorage();

async function fetchFunscript(url) {
  const cache = await window.caches.open("funscript-cache");
  const cachedResponse = await cache.match(url);
  let response = cachedResponse;
  if (!response) {
    response = await fetch(url);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch funscript: ${response.statusText}`);
  }
  let filePath = response.headers
    .get("Content-Disposition")
    ?.match(/filename\*=UTF-8''([^]+.funscript)$/)?.[1];
  if (!filePath) {
    throw new Error("No file path found");
  }
  filePath = decodeURIComponent(filePath);
  // Update last activity time whenever cache is accessed
  const cacheInfo = JSON.parse(
    localStorage.getItem("funscript-cache-info") || "{}",
  );
  cacheInfo.version ??= CACHE_INFO_VERSION;
  cacheInfo.lastActivity = Date.now();
  let scripts = (cacheInfo.scripts ??= {});
  
  if (!cachedResponse) {
    scripts[url] = {
      ...scripts[url],
      url,
      filePath,
      scriptCachedAt: Date.now(),
    };
    await cache.put(url, response.clone());
  }
  
  localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));
  const json = await response.json();
  return new Funscript(json, { file: decodeURIComponent(filePath) });
}

async function generateSvgBlobUrl(url) {
  console.time("readCache " + url);
  const cache = await window.caches.open("funscript-cache");
  const svgUrl = url + ".svg";
  const cachedResponse = userSettings.cache_heatmaps ? await cache.match(svgUrl) : null;
  console.timeEnd("readCache " + url);
  if (cachedResponse) {
    // Update last activity time when accessing cached SVG
    const cacheInfo = JSON.parse(
      localStorage.getItem("funscript-cache-info") || "{}",
    );
    cacheInfo.lastActivity = Date.now();
    localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));
    
    return URL.createObjectURL(await cachedResponse.blob());
  }

  console.time("fetchFunscript " + url);
  const funscript = await fetchFunscript(url);
  console.timeEnd("fetchFunscript " + url);
  console.time("toSvgElement " + svgUrl);
  // Use user setting if present, else theme setting
  const solidBackground = userSettings.solid_background;
  const svg = funscript.toSvgElement({
    ...(solidBackground ? { solidTitleBackground: true } : {}),
  });
  console.timeEnd("toSvgElement " + svgUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });

  const cacheInfo = JSON.parse(
    localStorage.getItem("funscript-cache-info") || "{}",
  );
  cacheInfo.version ??= CACHE_INFO_VERSION;
  cacheInfo.lastActivity = Date.now();
  let scripts = (cacheInfo.scripts ??= {});
  scripts[url] = {
    ...scripts[url],
    url,
    svgCachedAt: Date.now(),
  };
  localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));

  await cache.put(svgUrl, new Response(blob));
  return URL.createObjectURL(blob);
}