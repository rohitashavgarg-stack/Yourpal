// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Design-system guard (warn level): no new hard-coded hex colours, border radii or font sizes in app code.
// Use the tokens instead: colours from useTheme() or `fixed` in '@/design-system/tokens', `radii`, `fontSizes`.
// The token files themselves are the only place these literals belong, so they are switched off below.
// Existing leftovers are listed in docs/tokens-review.md.
const HEX = "Literal[value=/^#[0-9a-fA-F]{3,8}$/]";
const RADIUS = "Property[key.name=/^border(Top|Bottom)?(Left|Right)?Radius$/] > Literal[raw=/^[0-9]/]";
const FONT_SIZE = "Property[key.name='fontSize'] > Literal[raw=/^[0-9]/]";
const FONT_SIZE_JSX = "JSXAttribute[name.name='fontSize'] > JSXExpressionContainer > Literal[raw=/^[0-9]/]";
const RADIUS_JSX = "JSXAttribute[name.name=/^border.*Radius$/] > JSXExpressionContainer > Literal[raw=/^[0-9]/]";

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/design-system/**", "src/theme/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        { selector: HEX, message: "Hard-coded hex colour. Use a theme colour (useTheme) or fixed.* from '@/design-system/tokens'." },
        { selector: RADIUS, message: "Hard-coded border radius. Use radii.* from '@/design-system/tokens'." },
        { selector: RADIUS_JSX, message: "Hard-coded border radius. Use radii.* from '@/design-system/tokens'." },
        { selector: FONT_SIZE, message: "Hard-coded font size. Use fontSizes.* from '@/design-system/tokens' (or a Txt variant)." },
        { selector: FONT_SIZE_JSX, message: "Hard-coded font size. Use fontSizes.* from '@/design-system/tokens' (or a Txt variant)." },
      ],
    },
  },
]);
