# MuscleThumb

`src/design-system/primitives/MuscleThumb.tsx`. Storybook: Primitives / MuscleThumb.

## Purpose

A small dark square with the part of the body that matters for one muscle group (from the front, or from the back for Back) and that group lit in the accent blue. It sits at the start of a muscle row (name, sets, capsules) on the Muscles trained page. The figure comes from MuscleBody.

```tsx
<MuscleThumb muscle="Chest" size={64} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `muscle` | Chest, Arms, Shoulders, Core, Legs or Back | required | The group that is lit |
| `size` | number | 64 | Width and height in px |

## Do and don't

- Do use it only beside a muscle row, not alone.
- Don't use it as a button: it takes no taps.

## Accessibility

- Decoration. The row names the muscle in text.
