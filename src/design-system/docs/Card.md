# Card

`src/design-system/primitives/Card.tsx`. `import { Card } from '@/components/ui'` still works: `ui.tsx` re-exports it.

Storybook: Primitives / Card

## Purpose

The white (or dark) rounded container that holds one subject on a screen.

```tsx
<Card><Txt v="headline">Today</Txt></Card>
<Card variant="compact">...</Card>
<Card variant="tight" flat>...</Card>                        // on a sheet, no shadow
<Card variant="tight" border={{ color: c.accent, width: 1.5 }}>...</Card>
<Card variant="roomy" clip>...chart to the edge...</Card>
<Card padding={{ top: 6, bottom: 6, horizontal: 18 }}>...list rows...</Card>
<Card dark>...</Card>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'default' \| 'roomy' \| 'compact' \| 'tight' \| 'dark'` | `default` (or `dark` when `dark` is set) | One of the looks below |
| `gap` | number | the variant's gap | Space between children |
| `dark` | boolean | false | Old name for `variant="dark"`; kept so `<Card dark>` keeps working |
| `tone` | `'surface' | 'accent' | 'warn'` | `surface` | The fill: the surface, soft blue (a summary) or soft amber, or `none` (no fill: an outlined card, give it `border`) (a notice that is a whole card) |
| `flat` | boolean | false | No shadow, also in light mode (a card on a sheet or inside another surface) |
| `border` | `{ color: string; width?: number }` | none | A line around the card; width 1 by default (the selected plan on the break page uses 1.5 px accent) |
| `clip` | boolean | false | Clips the content to the rounded corners (a chart or an image that runs to the edge) |
| `padding` | `{ top?, bottom?, horizontal? }` | none | Per-side padding for list cards whose rows bring their own vertical space. Replaces the variant's padding; a side left out is 0 |
| `style` | ViewStyle | none | Layout only: flex, margins, direction and alignment of the children. Not for colours, radius or padding |
| `children` | node | none | |
| any other `View` prop | | | Passed through: `onLayout`, `accessibilityLabel`, `accessibilityRole`, `pointerEvents` and so on |

## States

| Variant | Background | Radius | Padding | Gap | Came from |
|---|---|---|---|---|---|
| `default` | `c.surface` | 28 | 20 | none | `Card` in `components/ui.tsx` |
| `roomy` | `c.surface` | 28 | 18 | none | the break, health and metric pages |
| `compact` | `c.surface` | 24 (`radii.card`) | 18 | 10 | the local `Card` in `app/goal-detail.tsx` |
| `tight` | `c.surface` | 24 (`radii.card`) | 16 | none | update cards, the no-plan card, onboarding summaries, streaks, break history |
| `dark` | `c.dark` | 28 | 20 | none | `<Card dark>` in `components/ui.tsx` |

Shadow: the card shadow in light mode; none in dark mode, none on the `dark` variant, and none when `flat` is set.

Modifiers on any variant: `border` adds a line, `clip` hides overflow, `padding` replaces the padding per side.

## Do and don't

- Do put one subject in a card, with its title first.
- Do use `dark` for hero cards with a soft glow (workout, goal) and the white card for data.
- Do use `flat` for a card that sits on a sheet or on another surface, and `clip` when a chart or photo runs to the edge.
- Don't nest a card in a card. Use a hairline or a soft surface tile inside.
- Don't set the radius, padding or colours through `style`; pick a variant, `padding` or `border`. If a look is missing, add a variant.
- Don't hard-code a light background; use theme tokens so dark mode works.

## Accessibility

- A plain View with no role of its own. Give the title inside it `accessibilityRole="header"`.
- It passes View props through, so you can label it or group it (`accessible`, `accessibilityLabel`) without a wrapper.
- If the whole card is tappable, wrap it in `Pressy` with role `button` or `link` and a label that says where it goes.

## Copy rules

- Title, then a sentence, then a quiet info line on its own line. No dot separators.
- No duplicate data on one page: if a number is on another card, do not repeat it here.

## Notes

`scripts/codemods/card-matches.js` looked for `<View>` containers with `backgroundColor: c.surface` and only radius, padding and gap; none matched a variant exactly at the time, and the 33 similar ones are listed in `docs/card-review.md`. In Phase B the 14 near-match cards were resolved: 13 now use `Card` (with `tight`, `roomy`, `flat`, `border`, `clip` or `padding`), one stays hand-built (the search field on `plans/log.tsx`; see `docs/coverage-exceptions.md`).
