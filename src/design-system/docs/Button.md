# Button and IconButton

`src/design-system/primitives/Button.tsx`

Storybook: Primitives / Button (one story per kind and size, "All Kinds", and the IconButton stories "Icon Buttons", "Icon Button Wide", "Icon Button Hit Slop").

## Purpose

Every action in the app. One `Button` with a kind (colour) and a size (shape), and one `IconButton` for the icon-only ones (a rounded square by default, a pill when `width` is set). Before this there were six buttons: `Button` (ui.tsx), `PillBtn` and `RoundBtn` (bits.tsx), `StepBtn` (progress parts), and `Btn` and `SmallBtn` on the workout card. The old names stay as one-line wrappers.

```tsx
<Button label="Confirm" onPress={go} />                        // large, ink
<Button kind="accent" size="small" label="Save" />
<Button kind="white" size="medium" label="Start" />            // on a dark card
<Button kind="glass" size="tight" label="Skip" />              // on a dark card
<Button size="compact" height={40} kind="secondary" label="Try again" />   // was PillBtn
<Button kind="dashed" size="medium" label="Add set" icon={<Plus size={16} />} />
<Button kind="quiet" size="small" muted label="Skip meal" />
<Button kind="soft" size="xs" weight="medium" label="About: Leg day" iconAfter={<X size={14} />} />
<Button kind="line" size="chip" label="Form check" />
<IconButton label="Close" onPress={back}><X size={20} /></IconButton>      // was RoundBtn
<IconButton label="Play" onPress={play} size={36} radius={18} borderWidth={1} borderColor={c.line}><Play size={16} /></IconButton>
<IconButton label="Add steps" onPress={add} size={30} radius={15} hitSlop={10}><Plus size={14} /></IconButton>
```

## Props: Button

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | The visible text, also the spoken label |
| `onPress` | () => void | none | |
| `kind` | `'primary' \| 'accent' \| 'secondary' \| 'ghost' \| 'white' \| 'outline' \| 'glass' \| 'dashed' \| 'line' \| 'quiet' \| 'soft' \| 'whiteLine' \| 'surface'` | `primary` | Colour, see below |
| `size` | `'large' \| 'medium' \| 'small' \| 'tight' \| 'compact' \| 'chip' \| 'xs'` | `large` | Shape, see below |
| `small` | boolean | false | Old way to ask for `size="small"` (ignored when `size` is set) |
| `height` | number | 36 | `compact` only: its height; the corner is half of it |
| `disabled` | boolean | false | 40% opacity, not pressable |
| `icon` | node | none | Drawn before the text |
| `iconAfter` | node | none | Drawn after the text (the X on a removable "About: ..." pill). The side after it is 4 px tighter |
| `weight` | `'medium' \| 'semibold'` | the kind's own | Label weight. Medium for dashed, line, quiet and glass; semibold for the rest |
| `muted` | boolean | false | The label in the quiet (muted) text colour, for an action that is not the main one ("Skip meal") |
| `scaleTo` | number | 0.97 | Press scale |
| `style` | ViewStyle | none | Layout only: flex, margins, position. Not for colours or sizes (add a kind or a size instead) |
| `accessibilityLabel` | string | `label` | Spoken label when it must say more than the text |

## Props: IconButton

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | Spoken label; there is no visible text |
| `onPress` | () => void | required | |
| `children` | node | required | The icon or sign |
| `bg` | string | `c.surface2` | Fill colour |
| `glass` | boolean | false | Frosted glass instead of a fill, with a soft shadow, for buttons on a photo or a map |
| `scaleTo` | number | 0.97 | Press scale; the stepper buttons use 0.9 |
| `size` | number | 44 | Height in px, and the width unless `width` is set |
| `width` | number | `size` | Width when the button is not square (the 44 x 40 emoji tab, the 74 px water pill with two icons). Children are then laid out in a row |
| `radius` | number | `radii.lg` | Corner radius; half the size makes a circle |
| `borderColor` | string | none | Outline colour |
| `borderWidth` | number | none | Outline width; drawn only when set |
| `disabled` | boolean | false | Not pressable, and announced as disabled. It does not dim itself: dim it with `style` opacity |
| `hitSlop` | number or `{ top, bottom, left, right }` | none | Extra tap area around a small button so it still reaches 44 px |
| `style` | ViewStyle | none | Merged last |

## States

### Kind (colour)

