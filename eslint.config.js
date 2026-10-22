// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

// Design-system guard: no hard-coded hex colours, border radii or font sizes.
// Use the tokens instead: colours from useTheme() or `fixed` / `onDark` / `gradients` in '@/design-system/tokens', `radii` or `round(h)`, `fontSizes`.
//   src/design-system (primitives, patterns, stories): error. The token files are where these values live, so they are exempt.
//   the rest of src: warn, so existing leftovers (docs/tokens-review.md) do not fail the build.
//   files changed in a branch or PR: error on the lines the branch added or changed. Run `npm run lint:changed`
//   (scripts/lint-changed.js sets YP_LINT_STRICT=1, lints only those files and fails only on new lines).
const HEX = "Literal[value=/^#[0-9a-fA-F]{3,8}$/]";
const RADIUS = "Property[key.name=/^border(Top|Bottom)?(Left|Right)?Radius$/] > Literal[raw=/^[0-9]/]";
const FONT_SIZE = "Property[key.name='fontSize'] > Literal[raw=/^[0-9]/]";
const FONT_SIZE_JSX = "JSXAttribute[name.name='fontSize'] > JSXExpressionContainer > Literal[raw=/^[0-9]/]";
const RADIUS_JSX = "JSXAttribute[name.name=/^border.*Radius$/] > JSXExpressionContainer > Literal[raw=/^[0-9]/]";

const strict = process.env.YP_LINT_STRICT === "1";
const guard = (level) => [
  level,
  { selector: HEX, message: "Hard-coded hex colour. Use a theme colour (useTheme) or fixed.* / onDark.* / gradients.* from '@/design-system/tokens'." },
  { selector: RADIUS, message: "Hard-coded border radius. Use radii.* or round(h) from '@/design-system/tokens'." },
  { selector: RADIUS_JSX, message: "Hard-coded border radius. Use radii.* or round(h) from '@/design-system/tokens'." },
  { selector: FONT_SIZE, message: "Hard-coded font size. Use fontSizes.* from '@/design-system/tokens' (or a Txt variant)." },
  { selector: FONT_SIZE_JSX, message: "Hard-coded font size. Use fontSizes.* from '@/design-system/tokens' (or a Txt variant)." },
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "storybook-static/*", "handoff/*"],
  },
  {
    // Node scripts (screenshots, audits, codemods): CommonJS with Node globals
    files: ["scripts/**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/design-system/**", "src/theme/**"],
    rules: { "no-restricted-syntax": guard(strict ? "error" : "warn") },
  },
  {
    files: ["src/design-system/**/*.{ts,tsx}"],
    ignores: ["src/design-system/tokens/**", "src/design-system/_archive/**"],
    rules: { "no-restricted-syntax": guard("error") },
  },
]);
