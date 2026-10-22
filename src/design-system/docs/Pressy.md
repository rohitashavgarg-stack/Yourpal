# Pressy

`src/design-system/primitives/Pressy.tsx`

## Purpose

The pressable every tappable thing is built on: it scales down on press (snappy spring), back up on release (bouncy spring), and plays a tap haptic.

```tsx
<Pressy accessibilityRole="button" accessibilityLabel="Open meal" onPress={open} style={row}>...</Pressy>
```

## Props

Every `Pressable` prop, and:

| Prop | Type | Default | What it does |
|---|---|---|---|
| `scaleTo` | number | 0.97 | Scale while pressed. 1 turns the scale off |
| `haptics` | boolean | true | Tap haptic on press |
| `style` | ViewStyle | none | A plain style (not a function of the pressed state) |
| `children` | node | none | |

## States

| State | Look |
|---|---|
| Rest | scale 1 |
| Pressed | scale `scaleTo` |
| Disabled | as you style it; `disabled` stops presses |

## Do and don't

- Do use it (or a component built on it) for every tap target, so the whole app feels the same.
- Do set `accessibilityRole` and `accessibilityLabel` yourself.
- Don't nest a Pressy in a Pressy with different actions unless the inner one sits above the outer one (see the water tile's add button).

## Accessibility

- It sets no role or label by itself. Pass `accessibilityRole` (`button`, `link`, `radio`) and a label.
- Make the tap area 44 px: size it, or pass `hitSlop`.

## Copy rules

- None of its own.
