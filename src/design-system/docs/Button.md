# Button and IconButton

`src/design-system/primitives/Button.tsx`. Before this there were six buttons: `Button` (ui.tsx), `PillBtn` and `RoundBtn` (bits.tsx), `StepBtn` (progress parts), and `Btn` and `SmallBtn` on the workout card. They are now one `Button` (kind and size) and one `IconButton`. The old names stay and are one-line wrappers.

```tsx
<Button label="Confirm" onPress={go} />                        // large, ink
<Button kind="accent" size="small" label="Save" />
<Button kind="white" size="medium" label="Start" />            // on a dark card
<Button kind="glass" size="tight" label="Skip" />              // on a dark card
<Button size="compact" height={40} kind="secondary" label="Try again" />   // was PillBtn
<IconButton label="Close" onPress={back}><X size={20} /></IconButton>      // was RoundBtn
```

## Kind (colour)

| Kind | Fill | Text |
|---|---|---|
| primary | ink | background colour |
| accent | blue accent | accent ink |
| secondary | soft surface | ink |
| ghost | none | accent text |
| outline | none, 1 px line | ink |
| white | white | dark |
| glass | white at 12% | white, medium weight |

## Size (shape)

| Size | Height | Corner | Side padding | Text |
|---|---|---|---|---|
| large (default) | 56 | `radii.xl` | 20 | 16 / 21 |
| medium | 50 | 25 (pill) | 20 | 15 / 21 |
| small | 44 | `radii.lg` | 20 | 13 / 18 |
| tight | 40 | 20 (pill) | 16 | 13 / 20 |
| compact | 36, or `height` | half the height | 14 | 12 / 17 |

`compact` keeps a 44 px tap area with a hit slop when it is shorter than 44. The text is semibold except on `glass`, which is medium.

## Props

`label`, `onPress`, `kind`, `size`, `small` (old name for size small), `height` (compact only), `disabled` (40% opacity, not pressable), `icon`, `style`, `accessibilityLabel`.

## IconButton

A 44 px rounded square (`radii.lg`) with one icon or sign. Props: `label` (spoken), `onPress`, `children`, `bg` (default soft surface), `glass` (frosted, for photos and maps), `scaleTo` (press scale, 0.97; the stepper uses 0.9). `StepBtn` is an IconButton with a minus or plus sign.

## Old name to new

| Old | Now |
|---|---|
| `Button` (components/ui) | `Button` (same props) |
| `PillBtn tone ink / white / soft, h` | `Button size="compact" kind primary / white / secondary, height` |
| `RoundBtn` | `IconButton` |
| `StepBtn` | `IconButton scaleTo={0.9}` with a sign |
| workout card `Btn` | `Button kind="white" size="medium"` |
| workout card `SmallBtn` (solid or not) | `Button size="tight" kind="white"` or `"glass"` |

Not merged: `StarBtn` (rating stars on the coach confirm page) is an animated toggle, not a button.
