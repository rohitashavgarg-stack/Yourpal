# Hand-built on purpose

Elements from the near-match list that stay hand-built, and why. Everything else from that list now uses a library component (see [coverage-decisions.md](coverage-decisions.md)).

| Where | What it is | Why it stays |
|---|---|---|
| `src/app/welcome.tsx:158` | One segment of the story progress bar on the welcome screen (28 x 4 px), tappable to jump to that story | Not a button look at all: a progress segment that the audit counts as an icon button because it is pressable. It fills with an animated bar; no library component draws that. |
| `src/app/plans/log.tsx:41` | The search field on "What did you eat?" (52 px, radius 28, 1 px line, no shadow, an icon and a text input inside) | A text field, not a card. It belongs with `Field` (Input), which is 56 px with a 1.5 px line on focus; this one is 52 px and does not change on focus, so it would need its own Field variant. Left as a one-off as agreed. |
| `src/features/workout/NewWorkoutUI.tsx:54` | The exercise clip thumbnail button (64 px, a photo filling it, clipped to radius 12, a play mark on top) | An image button. `IconButton` draws a fill and an icon; it does not clip a photo to its corners. One place in the app. |
| `src/web/WebFrame.tsx:316` | Collapse / expand on the demo controls panel (web only, beside the phone) | Part of the demo tooling, not the app. It uses a plain Pressable on purpose (no press scale, no haptic); `IconButton` would add both. |
