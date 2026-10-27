# Hand-built on purpose

Elements from the near-match list that stay hand-built, and why. Everything else from that list now uses a library component (see [coverage-decisions.md](coverage-decisions.md)).

| Where | What it is | Why it stays |
|---|---|---|
| `src/app/welcome.tsx:158` | One segment of the story progress bar on the welcome screen (28 x 4 px), tappable to jump to that story | Not a button look at all: a progress segment that the audit counts as an icon button because it is pressable. It fills with an animated bar; no library component draws that. |
| `src/app/plans/log.tsx:41` | The search field on "What did you eat?" (52 px, radius 28, 1 px line, no shadow, an icon and a text input inside) | A text field, not a card. It belongs with `Field` (Input), which is 56 px with a 1.5 px line on focus; this one is 52 px and does not change on focus, so it would need its own Field variant. Left as a one-off as agreed. |
| `src/features/workout/NewWorkoutUI.tsx:54` | The exercise clip thumbnail button (64 px, a photo filling it, clipped to radius 12, a play mark on top) | An image button. `IconButton` draws a fill and an icon; it does not clip a photo to its corners. One place in the app. |
| `src/web/WebFrame.tsx:311` | Collapse / expand on the demo controls panel (web only, beside the phone) | Part of the demo tooling, not the app. It uses a plain Pressable on purpose (no press scale, no haptic); `IconButton` would add both. |

## Shared components kept where they are

Round 4, step 7 moved every shared component used on 3 or more screens into `src/design-system/` (14 components, each with a story and a doc; the old import paths re-export them). These stay in `src/components/`, counted by `node scripts/audit/shared-usage.js` (a screen counts when its import closure draws the component):

| Component | Where | Why it stays |
|---|---|---|
| `Segmented` | `src/components/ui.tsx` | Used on 1 screen |
| `Skeleton` | `src/components/bits.tsx` | Used on 2 screens |
| `Glow` | `src/components/bits.tsx` | Used on 1 screen (the pulsing dot on the check-in bar); the library has `RadialGlow` for the card glow |
| `UnitPill` | `src/components/bits.tsx` | Used on 0 screens by tag (the unit switch on the onboarding steps) |
| `OtpInput` | `src/components/OtpInput.tsx` | Used on 1 screen (login) |
| `TabScreen` | `src/components/TabScreen.tsx` | App structure: the tab page shell, tied to the tab bar's hide-on-scroll context. 4 screens, but it is a layout, not a visual component; a library pattern must not depend on navigation |
| `GymHeader`, `Avatar`, `GymLogo` | `src/components/GymHeader.tsx` | A container: reads the router, programmes, notifications and the member. The visual parts it draws (YourPalLogo, Brand, Glass, IconBadge, StatusDot) are in the library |
| `FloatingTabBar`, `NavHideProvider` | `src/components/FloatingTabBar.tsx` | App structure: the tab bar, drawn by the tabs layout only |
| `PillBtn`, `RoundBtn` | `src/components/bits.tsx` | Old names of `Button` (compact) and `IconButton`; already library components |
| `OverlayProvider` | `src/components/Overlay.tsx` | App infrastructure (sheet and toast host); its look is `Sheet` and `Snackbar` in the library |
