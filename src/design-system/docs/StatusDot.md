# StatusDot

In use: the 10 px unread and status dots on the bell, Plans, Attendance and the Today update cards now use it. No visible change.

`src/design-system/primitives/StatusDot.tsx`

## Purpose

A small solid dot: a status, a legend key, an unread mark, or one cell of a grid (for example the attendance grid on the Gym tab, `app/(tabs)/gym.tsx`).

```tsx
<StatusDot size={8} color={c.accent} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | number | required | Diameter in px |
| `color` | string | required | Fill colour |
| `style` | ViewStyle | none | Merged last: margin, position |

## States

None of its own. The colour is the state, chosen by the caller. Common uses:

| Use | Colour |
|---|---|
| Done or on plan | `c.good` or `c.accent` |
| Not done, holiday or empty | `c.surface2` or `c.surface3` |
| Live or unread | `c.live` (mint) |
| Needs attention | `c.warn` (amber, never red) |

## Do and don't

- Do give the dot a text partner (a legend, a label or a spoken summary) so colour is not the only signal.
- Do use theme tokens so it reads in dark mode.
- Don't make it a tap target.
- Don't use red for a warning or a missed day: amber.
- Don't use it with an icon inside: that is `IconBadge`.

## Accessibility

- It is a plain View with no label and is not read by screen readers.
- Put the meaning in the surrounding text or in an `accessibilityLabel` on the parent row or grid (for example "8 of 12 visits this month").

## Copy rules

- The legend next to a set of dots is one short noun ("Workout", "Meals on plan"). No dot separators in the legend.
