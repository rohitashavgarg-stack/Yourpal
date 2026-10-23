# Beat

`src/design-system/primitives/Beat.tsx`

## Purpose

Wraps one icon and pulses it (scale 1 to 1.25 and back, twice, then a pause). Only for a live heart rate from the wearable.

```tsx
<Beat><HeartIcon size={16} color={c.cHeart} /></Beat>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `children` | node | required | The icon to pulse |

## States

Loops while mounted. Unmount it when the value is not live.

## Do and don't

- Do use it only for a live value.
- Don't wrap text in it.

## Accessibility

- Decorative: it adds no label. The value beside it carries the meaning.

## Copy rules

- Not applicable.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
