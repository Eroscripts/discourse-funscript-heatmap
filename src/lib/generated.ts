export const THEME_ID = "discourse-funscript-heatmap";
export const THEME_VERSION = "2.0.0";
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
    type: "enum",
    default: "v1.1",
    choices: ["v2.0", "v1.1", "v1.0"],
    choiceDescriptions: {
      "v2.0":
        "2.0 - Download as 2.0 funscript, supported since MFP v1.33.9 & XTP v0.55b",
      "v1.1": "1.1 - Download as 1.1 funscript, supported by MFP since forever",
      "v1.0":
        "1.0 (separate) - Download all axis scripts as separate files. Saves you some clicking.",
    },
  },
  multiaxis_extension: {
    description: "File extension for merged multi-axis funscripts",
    type: "enum",
    default: ".funscript",
    choices: [".max.funscript", ".funscript"],
    choiceDescriptions: {
      ".max.funscript":
        "Use .max.funscript extension (requires video to be renamed to .max.mp4)",
      ".funscript": "Use .funscript extension",
    },
  },
} as const;
declare global {
  const settings: {
    [K in keyof typeof settingsYml]: {
      bool: boolean;
      string: string;
      number: number;
      enum: (typeof settingsYml)[K] extends { type: "enum" }
        ? (typeof settingsYml)[K]["choices"][number]
        : never;
    }[(typeof settingsYml)[K]["type"]];
  };
}
