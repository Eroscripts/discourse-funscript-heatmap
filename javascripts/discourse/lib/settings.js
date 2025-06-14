// src/lib/cache.ts
var CACHE_NAME = "funscript-cache";
var MAX_CACHE_AGE_HOURS = 8;
var CACHE_HASH = "2";
var settings = {};
async function clearCache() {
  await window.caches.delete(CACHE_NAME);
  localStorage.removeItem("funscript-cache-info");
}
function clearExpiredCache() {
  const cacheAge = localStorage.getItem("funscript-cache-age");
  const cacheHash = localStorage.getItem("funscript-cache-hash");
  if (!cacheAge)
    localStorage.setItem("funscript-cache-age", Date.now().toString());
  if (!cacheHash) localStorage.setItem("funscript-cache-hash", CACHE_HASH);
  if (!cacheAge || !cacheHash) return clearCache();
  let age = !cacheAge ? 0 : Date.now() - new Date(cacheAge).getTime();
  if (age > MAX_CACHE_AGE_HOURS * 3600000 || cacheHash !== CACHE_HASH) {
    clearCache();
  }
}
async function getCached(url, create) {
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

// src/lib/settings.ts
var user_settings_desc = {
  disable_heatmaps: "Disable funscript heatmap generation",
  solid_background: "Use solid background color in heatmaps",
  cache_heatmaps: "Cache heatmaps for faster loading",
  merge_scripts: "Merge multi-axis funscripts",
  use_max_extension:
    "Use .max.funscript extension for multi-axis funscripts (renaming video to .max.mp4 is recommended)",
};
var userSettings = new Proxy(settings, {
  get(target, prop) {
    let value = localStorage.getItem(`heatmap-${prop}`);
    try {
      return value ? JSON.parse(value) : settings[prop];
    } catch (e) {
      console.error(e);
      return settings[prop];
    }
  },
  set(target, prop, value) {
    localStorage.setItem(`heatmap-${prop}`, JSON.stringify(value));
    return true;
  },
});
function makeSettingsEdits() {
  const container = document.createElement("div");
  container.id = "heatmap-user-settings";
  container.style.marginTop = "2em";
  let h3 = document.createElement("h3");
  h3.textContent = "Heatmap User Settings";
  for (const [key, text] of Object.entries(user_settings_desc)) {
    let label = document.createElement("label");
    let input = document.createElement("input");
    input.type = "checkbox";
    input.id = `user-${key}`;
    label.append(input, text);
    input.checked = userSettings[key];
    input.addEventListener("change", (e) => {
      userSettings[key] = e.target?.checked;
      clearCache();
    });
    container.appendChild(label);
  }
  return container;
}
export { user_settings_desc, userSettings, makeSettingsEdits };
