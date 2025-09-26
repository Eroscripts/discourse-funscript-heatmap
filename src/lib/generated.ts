export const THEME_ID = "discourse-funscript-heatmap";
export const THEME_VERSION = "1.3.0";
export const settingsYml = {
  disable_heatmaps: {
    description: "Disable funscript heatmap generation entirely",
    type: "bool",
    default: false,
  },
  solid_background: {
    description: "Use solid background color instead of gradient in heatmaps",
    type: "bool",
    default: false,
  },
  cache_heatmaps: {
    description: "Cache heatmaps for faster loading",
    type: "bool",
    default: true,
  },
  merge_heatmaps: {
    description: "Merge heatmaps of multi-axis funscripts",
    type: "bool",
    default: true,
  },
  multiaxis_download_format: {
    description: "How to download multi-axis funscripts",
    type: "dropdown",
    default: "merged-axes",
    choices: [
      {
        value: "2.0",
        description:
          "2.0 - Download as 2.0 funscript, supported since MFP v1.33.9 & XTP v0.55b",
      },
      {
        value: "1.1",
        description:
          "1.1 - Download as 1.1 funscript, supported by MFP since forever",
      },
      {
        value: "1.0",
        description:
          "1.0 (separate) - Download all axis scripts as separate files. Saves you some clicking.",
      },
    ],
  },
  multiaxis_extension: {
    description: "File extension for merged multi-axis funscripts",
    type: "dropdown",
    default: ".funscript",
    choices: [
      {
        value: ".max.funscript",
        description:
          "Use .max.funscript extension (requires video to be renamed to .max.mp4)",
      },
      {
        value: ".funscript",
        description: "Use .funscript extension",
      },
    ],
  },
} as const;
declare global {
  const settings: {
    [K in keyof typeof settingsYml]: {
      bool: boolean;
      string: string;
      number: number;
      dropdown: (typeof settingsYml)[K] extends { type: "dropdown" }
        ? (typeof settingsYml)[K]["choices"][number]["value"]
        : never;
    }[(typeof settingsYml)[K]["type"]];
  };
}
