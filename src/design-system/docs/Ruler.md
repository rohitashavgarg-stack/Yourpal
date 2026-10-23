# Ruler

`src/design-system/primitives/Ruler.tsx`

## Purpose

A ruler you drag to set a decimal value: weight, height. Ten pixels per step. Horizontal by default; `vertical` puts bigger values at the top with labels on the left. A warning haptic fires when you push past either end.

```tsx
<Ruler value={kg} onChange={setKg} min={30} max={200} step={0.5} decimals={1} majorEvery={10} label={(v) => String(v)} accessibilityLabel="Weight" />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | number | required | The value |
| `onChange` | (v: number) => void | required | New value |
| `min`, `max`, `step` | number | required | Range and step |
| `decimals` | number | 0 | Decimals kept |
| `majorEvery` | number | required | A labelled tick every this many steps |
| `markEvery` | number | majorEvery / 2 | Heavier haptic every this many steps |
| `label` | (v: number) => string | required | Text of a labelled tick |
| `accessibilityLabel` | string | required | Read with the value |
| `vertical` | boolean | false | Vertical ruler |

## States

Rest and dragging. At either end it stops and warns.

## Do and don't

- Do show the chosen number big beside the ruler: the ruler is the control, the number is the fact.

## Accessibility

- Role `adjustable` with increment and decrement actions.

## Copy rules

- Tick labels are bare numbers; the unit is shown once, beside the value.

Moved here from `components/Ruler.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
