# HeartIcon

`src/design-system/primitives/HeartIcon.tsx`

## Purpose

A solid heart for heart-rate tiles, where the icon set only has an outline. Pair it with `Beat` for a live value.

```tsx
<HeartIcon size={14} color={c.cHeart} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | number | 14 | Width and height |
| `color` | string | required | Fill |

## States

No states.

## Do and don't

- Do use a theme heart colour (`c.cHeart`, `onDark.heart`).
- Don't use it as a like or favourite mark.

## Accessibility

- Decorative: no label.

## Copy rules

- Not applicable.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
