# Snackbar

`src/design-system/primitives/Snackbar.tsx`. The message bar at the foot of the screen (called Toast before). Show one with `useOverlay().toast(msg, { undo })`.

| Prop | What it does |
|---|---|
| `msg` | the message |
| `undo` | adds an Undo button; it runs this and dismisses |
| `raised` | true while a sheet is open: moves to the top (58 px down) |
| `lift` | bottom offset while screen chrome shows (check-in bar, rest panel); 0 means 104 |
| `onGone` | called when it leaves |

Ink background, background-coloured text, `radii.md`, 52 px minimum height. It shows for 3.6 s, slides in with a spring, fades out in 250 ms. Announced as a polite alert. `useToastLift(px)` raises it for a screen.
