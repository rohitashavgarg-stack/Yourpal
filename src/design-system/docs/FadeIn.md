# FadeIn

`src/design-system/primitives/FadeIn.tsx`. The one fade-in wrapper for screens and cards.

It replaces four copies of the same one-line wrapper (`E` in the two Plans files, `Enter` on Today and Gym) and 108 places that wrote `<Animated.View entering={fade(...)}>` by hand.

| Prop | Type | Default | What it does |
|---|---|---|---|
| `i` | number | 0 | Stagger index. The fade starts `i x step` ms after mount |
| `step` | number | 40 | Milliseconds per index. Today uses 50 |
| `delay` | number | | Delay in ms. Wins over `i` |
| any View prop | | | `style`, `pointerEvents`, `exiting`, `layout` ... pass through to the `Animated.View` |

The animation is `fade()` from the motion tokens: a plain 180 ms fade, no springs, bounce or overshoot (rule from `docs/PHASE2_HANDOFF.md`).

```tsx
<FadeIn i={2}><Card>...</Card></FadeIn>
<FadeIn delay={120} style={{ flex: 1 }}>...</FadeIn>
```

States: there is no visual state. Reduced-motion is not handled yet (the old wrappers did not handle it either).
