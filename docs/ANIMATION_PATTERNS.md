# Animation patterns for YourPal

What each kind of screen and control does when it moves, and where the app does not follow it yet. The rules come from three places: Apple's Human Interface Guidelines (Motion, Playing haptics, Loading), the designer's rules in `PHASE2_HANDOFF.md`, and what is already built. The HIG gives principles only, no durations or curves, so the numbers below are this project's own.

## Principles (HIG, applied)

1. Motion has a reason: it shows where something came from or went, or confirms an action. No decoration.
2. Motion follows the gesture: a page dragged down leaves downward, a page swiped from the left edge leaves to the right.
3. Short and precise. Frequent actions get the least motion (a tap, a tick), rare ones can get a little more (finishing a workout).
4. Never make people wait: every transition can be left or cancelled at once, and nothing blocks the next tap.
5. Motion is never the only signal: a haptic or a text change goes with it.
6. Respect Reduce Motion: with the system setting on, movement is replaced by a plain change or a short fade.

## Patterns

| Thing | What it does | Timing | Built in |
|---|---|---|---|
| Screen or card entering | Plain fade, tiny slide at most. No spring, bounce or overshoot. | 180 ms in, 150 ms out, ease-out | `FadeIn`, `fade()` in `tokens/motion.ts` |
| Page opened from a card | Grows out of the card, drags down to close, left-edge swipe or phone back plays the same close | 420 ms open, 260 ms close, smooth ease | `GrowFrame` in `SubPage.tsx`, `cardGrow.ts` |
| Detail page (a back arrow) | Slides in from the right, leaves to the right | stack default | `DETAIL_PAGES` in `_layout.tsx` |
| Page with a cross (X) | Slides up from the bottom, leaves downward | stack default | `FROM_BOTTOM` in `_layout.tsx` |
| Bottom sheet | Rises, drags down to close, scrim fades | spring `soft` in, `snappy` back | `Sheet.tsx`, `Overlay.tsx` |
| Press | Shrinks to 0.97 and back, with a haptic | 110 ms in, 220 ms out | `Pressy` |
| Tab switch | Pill slides under the active tab, screens stay mounted | spring `nav` (no visible bounce) | `FloatingTabBar` |
| Floating buttons | Stay above the tab bar, settle to the bottom edge when the bar hides on scroll | 88 px translate | `StickyStart`, `StickyLog`, `StickyEdit` |
| Toast | Slides in from the top with a small settle, one at a time | spring `bouncy` | `Snackbar` |
| Progress and bars | Fill smoothly, never jump | timing or `soft` | `TimeBar`, rings |
| Celebration (finish, waiver signed) | Only here may it overshoot, once, and only when something was finished | spring | `FinishScreen`, `Waiver*` |
| Loading | Show the content shape or a placeholder at once, never a blank page | none | per screen |

## Reduce Motion

With the system setting on:
- Fade-ins (), presses (), the card-to-page growth (), the web page slides () and sheets () show the end state at once, with no movement.
- Springs go through  in : the toast, tab pill, segmented thumbs, switches, chevrons, row swipes, the water levels and the rest timer beat jump to where they were going.
- Loops do not run: the water wave, the rest timer beat, the heart beat, loading shimmer, typing dots, the scan lines, the live glow and the chat pulse. The plans highlight still shows once, steady, because it marks where to look.
- The confetti on the finish screen is not drawn.

Not tested on a device: it was checked by reading the code and by the type and lint checks. Turn on Reduce Motion on a phone and go through Today, Plans, a workout and a sheet to confirm. New animation must use  or .

## Other things the audit found

- `withSpring` with `bouncy` is used for entering things in a few places (toast, OTP digits, `popIn`, SetRow snap-back). The designer's rule is no bounce on screens and cards entering; these are controls, so they were left, but they are the first place to look if something feels springy.
- The press shrink is capped at 0.97 in `Pressy` whatever `scaleTo` asks for.
- Haptics already go with presses, back, check-ins and finishing a set. Keep matching the haptic's strength to the animation next to it.

## How to add motion

1. Check this table first. If the thing is a page, sheet, toast or button, reuse its pattern.
2. Use `FadeIn` or `fade()` for anything entering. No new springs for entering.
3. Read `useReducedMotion()` from `react-native-reanimated`. When it is true, skip the movement and set the end state.
4. Loops need a stop: under Reduce Motion, and when the screen is not in view.
5. Put any new duration in `tokens/motion.ts`, not in the component.
