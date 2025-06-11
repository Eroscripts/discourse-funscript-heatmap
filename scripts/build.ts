export {};

await Bun.$`bunx prettier --write src/`;

let buildOutput = await Bun.build({
  entrypoints: [...new Bun.Glob("src/**/*.ts").scanSync()].filter(
    (f) => !f.endsWith(".d.ts"),
  ),
  outdir: "./javascripts/discourse",
  splitting: true,
  target: "browser",
  external: ["discourse"],
});

for (let { path } of buildOutput.outputs) {
  let f = Bun.file(path);
  let content = await f.text();
  content = content.replace(/\nexport {.*?};/, "").replaceAll('.js";', '";');
  await f.write(content);
}
