# PageGlow

`src/design-system/primitives/PageGlow.tsx`. Storybook: Primitives / PageGlow.

## Purpose

A very faint blue light in the top left corner of every page. It is mounted once in the app shell (`src/app/_layout.tsx`), above the screens and below sheets and toasts, so no page has to add it. A round fade to nothing: never a band, never a hard edge.

```tsx
<PageGlow />
```

## Props

None. It reads the theme: the brand blue (`fixed.blue`) at 15% in the middle of the corner in dark mode (7% in light), fading out within 90% of the width and 380 px of height.

## States

| State | Look |
|---|---|
| dark | blue at 15% in the corner, 5% half way out, then nothing |
| light | the same shape at about half the strength |

## Do and don't

- Do keep it faint. If you can see where it ends, it is too strong.
- Don't add a second blue glow on a page. A page can still have its own glow in the colour of what it is about (the assessment page has a green one).
- Don't make it a tap target. It takes no touches.

## Accessibility

- Hidden from screen readers. It is decoration.
