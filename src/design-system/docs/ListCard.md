# ListCard

`src/design-system/primitives/ListCard.tsx`. A list inside a white card. One component for the three lists that were called `ListCard`.

| Variant | How you use it | Was |
|---|---|---|
| rows | `<ListCard rows={[{ l, v, sub, right, onPress, muted, warn }]} mono />` | `ListCard` in `features/progress/parts.tsx` |
| container | `<ListCard>{rows}</ListCard>` | `ListCard` in `features/shell/parts.tsx` |
| titled | `<ListCard dot={color} title="Warm-up" rows={[{ n, s }]} />` | the local `ListCard` in `features/plans/WorkoutPlan.tsx` |

The variant follows the props: `title` means titled, `children` means container, otherwise rows. TypeScript rejects mixed props.

| Row field (rows variant) | |
|---|---|
| `l` | label, left |
| `v` | value, right (mono by default; `mono={false}` for body text) |
| `sub` | caption under the label |
| `right` | extra node before the chevron |
| `onPress` | makes the row pressable and adds a chevron |
| `muted`, `warn` | quieter label, or the warning colour |

Both old import paths keep working (`@/features/progress/parts` and `@/features/shell/parts` re-export it).
