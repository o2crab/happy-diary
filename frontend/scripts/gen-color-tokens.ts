// ブランド色から M3 のカラートークン(src/design/tokens/colors.css)を生成します。
// --check では生成結果と既存ファイルの差分の検出のみ行います。
import { readFileSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import type { DynamicScheme as DynamicSchemeType } from "@material/material-color-utilities";

// material-color-utilities 0.4.0 は拡張子なしの相対 import を含み、Node では解決できないため .js を補います。
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !specifier.endsWith(".js")) {
        return nextResolve(`${specifier}.js`, context);
      }
      throw error;
    }
  },
});

const {
  argbFromHex,
  Contrast,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  TonalPalette,
  Variant,
} = await import("@material/material-color-utilities");

// ブランド色。変更したら mise run design:tokens で再生成します。
const BRAND = {
  olive: "#6B7B3A", // primary
  wheat: "#D9B26F", // secondary、neutral の色相
  terracotta: "#B5704F", // tertiary
} as const;

// 背景を生成り寄りにするため、neutral は小麦色の色相から低彩度で作ります。
const NEUTRAL_CHROMA = 6;
const NEUTRAL_VARIANT_CHROMA = 10;

const OUTPUT = fileURLToPath(new URL("../src/design/tokens/colors.css", import.meta.url));

// WCAG AA(本文 4.5:1)を検証する前景と背景の組み合わせ
const CONTRAST_PAIRS = [
  ["on-primary", "primary"],
  ["on-primary-container", "primary-container"],
  ["on-secondary", "secondary"],
  ["on-secondary-container", "secondary-container"],
  ["on-tertiary", "tertiary"],
  ["on-tertiary-container", "tertiary-container"],
  ["on-error", "error"],
  ["on-error-container", "error-container"],
  ["on-surface", "surface"],
  ["on-surface-variant", "surface"],
  ["on-surface-variant", "surface-container-highest"],
  ["inverse-on-surface", "inverse-surface"],
] as const;
const MIN_CONTRAST = 4.5;

function buildScheme(isDark: boolean): DynamicSchemeType {
  const wheatHue = Hct.fromInt(argbFromHex(BRAND.wheat)).hue;
  return new DynamicScheme({
    sourceColorHct: Hct.fromInt(argbFromHex(BRAND.olive)),
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
    isDark,
    primaryPalette: TonalPalette.fromInt(argbFromHex(BRAND.olive)),
    secondaryPalette: TonalPalette.fromInt(argbFromHex(BRAND.wheat)),
    tertiaryPalette: TonalPalette.fromInt(argbFromHex(BRAND.terracotta)),
    neutralPalette: TonalPalette.fromHueAndChroma(wheatHue, NEUTRAL_CHROMA),
    neutralVariantPalette: TonalPalette.fromHueAndChroma(wheatHue, NEUTRAL_VARIANT_CHROMA),
  });
}

function kebab(name: string): string {
  return name
    .replaceAll("_", "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function schemeColors(scheme: DynamicSchemeType): Map<string, number> {
  const colors = new Map<string, number>();
  for (const color of new MaterialDynamicColors().allColors) {
    if (color.name.endsWith("palette_key_color")) continue;
    colors.set(kebab(color.name), color.getArgb(scheme));
  }
  return colors;
}

function checkContrast(label: string, colors: Map<string, number>): string[] {
  const errors: string[] = [];
  for (const [fg, bg] of CONTRAST_PAIRS) {
    const fgArgb = colors.get(fg);
    const bgArgb = colors.get(bg);
    if (fgArgb === undefined || bgArgb === undefined) {
      errors.push(`${label}: ${fg} または ${bg} が生成されていません`);
      continue;
    }
    const ratio = Contrast.ratioOfTones(Hct.fromInt(fgArgb).tone, Hct.fromInt(bgArgb).tone);
    if (ratio < MIN_CONTRAST) {
      errors.push(`${label}: ${fg} / ${bg} のコントラスト比 ${ratio.toFixed(2)} が不足`);
    }
  }
  return errors;
}

function declarations(colors: Map<string, number>, indent: string): string {
  return [...colors]
    .map(([name, argb]) => `${indent}--md-sys-color-${name}: ${hexFromArgb(argb)};`)
    .join("\n");
}

function render(): string {
  const light = schemeColors(buildScheme(false));
  const dark = schemeColors(buildScheme(true));

  const errors = [...checkContrast("light", light), ...checkContrast("dark", dark)];
  if (errors.length > 0) {
    throw new Error(`コントラストが WCAG AA を満たしません。\n${errors.join("\n")}`);
  }

  return `/* このファイルは scripts/gen-color-tokens.ts が生成します。直接編集しないでください。 */
:root {
  color-scheme: light;
${declarations(light, "  ")}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${declarations(dark, "    ")}
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
${declarations(dark, "  ")}
}
`;
}

const css = render();
if (process.argv.includes("--check")) {
  if (readFileSync(OUTPUT, "utf8") !== css) {
    console.error("カラートークンが古くなっています。mise run design:tokens を実行してください。");
    process.exit(1);
  }
} else {
  writeFileSync(OUTPUT, css);
}
