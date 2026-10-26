# Wheel

`src/design-system/primitives/Wheel.tsx`

## Purpose

A vertical number wheel for whole numbers (age, reps). It snaps to a value, ticks once per step and heavier every fifth, and reads as an adjustable control for screen readers.

```tsx
<Wheel value={age} onChange={setAge} min={14} max={80} unit="years" accessibilityLabel="Age" />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | number | required | The selected number |
| `onChange` | (v: number) => void | required | Called when it snaps to a new value |
| `min`, `max` | number | required | Range |
| `unit` | string | none | Shown beside the number |
| `accessibilityLabel` | string | required | Read with the value |
| `fmt` | (n: number) => string | none | Formats each number |
| `size` | number | 56 | Font size of the numbers |

## States

Rest and scrolling. Numbers fade and shrink away from the middle.

## Do and don't

- Do give it a label: "Age".

## Accessibility

- Role `adjustable` with increment and decrement actions, label and value read together.

## Copy rules

- The unit is the plain word: "years", "kg".

Moved here from `components/Wheel.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
