# Snackbar

`src/design-system/primitives/Snackbar.tsx`

Storybook: Primitives / Snackbar

## Purpose

The message bar at the foot of the screen (called Toast before). Show one with `useOverlay().toast(msg, { undo })`; you do not render it yourself. `useToastLift(px)` raises it for a screen with chrome at the bottom.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `msg` | string | required | The message |
| `undo` | () => void | none | Adds an Undo button; it runs this and dismisses |
| `onGone` | () => void | required | Called when it leaves |
| `raised` | boolean | required | true while a sheet is open: moves to the top (58 px down) |
| `lift` | number | required | Bottom offset while screen chrome shows (check-in bar, rest panel); 0 means 104 |

## States

| State | Look |
|---|---|
| Plain | Ink bar, background-coloured text, `radii.md`, 52 px min height |
| With undo | An Undo button on the right (white 16% fill, bold) |
| Raised | At the top of the screen while a sheet is open |
| Lifted | Higher above the bottom chrome |
| Entering | Slides in with the bouncy spring, fades in over 200 ms |
| Leaving | After 3.6 s: fades and slides down over 250 ms |

## Do and don't

- Do use it to confirm something the member just did, with Undo when it can be undone.
- Do show one snackbar at a time.
- Don't use it for errors that need an action; put those on the screen.
- Don't put a second button in it.

## Accessibility

- Role `alert` with a polite live region, so it is read without stealing focus.
- Undo is a button labelled "Undo" with a light haptic. It is drawn 40 px high with a 2 px hit slop above and below, so its tap area is 44 px; the bar around it is 52 px.
- It stays 3.6 s. Keep the message short enough to read in that time.

## Copy rules

- Fact first, past tense, short: "Breakfast logged", "Leg day moved to tomorrow".
- Say the number when there is one: "250 ml added".
- No dot separators, no emoji, no exclamation marks.
