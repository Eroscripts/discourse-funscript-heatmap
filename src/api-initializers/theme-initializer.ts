// @ts-check
import { apiInitializer } from "discourse/lib/api";
import { exampleBlobUrl, Funscript, toSvgElement } from "../lib/funlib";
import { clearExpiredCache, getCached } from "../lib/cache";
import ClickTrack from "discourse/lib/click-track";
import {
  injectSettings,
  USER_SETTINGS_UPDATED_EVENT,
  userSettings,
} from "../lib/user_settings";

export default apiInitializer((api) => {
  clearExpiredCache();

  // Inject user settings UI into preferences page
  api.onPageChange(injectSettings);

  // Listen for user setting changes to handle cache clearing or other actions
  document.addEventListener(USER_SETTINGS_UPDATED_EVENT, () => {
    clearExpiredCache(true);
  });

  api.decorateCookedElement(
    async (cookedElement: HTMLElement) => {
      // Use user setting if present, else theme setting
      if (userSettings.disable_heatmaps) {
        return;
      }

      await new Promise(requestAnimationFrame);

      const links = Array.from(
        cookedElement.querySelectorAll<HTMLAnchorElement>(
          'a[href$=".funscript"]',
        ),
      ).map((a) => {
        if (a.classList.contains("attachment"))
          a.classList.remove("attachment");

        let p = a.parentElement!;
        const width = ~~a.closest(".cooked")!.getBoundingClientRect().width;

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
          container.append(createTextSpan(text.textContent!));
        }
        // if ((container.nextSibling as HTMLElement)?.tagName === "BR") {
        //   (container.nextSibling as HTMLElement).remove();
        // }
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
          m.file!.axisName = "max" as any;
        }
        let links = m.file!.mergedFiles!.map(
          (f) => resolvedLinks.find((r) => r.file === f)!,
        );
        (m as any).version = "1.2";
        (m.metadata as any).script_url = links[0]!.p
          .closest(".topic-body")!
          .querySelector<HTMLAnchorElement>("a.post-date")!
          .href.replace(/\?.*/, "");

        const url = links.map((l) => l.url).join("&");
        const width = links[0]!.width;
        const svg = await generateSvgBlobUrl(url, width, m);

        const img = createHeatmapImage({ width, merged: true, src: svg });

        const icon = createIcon({ rotate: 220 });

        const a = document.createElement("a");
        a.className = "funscript-link-merged";
        a.append(m.file!.filePath);
        a.dataset.clicks = Math.max(
          ...links.map((l) => +(l.a.dataset.clicks ?? 0)),
        ).toString();

        const container = document.createElement("a");
        container.className = "funscript-link-container funscript-link-merged";
        container.style.cssText = "display: block; line-height: 80%";
        container.href = "#";
        container.download = m.file!.filePath;
        container.addEventListener("click", (e) => {
          const clickedLink = (e.target as HTMLElement).matches("a")
            ? (e.target as HTMLAnchorElement)
            : (e.target as HTMLElement).closest("a");
          const isMergedLink = clickedLink?.matches(".funscript-link-merged");
          console.log({ isMergedLink, clickedLink }, e, e.target);

          if (!isMergedLink) return;

          if (userSettings.separate_downloads) {
            // stop download if separate downloads is enabled
            e.preventDefault();
            // Download files sequentially with delays to avoid browser blocking
            links.forEach((link, index) => {
              setTimeout(() => {
                console.log("click", link.a);
                // Create a more convincing synthetic click event
                const syntheticEvent = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  button: 0,
                  which: 1,
                  detail: 1, // click count
                });
                // Dispatch the event to trigger download
                link.a.dispatchEvent(syntheticEvent);
              }, index * 500); // 500ms delay between downloads
            });
            return;
          }

          // Track clicks for all original links using Discourse's system
          links.forEach((link) => {
            // Create a synthetic click event for tracking
            const syntheticEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
              button: 0,
              which: 1,
              ctrlKey: true, // prevent navigation
            });
            // Set the currentTarget to the original link
            Object.defineProperty(syntheticEvent, "currentTarget", {
              value: link.a,
              writable: false,
            });
            // Track the click without navigating
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

        const size = createTextSpan(` (0.0 KB)`);

        links[0]!.container.replaceWith(container);
        details.append(summary, ...links.map((l) => l.container));
        container.append(img, icon, a, size, details);

        requestAnimationFrame(() => {
          const text = m.toJsonText({ compress: true, maxPrecision: 0 });
          const blob = new Blob([text], { type: "application/json" });
          container.href = URL.createObjectURL(blob);
          size.textContent = ` (${(text.length / 1024).toFixed(1)} KB)`;
        });
      }
    },
    {
      id: "funscript-heatmap", // Unique ID for the decorator
    },
  );
});

async function fetchFunscript(url: string): Promise<Funscript> {
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

async function generateSvgBlobUrl(
  url: string,
  width: number = 690,
  funscript?: Funscript,
): Promise<string> {
  width = ~~width;
  console.time("readCache " + url);
  const svgUrl = url + ".svg" + (width === 690 ? "" : "?width=" + width);

  let response = await getCached(svgUrl, "funscript-svg-cache", async () => {
    console.time("fetchFunscript " + url);
    funscript ??= await fetchFunscript(url);
    console.timeEnd("fetchFunscript " + url);
    console.time("toSvgElement " + svgUrl);

    // Use user setting if present, else theme setting
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

function createIcon(options: { rotate?: number } = {}) {
  const icon = document.createElement("img");
  icon.src = "/images/emoji/twitter/bookmark_tabs.png?v=12";
  icon.className = "emoji";
  icon.style.width = "1.2em";
  icon.style.height = "1.2em";
  if (options.rotate) icon.style.filter = `hue-rotate(${options.rotate}deg)`;
  return icon;
}
function createHeatmapImage(options: {
  width: number;
  merged?: boolean;
  src?: string;
}) {
  const img = document.createElement("img");
  img.className =
    "funscript-heatmap-image" +
    (options.merged ? " funscript-heatmap-image-merged" : "");
  img.style.display = "block";
  img.style.willChange = "opacity"; // improve draw perf
  img.src = options.src ?? exampleBlobUrl(options.width);
  return img;
}
function createTextSpan(text: string) {
  const span = document.createElement("span");
  span.style.color = "var(--primary)";
  span.textContent = text;
  return span;
}
