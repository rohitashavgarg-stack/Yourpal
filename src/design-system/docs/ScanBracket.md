# ScanBracket

`src/design-system/primitives/ScanBracket.tsx`

## Purpose

One white corner of the plate-photo viewfinder. Draw four. It was written twice, once for the scan sheet and once for the full-page scanner. Scan is a plate photo only (no barcode).

```tsx
<ScanBracket pos="tl" />                  // scan sheet: 30 px, 20 from the edge
<ScanBracket pos="br" size="large" />     // full page scanner: 34 px, 22 from the edge
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `pos` | `'tl' \| 'tr' \| 'bl' \| 'br'` | required | Which corner |
| `size` | `'large' \| 'small'` | `small` | large: 34 px, 22 from the edge. small: 30 px, 20 from the edge |

## States

No states. A 3 px white line at 90% opacity with a 12 px corner radius, positioned absolutely in its parent.

## Do and don't

- Do draw all four corners inside a parent with a size and `position: relative`.
- Don't tint it; it sits on a camera image, so it is always white.

## Accessibility

- Decorative, no role or label. The camera view or its capture button carries the label.

## Copy rules

- None of its own. The hint text near it says what to do: "Fit the whole plate in the frame".
