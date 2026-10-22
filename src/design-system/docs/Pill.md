# Pill

`src/design-system/primitives/Pill.tsx`

## Purpose

A selectable pill for filters and options (44 px high, `radii.lg`). Selecting it fills it with ink over 220 ms. It chooses between options; it is not an action.

```tsx
<Pill label="Today" on={value === 0} onPress={() => setValue(0)} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | Text, 13 px medium |
| `on` | boolean | required | Selected: ink fill, background-coloured text |
| `onPress` | () => void | required | |
| `style` | ViewStyle | none | For width, for example `flex: 1` |

## States

| State | Look |
|---|---|
| Off | Transparent, 1 px `c.surface3` line, ink text |
| On | Ink fill and line, background-coloured text |
| Pressed | Scale 0.97, tap haptic |

The fill and line animate over 220 ms.

## Do and don't

- Do use a group of pills where exactly one is on (a filter, a version choice in the Start sheet).
- Don't use a pill to start or save something: use `Button`.
- Don't use it for a two or three way switch inside a card header: that is `Segmented`.

## Accessibility

- Role `radio`, state `selected`. The label is the text.
- 44 px high.

## Copy rules

- One or two words, sentence case. No counts in brackets unless the number is the point.

Near-copies left alone: the food-type picker on the log page (veg or egg mark inside, no animation), the range switch on Trends (32 px high, `radii.md`), the option rows in the scan sheet (list rows). `SwitchChip` and `ActionChip` on the demo panel are web-only developer controls.
