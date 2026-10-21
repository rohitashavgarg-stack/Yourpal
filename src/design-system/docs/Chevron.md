# Chevron

`src/design-system/primitives/Chevron.tsx`. A down chevron that turns half a turn when a row opens. It was written twice: in the plans diet accordion and in the Today meals card.

```tsx
<Chevron open={open} />                    // plans: 300 ms timing
<Chevron open={open} motion="spring" />    // Today meals: the snappy spring
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `open` | boolean | | 180 degrees when true, 0 when false |
| `motion` | `'timing' \| 'spring'` | `timing` | the two ways it used to turn |
| `size` | number | 18 | icon size; colour is `c.muted` |

Not merged: the FAQ row on the help page has its own chevron that is not a separate component (it is inline in `FaqItem`, 220 ms).
