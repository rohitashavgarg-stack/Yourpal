# FadeIn

`src/design-system/primitives/FadeIn.tsx`

Storybook: Primitives / FadeIn

## Purpose

The one fade-in wrapper for screens and cards. It replaces four copies of the same wrapper (`E` in the two Plans files, `Enter` on Today and Gym) and 108 places that wrote `<Animated.View entering={fade(...)}>` by hand.

```tsx
<FadeIn i={2}><Card>...</Card></FadeIn>
<FadeIn delay={120} style={{ flex: 1 }}>...</FadeIn>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `i` | number | 0 | Stagger index. The fade starts `i x step` ms after mount |
| `step` | number | 40 | Milliseconds per index. Today uses 50 |
| `delay` | number | none | Delay in ms. Wins over `i` |
| any `Animated.View` prop except `entering` | | | `style`, `pointerEvents`, `exiting`, `layout` pass through |

## States

No visual state. It plays once on mount: `fade()` from the motion tokens, a plain 180 ms fade.

| State | Look |
|---|---|
| Default | Fades in once on mount after its delay |
| Reduce motion on | No fade: the content is there at once (`useReducedMotion` from reanimated) |

## Do and don't

- Do use it for every card and screen that enters.
- Don't add springs, bounce, overshoot or wiggle to entering or exiting (rule from `docs/PHASE2_HANDOFF.md`).
- Don't stagger long lists past a few hundred ms: keep `i` small.

## Accessibility

- No role or label. Content is readable while it fades.
- With the system reduce-motion setting on, it skips the fade and shows the content at once.

## Copy rules

- None.
