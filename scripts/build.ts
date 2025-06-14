export {};

const userscript = true;

await Bun.$`bunx prettier --write src/`;

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
        "async function clearCache",
        "var settings = {};async function clearCache",
      )
      .replace("userSettings.disable_heatmaps", "false");
  }
  await f.write(content);
}

await Bun.$`bunx prettier -w .`;
