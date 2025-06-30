import { userSettings } from "./user_settings";
import "./generated";

// ../../projects/funlib/node_modules/colorizr/dist/index.mjs
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
function invariant(condition, message) {
  if (condition) {
    return;
  }
  if (true) {
    if (message === undefined) {
      throw new Error("invariant requires an error message argument");
    }
  }
  const error = !message
    ? new Error(
        "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.",
      )
    : new Error(message);
  error.name = "colorizr";
  throw error;
}
var COLOR_KEYS = {
  hsl: ["h", "s", "l"],
  oklab: ["l", "a", "b"],
  oklch: ["l", "c", "h"],
  rgb: ["r", "g", "b"],
};
var COLOR_MODELS = ["hsl", "oklab", "oklch", "rgb"];
var DEG2RAD = Math.PI / 180;
var LAB_TO_LMS = {
  l: [0.3963377773761749, 0.2158037573099136],
  m: [-0.1055613458156586, -0.0638541728258133],
  s: [-0.0894841775298119, -1.2914855480194092],
};
var LRGB_TO_LMS = {
  l: [0.4122214708, 0.5363325363, 0.0514459929],
  m: [0.2119034982, 0.6806995451, 0.1073969566],
  s: [0.0883024619, 0.2817188376, 0.6299787005],
};
var LSM_TO_LAB = {
  l: [0.2104542553, 0.793617785, 0.0040720468],
  a: [1.9779984951, 2.428592205, 0.4505937099],
  b: [0.0259040371, 0.7827717662, 0.808675766],
};
var LSM_TO_RGB = {
  r: [4.076741636075958, -3.307711539258063, 0.2309699031821043],
  g: [-1.2684379732850315, 2.609757349287688, -0.341319376002657],
  b: [-0.0041960761386756, -0.7034186179359362, 1.7076146940746117],
};
var PRECISION = 5;
var RAD2DEG = 180 / Math.PI;
var MESSAGES = {
  alpha: "amount must be a number between 0 and 1",
  hueRange: "hue must be a number between 0 and 360",
  input: "input is required",
  inputHex: "input is required and must be a hex",
  inputNumber: "input is required and must be a number",
  inputString: "input is required and must be a string",
  invalid: "invalid input",
  invalidCSS: "invalid CSS string",
  left: "left is required and must be a string",
  lightnessRange: "lightness must be a number between 0 and 1",
  options: "invalid options",
  right: "right is required and must be a string",
  threshold: "threshold must be a number between 0 and 255",
};
function isNumber(input) {
  return typeof input === "number" && !Number.isNaN(input);
}
function isPlainObject(input) {
  if (!input) {
    return false;
  }
  const { toString } = Object.prototype;
  const prototype = Object.getPrototypeOf(input);
  return (
    toString.call(input) === "[object Object]" &&
    (prototype === null || prototype === Object.getPrototypeOf({}))
  );
}
function isString(input, validate = true) {
  const isValid = typeof input === "string";
  if (validate) {
    return isValid && !!input.trim().length;
  }
  return isValid;
}
function isHex(input) {
  if (!isString(input)) {
    return false;
  }
  return /^#([\da-f]{3,4}|[\da-f]{6,8})$/i.test(input);
}
function isHSL(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  const entries = Object.entries(input);
  return (
    !!entries.length &&
    entries.every(([key, value]) => {
      if (key === "h") {
        return value >= 0 && value <= 360;
      }
      if (key === "alpha") {
        return value >= 0 && value <= 1;
      }
      return COLOR_KEYS.hsl.includes(key) && value >= 0 && value <= 100;
    })
  );
}
function isLAB(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  const entries = Object.entries(input);
  return (
    !!entries.length &&
    entries.every(([key, value]) => {
      if (key === "l") {
        return value >= 0 && value <= 100;
      }
      if (key === "alpha") {
        return value >= 0 && value <= 1;
      }
      return COLOR_KEYS.oklab.includes(key) && value >= -1 && value <= 1;
    })
  );
}
function isLCH(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  const entries = Object.entries(input);
  return (
    !!entries.length &&
    entries.every(([key, value]) => {
      if (key === "l") {
        return value >= 0 && value <= 100;
      }
      if (key === "alpha") {
        return value >= 0 && value <= 1;
      }
      return (
        COLOR_KEYS.oklch.includes(key) &&
        value >= 0 &&
        value <= (key === "h" ? 360 : 1)
      );
    })
  );
}
function isRGB(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  const entries = Object.entries(input);
  return (
    !!entries.length &&
    entries.every(([key, value]) => {
      if (key === "alpha") {
        return value >= 0 && value <= 1;
      }
      return COLOR_KEYS.rgb.includes(key) && value >= 0 && value <= 255;
    })
  );
}
function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}
function limit(input, model, key) {
  invariant(isNumber(input), "Input is not a number");
  invariant(
    COLOR_MODELS.includes(model),
    `Invalid model${model ? `: ${model}` : ""}`,
  );
  invariant(
    COLOR_KEYS[model].includes(key),
    `Invalid key${key ? `: ${key}` : ""}`,
  );
  switch (model) {
    case "hsl": {
      invariant(COLOR_KEYS.hsl.includes(key), "Invalid key");
      if (["s", "l"].includes(key)) {
        return clamp(input);
      }
      return clamp(input, 0, 360);
    }
    case "rgb": {
      invariant(COLOR_KEYS.rgb.includes(key), "Invalid key");
      return clamp(input, 0, 255);
    }
    default: {
      throw new Error("Invalid inputs");
    }
  }
}
function parseInput(input, model) {
  const keys = COLOR_KEYS[model];
  const validator = {
    hsl: isHSL,
    oklab: isLAB,
    oklch: isLCH,
    rgb: isRGB,
  };
  invariant(isPlainObject(input) || Array.isArray(input), MESSAGES.invalid);
  const value = Array.isArray(input)
    ? { [keys[0]]: input[0], [keys[1]]: input[1], [keys[2]]: input[2] }
    : input;
  invariant(validator[model](value), `invalid ${model} color`);
  return value;
}
function restrictValues(input, precision = PRECISION, forcePrecision = true) {
  const output = new Map(Object.entries(input));
  for (const [key, value] of output.entries()) {
    output.set(key, round(value, precision, forcePrecision));
  }
  return Object.fromEntries(output);
}
function round(input, precision = 2, forcePrecision = true) {
  if (!isNumber(input) || input === 0) {
    return 0;
  }
  if (forcePrecision) {
    const factor2 = 10 ** precision;
    return Math.round(input * factor2) / factor2;
  }
  const absInput = Math.abs(input);
  let digits = Math.abs(Math.ceil(Math.log(absInput) / Math.LN10));
  if (digits === 0) {
    digits = 2;
  } else if (digits > precision) {
    digits = precision;
  }
  let exponent = precision - (digits < 0 ? 0 : digits);
  if (exponent <= 1 && precision > 1) {
    exponent = 2;
  } else if (exponent > precision || exponent === 0) {
    exponent = precision;
  }
  const factor = 10 ** exponent;
  return Math.round(input * factor) / factor;
}
var converters_exports = {};
__export(converters_exports, {
  hex2hsl: () => hex2hsl,
  hex2oklab: () => hex2oklab,
  hex2oklch: () => hex2oklch,
  hex2rgb: () => hex2rgb,
  hsl2hex: () => hsl2hex,
  hsl2oklab: () => hsl2oklab,
  hsl2oklch: () => hsl2oklch,
  hsl2rgb: () => hsl2rgb,
  oklab2hex: () => oklab2hex,
  oklab2hsl: () => oklab2hsl,
  oklab2oklch: () => oklab2oklch,
  oklab2rgb: () => oklab2rgb,
  oklch2hex: () => oklch2hex,
  oklch2hsl: () => oklch2hsl,
  oklch2oklab: () => oklch2oklab,
  oklch2rgb: () => oklch2rgb,
  rgb2hex: () => rgb2hex,
  rgb2hsl: () => rgb2hsl,
  rgb2oklab: () => rgb2oklab,
  rgb2oklch: () => rgb2oklch,
});
function formatHex(input) {
  invariant(isHex(input), MESSAGES.inputHex);
  let color = input.replace("#", "");
  if (color.length === 3 || color.length === 4) {
    const values = [...color];
    color = "";
    values.forEach((d) => {
      color += `${d}${d}`;
    });
  }
  const hex = `#${color}`;
  invariant(isHex(hex), "invalid hex");
  return hex;
}
function hex2rgb(input) {
  invariant(isHex(input), MESSAGES.inputHex);
  const hex = formatHex(input).slice(1);
  return {
    r: parseInt(hex.charAt(0) + hex.charAt(1), 16),
    g: parseInt(hex.charAt(2) + hex.charAt(3), 16),
    b: parseInt(hex.charAt(4) + hex.charAt(5), 16),
  };
}
function rgb2hsl(input) {
  const value = parseInput(input, "rgb");
  const rLimit = limit(value.r, "rgb", "r") / 255;
  const gLimit = limit(value.g, "rgb", "g") / 255;
  const bLimit = limit(value.b, "rgb", "b") / 255;
  const min = Math.min(rLimit, gLimit, bLimit);
  const max = Math.max(rLimit, gLimit, bLimit);
  const delta = max - min;
  let h = 0;
  let s;
  const l = (max + min) / 2;
  let rate;
  switch (max) {
    case rLimit:
      rate = !delta ? 0 : (gLimit - bLimit) / delta;
      h = 60 * rate;
      break;
    case gLimit:
      rate = (bLimit - rLimit) / delta;
      h = 60 * rate + 120;
      break;
    case bLimit:
      rate = (rLimit - gLimit) / delta;
      h = 60 * rate + 240;
      break;
    default:
      break;
  }
  if (h < 0) {
    h = 360 + h;
  }
  if (min === max) {
    s = 0;
  } else {
    s = l < 0.5 ? delta / (2 * l) : delta / (2 - 2 * l);
  }
  return {
    h: Math.abs(+(h % 360).toFixed(2)),
    s: +(s * 100).toFixed(2),
    l: +(l * 100).toFixed(2),
  };
}
function hex2hsl(input) {
  invariant(isHex(input), MESSAGES.inputHex);
  return rgb2hsl(hex2rgb(input));
}
var { cbrt, sign } = Math;
function rgb2lrgb(input) {
  const abs2 = Math.abs(input);
  if (abs2 < 0.04045) {
    return input / 12.92;
  }
  return (sign(input) || 1) * ((abs2 + 0.055) / 1.055) ** 2.4;
}
function rgb2oklab(input, precision = PRECISION) {
  const value = parseInput(input, "rgb");
  const [lr, lg, lb] = [
    rgb2lrgb(value.r / 255),
    rgb2lrgb(value.g / 255),
    rgb2lrgb(value.b / 255),
  ];
  const l = cbrt(
    LRGB_TO_LMS.l[0] * lr + LRGB_TO_LMS.l[1] * lg + LRGB_TO_LMS.l[2] * lb,
  );
  const m = cbrt(
    LRGB_TO_LMS.m[0] * lr + LRGB_TO_LMS.m[1] * lg + LRGB_TO_LMS.m[2] * lb,
  );
  const s = cbrt(
    LRGB_TO_LMS.s[0] * lr + LRGB_TO_LMS.s[1] * lg + LRGB_TO_LMS.s[2] * lb,
  );
  const lab = {
    l: LSM_TO_LAB.l[0] * l + LSM_TO_LAB.l[1] * m - LSM_TO_LAB.l[2] * s,
    a: LSM_TO_LAB.a[0] * l - LSM_TO_LAB.a[1] * m + LSM_TO_LAB.a[2] * s,
    b: LSM_TO_LAB.b[0] * l + LSM_TO_LAB.b[1] * m - LSM_TO_LAB.b[2] * s,
  };
  return restrictValues(lab, precision);
}
function hex2oklab(input, precision) {
  invariant(isHex(input), MESSAGES.inputHex);
  return rgb2oklab(hex2rgb(input), precision);
}
var { atan2, sqrt } = Math;
function oklab2oklch(input, precision) {
  const { l, a, b } = restrictValues(parseInput(input, "oklab"));
  const c = sqrt(a ** 2 + b ** 2);
  let h = (atan2(b, a) * RAD2DEG + 360) % 360;
  if (round(c * 1e4) === 0) {
    h = 0;
  }
  return restrictValues({ l, c, h }, precision);
}
function rgb2oklch(input, precision) {
  const value = parseInput(input, "rgb");
  return oklab2oklch(rgb2oklab(value, precision), precision);
}
function hex2oklch(input, precision) {
  invariant(isHex(input), MESSAGES.inputHex);
  return rgb2oklch(hex2rgb(input), precision);
}
function hue2rgb(point, chroma2, h) {
  invariant(
    isNumber(point) && isNumber(chroma2) && isNumber(h),
    "point, chroma and h are required",
  );
  let hue = h;
  if (hue < 0) {
    hue += 1;
  }
  if (hue > 1) {
    hue -= 1;
  }
  if (hue < 1 / 6) {
    return round(point + (chroma2 - point) * 6 * hue, 4);
  }
  if (hue < 1 / 2) {
    return round(chroma2, 4);
  }
  if (hue < 2 / 3) {
    return round(point + (chroma2 - point) * (2 / 3 - hue) * 6, 4);
  }
  return round(point, 4);
}
function hsl2rgb(input) {
  const value = parseInput(input, "hsl");
  const h = round(value.h) / 360;
  const s = round(value.s) / 100;
  const l = round(value.l) / 100;
  let r;
  let g;
  let b;
  let point;
  let chroma2;
  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    chroma2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    point = 2 * l - chroma2;
    r = hue2rgb(point, chroma2, h + 1 / 3);
    g = hue2rgb(point, chroma2, h);
    b = hue2rgb(point, chroma2, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
function rgb2hex(input) {
  const rgb = parseInput(input, "rgb");
  return `#${Object.values(rgb)
    .map((d) => `0${Math.floor(d).toString(16)}`.slice(-2))
    .join("")}`;
}
function hsl2hex(input) {
  const value = parseInput(input, "hsl");
  return rgb2hex(hsl2rgb(value));
}
function hsl2oklab(input, precision) {
  const value = parseInput(input, "hsl");
  return rgb2oklab(hsl2rgb(value), precision);
}
function hsl2oklch(input, precision) {
  const value = parseInput(input, "hsl");
  return rgb2oklch(hsl2rgb(value), precision);
}
var { abs } = Math;
function lrgb2rgb(input) {
  const absoluteNumber = abs(input);
  const sign2 = input < 0 ? -1 : 1;
  if (absoluteNumber > 0.0031308) {
    return sign2 * (absoluteNumber ** (1 / 2.4) * 1.055 - 0.055);
  }
  return input * 12.92;
}
function oklab2rgb(input, precision = 0) {
  const { l: L, a: A, b: B } = parseInput(input, "oklab");
  const l = (L + LAB_TO_LMS.l[0] * A + LAB_TO_LMS.l[1] * B) ** 3;
  const m = (L + LAB_TO_LMS.m[0] * A + LAB_TO_LMS.m[1] * B) ** 3;
  const s = (L + LAB_TO_LMS.s[0] * A + LAB_TO_LMS.s[1] * B) ** 3;
  const r =
    255 *
    lrgb2rgb(LSM_TO_RGB.r[0] * l + LSM_TO_RGB.r[1] * m + LSM_TO_RGB.r[2] * s);
  const g =
    255 *
    lrgb2rgb(LSM_TO_RGB.g[0] * l + LSM_TO_RGB.g[1] * m + LSM_TO_RGB.g[2] * s);
  const b =
    255 *
    lrgb2rgb(LSM_TO_RGB.b[0] * l + LSM_TO_RGB.b[1] * m + LSM_TO_RGB.b[2] * s);
  return {
    r: clamp(round(r, precision), 0, 255),
    g: clamp(round(g, precision), 0, 255),
    b: clamp(round(b, precision), 0, 255),
  };
}
function oklab2hex(input) {
  const value = parseInput(input, "oklab");
  return rgb2hex(oklab2rgb(value));
}
function oklab2hsl(input) {
  const value = parseInput(input, "oklab");
  return rgb2hsl(oklab2rgb(value));
}
var { sin, cos } = Math;
function oklch2oklab(input, precision) {
  let { l, c, h } = parseInput(input, "oklch");
  if (Number.isNaN(h) || h < 0) {
    h = 0;
  }
  return restrictValues(
    { l, a: c * cos(h * DEG2RAD), b: c * sin(h * DEG2RAD) },
    precision,
  );
}
function oklch2rgb(input, precision = 0) {
  const value = parseInput(input, "oklch");
  return oklab2rgb(oklch2oklab(value), precision);
}
function oklch2hex(input) {
  const value = parseInput(input, "oklch");
  return rgb2hex(oklch2rgb(value));
}
function oklch2hsl(input) {
  const value = parseInput(input, "oklch");
  return rgb2hsl(oklch2rgb(value));
}

// ../../projects/funlib/src/misc.ts
function clamp2(value, left, right) {
  return Math.max(left, Math.min(right, value));
}
function lerp(left, right, t) {
  return left * (1 - t) + right * t;
}
function unlerp(left, right, value) {
  if (left === right) return 0.5;
  return (value - left) / (right - left);
}
function clamplerp(value, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, clamp2(unlerp(inMin, inMax, value), 0, 1));
}
function listToSum(list) {
  return list.reduce((a, b) => a + b, 0);
}
function speedBetween(a, b) {
  if (!a || !b) return 0;
  if (a.at === b.at) return 0;
  return ((b.pos - a.pos) / (b.at - a.at)) * 1000;
}
function compareWithOrder(a, b, order) {
  const N = order.length;
  let aIndex = order.indexOf(a);
  let bIndex = order.indexOf(b);
  aIndex = aIndex > -1 ? aIndex : a ? N : a === "" ? N + 1 : N + 2;
  bIndex = bIndex > -1 ? bIndex : b ? N : b === "" ? N + 1 : N + 2;
  if (aIndex !== bIndex) return aIndex - bIndex;
  if (aIndex === N) {
    return a === b ? 0 : a < b ? -1 : 1;
  }
  return 0;
}
function makeNonEnumerable(target, key, value) {
  return Object.defineProperty(target, key, {
    value: value ?? target[key],
    writable: true,
    configurable: true,
    enumerable: false,
  });
}
function clone(obj, ...args) {
  return new obj.constructor(obj, ...args);
}

// ../../projects/funlib/src/converter.ts
function timeSpanToMs(timeSpan) {
  if (typeof timeSpan !== "string") {
    throw new TypeError("timeSpanToMs: timeSpan must be a string");
  }
  const sign2 = timeSpan.startsWith("-") ? -1 : 1;
  if (sign2 < 0) timeSpan = timeSpan.slice(1);
  const split = timeSpan.split(":").map((e) => Number.parseFloat(e));
  while (split.length < 3) split.unshift(0);
  const [hours, minutes, seconds] = split;
  return Math.round(sign2 * (hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}
function msToTimeSpan(ms) {
  const sign2 = ms < 0 ? -1 : 1;
  ms *= sign2;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 1000 / 60) % 60;
  const hours = Math.floor(ms / 1000 / 60 / 60);
  ms = ms % 1000;
  return `${sign2 < 0 ? "-" : ""}${hours.toFixed(0).padStart(2, "0")}:${minutes.toFixed(0).padStart(2, "0")}:${seconds.toFixed(0).padStart(2, "0")}.${ms.toFixed(0).padStart(3, "0")}`;
}
function secondsToDuration(seconds) {
  seconds = Math.round(seconds);
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
      .toFixed(0)
      .padStart(2, "0")}`;
  }
  return `${Math.floor(seconds / 60 / 60)}:${Math.floor((seconds / 60) % 60)
    .toFixed(0)
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toFixed(0)
    .padStart(2, "0")}`;
}
function orderTrimJson(that, overrides) {
  const shape = that.constructor?.jsonShape;
  if (!shape || typeof shape !== "object") {
    throw new Error("orderTrimJson: missing static jsonShape on constructor");
  }
  const copy = { ...shape, ...that, ...overrides };
  for (const [k, v] of Object.entries(shape)) {
    if (v === undefined || !(k in copy)) continue;
    const copyValue = copy[k];
    if (copyValue === v) delete copy[k];
    if (
      Array.isArray(v) &&
      Array.isArray(copyValue) &&
      copyValue.length === 0 &&
      v.length === 0
    ) {
      delete copy[k];
    } else if (
      typeof v === "object" &&
      v !== null &&
      Object.keys(v).length === 0 &&
      typeof copyValue === "object" &&
      copyValue !== null &&
      Object.keys(copyValue).length === 0
    ) {
      delete copy[k];
    }
  }
  return copy;
}
function fromEntries(a) {
  return Object.fromEntries(a);
}
var axisPairs = [
  ["L0", "stroke"],
  ["L1", "surge"],
  ["L2", "sway"],
  ["R0", "twist"],
  ["R1", "roll"],
  ["R2", "pitch"],
  ["A1", "suck"],
];
var axisToNameMap = fromEntries(axisPairs);
var axisNameToAxisMap = fromEntries(axisPairs.map(([a, b]) => [b, a]));
var axisIds = axisPairs.map((e) => e[0]);
var axisNames = axisPairs.map((e) => e[1]);
var axisLikes = axisPairs.flat();
function axisLikeToAxis(axisLike) {
  if (!axisLike) return "L0";
  if (axisIds.includes(axisLike)) return axisLike;
  if (axisNames.includes(axisLike)) return axisNameToAxisMap[axisLike];
  if (axisLike === "singleaxis") return "L0";
  throw new Error(`axisLikeToAxis: ${axisLike} is not supported`);
}
function orderByAxis(a, b) {
  return compareWithOrder(a.id, b.id, axisIds);
}
function formatJson(
  json,
  { lineLength = 100, maxPrecision = 0, compress = true } = {},
) {
  function removeNewlines(s) {
    return s.replaceAll(/ *\n\s*/g, " ");
  }
  const inArrayRegex = /(?<=\[)((?:[^[\]]|\[[^[\]]*\])*)(?=\])/g;
  json = json.replaceAll(
    /\{\s*"(at|time|startTime)":[^{}]+\}/g,
    removeNewlines,
  );
  json = json.replaceAll(inArrayRegex, (s) => {
    s = s.replaceAll(/(?<="(at|pos)":\s*)(-?\d+\.?\d*)/g, (num) =>
      Number(num).toFixed(maxPrecision).replace(/\.0+$/, ""),
    );
    const atValues = s.match(/(?<="at":\s*)(-?\d+\.?\d*)/g) ?? [];
    if (atValues.length === 0) return s;
    const maxAtLength = Math.max(0, ...atValues.map((e) => e.length));
    s = s.replaceAll(/(?<="at":\s*)(-?\d+\.?\d*)/g, (s2) =>
      s2.padStart(maxAtLength, " "),
    );
    const posValues = s.match(/(?<="pos":\s*)(-?\d+\.?\d*)/g) ?? [];
    const posDot = Math.max(
      0,
      ...posValues
        .map((e) => e.split(".")[1])
        .filter((e) => e)
        .map((e) => e.length + 1),
    );
    s = s.replaceAll(/(?<="pos":\s*)(-?\d+\.?\d*)/g, (s2) => {
      if (!s2.includes(".")) return s2.padStart(3) + " ".repeat(posDot);
      const [a, b] = s2.split(".");
      return `${a.padStart(3)}.${b.padEnd(posDot - 1, " ")}`;
    });
    const actionLength =
      '{ "at": , "pos": 100 },'.length + maxAtLength + posDot;
    let actionsPerLine1 = 10;
    while (6 + (actionLength + 1) * actionsPerLine1 - 1 > lineLength)
      actionsPerLine1--;
    let i = 0;
    s = s.replaceAll(/\n(?!\s*$)\s*/g, (s2) =>
      i++ % actionsPerLine1 === 0 ? s2 : " ",
    );
    if (compress) {
      const [, start, , end] = s.match(
        /^(\s*(?=$|\S))([\s\S]+)((?<=^|\S)\s*)$/,
      ) ?? ["", "", "", ""];
      s = start + JSON.stringify(JSON.parse(`[${s}]`)).slice(1, -1) + end;
    }
    return s;
  });
  return json;
}
var speedToOklchParams = {
  l: { left: 500, right: 600, from: 0.8, to: 0.4 },
  c: { left: 800, right: 900, from: 0.4, to: 0.1 },
  h: { speed: -2.4, offset: 210 },
  a: { left: 0, right: 100, from: 0, to: 1 },
};
function speedToOklch(speed, useAlpha = false) {
  function roll(value, cap) {
    return ((value % cap) + cap) % cap;
  }
  const l = clamplerp(
    speed,
    speedToOklchParams.l.left,
    speedToOklchParams.l.right,
    speedToOklchParams.l.from,
    speedToOklchParams.l.to,
  );
  const c = clamplerp(
    speed,
    speedToOklchParams.c.left,
    speedToOklchParams.c.right,
    speedToOklchParams.c.from,
    speedToOklchParams.c.to,
  );
  const h = roll(
    speedToOklchParams.h.offset + speed / speedToOklchParams.h.speed,
    360,
  );
  const a = useAlpha
    ? clamplerp(
        speed,
        speedToOklchParams.a.left,
        speedToOklchParams.a.right,
        speedToOklchParams.a.from,
        speedToOklchParams.a.to,
      )
    : 1;
  return [l, c, h, a];
}
function speedToHex(speed) {
  const [l, c, h] = speedToOklch(speed);
  return oklch2hex({ l, c, h });
}
var hexCache = new Map();
function speedToHexCached(speed) {
  if (hexCache.has(speed)) return hexCache.get(speed);
  const hex = speedToHex(Math.abs(speed));
  hexCache.set(speed, hex);
  return hex;
}

// ../../projects/funlib/src/index.ts
class FunAction {
  at = 0;
  pos = 0;
  constructor(action) {
    Object.assign(this, action);
  }
  static jsonShape = { at: undefined, pos: undefined };
  toJSON() {
    return orderTrimJson(this, {
      at: +this.at.toFixed(1),
      pos: +this.pos.toFixed(1),
    });
  }
  clone() {
    return clone(this);
  }
}

class FunChapter {
  name = "";
  startTime = "00:00:00.000";
  endTime = "00:00:00.000";
  constructor(chapter) {
    Object.assign(this, chapter);
  }
  get startAt() {
    return timeSpanToMs(this.startTime);
  }
  set startAt(v) {
    this.startTime = msToTimeSpan(v);
  }
  get endAt() {
    return timeSpanToMs(this.endTime);
  }
  set endAt(v) {
    this.endTime = msToTimeSpan(v);
  }
  static jsonShape = { startTime: undefined, endTime: undefined, name: "" };
  toJSON() {
    return orderTrimJson(this);
  }
  clone() {
    return clone(this);
  }
}

class FunBookmark {
  name = "";
  time = "00:00:00.000";
  constructor(bookmark) {
    this.name = bookmark?.name ?? "";
    this.time = bookmark?.time ?? "00:00:00.000";
  }
  get startAt() {
    return timeSpanToMs(this.time);
  }
  set startAt(v) {
    this.time = msToTimeSpan(v);
  }
  static jsonShape = { time: undefined, name: "" };
  toJSON() {
    return orderTrimJson(this);
  }
}

class FunMetadata {
  static Bookmark = FunBookmark;
  static Chapter = FunChapter;
  duration = 0;
  chapters = [];
  bookmarks = [];
  constructor(metadata, parent) {
    Object.assign(this, metadata);
    const base = this.constructor;
    if (metadata?.bookmarks)
      this.bookmarks = metadata.bookmarks.map((e) => new base.Bookmark(e));
    if (metadata?.chapters)
      this.chapters = metadata.chapters.map((e) => new base.Chapter(e));
    if (metadata?.duration) this.duration = metadata.duration;
    if (this.duration > 3600) {
      const actionsDuration = parent?.actionsDuraction;
      if (actionsDuration && actionsDuration < 500 * this.duration) {
        this.duration /= 1000;
      }
    }
  }
  static jsonShape = {
    title: "",
    creator: "",
    description: "",
    duration: undefined,
    chapters: [],
    bookmarks: [],
    license: "",
    notes: "",
    performers: [],
    script_url: "",
    tags: [],
    type: "basic",
    video_url: "",
  };
  toJSON() {
    return orderTrimJson(this, {
      duration: +this.duration.toFixed(3),
    });
  }
  clone() {
    const clonedData = JSON.parse(JSON.stringify(this.toJSON()));
    return clone(this, clonedData);
  }
}

class FunscriptFile {
  axisName = "";
  title = "";
  dir = "";
  mergedFiles;
  constructor(filePath) {
    if (filePath instanceof FunscriptFile) filePath = filePath.filePath;
    let parts = filePath.split(".");
    if (parts.at(-1) === "funscript") parts.pop();
    const axisLike = parts.at(-1);
    if (axisLikes.includes(axisLike)) {
      this.axisName = parts.pop();
    }
    filePath = parts.join(".");
    parts = filePath.split(/[\\/]/);
    this.title = parts.pop();
    this.dir = filePath.slice(0, -this.title.length);
  }
  get id() {
    return !this.axisName ? undefined : axisLikeToAxis(this.axisName);
  }
  get filePath() {
    return `${this.dir}${this.title}${this.axisName ? `.${this.axisName}` : ""}.funscript`;
  }
  clone() {
    return clone(this, this.filePath);
  }
}

class Funscript {
  static Action = FunAction;
  static Chapter = FunChapter;
  static Bookmark = FunBookmark;
  static Metadata = FunMetadata;
  static File = FunscriptFile;
  static AxisScript = null;
  static mergeMultiAxis(scripts, options) {
    const multiaxisScripts = scripts.filter((e) => e.axes.length);
    const singleaxisScripts = scripts.filter((e) => !e.axes.length);
    const groups = Object.groupBy(singleaxisScripts, (e) =>
      e.file ? e.file.dir + e.file.title : "[unnamed]",
    );
    const mergedSingleaxisScripts = Object.entries(groups).flatMap(
      ([_title, scripts2]) => {
        if (!scripts2) return [];
        const allScripts = scripts2
          .flatMap((e) => [e, ...e.axes])
          .sort(orderByAxis);
        const axes = [...new Set(allScripts.map((e) => e.id))];
        if (axes.length === allScripts.length) {
          const L0 = allScripts.find((e) => e.id === "L0");
          if (L0) {
            const result = new this(L0, {
              axes: allScripts.filter((e) => e !== L0),
            });
            if (L0.file) {
              result.file = L0.file.clone();
              result.file.mergedFiles = allScripts.map((e) => e.file);
            }
            return result;
          }
          if (options?.allowMissingL0) {
            const result = new this(
              { metadata: allScripts[0].metadata.clone(), actions: [] },
              {
                axes: allScripts,
              },
            );
            if (allScripts[0].file) {
              result.file = allScripts[0].file.clone();
              result.file.axisName = "";
              result.file.mergedFiles = allScripts.map((e) => e.file);
            }
            return result;
          }
          throw new Error(
            "Funscript.mergeMultiAxis: trying to merge multi-axis scripts without L0",
          );
        }
        console.log(
          allScripts.map((e) => e.file?.filePath),
          axes,
        );
        throw new Error(
          "Funscript.mergeMultiAxis: multi-axis scripts are not implemented yet",
        );
      },
    );
    return [...multiaxisScripts, ...mergedSingleaxisScripts];
  }
  id = "L0";
  actions = [];
  axes = [];
  metadata;
  parent;
  file;
  constructor(funscript, extras) {
    Object.assign(this, funscript);
    const base = this.constructor;
    this.metadata = new base.Metadata();
    if (extras?.file) this.file = new base.File(extras.file);
    else if (funscript instanceof Funscript)
      this.file = funscript.file?.clone();
    this.id =
      extras?.id ??
      funscript?.id ??
      this.file?.id ??
      (this instanceof AxisScript ? null : "L0");
    if (funscript?.actions) {
      this.actions = funscript.actions.map((e) => new base.Action(e));
    }
    if (funscript?.metadata !== undefined)
      this.metadata = new base.Metadata(funscript.metadata, this);
    else if (funscript instanceof Funscript)
      this.file = funscript.file?.clone();
    if (extras?.axes) {
      if (funscript?.axes?.length)
        throw new Error("FunFunscript: both axes and axes are defined");
      this.axes = extras.axes
        .map((e) => new base.AxisScript(e, { parent: this }))
        .sort(orderByAxis);
    } else if (funscript?.axes) {
      this.axes = funscript.axes
        .map((e) => new base.AxisScript(e, { parent: this }))
        .sort(orderByAxis);
    }
    if (extras?.parent) this.parent = extras.parent;
    makeNonEnumerable(this, "parent");
    makeNonEnumerable(this, "file");
  }
  get duration() {
    if (this.metadata.duration) return this.metadata.duration;
    return (
      Math.max(
        this.actions.at(-1)?.at ?? 0,
        ...this.axes.map((e) => e.actions.at(-1)?.at ?? 0),
      ) / 1000
    );
  }
  get actionsDuraction() {
    return (
      Math.max(
        this.actions.at(-1)?.at ?? 0,
        ...this.axes.map((e) => e.actions.at(-1)?.at ?? 0),
      ) / 1000
    );
  }
  get actualDuration() {
    if (!this.metadata.duration) return this.actionsDuraction;
    const actionsDuraction = this.actionsDuraction;
    const metadataDuration = this.metadata.duration;
    if (actionsDuraction > metadataDuration) return actionsDuraction;
    if (actionsDuraction * 3 < metadataDuration) return actionsDuraction;
    return metadataDuration;
  }
  normalize() {
    this.axes.forEach((e) => e.normalize());
    this.actions.forEach((e) => {
      e.at = Math.round(e.at) || 0;
      e.pos = clamp2(Math.round(e.pos) || 0, 0, 100);
    });
    this.actions.sort((a, b) => a.at - b.at);
    this.actions = this.actions.filter((e, i, a) => {
      if (!i) return true;
      return a[i - 1].at < e.at;
    });
    const negativeActions = this.actions.filter((e) => e.at < 0);
    if (negativeActions.length) {
      this.actions = this.actions.filter((e) => e.at >= 0);
      if (this.actions[0]?.at > 0) {
        const lastNegative = negativeActions.at(-1);
        lastNegative.at = 0;
        this.actions.unshift(lastNegative);
      }
    }
    const duration = Math.ceil(this.actualDuration);
    this.metadata.duration = duration;
    this.axes.forEach((e) => (e.metadata.duration = duration));
    return this;
  }
  getAxes(ids) {
    const allAxes = [this, ...this.axes].sort(orderByAxis);
    if (!ids) return allAxes;
    return allAxes.filter((axis) => ids.includes(axis.id));
  }
  static jsonShape = {
    id: undefined,
    metadata: {},
    actions: undefined,
    axes: [],
    inverted: false,
    range: 100,
    version: "1.0",
  };
  toJSON() {
    return orderTrimJson(this, {
      axes: this.axes
        .slice()
        .sort(orderByAxis)
        .map((e) => ({ ...e.toJSON(), metadata: undefined })),
      metadata: {
        ...this.metadata.toJSON(),
        duration: +this.duration.toFixed(3),
      },
    });
  }
  toJsonText(options) {
    return formatJson(JSON.stringify(this, null, 2), options ?? {});
  }
  clone() {
    const cloned = clone(this);
    cloned.file = this.file?.clone();
    return cloned;
  }
}

class AxisScript extends Funscript {
  constructor(funscript, extras) {
    super(funscript, extras);
    if (!this.id) throw new Error("AxisScript: axis is not defined");
    if (!this.parent) throw new Error("AxisScript: parent is not defined");
  }
  clone() {
    const index = this.parent.axes.indexOf(this);
    return this.parent.clone().axes[index];
  }
}
Funscript.AxisScript = AxisScript;

// ../../projects/funlib/src/manipulations.ts
function isPeak(actions, index) {
  const action = actions[index];
  const prevAction = actions[index - 1];
  const nextAction = actions[index + 1];
  if (!prevAction && !nextAction) return 1;
  if (!prevAction) {
    const speedFrom2 = speedBetween(action, nextAction);
    return speedFrom2 < 0 ? 1 : 1;
  }
  if (!nextAction) {
    const speedTo2 = speedBetween(prevAction, action);
    return speedTo2 > 0 ? -1 : -1;
  }
  const speedTo = speedBetween(prevAction, action);
  const speedFrom = speedBetween(action, nextAction);
  if (Math.sign(speedTo) === Math.sign(speedFrom)) return 0;
  if (speedTo > speedFrom) return 1;
  if (speedTo < speedFrom) return -1;
  return 0;
}
function actionsToLines(actions) {
  return actions
    .map((e, i, a) => {
      const p = a[i - 1];
      if (!p) return null;
      const speed = speedBetween(p, e);
      return Object.assign([p, e, Math.abs(speed)], {
        speed,
        absSpeed: Math.abs(speed),
        speedSign: Math.sign(speed),
        dat: e.at - p.at,
        atStart: p.at,
        atEnd: e.at,
      });
    })
    .slice(1)
    .filter((e) => e[0].at < e[1].at);
}
function actionsToZigzag(actions) {
  return actions.filter((_, i) => isPeak(actions, i)).map((e) => e.clone());
}
function mergeLinesSpeed(lines, mergeLimit) {
  if (!mergeLimit) return lines;
  let j = 0;
  for (let i = 0; i < lines.length - 1; i = j + 1) {
    for (j = i; j < lines.length - 1; j++) {
      if (lines[i].speedSign !== lines[j + 1].speedSign) break;
    }
    const f = lines.slice(i, j + 1);
    if (i === j) continue;
    if (listToSum(f.map((e) => e.dat)) > mergeLimit) continue;
    const avgSpeed =
      listToSum(f.map((e) => e.absSpeed * e.dat)) /
      listToSum(f.map((e) => e.dat));
    f.map((e) => (e[2] = avgSpeed));
  }
  return lines;
}
function actionsAverageSpeed(actions) {
  const zigzag = actionsToZigzag(actions);
  const fast = zigzag.filter((e, i, arr) => {
    const prev = arr[i - 1];
    return prev && Math.abs(speedBetween(prev, e)) > 30;
  });
  return (
    listToSum(
      fast.map((e, i, arr) => {
        const prev = arr[i - 1];
        const next = arr[i + 1];
        const speedTo = prev ? Math.abs(speedBetween(prev, e)) : 0;
        const datNext = next ? next.at - e.at : 0;
        return speedTo * datNext;
      }),
    ) /
    (listToSum(
      fast.map((e, i, arr) => {
        const next = arr[i + 1];
        return next ? next.at - e.at : 0;
      }),
    ) || 1)
  );
}
function actionsRequiredMaxSpeed(actions) {
  if (actions.length < 2) return 0;
  const requiredSpeeds = [];
  let nextPeakIndex = 0;
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    if (nextPeakIndex === i) {
      nextPeakIndex = actions.findIndex(
        (action, idx) => idx > i && isPeak(actions, idx) !== 0,
      );
      if (nextPeakIndex === -1) break;
    }
    const nextPeak = actions[nextPeakIndex];
    if (!nextPeak) break;
    requiredSpeeds.push([
      Math.abs(speedBetween(a, nextPeak)),
      nextPeak.at - a.at,
    ]);
  }
  const sorted = requiredSpeeds.sort((a, b) => a[0] - b[0]).reverse();
  return sorted.find((e) => e[1] >= 50)?.[0] ?? 0;
}
function toStats(actions, options) {
  const MaxSpeed = actionsRequiredMaxSpeed(actions);
  const AvgSpeed = actionsAverageSpeed(actions);
  return {
    Duration: secondsToDuration(options.durationSeconds),
    Actions: actions.filter((_, i) => isPeak(actions, i) !== 0).length,
    MaxSpeed: Math.round(MaxSpeed),
    AvgSpeed: Math.round(AvgSpeed),
  };
}

// ../../projects/funlib/src/rendering/svg.ts
var SPACING_BETWEEN_AXES = 0;
var SPACING_BETWEEN_FUNSCRIPTS = 4;
var SVG_PADDING = 0;
var svgDefaultOptions = {
  title: null,
  lineWidth: 0.5,
  font: "Arial, sans-serif",
  axisFont: "Consolas, monospace",
  halo: true,
  solidHeaderBackground: false,
  graphOpacity: 0.2,
  headerOpacity: 0.7,
  mergeLimit: 500,
  normalize: true,
  titleEllipsis: true,
  titleSeparateLine: "auto",
  width: 690,
  height: 52,
  headerHeight: 20,
  headerSpacing: 0,
  axisWidth: 46,
  axisSpacing: 0,
  durationMs: 0,
};
var isBrowser = typeof document !== "undefined";
function textToSvgLength(text, font) {
  if (!isBrowser) return 0;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const width = context.measureText(text).width;
  return width;
}
function textToSvgText(text) {
  if (!text) return text;
  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => entityMap[char] || char);
}
function truncateTextWithEllipsis(text, maxWidth, font) {
  if (!text) return text;
  if (textToSvgLength(text, font) <= maxWidth) return text;
  while (text && textToSvgLength(text + "…", font) > maxWidth) {
    text = text.slice(0, -1);
  }
  return text + "…";
}
function toSvgLines(script, ops, ctx) {
  const { lineWidth, mergeLimit, durationMs } = ops;
  const { width, height } = ctx;
  const round2 = (x) => +x.toFixed(2);
  function lineToStroke(a, b) {
    const at = (a2) =>
      round2((a2.at / durationMs) * (width - 2 * lineWidth) + lineWidth);
    const pos = (a2) =>
      round2(((100 - a2.pos) * (height - 2 * lineWidth)) / 100 + lineWidth);
    return `M ${at(a)} ${pos(a)} L ${at(b)} ${pos(b)}`;
  }
  const lines = actionsToLines(script.actions);
  mergeLinesSpeed(lines, mergeLimit);
  lines.sort((a, b) => a[2] - b[2]);
  return lines.map(
    ([a, b, speed]) =>
      `<path d="${lineToStroke(a, b)}" stroke="${speedToHexCached(speed)}"></path>`,
  );
}
function toSvgBackgroundGradient(script, { durationMs }, linearGradientId) {
  const round2 = (x) => +x.toFixed(2);
  const lines = actionsToLines(actionsToZigzag(script.actions)).flatMap((e) => {
    const [a, b, s] = e;
    const len = b.at - a.at;
    if (len <= 0) return [];
    if (len < 2000) return [e];
    const N = ~~((len - 500) / 1000);
    const ra = Array.from({ length: N }, (_, i) => {
      return [
        new FunAction({
          at: lerp(a.at, b.at, i / N),
          pos: lerp(a.pos, b.pos, i / N),
        }),
        new FunAction({
          at: lerp(a.at, b.at, (i + 1) / N),
          pos: lerp(a.pos, b.pos, (i + 1) / N),
        }),
        s,
      ];
    });
    return ra;
  });
  for (let i = 0; i < lines.length - 1; i++) {
    const [a, b, ab] = lines[i],
      [c, d, cd] = lines[i + 1];
    if (d.at - a.at < 1000) {
      const speed =
        (ab * (b.at - a.at) + cd * (d.at - c.at)) /
        (b.at - a.at + (d.at - c.at));
      lines.splice(i, 2, [a, d, speed]);
      i--;
    }
  }
  let stops = lines
    .filter((e, i, a) => {
      const p = a[i - 1],
        n = a[i + 1];
      if (!p || !n) return true;
      if (p[2] === e[2] && e[2] === n[2]) return false;
      return true;
    })
    .map(([a, b, speed]) => {
      const at = (a.at + b.at) / 2;
      return { at, speed };
    });
  if (lines.length) {
    const first = lines[0],
      last = lines.at(-1);
    stops.unshift({ at: first[0].at, speed: first[2] });
    if (first[0].at > 100) {
      stops.unshift({ at: first[0].at - 100, speed: 0 });
    }
    stops.push({ at: last[1].at, speed: last[2] });
    if (last[1].at < durationMs - 100) {
      stops.push({ at: last[1].at + 100, speed: 0 });
    }
  }
  stops = stops.filter((e, i, a) => {
    const p = a[i - 1],
      n = a[i + 1];
    if (!p || !n) return true;
    if (p.speed === e.speed && e.speed === n.speed) return false;
    return true;
  });
  return `
      <linearGradient id="${linearGradientId}">
        ${stops.map(
          (s) =>
            `<stop offset="${round2(Math.max(0, Math.min(1, s.at / durationMs)))}" stop-color="${speedToHexCached(s.speed)}"${s.speed >= 100 ? "" : ` stop-opacity="${round2(s.speed / 100)}"`}></stop>`,
        ).join(`
          `)}
      </linearGradient>`;
}
function toSvgElement(scripts, ops) {
  scripts = Array.isArray(scripts) ? scripts : [scripts];
  const fullOps = { ...svgDefaultOptions, ...ops };
  fullOps.width -= SVG_PADDING * 2;
  const round2 = (x) => +x.toFixed(2);
  const pieces = [];
  let y = SVG_PADDING;
  for (let s of scripts) {
    if (fullOps.normalize) s = s.clone().normalize();
    const durationMs = fullOps.durationMs || s.actualDuration * 1000;
    pieces.push(
      toSvgG(
        s,
        { ...fullOps, durationMs, title: fullOps.title },
        {
          transform: `translate(${SVG_PADDING}, ${y})`,
          onDoubleTitle: () => (y += fullOps.headerHeight),
        },
      ),
    );
    y += fullOps.height + SPACING_BETWEEN_AXES;
    for (const a of s.axes) {
      pieces.push(
        toSvgG(
          a,
          { ...fullOps, durationMs, title: fullOps.title ?? "" },
          {
            transform: `translate(${SVG_PADDING}, ${y})`,
            isSecondaryAxis: true,
            onDoubleTitle: () => (y += fullOps.headerHeight),
          },
        ),
      );
      y += fullOps.height + SPACING_BETWEEN_AXES;
    }
    y += SPACING_BETWEEN_FUNSCRIPTS - SPACING_BETWEEN_AXES;
  }
  y -= SPACING_BETWEEN_FUNSCRIPTS;
  y += SVG_PADDING;
  return `<svg class="funsvg" width="${round2(fullOps.width)}" height="${round2(y)}" xmlns="http://www.w3.org/2000/svg"
    font-size="${round2(fullOps.headerHeight * 0.8)}px" font-family="${fullOps.font}"
  >
    ${pieces.join(`
`)}
  </svg>`;
}
function toSvgG(script, ops, ctx) {
  const {
    title: rawTitle,
    lineWidth: w,
    graphOpacity,
    headerOpacity,
    headerHeight,
    headerSpacing,
    height,
    axisFont,
    width,
    solidHeaderBackground,
    titleEllipsis,
    titleSeparateLine,
    font,
    durationMs,
  } = ops;
  const { isSecondaryAxis } = ctx;
  const axisWidth = ops.axisWidth;
  const axisSpacing = axisWidth === 0 ? 0 : ops.axisSpacing;
  let title = "";
  if (rawTitle !== null) {
    title = typeof rawTitle === "function" ? rawTitle(script) : rawTitle;
  } else {
    if (script.file?.filePath) {
      title = script.file.filePath;
    } else if (script.parent?.file) {
      title = "";
    }
  }
  const stats = toStats(script.actions, { durationSeconds: durationMs / 1000 });
  if (isSecondaryAxis) delete stats.Duration;
  const statCount = Object.keys(stats).length;
  const round2 = (x) => +x.toFixed(2);
  const proportionalFontSize = round2(headerHeight * 0.8);
  const statLabelFontSize = round2(headerHeight * 0.4);
  const statValueFontSize = round2(headerHeight * 0.72);
  let useSeparateLine = false;
  const xx = {
    axisStart: 0,
    axisEnd: axisWidth,
    titleStart: axisWidth + axisSpacing,
    svgEnd: width,
    graphWidth: width - axisWidth - axisSpacing,
    statText: (i) => round2(width - (7 + i * 46) * (headerHeight / 20)),
    get axisText() {
      return round2(this.axisEnd / 2);
    },
    get headerText() {
      return round2(this.titleStart + headerHeight * 0.2);
    },
    get textWidth() {
      return this.statText(useSeparateLine ? 0 : statCount) - this.headerText;
    },
  };
  if (
    title &&
    titleSeparateLine !== false &&
    textToSvgLength(title, `${proportionalFontSize}px ${font}`) > xx.textWidth
  ) {
    useSeparateLine = true;
  }
  if (
    title &&
    titleEllipsis &&
    textToSvgLength(title, `${proportionalFontSize}px ${font}`) > xx.textWidth
  ) {
    title = truncateTextWithEllipsis(
      title,
      xx.textWidth,
      `${proportionalFontSize}px ${font}`,
    );
  }
  if (useSeparateLine) {
    ctx.onDoubleTitle();
  }
  const graphHeight = height - headerHeight - headerSpacing;
  const isForHandy = "_isForHandy" in script && script._isForHandy;
  let axis = script.id ?? "L0";
  if (isForHandy) axis = "☞";
  const badActions = script.actions.filter((e) => !Number.isFinite(e.pos));
  if (badActions.length) {
    console.log("badActions", badActions);
    badActions.map((e) => (e.pos = 120));
    title += "::bad";
    axis = "!!!";
  }
  const yy = {
    top: 0,
    get headerExtra() {
      return useSeparateLine ? headerHeight : 0;
    },
    get titleBottom() {
      return round2(headerHeight + this.headerExtra);
    },
    get graphTop() {
      return round2(this.titleBottom + headerSpacing);
    },
    get svgBottom() {
      return round2(height + this.headerExtra);
    },
    get axisText() {
      return round2((this.top + this.svgBottom) / 2 + 4 + this.headerExtra / 2);
    },
    headerText: round2(headerHeight * 0.75),
    get statLabelText() {
      return round2(headerHeight * 0.35 + this.headerExtra);
    },
    get statValueText() {
      return round2(headerHeight * 0.95 + this.headerExtra);
    },
  };
  const bgGradientId = `funsvg-grad-${script.id}-${script.actions.length}-${script.actions[0]?.at || 0}`;
  const axisColor = speedToHexCached(stats.AvgSpeed);
  const axisOpacity = round2(
    headerOpacity * Math.max(0.5, Math.min(1, stats.AvgSpeed / 100)),
  );
  return [
    `<g transform="${ctx.transform}">`,
    '  <g class="funsvg-bgs">',
    `    <defs>${toSvgBackgroundGradient(script, { durationMs }, bgGradientId)}</defs>`,
    axisWidth > 0 &&
      `    <rect class="funsvg-bg-axis-drop" x="0" y="${yy.top}" width="${xx.axisEnd}" height="${yy.svgBottom - yy.top}" fill="#ccc" opacity="${round2(graphOpacity * 1.5)}"></rect>`,
    `    <rect class="funsvg-bg-title-drop" x="${xx.titleStart}" width="${xx.graphWidth}" height="${yy.titleBottom}" fill="#ccc" opacity="${round2(graphOpacity * 1.5)}"></rect>`,
    axisWidth > 0 &&
      `    <rect class="funsvg-bg-axis" x="0" y="${yy.top}" width="${xx.axisEnd}" height="${yy.svgBottom - yy.top}" fill="${axisColor}" opacity="${axisOpacity}"></rect>`,
    `    <rect class="funsvg-bg-title" x="${xx.titleStart}" width="${xx.graphWidth}" height="${yy.titleBottom}" fill="${solidHeaderBackground ? axisColor : `url(#${bgGradientId})`}" opacity="${round2(solidHeaderBackground ? axisOpacity * headerOpacity : headerOpacity)}"></rect>`,
    `    <rect class="funsvg-bg-graph" x="${xx.titleStart}" width="${xx.graphWidth}" y="${yy.graphTop}" height="${graphHeight}" fill="url(#${bgGradientId})" opacity="${round2(graphOpacity)}"></rect>`,
    "  </g>",
    `  <g class="funsvg-lines" transform="translate(${xx.titleStart}, ${yy.graphTop})" stroke-width="${w}" fill="none" stroke-linecap="round">`,
    ...toSvgLines(script, ops, {
      width: xx.graphWidth,
      height: graphHeight,
    }).map((line) => `    ${line}`),
    "  </g>",
    '  <g class="funsvg-titles">',
    ops.halo && [
      `    <g class="funsvg-titles-halo" stroke="white" opacity="0.5" paint-order="stroke fill markers" stroke-width="3" stroke-dasharray="none" stroke-linejoin="round" fill="transparent">`,
      `      <text class="funsvg-title-halo" x="${xx.headerText}" y="${yy.headerText}"> ${textToSvgText(title)} </text>`,
      ...Object.entries(stats)
        .reverse()
        .map(([k, v], i) => [
          `      <text class="funsvg-stat-label-halo" x="${xx.statText(i)}" y="${yy.statLabelText}" font-weight="bold" font-size="${statLabelFontSize}px" text-anchor="end"> ${k} </text>`,
          `      <text class="funsvg-stat-value-halo" x="${xx.statText(i)}" y="${yy.statValueText}" font-weight="bold" font-size="${statValueFontSize}px" text-anchor="end"> ${v} </text>`,
        ]),
      "    </g>",
    ],
    axisWidth > 0 &&
      `    <text class="funsvg-axis" x="${xx.axisText}" y="${yy.axisText}" font-size="${round2(Math.max(12, axisWidth * 0.75))}px" font-family="${axisFont}" text-anchor="middle" dominant-baseline="middle"> ${axis} </text>`,
    `    <text class="funsvg-title" x="${xx.headerText}" y="${yy.headerText}"> ${textToSvgText(title)} </text>`,
    ...Object.entries(stats)
      .reverse()
      .map(([k, v], i) => [
        `    <text class="funsvg-stat-label" x="${xx.statText(i)}" y="${yy.statLabelText}" font-weight="bold" font-size="${statLabelFontSize}px" text-anchor="end"> ${k} </text>`,
        `    <text class="funsvg-stat-value" x="${xx.statText(i)}" y="${yy.statValueText}" font-weight="bold" font-size="${statValueFontSize}px" text-anchor="end"> ${v} </text>`,
      ]),
    "  </g>",
    "</g>",
  ]
    .flat(4)
    .filter((e) => !!e).join(`
`);
}
function toSvgBlobUrl(script, ops) {
  const svg = toSvgElement(script, ops);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
}

// src/lib/funlib.ts
var exampleFunscript = new Funscript({
  actions: [],
});
var exampleBlobCache = new Map();
function exampleBlobUrl(width = 690) {
  if (exampleBlobCache.has(width)) return exampleBlobCache.get(width);
  const blobUrl = toSvgBlobUrl(exampleFunscript, { width });
  exampleBlobCache.set(width, blobUrl);
  return blobUrl;
}
function funscriptOptions(width = 690) {
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
export {
  toSvgElement,
  funscriptOptions,
  exampleFunscript,
  exampleBlobUrl,
  Funscript,
};
