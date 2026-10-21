# Card

`src/design-system/primitives/Card.tsx`. The white (or dark) rounded container. `import { Card } from '@/components/ui'` still works: `ui.tsx` re-exports it.

| Variant | Background | Radius | Padding | Gap | Came from |
|---|---|---|---|---|---|
| `default` | `c.surface` | 28 | 20 | none | `Card` in `components/ui.tsx` |
| `compact` | `c.surface` | 24 | 18 | 10 | the local `Card` in `app/goal-detail.tsx` |
| `dark` | `c.dark` | 28 | 20 | none | `<Card dark>` in `components/ui.tsx` |

| Prop | Type | What it does |
|---|---|---|
| `variant` | `'default' \| 'compact' \| 'dark'` | One of the looks above |
| `gap` | number | Space between children; overrides the variant's gap |
| `dark` | boolean | Old name for `variant="dark"`; kept so `<Card dark>` keeps working |
| `style` | ViewStyle | Merged last, so it can override anything |

Shadow: the card shadow in light mode, none in dark mode and none on the `dark` variant (the same rule as before).

Radius 24 is not a step of the `radii` scale (4, 12, 18, 22, 28). It stays 24 so nothing moves; see `docs/tokens-review.md`.

Hand-built containers: `scripts/codemods/card-matches.js` looks for `<View>` containers with `backgroundColor: c.surface` and only radius, padding and gap. None matched a variant exactly, so none were replaced. The 33 that look similar are listed in `docs/card-review.md` with the reason each was left.
