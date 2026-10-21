# SectionLabel

`src/design-system/primitives/SectionLabel.tsx`. The small heading above a group of cards. It replaces four separate `Label` components.

| Variant | Look | Was |
|---|---|---|
| `overline` | 11 px semibold, letter-spacing 1.3, muted | `Label` in `app/coach.tsx` and `app/progress/streaks.tsx` (streaks adds `inset={4}`) |
| `quiet` | 13 px medium, muted | `Label` in `app/goal-detail.tsx` |
| `label` (default) | `Txt` variant "label", 6 px inset | `Label` in `features/shell/parts.tsx` |

| Prop | What it does |
|---|---|
| `variant` | one of the above |
| `inset` | horizontal padding. Default 6 for `label`, 0 for the others |
| `style` | merged last |

`import { Label } from '@/features/shell/parts'` still works (it is `SectionLabel` with the default variant).
