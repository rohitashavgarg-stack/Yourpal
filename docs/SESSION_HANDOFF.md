# Session handoff: where the YourPal app is now (19 Oct)

Read this with `PHASE2_HANDOFF.md` (same folder), `../AGENTS.md` and the `yourpal-mobile-ui` skill. Everything below is already on `main` and live at https://yourpal-psi.vercel.app.

## How we work with the designer (Rohitashav)
- He sends screenshots with a one-line correction. Fold each in at once. He often says "tell me what you will do, then I confirm": do that when he asks, otherwise just build.
- Look at it on screen before reporting (`npx expo start --web --port 8082`, open `/?signedin=1`). The demo controls panel sits beside the phone on web.
- **No dot separators** ("text · text"). Use a title, then a sentence, then a quiet info line on its own line. **Chips are not for actions** (a chip looks like a button): use plain info text.
- A paused membership and a comeback are never styled as failure. Amber for warnings, never red.

## Shipping
- `scripts/ship.sh "message"` typechecks, commits, merges into `main` with a real merge commit, pushes, waits for the Vercel Production build and screenshots the live site. Needs `gh` logged in. `scripts/ship.sh --status` shows what Production serves.
- Why a merge commit: Vercel never builds the same commit twice. A branch push is built as a Preview, so a fast-forward of that commit into `main` gets no Production build.
- `.claude/agents/ship.md` is an agent that runs the script.

## Built this session (all on Today unless noted)
- **Swipe to start** (onboarding): frosted liquid glass like iOS "slide to answer", inner white glow only, no outer glow or shadow. `SwipeToStart` in `src/app/onboarding.tsx`, `WebLiquidGlass` in `src/components/Glass.tsx`.
- **Goal card** (`src/features/today/GoalTickCard.tsx`, states and colours in `goalCardState.ts`): dark card `#1A1D22`, seven states from one component (on track, behind, almost, complete, comeback, back on, no goal; a goal is never frozen or paused, a membership pause shows only as the account banner) plus a stale weigh-in overlay. Percentage is time elapsed, the kg line is always beside it. 36-segment bar for weight and muscle goals only; other goal kinds keep their own picture (staircase, ruler, lane, slots, ticks). The date is subtext under the title; the pill stays in front.
- **Membership**: Today shows an edge-to-edge strip (`PaymentBanner`) with a "See plan" button; the Gym tab shows a compact card (`MembershipCard`). Expired memberships say logging and other features are paused.
- **Today order** (`src/app/(tabs)/index.tsx`): membership strip, then updates, then the main card of the moment (workout time: workout; meal time: compact "Today's Meals"; neither due: workout), then goal, trackers, the other card, This week. The streak card is no longer on Today (Progress has Streaks & badges).
- **Comeback day**: the comeback greeting as plain text, then the workout card in its comeback form (the library `WorkoutCard` state `comeback`: a flat card titled "Easy session": 20 min, chips "4 exercises" and "Half your usual load", buttons "Start easy session" and "Not today"), then the goal, then the PT and update cards.
- **Reminders** (`src/features/reminders/`): captions under the water, weight and steps tiles (water after 4 h, weight after 5 days, steps behind pace); meals use the meals card's own "not logged" row. Switches and quiet hours in Profile, Notifications. Phone notification preview via the demo panel ("Send reminder push"). Real scheduled pushes are not built.
- **Demo controls panel** (`src/web/WebFrame.tsx`, `ControlParts.tsx`): one short column with dropdowns and switches.
- Reassessment due is a card inside the "For you" stack (the stack's cards behind the front one are clipped to its height).

## Known gaps and ideas
- **Expo Go is untested.** The iOS and Android bundles build (`npx expo export`), but nobody has run it on a phone. Seven Expo packages are a patch behind (`npx expo install --check`).
- "Back on" is panel-only. The weigh-in date is a demo value (`goalCardStore.weighDays`).
- About 280 places still use " · " separators in copy (toasts, sheets, subtitles). Sweep them one screen at a time.
- Unreachable code left behind: the "Current" Today layout, the old larger goal card (`goalSizeStore`), `ComebackPlan`, `ComebackCard`.
- Page-specific demo rows registered with `useScenarios` (for example "Goal card state") do not show in the side panel any more; only the fixed cards do.