| Kind | Fill | Line | Text | For |
|---|---|---|---|---|
| primary | ink | none | background colour | the one main action |
| accent | blue accent | none | accent ink | |
| secondary | soft surface (`surface2`) | none | ink | |
| ghost | none | none | accent text | a text action |
| outline | none | 1 px `line` | ink | |
| white | white | none | dark | main button on a dark card |
| glass | white at 12% | none | white, medium | second buttons on a dark card |
| dashed | none | 1 px dashed `chipLine` | ink, medium | add something: "Ate something else?", "+ Add exercise", "+ Add item", "Add set" |
| line | none | 1 px `chipLine` | ink, medium | a row of topic choices (coach, chat) |
| quiet | none | 1 px `line` | ink, medium (use `muted` for the quiet colour) | "Skip meal", "Undo skip" |
| soft | `accentSoft` | none | accent text | "This week", "Back to today", "About: ..." |
| whiteLine | white | 1 px `fixed.lineOnWhite` (#C9D1DD) | dark | buttons on the white workout clip stage ("Finish", "Hide") |
| surface | `surface` | none | ink | a button on a soft surface (Profile "Edit") |

`weight` overrides the label weight of any kind; `muted` swaps the label to the muted colour.

### Size (shape)

| Size | Height | Corner | Side padding | Text | Gap |
|---|---|---|---|---|---|
| large (default) | 56 | `radii.xl` (28) | 20 | 16 / 21 | 8 |
| medium | 50 | 25 (pill) | 20 | 15 / 21 | 8 |
| small | 44 | `radii.lg` (22) | 20 | 14 / 18 | 8 |
| chip | 44 | `radii.lg` (22) | 16 | 14 / 18 | 6 |
| tight | 40 | 20 (pill) | 16 | 14 / 20 | 8 |
| compact | 36, or `height` | half the height | 14 | 13 / 17 | 5 |
| xs | 32 | 16 (pill) | 12 | 12 / 17 | 4 |

`compact` is left aligned (no centring), the others are centred. Every size under 44 px (tight, compact, xs) gets a vertical hit slop, so its tap area is 44 px; the drawn size does not change.

### Interaction states

| State | Button | IconButton |
|---|---|---|
| Rest | as above | fill, glass or outline |
| Pressed | scale `scaleTo` (0.97), tap haptic | scale `scaleTo`, tap haptic |
| Disabled | 40% opacity, not pressable, announced as disabled | not pressable, announced as disabled, no dimming unless you add it |

## Do and don't

- Do use one primary (ink) button per card or sheet. Secondary actions are `secondary`, `ghost`, `outline` or `quiet`.
- Do use `white` and `glass` only on dark cards (workout card, budget card), and `whiteLine` only on the white clip stage.
- Do use `dashed` for "add one more" actions and `line` with `chip` for a row of topics to pick from.
- Do use `IconButton` for close, back, minus, plus, play, the Plan, Trend and calendar arrows, the exercise menu, the timer button and the clip full-screen buttons. Use `width` for a non-square icon button, not `style`.
- Do pin a sheet's main button under the scroll with `SheetFooter` when the list is long.
- Do use `Option` (not Button) for a choice that stays selected (programme, days a week, a range, a tab).
- Don't set colours, heights or paddings through `style`. If a look is missing, add a kind or a size.
- Don't make a chip or a pill do an action. Actions are Buttons.
- Don't use a Pay or Resume button anywhere a member sees. Membership is view-only.
- Don't use red for a destructive or warning action. Amber text or an outline is enough.

## Accessibility

- Button: role `button`, label `accessibilityLabel ?? label`, `disabled` state.
- Tap area: every size under 44 px (tight 40, compact 36, xs 32) adds a vertical hit slop so the tap area is 44 px high. Leave a little room around them so the slop does not overlap a neighbour.
- IconButton: role `button`, label `label`, and a `disabled` accessibility state. Keep `size` at 44 or more; when you draw it smaller, pass `hitSlop` so the tap area still reaches 44 px (the chat remove-photo button is 24 px with `hitSlop={10}`, the add-steps button 30 px with `hitSlop={10}`).

## Copy rules

- A verb first, two or three words: "Log meal", "Start workout", "Edit log", "See plan".
- Sentence case, no full stop, no emoji, no dot separators.
- Never "Pay", "Renew now" or "Resume membership" as a button. The member renews at reception.

## Old name to new

| Old | Now |
|---|---|
| `Button` (components/ui) | `Button` (same props) |
| `PillBtn tone ink / white / soft, h` | `Button size="compact" kind primary / white / secondary, height` |
| `RoundBtn` | `IconButton` |
| `StepBtn` | `IconButton scaleTo={0.9}` with a sign |
| workout card `Btn` | `Button kind="white" size="medium"` |
| workout card `SmallBtn` (solid or not) | `Button size="tight" kind="white"` or `"glass"` |

Not merged: `StarBtn` (rating stars on the coach confirm page) is an animated toggle, not a button. The near-match buttons and icon buttons from the audit are resolved in `docs/coverage-decisions.md`; the ones that stay hand-built are in `docs/coverage-exceptions.md`.
