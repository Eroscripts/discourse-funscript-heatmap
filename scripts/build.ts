export {};

await Bun.$`bun run generate`;

const userscript =
  process.argv.includes("--userscript") || process.argv.includes("-u");

let buildOutput = await Bun.build({
  entrypoints: [...new Bun.Glob("src/**/*.ts").scanSync()].filter(
    (f) => !f.endsWith(".d.ts"),
  ),
  outdir: "./javascripts/discourse",
  splitting: !userscript,
  target: "browser",
  external: ["discourse"],
});

for (let { path } of buildOutput.outputs) {
  let f = Bun.file(path);
  let content = await f.text();
  content = content.replace(/\nexport {.*?};/, "").replaceAll('.js";', '";');
  if (userscript) {
    content = content
      .replace(
        "api.decorateCookedElement(",
        "api.decorateCookedElement(decorateCookedElement = ",
      )
      .replace(
        /export {\s*theme_initializer_default as default\s*};/,
        "document.querySelectorAll('.cooked').forEach(decorateCookedElement)",
      )
      .replace(
        'import { apiInitializer } from "discourse/lib/api";',
        'const apiInitializer = window.require("discourse/lib/plugin-api").withPluginApi',
      )
      .replace(
        'import ClickTrack from "discourse/lib/click-track";',
        "const ClickTrack = window.require('discourse/lib/click-track').default;",
      )
      .replace("\n\n", `var settings = {};\n`)
      .replace("userSettings.disable_heatmaps", "false");
  }
  await f.write(content);
}

await Bun.$`bunx prettier -w .`;

// Copy theme-initializer.js to clipboard in userscript mode
if (userscript) {
  const { default: clipboardy } = await import("clipboardy");
  clipboardy.writeSync(
    await Bun.file(
      "./javascripts/discourse/api-initializers/theme-initializer.js",
    ).text(),
  );
  console.log("✅ Copied theme-initializer.js to clipboard!");
}
