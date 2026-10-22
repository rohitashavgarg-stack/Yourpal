# Stepper

`src/design-system/primitives/Stepper.tsx`

## Purpose

The "minus, value, plus" control for numbers. One component, three variants (they were three separate steppers). For a food amount ("1 katori") use `AmountStepper`. `import { Stepper } from '@/features/plans/parts'` still works (it is `Stepper` with `variant="row"`).

```tsx
<Stepper variant="card" value={172} onChange={setH} step={1} unit="cm" label="height" />
<Stepper variant="row" label="Sets" value="3" onMinus={less} onPlus={more} minusLabel="Fewer sets" plusLabel="More sets" />
<Stepper variant="inline" value={40} unit="kg" onChange={setKg} step={2.5} min={0} label="Weight" />
```

## Props

| Prop | Type | Default | Variant | What it does |
|---|---|---|---|---|
| `variant` | `'card' \| 'row' \| 'inline'` | required | all | Which stepper |
| `value` | number | required | card, inline | The value |
| `value` | string | required | row | The value, already formatted |
| `onChange` | (v: number) => void | required | card, inline | New value |
| `step` | number | required | card, inline | One step |
| `unit` | string | required | card, inline | Shown after the value |
| `label` | string | required | all | card and inline: spoken name. row: the visible label on the left |
| `min` | number | required | inline | Floor |
| `block` | GestureType | none | inline | A gesture the scrub should block (the set row swipe) |
| `onMinus`, `onPlus` | () => void | required | row | |
| `minusLabel`, `plusLabel` | string | required | row | Spoken labels of the two buttons |

## States

| Variant | Look | Was |
|---|---|---|
| `card` | 52 px buttons around a 64 px value card with a unit | `Stepper` in `app/onboarding.tsx` |
| `row` | Label on the left, round 44 px buttons around a large number, 60 px min row | `Stepper` in `features/plans/parts.tsx` |
| `inline` | Compact 44 px control in a set row; drag the number sideways to scrub (14 px per step) | `Stepper` in `features/workout/SetRow.tsx` |

Step maths: `card` rounds to 1 decimal and floors at `step`. `inline` floors at `min`, rounds to 1 decimal, shows kg with one decimal, and plays a tap haptic on every change (taps and scrub).

## Do and don't

- Do pick the step the member thinks in: 2.5 kg, 1 rep, 5 s.
- Do use `inline` only inside a set row; it fills its parent's width.
- Don't use it for food amounts: `AmountStepper`.
- Don't show a stepper and a text field for the same value.

## Accessibility

- `card`: buttons "Less <label>" and "More <label>" (52 px); the value reads "<label> <value> <unit>".
- `row`: the buttons use `minusLabel` and `plusLabel` (44 px); the value is a polite live region, so changes are read.
- `inline`: role `adjustable` with increment and decrement actions, label "<label>, <value> <unit>". Minus and plus are 34 by 44 px, labelled "Minus <step> <unit>" and "Plus <step> <unit>".

## Copy rules

- Units in lower case after the number: "40 kg", "12 reps", "45 s".
- Spoken labels say the direction and the unit, not "Decrease".
