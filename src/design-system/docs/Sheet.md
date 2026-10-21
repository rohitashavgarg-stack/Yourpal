# Sheet

`src/design-system/primitives/Sheet.tsx`. The bottom sheet. It lived inside `components/Overlay.tsx`. You do not render it yourself: call `useOverlay().openSheet(content, { label, glow })` and `closeSheet(after?)`.

| Prop | What it does |
|---|---|
| `children` | the content, in a scroll with 20 px side padding and 12 px gap |
| `label` | spoken label |
| `glow` | a colour that bleeds in from the top right corner |
| `onClosed`, `registerClose` | wiring used by `OverlayProvider` |

Behaviour: springs up (`spring.soft`), a scrim fades in, drag down more than 120 px or flick faster than 900 to close, up to 88% of the screen high, lifts above the keyboard on native, 30 px top corners, grab handle 40 by 5.

There is one sheet in the app. The 36 "...Sheet" components are the content that goes inside it.
