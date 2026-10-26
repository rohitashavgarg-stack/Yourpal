# AmountStepper

`src/design-system/primitives/AmountStepper.tsx`

## Purpose

The amount control on one food: a thin outlined pill (40 px high) with a small round minus and plus (24 px, solid ink) and the amount between them. Used in the log meals sheet (`features/today/LogMealsSheet.tsx`) and the diet plan (`features/plans/DietPlan.tsx`). The parent owns the amount and the step maths (halves for a katori, 25 for grams); this control only draws it and reports taps.

```tsx
<AmountStepper text="1 katori" unit="katori" onLess={less} onMore={more} lessDisabled={amt <= 0.5} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `text` | string | required | The amount in the middle, "1 katori", "5 pcs". 13 px semibold |
| `onLess` | () => void | required | Minus tapped |
| `onMore` | () => void | required | Plus tapped |
| `lessDisabled` | boolean | false | At the smallest amount: minus dims to 35% and does nothing |
| `moreDisabled` | boolean | false | At the largest amount: plus dims to 35% and does nothing |
| `unit` | string | `'piece'` (in the spoken labels) | What one step is, for the spoken labels ("Less katori") |
| `onLongPress` | () => void | none | Hold the amount (450 ms), for example the units and reset sheet in Plans. Without it the amount is not pressable |
| `accessibilityLabel` | string | `"Amount <text>"` | Spoken label of the amount |

## States

| State | Look |
|---|---|
| Rest | Outline pill, both buttons solid ink (light in dark mode, dark in light mode) |
| At minimum | `lessDisabled`: minus at 35% opacity, not pressable |
| At maximum | `moreDisabled`: plus at 35% opacity, not pressable |
| Holdable | `onLongPress` set: the amount becomes a button and scales to 0.96 on press |
| Pressed | Buttons scale to 0.86 with a tap haptic |

The outline is ink at 18% (light) or white at 22% (dark).

## Do and don't

- Do keep the step maths and limits in the parent and pass `lessDisabled` / `moreDisabled` at the ends.
- Do write the amount with its unit ("1 katori", "150 g"), not a bare number.
- Don't use it for workout sets or onboarding numbers: that is `Stepper` (inline, card or row).
- Don't put two amount steppers on one row.

## Accessibility

- Minus and plus are buttons labelled "Less <unit>" and "More <unit>", with `disabled` state at the ends.
- The buttons are 24 px but have a 10 px hit slop, so the tap area is 44 px.
- The amount reads "Amount <text>" (or your `accessibilityLabel`). It has the button role only when `onLongPress` is set.

## Copy rules

- Say the number and the unit the member knows: "1 katori", "2 roti", "150 g". No dot separators.
- Spoken labels follow the unit: "Less katori", not "Decrease".
