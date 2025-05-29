// @ts-check
import { apiInitializer } from "discourse/lib/api";
import { Funscript } from "../lib/funlib";
import { makeSettingsEdits, userSettings } from "../lib/settings";
import { clearExpiredCache, getCached } from "../lib/cache";

export default apiInitializer((api) => {
  clearExpiredCache();

  // Inject user settings UI into preferences page
  api.onPageChange((url: string) => {
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
    async (cookedElement: HTMLElement) => {
      // Use user setting if present, else theme setting
      if (userSettings.disable_heatmaps) {
        return;
      }

      let links = [
        ...cookedElement.querySelectorAll<HTMLAnchorElement>(
          'a[href$=".funscript"]',
        ),
      ];

      await Promise.all(
        links.map(async (a: HTMLAnchorElement) => {
          if (a.classList.contains("attachment"))
            a.classList.remove("attachment");

          let spanAContainer = document.createElement("a");
          spanAContainer.setAttribute("href", a.getAttribute("href") || "#");
          spanAContainer.className = "funscript-link-container";
          spanAContainer.style.cssText = "display: block; line-height: 80%";
          a.replaceWith(spanAContainer);
          spanAContainer.append(a);

          if (spanAContainer.nextSibling?.nodeType == 3) {
            spanAContainer.append(spanAContainer.nextSibling);
          }

          const img = document.createElement("img");
          img.style.willChange = "opacity"; // improve draw perf
          spanAContainer.prepend(img);

          const svgUrl = await generateSvgBlobUrl(a.href);
          img.src = svgUrl;

          await img.decode();
          await new Promise(requestAnimationFrame);

          let targetWidth = spanAContainer.getBoundingClientRect().width;
          if (targetWidth > 700) {
            img.src = await generateSvgBlobUrl(a.href, ~~targetWidth);
          }
        }),
      );
    },
    {
      id: "funscript-heatmap", // Unique ID for the decorator
    },
  );
});

async function fetchFunscript(url: string): Promise<Funscript> {
  let response = await getCached(url, fetch);

  if (!response) {
    throw new Error(`Failed to fetch funscript: ${url}`);
  }

  let filePath = response.headers
    .get("Content-Disposition")
    ?.match(/filename\*=UTF-8''([^]+.funscript)$/)?.[1];
  if (!filePath) {
    throw new Error("No file path found");
  }

  const json = await response.json();
  return new Funscript(json, { file: decodeURIComponent(filePath) });
}

async function generateSvgBlobUrl(
  url: string,
  width: number = 690,
  funscript?: Funscript,
): Promise<string> {
  console.time("readCache " + url);
  const svgUrl = url + ".svg" + (width === 690 ? "" : "?width=" + width);

  let response = await getCached(svgUrl, async () => {
    console.time("fetchFunscript " + url);
    funscript ??= await fetchFunscript(url);
    console.timeEnd("fetchFunscript " + url);
    console.time("toSvgElement " + svgUrl);

    // Use user setting if present, else theme setting
    const solidBackground = userSettings.solid_background;
    const svg = funscript.toSvgElement({
      width,
      ...(solidBackground
        ? { solidTitleBackground: true, headerOpacity: 0.2 }
        : {}),
    });
    console.timeEnd("toSvgElement " + svgUrl);

    const blob = new Blob([svg], { type: "image/svg+xml" });
    return new Response(blob);
  });

  console.timeEnd("readCache " + url);

  if (response) {
    return URL.createObjectURL(await response.blob());
  } else {
    console.error("Failed to generate SVG blob URL for " + url);
    return "";
  }
}
