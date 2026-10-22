# Card

`src/design-system/primitives/Card.tsx`. `import { Card } from '@/components/ui'` still works: `ui.tsx` re-exports it.

## Purpose

The white (or dark) rounded container that holds one subject on a screen.

```tsx
<Card><Txt v="headline">Today</Txt></Card>
<Card variant="compact">...</Card>
<Card dark>...</Card>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'default' \| 'compact' \| 'dark'` | `default` (or `dark` when `dark` is set) | One of the looks below |
| `gap` | number | the variant's gap | Space between children |
| `dark` | boolean | false | Old name for `variant="dark"`; kept so `<Card dark>` keeps working |
| `style` | ViewStyle | none | Merged last, so it can override anything |
| `children` | node | none | |

## States

| Variant | Background | Radius | Padding | Gap | Came from |
|---|---|---|---|---|---|
| `default` | `c.surface` | 28 | 20 | none | `Card` in `components/ui.tsx` |
| `compact` | `c.surface` | 24 (`radii.card`) | 18 | 10 | the local `Card` in `app/goal-detail.tsx` |
| `dark` | `c.dark` | 28 | 20 | none | `<Card dark>` in `components/ui.tsx` |

Shadow: the card shadow in light mode; none in dark mode and none on the `dark` variant.

## Do and don't

- Do put one subject in a card, with its title first.
- Do use `dark` for hero cards with a soft glow (workout, goal) and the white card for data.
- Don't nest a card in a card. Use a hairline or a soft surface tile inside.
- Don't hard-code a light background through `style`; use theme tokens so dark mode works.

## Accessibility

- A plain View with no role. Give the title inside it `accessibilityRole="header"`.
- If the whole card is tappable, wrap it in `Pressy` with role `button` or `link` and a label that says where it goes.

## Copy rules

- Title, then a sentence, then a quiet info line on its own line. No dot separators.
- No duplicate data on one page: if a number is on another card, do not repeat it here.

## Notes

`scripts/codemods/card-matches.js` looks for `<View>` containers with `backgroundColor: c.surface` and only radius, padding and gap. None matched a variant exactly, so none were replaced. The 33 that look similar are listed in `docs/card-review.md` with the reason each was left.
