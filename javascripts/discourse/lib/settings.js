import { clearCache } from "./cache";

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
