import { clearExpiredCache, getCached } from "../lib/cache";
import {
  Funscript,
  exampleBlobUrl,
  funscriptOptions,
  toSvgElement,
} from "../lib/funlib";
import {
  USER_SETTINGS_UPDATED_EVENT,
  injectSettings,
  userSettings,
} from "../lib/user_settings";
import "../lib/generated";

// src/api-initializers/theme-initializer.ts
import { apiInitializer } from "discourse/lib/api";
import ClickTrack from "discourse/lib/click-track";
var theme_initializer_default = apiInitializer((api) => {
  clearExpiredCache();
  api.onPageChange(injectSettings);
  document.addEventListener(USER_SETTINGS_UPDATED_EVENT, () => {
    clearExpiredCache(true);
  });
  api.decorateCookedElement(
    async (cookedElement) => {
      if (userSettings.disable_heatmaps) {
        return;
      }
      await new Promise(requestAnimationFrame);
      const links = Array.from(
        cookedElement.querySelectorAll('a[href$=".funscript"]'),
      ).map((a) => {
        if (a.classList.contains("attachment"))
          a.classList.remove("attachment");
        let p = a.parentElement;
        const width = ~~a.closest(".cooked").getBoundingClientRect().width;
        const url = a.href;
        const img = createHeatmapImage({ width });
        const icon = createIcon();
        const container = document.createElement("a");
        container.className = "funscript-link-container";
        container.style.cssText = "display: block; line-height: 80%";
        container.href = url;
        const funscript = fetchFunscript(url);
        const svg = funscript.then((f) => generateSvgBlobUrl(url, width, f));
        a.replaceWith(container);
        container.append(img, icon, a);
        if (container.nextSibling?.nodeType == 3) {
          const text = container.nextSibling;
          text.remove();
          container.append(createTextSpan(text.textContent));
        }
        svg.then((svgUrl) => (img.src = svgUrl));
        return {
          a,
          img,
          p,
          url,
          container,
          funscript,
          svg,
          icon,
          width,
        };
      });
      if (links.length === 0) return;
      if (!userSettings.merge_scripts) return;
      const resolvedLinks = await Promise.all(
        links.map(async (link) => {
          let funscript = await link.funscript;
          console.log("funscript", link.url, funscript.file);
          return { ...link, funscript, file: funscript.file };
        }),
      );
      console.log("resolvedLinks", resolvedLinks);
      const merged = Funscript.mergeMultiAxis(
        resolvedLinks.map((r) => r.funscript),
      );
      for (let m of merged) {
        if (m.axes.length == 0) continue;
        if (!m.file?.mergedFiles) continue;
        if (
          userSettings.use_max_extension &&
          !m.file.filePath.endsWith(".max.funscript")
        ) {
          m.file.axisName = "max";
        }
        let links2 = m.file.mergedFiles.map((f) =>
          resolvedLinks.find((r) => r.file === f),
        );
        m.version = "1.2";
        m.metadata.script_url = links2[0].p
          .closest(".topic-body")
          .querySelector("a.post-date")
          .href.replace(/\?.*/, "");
        const url = links2.map((l) => l.url).join("&");
        const width = links2[0].width;
        const svg = await generateSvgBlobUrl(url, width, m);
        const img = createHeatmapImage({ width, merged: true, src: svg });
        const icon = createIcon({ rotate: 220 });
        const a = document.createElement("a");
        a.className = "funscript-link-merged";
        a.append(m.file.filePath);
        a.dataset.clicks = Math.max(
          ...links2.map((l) => +(l.a.dataset.clicks ?? 0)),
        ).toString();
        const container = document.createElement("a");
        container.className = "funscript-link-container funscript-link-merged";
        container.style.cssText = "display: block; line-height: 80%";
        container.href = "#";
        container.download = m.file.filePath;
        container.addEventListener("click", (e) => {
          const clickedLink = e.target.matches("a")
            ? e.target
            : e.target.closest("a");
          const isMergedLink = clickedLink?.matches(".funscript-link-merged");
          console.log({ isMergedLink, clickedLink }, e, e.target);
          if (!isMergedLink) return;
          e.stopPropagation();
          if (userSettings.separate_downloads) {
            e.preventDefault();
            links2.forEach((link, index) => {
              setTimeout(() => {
                console.log("click", link.a);
                const syntheticEvent = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  button: 0,
                  which: 1,
                  detail: 1,
                });
                link.a.dispatchEvent(syntheticEvent);
              }, index * 500);
            });
            return;
          }
          links2.forEach((link) => {
            const syntheticEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
              button: 0,
              which: 1,
              ctrlKey: true,
            });
            Object.defineProperty(syntheticEvent, "currentTarget", {
              value: link.a,
              writable: false,
            });
            ClickTrack.trackClick(syntheticEvent);
          });
        });
        const details = document.createElement("details");
        details.style.float = "right";
        details.style.outline = "1px solid";
        details.style.padding = "0";
        const summary = document.createElement("summary");
        summary.textContent = "axes";
        summary.style.color = "var(--primary)";
        summary.style.padding = ".25rem .75rem";
        summary.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        const helpButton = document.createElement("button");
        helpButton.textContent = "?";
        helpButton.style.cssText = `
          float: right;
          outline: solid 1px var(--tertiary);
          padding: 0px;
          background-color: var(--primary-very-low);
          margin-bottom: .5rem;
          border: 0;
          height: 1.3em;
          width: 1.3em;
          border-radius: 50%;
          margin-right: 0.3em;
          margin-left: 0.3em;
          cursor: pointer;
          color: var(--primary);
        `;
        helpButton.title = "Click for merging explanation";
        helpButton.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const explanation = `Script Merging Explanation:
When multi-axis funscript files are detected in a post, they are automatically merged.
• Clicking the heatmap will download the merged script.
• Merged script can only be used in MFP.
• If you use XTP or something else, enable "separate downloads" in your preferences, then clicking will download the individual files.

Would you like to open preferences?
`;
          if (confirm(explanation)) {
            window.open("/my/preferences/account", "_blank");
          }
        });
        const size = createTextSpan(` (0.0 KB)`);
        links2[0].container.replaceWith(container);
        details.append(summary, ...links2.map((l) => l.container));
        container.append(img, icon, a, size, details, helpButton);
        requestAnimationFrame(() => {
          const text = m.toJsonText({ compress: true, maxPrecision: 0 });
          const blob = new Blob([text], { type: "application/json" });
          container.href = URL.createObjectURL(blob);
          size.textContent = ` (${(text.length / 1024).toFixed(1)} KB)`;
        });
      }
    },
    {
      id: "funscript-heatmap",
    },
  );
});
async function fetchFunscript(url) {
  let response = await getCached(url, "funscript-cache", fetch);
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
async function generateSvgBlobUrl(url, width = 690, funscript) {
  width = ~~width;
  console.time("readCache " + url);
  const svgUrl = url + ".svg" + (width === 690 ? "" : "?width=" + width);
  let response = await getCached(svgUrl, "funscript-svg-cache", async () => {
    console.time("fetchFunscript " + url);
    funscript ??= await fetchFunscript(url);
    console.timeEnd("fetchFunscript " + url);
    console.time("toSvgElement " + svgUrl);
    const svg = toSvgElement([funscript], funscriptOptions(width));
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
function createIcon(options = {}) {
  const icon = document.createElement("img");
  icon.src = "/images/emoji/twitter/bookmark_tabs.png?v=12";
  icon.className = "emoji";
  icon.style.width = "1.2em";
  icon.style.height = "1.2em";
  if (options.rotate) icon.style.filter = `hue-rotate(${options.rotate}deg)`;
  return icon;
}
function createHeatmapImage(options) {
  const img = document.createElement("img");
  img.className =
    "funscript-heatmap-image" +
    (options.merged ? " funscript-heatmap-image-merged" : "");
  img.style.display = "block";
  img.style.willChange = "opacity";
  img.src = options.src ?? exampleBlobUrl(options.width);
  return img;
}
function createTextSpan(text) {
  const span = document.createElement("span");
  span.style.color = "var(--primary)";
  span.textContent = text;
  return span;
}
export { theme_initializer_default as default };
