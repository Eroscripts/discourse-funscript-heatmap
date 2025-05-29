import {
  Funscript
} from "../lib/funlib.js";
import {
  makeSettingsEdits,
  userSettings
} from "../lib/settings.js";

// src/api-initializers/theme-initializer.ts
import { apiInitializer } from "discourse/lib/api";
var theme_initializer_default = apiInitializer((api) => {
  api.onPageChange((url) => {
    if (url.startsWith("/u/") && url.includes("/preferences")) {
      setTimeout(() => {
        if (document.getElementById("heatmap-user-settings"))
          return;
        const preferences = document.querySelector(".user-preferences");
        if (preferences) {
          preferences.appendChild(makeSettingsEdits());
        }
      }, 500);
    }
  });
  api.decorateCookedElement(async (cookedElement) => {
    const disableHeatmaps = userSettings.disable_heatmaps;
    if (disableHeatmaps) {
      return;
    }
    let aa = Array.from(cookedElement.querySelectorAll('a[href$=".funscript"]'));
    await Promise.all(aa.map(async (a) => {
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
      img.style.willChange = "opacity";
      img.src = svgUrl;
      spanAContainer.append(img);
    }));
  }, {
    id: "funscript-heatmap"
  });
});
var CACHE_INFO_VERSION = "" + 1 + userSettings.cache_heatmaps + userSettings.solid_background;
var CACHE_INACTIVITY_HOURS = 8;
async function cleanStorage() {
  const cache = await window.caches.open("funscript-cache");
  let cacheInfo = JSON.parse(localStorage.getItem("funscript-cache-info") || `{ version: ${CACHE_INFO_VERSION}, scripts: {}, lastActivity: ${Date.now()} }`);
  if (cacheInfo.version !== CACHE_INFO_VERSION) {
    cacheInfo = {
      version: CACHE_INFO_VERSION,
      scripts: {},
      lastActivity: Date.now()
    };
    window.caches.delete("funscript-cache");
  }
  if (!cacheInfo.lastActivity) {
    cacheInfo.lastActivity = Date.now();
  }
  const inactivityHours = (Date.now() - cacheInfo.lastActivity) / 3600000;
  if (inactivityHours > CACHE_INACTIVITY_HOURS) {
    console.log(`Cache inactive for ${inactivityHours.toFixed(2)} hours, clearing completely`);
    await window.caches.delete("funscript-cache");
    cacheInfo = {
      version: CACHE_INFO_VERSION,
      scripts: {},
      lastActivity: Date.now()
    };
  } else {
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
  let filePath = response.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''([^]+.funscript)$/)?.[1];
  if (!filePath) {
    throw new Error("No file path found");
  }
  filePath = decodeURIComponent(filePath);
  const cacheInfo = JSON.parse(localStorage.getItem("funscript-cache-info") || "{}");
  cacheInfo.version ??= CACHE_INFO_VERSION;
  cacheInfo.lastActivity = Date.now();
  let scripts = cacheInfo.scripts ??= {};
  if (!cachedResponse) {
    scripts[url] = {
      ...scripts[url],
      url,
      filePath,
      scriptCachedAt: Date.now()
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
    const cacheInfo2 = JSON.parse(localStorage.getItem("funscript-cache-info") || "{}");
    cacheInfo2.lastActivity = Date.now();
    localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo2));
    return URL.createObjectURL(await cachedResponse.blob());
  }
  console.time("fetchFunscript " + url);
  const funscript = await fetchFunscript(url);
  console.timeEnd("fetchFunscript " + url);
  console.time("toSvgElement " + svgUrl);
  const solidBackground = userSettings.solid_background;
  const svg = funscript.toSvgElement({
    ...solidBackground ? { solidTitleBackground: true, headerOpacity: 0.2 } : {}
  });
  console.timeEnd("toSvgElement " + svgUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const cacheInfo = JSON.parse(localStorage.getItem("funscript-cache-info") || "{}");
  cacheInfo.version ??= CACHE_INFO_VERSION;
  cacheInfo.lastActivity = Date.now();
  let scripts = cacheInfo.scripts ??= {};
  scripts[url] = {
    ...scripts[url],
    url,
    svgCachedAt: Date.now()
  };
  localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));
  await cache.put(svgUrl, new Response(blob));
  return URL.createObjectURL(blob);
}
export {
  theme_initializer_default as default
};
