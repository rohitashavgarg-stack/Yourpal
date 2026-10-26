# Txt

`src/design-system/primitives/Txt.tsx`

## Purpose

The text component under every screen. Eight variants (display 34, title 28, headline 17, body 15, label 13, caption 12, mono 13, number 30). It always gives the text a line height of at least 1.3 times the font size, because Geist crops at the top when the leading is tight.

```tsx
<Txt v="headline">Leg day</Txt>
<Txt muted>From your watch</Txt>
<Txt style={{ fontSize: fontSizes.sm }}>Own size, line height follows</Txt>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `v` | `display \| title \| headline \| body \| label \| caption \| mono \| number` | `body` | The size, weight and spacing |
| `muted` | boolean | false | Muted colour (label and caption are muted by default) |
| `color` | string | ink | Overrides the colour |
| `style` | TextStyle | none | Merged after the variant; the line height is recomputed from the final font size |
| rest | TextProps |  | Passed to Text |

## States

No states. Colour is `c.ink`, or `c.muted` for `muted`, `label` and `caption`.

## Do and don't

- Do use a variant first. A new size is a new token, not a number in a style.
- Do put `accessibilityRole="header"` on headings (or use `SectionLabel`).
- Don't set a `lineHeight` below 1.3 times the size: it is raised for you.

## Accessibility

- Plain Text: read as its content. Text scales with the system font size.

## Copy rules

- Say the number, put the fact first. No dot separators, no emoji.

Moved here from `components/ui.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
