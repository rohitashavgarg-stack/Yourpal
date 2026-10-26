# Option

`src/design-system/primitives/Option.tsx`

Storybook: Primitives / Option

## Purpose

One choice in a set that stays selected: a programme, an experience level, days a week, a food type, a Progress range, a segmented tab. It draws the container and its selected state; the content (text, a logo, a number) is whatever the caller puts in it. The caller colours its own text from `selected`.

It is not an action: a Button does something, an Option picks something. `Pill` is the simpler fixed-size (44 px, text only) choice; use `Option` when the content is more than a label or the size differs.

```tsx
// outline look: onboarding programme and experience
<Option look="outline" selected={on} onPress={pick} minHeight={72} padX={16} gap={12}>
  <Logo /><Txt>Gold's Gym</Txt>
</Option>

// fill look with a line when off: days a week
<Option selected={on} accessibilityLabel="4 days a week" onPress={pick} height={72} row={false} offFill={c.surface} offLine={c.line} style={{ flex: 1 }}>
  <Txt style={{ color: on ? c.bg : c.ink }}>4</Txt>
</Option>

// segmented tab
<Option role="tab" selected={on} onPress={pick} scaleTo={0.96} height={44} minWidth={72} padX={16} row={false}>...</Option>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `selected` | boolean | required | The selected state |
| `onPress` | () => void | required | |
| `look` | `'fill' \| 'outline'` | `fill` | See States |
| `role` | `'radio' \| 'tab'` | `radio` | radio: one of a set. tab: a segmented control |
| `accessibilityLabel` | string | none | Spoken label when the content is not plain text |
| `height` | number | none | Fixed height |
| `minHeight` | number | none | Minimum height, for a row that grows with its content |
| `minWidth` | number | none | Minimum width |
| `radius` | number | `radii.lg` | Corner radius |
| `padX` | number | 0 | Side padding (0 centres the content) |
| `gap` | number | none | Space between the children |
| `row` | boolean | true | Lay the children out in a row (logo and text); false stacks them |
| `offFill` | string | transparent | fill look, not selected: the fill |
| `offLine` | string | fill: none. outline: `c.line` | Not selected: the 1 px line colour |
| `scaleTo` | number | 0.97 | Press scale |
| `style` | ViewStyle | none | Layout only: flex, margins |
| `children` | node | required | The content |

## States

| Look | Not selected | Selected |
|---|---|---|
| `fill` | `offFill` (transparent by default); a 1 px `offLine` when one is given | Ink fill. When there is an `offLine`, a 1 px ink line too, so nothing moves |
| `outline` | `c.surface` fill, 1 px `offLine` (`c.line` by default) | `c.surface` fill, 2 px ink line |

| Interaction | Look |
|---|---|
| Pressed | Scale `scaleTo` (0.97), tap haptic (from `Pressy`) |

Content alignment is always centred on both axes; `padX` and `gap` space it. There is no disabled state.

Where it is used: onboarding programme and experience (outline), onboarding days a week (fill with a line), food type on "What did you eat?" (fill with a line), the Progress range 1W / 1M / ... (fill, 32 px, `radii.md`), the segmented tabs in `components/bits.tsx` (fill, `role="tab"`).

## Do and don't

- Do use it for a choice that stays selected. Use `Button` for an action.
- Do colour the text yourself: background colour on the ink fill, ink or muted otherwise.
- Do give an `offLine` on a fill-look set that sits on the page background, so the unselected ones are visible.
- Don't mix the two looks in one set.
- Don't set colours or borders through `style`; use `look`, `offFill` and `offLine`.
- Don't use it for a single on/off switch; that is a Switch.

## Accessibility

- Role `radio` (or `tab`) with the `selected` state, so a screen reader says "selected".
- Pass `accessibilityLabel` when the content is a logo or a bare number ("4 days a week", "1 month").
- Keep `height` or `minHeight` at 44 or more where you can. An Option shorter than 44 px (the 32 px Progress range options) keeps a 44 px tap area through a vertical hit slop that the component adds itself.

## Copy rules

- One to three words, sentence case: "Beginner", "Veg", "1M".
- No dot separators. A second line, when there is one, is a quiet sentence under the first, not a run of facts.
