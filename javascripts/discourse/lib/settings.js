

// export const userSettings = {
//     disable_heatmaps: false,
//     solid_background: false,
// }


const user_settings_desc = {
    disable_heatmaps: 'Disable funscript heatmap generation',
    solid_background: 'Use solid background color in heatmaps',
    cache_heatmaps: 'Cache heatmaps for faster loading',
}

export const userSettings = new Proxy(user_settings_desc, {
    get(target, prop) {
        let value = localStorage.getItem(`heatmap-${prop}`);
        if (value === null) {
            return settings[prop];
        }
        return JSON.parse(value);
    },
    set(target, prop, value) {
        localStorage.setItem(`heatmap-${prop}`, JSON.stringify(value));
        return true;
    },
});

export function makeSettingsEdits() {
    const container = document.createElement('div');
    container.id = 'heatmap-user-settings'
    let h3 = document.createElement('h3');
    h3.textContent = 'Heatmap User Settings';
    for (const [key, text] of Object.entries(user_settings_desc)) {
        let label = document.createElement('label');
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `user-${key}`;
        label.append(input, text);
        input.checked = userSettings[key];
        input.addEventListener('change', (e) => {
            userSettings[key] = e.target.checked;
        });
        container.appendChild(label);
    }
    return container;
}

export default user_settings_desc;