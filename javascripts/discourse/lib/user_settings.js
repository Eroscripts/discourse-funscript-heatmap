import { THEME_ID, settingsYml } from "./generated";

// src/lib/user_settings.ts
var settingsTitle = "Heatmap Settings";
var USER_SETTINGS_UPDATED_EVENT = `${THEME_ID}-user-settings`;
var userSettings = new Proxy(settings, {
  get(target, prop) {
    const value = localStorage.getItem(`${THEME_ID}-${String(prop)}`);
    try {
      if (value) return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return settings[prop] ?? settingsYml[prop]?.default;
  },
  set(target, prop, value) {
    localStorage.setItem(`${THEME_ID}-${String(prop)}`, JSON.stringify(value));
    return true;
  },
});
function makeSettingsEdits() {
  const container = document.createElement("div");
  container.id = `${THEME_ID}-user-settings`;
  container.style.marginTop = "2em";
  const h3 = document.createElement("h3");
  h3.textContent = settingsTitle;
  container.appendChild(h3);
  for (const [key, config] of Object.entries(settingsYml)) {
    let set = function (value) {
      let prev = userSettings[key];
      userSettings[key] = value;
      document.dispatchEvent(
        new CustomEvent(USER_SETTINGS_UPDATED_EVENT, {
          detail: { key, value, prev, ...config },
        }),
      );
    };
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "0.5em";
    let input = document.createElement("input");
    if (config.type !== "enum") {
      input.id = `${THEME_ID}-user-${key}`;
      input.style.marginRight = "0.5em";
    }
    if (config.type === "bool") {
      input.type = "checkbox";
      input.checked = !!userSettings[key];
      input.addEventListener("change", () => set(input.checked));
    } else if (config.type === "string") {
      input.type = "text";
      input.value = String(userSettings[key]);
      input.addEventListener("input", () => set(input.value));
    } else if (config.type === "number") {
      input.type = "number";
      input.value = String(userSettings[key]);
      input.addEventListener("input", () => set(+input.value || 0));
    } else if (config.type === "enum") {
      input = document.createElement("select");
      input.style.width = "600px";
      input.style.display = "block";
      for (const choice of config.choices ?? []) {
        const option = document.createElement("option");
        option.value = choice;
        option.textContent = config.choiceDescriptions?.[choice] ?? choice;
        input.appendChild(option);
      }
      input.value = String(userSettings[key]);
      input.addEventListener("change", () => set(input.value));
    }
    if (config.type === "enum") {
      label.append(config.description, input);
    } else {
      label.append(input, config.description);
    }
    container.appendChild(label);
  }
  return container;
}
function injectSettings(url) {
  if (url.startsWith("/u/") && url.includes("/preferences")) {
    requestAnimationFrame(() => {
      if (document.getElementById(`${THEME_ID}-user-settings`)) return;
      const preferences = document.querySelector(".user-preferences");
      if (preferences) {
        preferences.appendChild(makeSettingsEdits());
      }
    });
  }
}
export {
  userSettings,
  makeSettingsEdits,
  injectSettings,
  USER_SETTINGS_UPDATED_EVENT,
};
