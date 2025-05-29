import {
  Funscript
} from "../lib/funlib.js";
import {
  makeSettingsEdits,
  userSettings
} from "../lib/settings.js";
import {
  clearExpiredCache,
  getCached
} from "../lib/cache.js";

// src/api-initializers/theme-initializer.ts
import { apiInitializer } from "discourse/lib/api";
var theme_initializer_default = apiInitializer((api) => {
  clearExpiredCache();
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
    if (userSettings.disable_heatmaps) {
      return;
    }
    let links = [
      ...cookedElement.querySelectorAll('a[href$=".funscript"]')
    ];
    await Promise.all(links.map(async (a) => {
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
async function fetchFunscript(url) {
  let response = await getCached(url, fetch);
  if (!response) {
    throw new Error(`Failed to fetch funscript: ${url}`);
  }
  let filePath = response.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''([^]+.funscript)$/)?.[1];
  if (!filePath) {
    throw new Error("No file path found");
  }
  const json = await response.json();
  return new Funscript(json, { file: decodeURIComponent(filePath) });
}
async function generateSvgBlobUrl(url) {
  console.time("readCache " + url);
  const svgUrl = url + ".svg";
  let response = await getCached(svgUrl, async () => {
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
    return new Response(blob);
  });
  if (response) {
    return URL.createObjectURL(await response.blob());
  } else {
    console.error("Failed to generate SVG blob URL for " + url);
    return "";
  }
}
export {
  theme_initializer_default as default
};
