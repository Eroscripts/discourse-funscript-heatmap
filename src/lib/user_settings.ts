import { settingsYml, THEME_ID } from "./generated";
const settingsTitle = "Heatmap Settings";

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export const USER_SETTINGS_UPDATED_EVENT = `${THEME_ID}-user-settings`;

// Proxy for user settings that stores in localStorage with theme-specific prefixes
export const userSettings = new Proxy(settings as Writable<typeof settings>, {
  get(target, prop: keyof typeof settings) {
    const value = localStorage.getItem(`${THEME_ID}-${String(prop)}`);
    try {
      if (value) return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return (
      settings[prop] ?? settingsYml[prop as keyof typeof settingsYml]?.default
    );
  },
  set(target, prop: keyof typeof settings, value) {
    localStorage.setItem(`${THEME_ID}-${String(prop)}`, JSON.stringify(value));
    return true;
  },
});

export function makeSettingsEdits() {
  const container = document.createElement("div");
  container.id = `${THEME_ID}-user-settings`;
  container.style.marginTop = "2em";

  const h3 = document.createElement("h3");
  h3.textContent = settingsTitle;
  container.appendChild(h3);

  for (const [key, config] of Object.entries(settingsYml) as [
    keyof typeof settingsYml,
    {
      type: string;
      description: string;
      default: any;
      choices?: readonly string[];
      choiceDescriptions?: Record<string, string>;
    },
  ][]) {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "0.5em";

    let input: HTMLInputElement | HTMLSelectElement =
      document.createElement("input");

    if (config.type !== "enum") {
      input.id = `${THEME_ID}-user-${key}`;
      input.style.marginRight = "0.5em";
    }

    function set(value: any) {
      let prev = userSettings[key];
      (userSettings as any)[key] = value;
      document.dispatchEvent(
        new CustomEvent(USER_SETTINGS_UPDATED_EVENT, {
          detail: { key, value, prev, ...config },
        }),
      );
    }

    if (config.type === "bool") {
      input.type = "checkbox";
      input.checked = !!userSettings[key];
      input.addEventListener("change", () =>
        set((input as HTMLInputElement).checked),
      );
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

export function injectSettings(url: string) {
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
