# Stepper

`src/design-system/primitives/Stepper.tsx`. The "minus, value, plus" control. One component, three variants (they were three separate steppers).

| Variant | Look | Props | Was |
|---|---|---|---|
| `card` | 52 px buttons around a 64 px value card with a unit | `value`, `onChange`, `step`, `unit`, `label` | `Stepper` in `app/onboarding.tsx` |
| `row` | label on the left, round buttons around a large number | `label`, `value` (string), `onMinus`, `onPlus`, `minusLabel`, `plusLabel` | `Stepper` in `features/plans/parts.tsx` |
| `inline` | compact 44 px control in a set row; drag the number sideways to scrub | `value`, `unit`, `onChange`, `step`, `min`, `label`, `block` | `Stepper` in `features/workout/SetRow.tsx` |

Step maths, rounding and accessibility labels are unchanged: `card` keeps the 1-decimal rounding and floor at `step`; `inline` keeps the floor at `min`, haptics, `adjustable` actions and the scrub (14 px per step).

`import { Stepper } from '@/features/plans/parts'` still works (it is `Stepper` with `variant="row"`).
