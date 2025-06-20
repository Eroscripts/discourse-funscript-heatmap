export const THEME_ID = "discourse-funscript-heatmap";
export const THEME_VERSION = "1.2.0";
export const settingsYml = {
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
} as const;
declare global {
  const settings: {
    [K in keyof typeof settingsYml]: {
      bool: boolean;
      string: string;
      number: number;
    }[(typeof settingsYml)[K]["type"]];
  };
}
