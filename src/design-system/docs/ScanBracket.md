# ScanBracket

`src/design-system/primitives/ScanBracket.tsx`. One white corner of the plate-photo viewfinder. Draw four. It was written twice, once for the scan sheet and once for the full-page scanner.

```tsx
<ScanBracket pos="tl" />                  // scan sheet: 30 px, 20 from the edge
<ScanBracket pos="br" size="large" />     // full page scanner: 34 px, 22 from the edge
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `pos` | `'tl' \| 'tr' \| 'bl' \| 'br'` | | which corner |
| `size` | `'large' \| 'small'` | `small` | the two sizes that existed |

3 px white line at 90% opacity, corner radius 12.
