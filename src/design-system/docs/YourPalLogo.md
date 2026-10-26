# YourPalLogo

`src/design-system/primitives/YourPalLogo.tsx`

## Purpose

The YourPal logo (symbol and wordmark) drawn as one vector, so it is sharp at any height. Default colour is the brand blue (`fixed.logoBlue`); pass white on dark screens.

```tsx
<YourPalLogo height={28} />
<YourPalLogo height={28} color={fixed.white} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `height` | number | 40 | Height in px; the width follows `LOGO_RATIO` (268 by 78) |
| `color` | string | `fixed.logoBlue` | Fill |

## States

No states.

## Do and don't

- Do use white on dark and the brand blue on light.
- Don't stretch it: set the height only.

## Accessibility

- Labelled "YourPal".

## Copy rules

- Not applicable.

Moved here from `components/YourPalLogo.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
