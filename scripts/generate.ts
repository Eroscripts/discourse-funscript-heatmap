import packageJson from "../package.json";
import { parse } from "yaml";

console.log(packageJson);

const settingsYml = parse(await Bun.file("settings.yml").text());

console.log({ settingsYml });

// Generate the TypeScript constants and types
Bun.write(
  "src/lib/generated.ts",
  `
export const THEME_ID = "${packageJson.name}";
export const THEME_VERSION = "${packageJson.version}";
export const settingsYml = ${JSON.stringify(settingsYml, null, 2)} as const;
declare global {
    const settings: {
        [K in keyof typeof settingsYml]: {
            bool: boolean;
            string: string;
            number: number;
        }[typeof settingsYml[K]["type"]]
    }
}
`,
);

// Update about.json theme_version with package.json version
const aboutJson = await Bun.file("about.json").json();
aboutJson.theme_version = packageJson.version;
await Bun.write("about.json", JSON.stringify(aboutJson, null, 2));

// Run prettier on generated and updated files
await Bun.$`bun run lint`;

console.log("✅ Generated files updated and formatted!");
