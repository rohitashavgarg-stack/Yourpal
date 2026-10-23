# ListCard

`src/design-system/primitives/ListCard.tsx`

## Purpose

A list inside a white card. One component for the three lists that were called `ListCard`. Both old import paths keep working (`@/features/progress/parts` and `@/features/shell/parts` re-export it).

## Props

The variant follows the props: `title` means titled, `children` means container, otherwise rows. TypeScript rejects mixed props.

| Prop | Type | Default | Variant | What it does |
|---|---|---|---|---|
| `rows` | `ListRow[]` | required | rows | The rows, see below |
| `mono` | boolean | true | rows | Right value in the mono font; `false` for body text |
| `style` | ViewStyle | none | rows, container | Merged last |
| `children` | node | required | container | Your own rows inside the card shell |
| `title` | string | required | titled | The label above the card |
| `dot` | string | required | titled | Colour of the 8 px dot before the title |
| `rows` | `{ n, s }[]` | required | titled | Name on the left, detail on the right |

Row fields (`ListRow`, rows variant):

| Field | Type | What it does |
|---|---|---|
| `l` | string | Label, left |
| `v` | string | Value, right |
| `sub` | string | Caption under the label |
| `right` | node | Extra node before the chevron |
| `onPress` | () => void | Makes the row pressable and adds a chevron |
| `muted` | boolean | Quieter label (regular, muted); the value turns ink |
| `warn` | boolean | Label in the warning colour (amber) |

## States

| Variant | Look | Was |
|---|---|---|
| rows | Card radius `radii.xl`, rows 60 px min with hairlines | `ListCard` in `features/progress/parts.tsx` |
| container | Card shell, 18 px side padding | `ListCard` in `features/shell/parts.tsx` |
| titled | Dot and title, then a card of 40 px name and detail rows | the local `ListCard` in `features/plans/WorkoutPlan.tsx` |

Row states: plain, pressable (chevron, press scale 0.99), muted, warn. No shadow in dark mode.

## Do and don't

- Do use rows for settings and facts with a value on the right.
- Do give every pressable row a chevron (it comes with `onPress`).
- Don't mix actions and facts in one row; a row is either a link or a fact.
- Don't use `warn` for a paused membership or a comeback.

## Accessibility

- Pressable rows have role `button`; the spoken label comes from the row text. Rows are at least 60 px high.
- Non-pressable rows are plain Views.

## Copy rules

- Label is a noun ("Membership", "Height"), value is the fact ("12 Dec", "172 cm").
- No dot separators in `v` or `sub`. Put a second fact in `sub` on its own line.
