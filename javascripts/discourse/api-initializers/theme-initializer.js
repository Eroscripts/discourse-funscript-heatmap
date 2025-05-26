// @ts-check
import { apiInitializer } from "discourse/lib/api";
import { Funscript } from "../lib/funlib"; 

export default apiInitializer((api) => {
  // Inject user settings UI into preferences page
  api.onPageChange((url) => {
    if (url.startsWith("/u/") && url.includes("/preferences")) {
      setTimeout(() => {
        if (document.getElementById("heatmap-user-settings")) return;
        const container = document.createElement("div");
        container.id = "heatmap-user-settings";
        container.style.margin = "2em 0";
        container.innerHTML = `
          <h3>Heatmap User Settings</h3>
          <label>
            <input type="checkbox" id="user-disable-heatmaps">
            Disable funscript heatmap generation
          </label><br>
          <label>
            <input type="checkbox" id="user-solid-background">
            Use solid background color in heatmaps
          </label>
        `;
        const preferences = document.querySelector(".user-preferences");
        if (preferences) {
          preferences.appendChild(container);
          document.getElementById("user-disable-heatmaps").checked =
            localStorage.getItem("user-disable-heatmaps") === "true";
          document.getElementById("user-solid-background").checked =
            localStorage.getItem("user-solid-background") === "true";
          document.getElementById("user-disable-heatmaps").addEventListener("change", (e) => {
            localStorage.setItem("user-disable-heatmaps", e.target.checked);
          });
          document.getElementById("user-solid-background").addEventListener("change", (e) => {
            localStorage.setItem("user-solid-background", e.target.checked);
          });
        }
      }, 500);
    }
  });

  // Helper to get user setting or fallback to theme setting
  function getUserOrThemeSetting(key, themeDefault) {
    const local = localStorage.getItem(key);
    if (local === "true") return true;
    if (local === "false") return false;
    return themeDefault;
  }

  console.log("[heatmap on]");

  api.decorateCookedElement(
    async (cookedElement) => {
      // Use user setting if present, else theme setting
      const disableHeatmaps = getUserOrThemeSetting("user-disable-heatmaps", settings.disable_heatmaps);
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
const CACHE_CLEAN_DAYS = 1;

async function cleanStorage() {
  const cache = await window.caches.open("funscript-cache");
  let cacheInfo = JSON.parse(
    localStorage.getItem("funscript-cache-info") ||
      `{ version: ${CACHE_INFO_VERSION}, scripts: {} }`,
  );
  if (cacheInfo.version !== CACHE_INFO_VERSION) {
    cacheInfo = { version: CACHE_INFO_VERSION, scripts: {} };
    window.caches.delete("funscript-cache");
  }
  for (const [url, script] of Object.entries(cacheInfo.scripts)) {
    const age = (Date.now() - script.scriptCachedAt) / 24 / 3600e3;
    if (age > CACHE_CLEAN_DAYS) {
      console.log("removing", script, "due to age", age);
      cache.delete(url);
      cache.delete(url + ".svg");
      delete cacheInfo.scripts[url];
    }
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
  if (!cachedResponse) {
    const cacheInfo = JSON.parse(
      localStorage.getItem("funscript-cache-info") || "{}",
    );
    cacheInfo.version ??= CACHE_INFO_VERSION;
    let scripts = (cacheInfo.scripts ??= {});
    scripts[url] = {
      ...scripts[url],
      url,
      filePath,
      scriptCachedAt: Date.now(),
    };
    cacheInfo.version = CACHE_INFO_VERSION;
    localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));

    await cache.put(url, response.clone());
  }
  const json = await response.json();
  return new Funscript(json, { file: decodeURIComponent(filePath) });
}

async function generateSvgBlobUrl(url) {
  console.time("readCache " + url);
  const cache = await window.caches.open("funscript-cache");
  const svgUrl = url + ".svg";
  const cachedResponse = await cache.match(svgUrl);
  console.timeEnd("readCache " + url);
  if (cachedResponse) {
    return URL.createObjectURL(await cachedResponse.blob());
  }

  console.time("fetchFunscript " + url);
  const funscript = await fetchFunscript(url);
  console.timeEnd("fetchFunscript " + url);
  console.time("toSvgElement " + svgUrl);
  // Use user setting if present, else theme setting
  const solidBackground = (function() {
    const local = localStorage.getItem("user-solid-background");
    if (local === "true") return true;
    if (local === "false") return false;
    return settings.solid_background;
  })();
  const svg = funscript.toSvgElement({
    ...(solidBackground ? { bgOpacity: 0 } : {}),
  });
  console.timeEnd("toSvgElement " + svgUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });

  const cacheInfo = JSON.parse(
    localStorage.getItem("funscript-cache-info") || "{}",
  );
  cacheInfo.version ??= CACHE_INFO_VERSION;
  let scripts = (cacheInfo.scripts ??= {});
  scripts[url] = {
    ...scripts[url],
    url,
    svgCachedAt: Date.now(),
  };
  cacheInfo.version = CACHE_INFO_VERSION;
  localStorage.setItem("funscript-cache-info", JSON.stringify(cacheInfo));

  await cache.put(svgUrl, new Response(blob));
  return URL.createObjectURL(blob);
}