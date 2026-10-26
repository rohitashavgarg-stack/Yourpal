# Glass

`src/design-system/primitives/Glass.tsx`

## Purpose

The frosted layer behind floating pills (Trends, the tab bar, the header) and the progressive blur under a header. On iOS with liquid glass it uses the real material; elsewhere a blur with a tint. `useScrolled` tells a header when the page has scrolled.

```tsx
<View style={{ borderRadius: 22, overflow: 'hidden' }}>
  <GlassBackdrop radius={22} tint={c.chipLine} />
  <Txt>Trends</Txt>
</View>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `GlassBackdrop.radius` | number | required | Corner of the clipped parent |
| `GlassBackdrop.tint` | string | none | Colour over the glass |
| `GlassBackdrop.frost` | number 0 to 100 | none | Extra blur and a light frosted tint (the tab bar) |
| `ProgressiveBlur.height` | number | required | How tall the fade is |
| `ProgressiveBlur.layers` | number | 12 | Steps of the fade |
| `ProgressiveBlur.edge` | `top \| bottom` | `top` | Which edge is sharpest |

## States

iOS 26 and up: liquid glass. Web: `WebLiquidGlass` (a CSS backdrop filter). Android and older iOS: blur and tint.

## Do and don't

- Do clip the parent (`overflow: hidden`, same radius).
- Do put icons in a View on web so they draw above the glass layer.
- Don't stack two glass layers.

## Accessibility

- Decorative: no role, no label, not a tap target.

## Copy rules

- Not applicable.

Moved here from `components/Glass.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
