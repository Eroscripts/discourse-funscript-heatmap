// src/lib/generated.ts
var THEME_ID = "discourse-funscript-heatmap";
var THEME_VERSION = "1.2.0";
var settingsYml = {
  disable_heatmaps: {
    type: "bool",
    default: false,
    description: "Disable funscript heatmap generation entirely",
  },
  solid_background: {
    type: "bool",
    default: false,
    description: "Use solid background color instead of gradient in heatmaps",
  },
  cache_heatmaps: {
    type: "bool",
    default: true,
    description: "Cache heatmaps for faster loading",
  },
  merge_scripts: {
    type: "bool",
    default: false,
    description: "Merge multi-axis funscripts",
  },
  use_max_extension: {
    type: "bool",
    default: true,
    description:
      "Use .max.funscript extension for multi-axis funscripts (renaming video to .max.mp4 is recommended)",
  },
};
export { settingsYml, THEME_VERSION, THEME_ID };
