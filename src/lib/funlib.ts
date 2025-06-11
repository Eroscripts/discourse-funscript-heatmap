import { Funscript } from "@eroscripts/funlib";
import { toSvgBlobUrl } from "@eroscripts/funlib/rendering/svg";
import { userSettings } from "./settings";
export { Funscript } from "@eroscripts/funlib";
export { toSvgElement } from "@eroscripts/funlib/rendering/svg";

export const exampleFunscript = new Funscript({
  actions: [],
  // Array.from({ length: 20 }, (_, i) => ({at: (i ** 1.1) * 200, pos: i % 2 ? 100 : 0 }))
});
const exampleBlobCache = new Map<number, string>();
export function exampleBlobUrl(width: number = 690) {
  if (exampleBlobCache.has(width)) return exampleBlobCache.get(width)!;
  const blobUrl = toSvgBlobUrl(exampleFunscript, { width });
  exampleBlobCache.set(width, blobUrl);
  return blobUrl;
}
export function funscriptOptions(width: number = 690) {
  const solidBackground = userSettings.solid_background;
  return !solidBackground
    ? { width }
    : {
        width,
        solidHeaderBackground: true,
        headerOpacity: 0.2,
        halo: false,
      };
}

export function handyMark(fun: Funscript) {
  if ("_isForHandy" in fun) return;
  if (fun.axes.length) return;
  const stats = fun.toStats();
  if (stats.MaxSpeed > 500) return;

  const ats = fun.actions.map((a) => a.at).sort((a, b) => a - b);
  const diffs = ats.map((e, i, a) => e - a[i - 1]!).slice(1);
  let isForHandy = diffs.every((e) => e > 30);
  console.log({ ats, diffs, isForHandy });

  if (isForHandy) {
    Object.defineProperty(fun, "_isForHandy", {
      value: true,
      configurable: true,
      writable: true,
    });
  }
}
