# IconBadge

In use: 61 hand-built icon tiles in the app now use it (Today cards, goal page, Plans, onboarding, Gym, Progress). No visible change.

`src/design-system/primitives/IconBadge.tsx`

## Purpose

A square or round tile with one icon centred in it: the tinted icon tiles in lists, headers and cards (for example the green tick on an eaten food in the meals card). It draws only the tile; the caller draws the icon in the colour it wants.

```tsx
<IconBadge size={18} bg={c.good}><Check size={11} strokeWidth={3.5} color={c.bg} /></IconBadge>
<IconBadge size={40} bg={c.surface3} radius={radii.sm}><Lock size={18} color={c.muted} /></IconBadge>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | number | required | Width and height in px |
| `bg` | string | none | Fill colour. Leave out for a badge with only a border |
| `radius` | number | `size / 2` (a circle) | Corner radius. Use a `radii` token for a rounded square |
| `children` | node | none | An icon, a letter or a small drawing, centred |
| `borderColor` | string | none | Line colour, for the outlined badges |
| `borderWidth` | number | none | Line width. The border is drawn only when this is set |
| `accessibilityLabel` | string | none | Spoken label, when the badge carries meaning on its own |
| `style` | ViewStyle | none | Merged last: position, margin, overflow |

## States

No states of its own. The looks in use:

| Look | Props |
|---|---|
| Round filled | `size`, `bg` |
| Rounded square | `size`, `bg`, `radius={radii.sm}` (or another token) |
| Outlined | `size`, `borderColor`, `borderWidth`, no `bg` |

## Do and don't

- Do use theme tokens for `bg` (`c.goodSoft`, `c.surface3`, `c.accentSoft`) so it works in dark mode.
- Do pair a soft fill with the matching strong icon colour (`c.warnSoft` with `c.warn`).
- Don't make it pressable. If the tile is an action, use `IconButton` (44 px, button role).
- Don't use it for a plain coloured dot without an icon: that is `StatusDot`.
- Don't use red for a warning badge: amber (`c.warn`).

## Accessibility

- It is a plain View with no role. Most badges sit next to text that already says the same thing, so leave the label out and let the row speak.
- Set `accessibilityLabel` only when the badge is the only carrier of meaning (for example a status icon with no text).
- It is never a tap target, so the 44 px rule does not apply to it.

## Copy rules

- No text inside except a single letter or number (an initial, a count).
- Paused-membership and comeback states never use a failure look (no red, no cross on a warning fill).
