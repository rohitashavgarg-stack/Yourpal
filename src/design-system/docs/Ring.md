# Ring

`src/design-system/primitives/Ring.tsx`

## Purpose

A thin ring that draws itself to a fraction: steps, goal progress. The ring starts at the top and runs clockwise. `delay` waits before the 1.3 s fill.

```tsx
<Ring size={96} r={40} stroke={8} pct={steps / target} color={c.tAct} track={c.surface3} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | number | required | Width and height of the svg |
| `r` | number | required | Radius of the circle |
| `stroke` | number | required | Line width |
| `pct` | number | required | Fraction from 0 to 1 |
| `color` | string | required | The fill line |
| `track` | string | required | The empty line |
| `delay` | number | 200 | Milliseconds before it starts |

## States

Animates from 0 to `pct` on mount and when `pct` changes. With reduce motion on, the system still runs the fill; keep `delay` short.

## Do and don't

- Do pair it with the number in text: the ring is a picture, the number is the fact.
- Don't use red for a ring that is behind. Use amber.

## Accessibility

- The svg has no label. Put the value in text beside it.

## Copy rules

- Not applicable: the number beside it follows the voice rules.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
