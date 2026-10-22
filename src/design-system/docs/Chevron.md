# Chevron

`src/design-system/primitives/Chevron.tsx`

## Purpose

A down chevron that turns half a turn when a row opens. It was written twice: in the plans diet accordion and in the Today meals card.

```tsx
<Chevron open={open} />                    // plans: 300 ms timing
<Chevron open={open} motion="spring" />    // Today meals: the snappy spring
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `open` | boolean | required | 180 degrees when true, 0 when false |
| `motion` | `'timing' \| 'spring'` | `timing` | 300 ms timing, or the snappy spring |
| `size` | number | 18 | Icon size; colour is `c.muted` |

## States

| State | Look |
|---|---|
| Closed | Points down (0 degrees) |
| Open | Points up (180 degrees) |

## Do and don't

- Do put it at the right end of the row that opens and closes.
- Don't make the chevron the tap target on its own. The whole row opens.
- Don't use it for "go to another page": that is `ChevronRight`.

## Accessibility

- Decorative: no role or label. The row that holds it should have role `button` and `accessibilityState={{ expanded: open }}`.

## Copy rules

- None of its own. The row label says what opens ("Micronutrients"), not "Show more".

Not merged: the FAQ row on the help page has its own chevron inline in `FaqItem` (220 ms).
