# Tag

`src/design-system/primitives/Tag.tsx`

## Purpose

A small filled pill (12 px text, 3 px by 10 px padding) for a short fact or status. Colours come from the caller, so use theme pairs (`goodSoft` with `good`, `warnSoft` with `warn`). It is not pressable. Use `Chip` for an outline label.

```tsx
<Tag label="On plan" bg={c.goodSoft} fg={c.good} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | The text |
| `bg` | string | required | Fill |
| `fg` | string | required | Text colour |
| `style` | ViewStyle | none | Merged last |

## States

No states.

## Do and don't

- Do pass a soft fill with its strong colour.
- Don't put `onPress` on it. A pill that acts is a `Button`.
- Amber for a warning, never red.

## Accessibility

- Read as its text. Not a tap target.

## Copy rules

- One to three words.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
