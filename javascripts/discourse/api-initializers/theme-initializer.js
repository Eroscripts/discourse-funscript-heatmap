import {
  Funscript,
  exampleBlobUrl,
  handyMark,
  toSvgElement,
} from "../lib/funlib";
import { makeSettingsEdits, userSettings } from "../lib/settings";
import { clearExpiredCache, getCached } from "../lib/cache";

// src/api-initializers/theme-initializer.ts
import { apiInitializer } from "discourse/lib/api";
var theme_initializer_default = apiInitializer((api) => {
  clearExpiredCache();
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
        const width = ~~p.getBoundingClientRect().width;
        const url = a.href;
        const img = document.createElement("img");
        img.className = "funscript-heatmap-image";
        img.style.display = "block";
        img.style.willChange = "opacity";
        img.src = exampleBlobUrl(width);
        const icon = document.createElement("img");
        icon.src = "/images/emoji/twitter/bookmark_tabs.png?v=12";
        icon.className = "emoji";
        const container = document.createElement("a");
        container.className = "funscript-link-container";
        container.style.cssText = "display: block; line-height: 80%";
        container.href = url;
        const funscript = fetchFunscript(url);
        const svg = funscript.then((f) => generateSvgBlobUrl(url, width, f));
        a.replaceWith(container);
        container.append(img);
        container.append(icon);
        container.append(a);
        if (container.nextSibling?.nodeType == 3) {
          container.append(container.nextSibling);
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
        const img = document.createElement("img");
        img.className =
          "funscript-heatmap-image funscript-heatmap-image-merged";
        img.style.display = "block";
        img.style.willChange = "opacity";
        img.src = svg;
        const icon = document.createElement("img");
        icon.src = "/images/emoji/twitter/bookmark_tabs.png?v=12";
        icon.style.filter = "hue-rotate(220deg)";
        icon.className = "emoji";
        const container = document.createElement("a");
        container.className =
          "funscript-link-container funscript-link-container-merged";
        container.style.cssText = "display: block; line-height: 80%";
        container.href = "#";
        container.download = m.file.filePath;
        container.addEventListener("click", (e) => e.stopPropagation(), true);
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = "axes";
        details.append(summary);
        container.append(img);
        container.append(icon);
        container.append(m.file.filePath);
        links2[0].container.replaceWith(container);
        container.after(details);
        details.append(...links2.map((l) => l.container));
        requestAnimationFrame(() => {
          const text = m.toJsonText({ compress: true, maxPrecision: 0 });
          const blob = new Blob([text], { type: "application/json" });
          container.href = URL.createObjectURL(blob);
        });
      }
    },
    {
      id: "funscript-heatmap",
    },
  );
});
async function fetchFunscript(url) {
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
  let fun = new Funscript(json, { file: decodeURIComponent(filePath) });
  handyMark(fun);
  return fun;
}
async function generateSvgBlobUrl(url, width = 690, funscript) {
  width = ~~width;
  console.time("readCache " + url);
  const svgUrl = url + ".svg" + (width === 690 ? "" : "?width=" + width);
  let response = await getCached(svgUrl, async () => {
    console.time("fetchFunscript " + url);
    funscript ??= await fetchFunscript(url);
    console.timeEnd("fetchFunscript " + url);
    console.time("toSvgElement " + svgUrl);
    const solidBackground = userSettings.solid_background;
    const svg = toSvgElement([funscript], {
      width,
      ...(solidBackground
        ? { solidHeaderBackground: true, headerOpacity: 0.2, halo: false }
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
export { theme_initializer_default as default };
