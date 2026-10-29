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


---

## From: YourPal app design: reference, handoff and goal cards (fork)

Session of 20 Oct 2026, run on one machine, forked from the earlier Today and goal card session. Everything was pushed to `main` as it was built. This section records what the session left behind. Later work on `main` (design system tokens, Storybook, the Today greeting moved to the 28 px page title size, Assessments on Gym) has since changed some numbers below, so open the file before relying on a value.

### How the designer worked (rules he repeated)
- He sends a screenshot and one line, often with a red box. Fold it in at once. When he says "show me here first" or "plan how", mock it in chat and wait. When he says "do what you understand", build and list the assumptions.
- Colour only where it means something. He removed the blue glow, then the mint and orange wash, from the Today card, and asked for a calm charcoal base with one gradient.
- Do not change what was not asked. He rejects anything that touches a nearby element ("nope", "fix this").
- No dot separators in copy. Use a heading, then a line, then a quieter line. No second sentence glued to a first.
- His reference screens win over the rules (the greeting reference uses "Hey! Rohitashav" with an exclamation mark).
- A build he cannot see is usually stale. Vercel takes 2 to 5 minutes after a push; check what is live with `curl` on the bundle and grep a colour value from the commit. Expo Go needs a reload.

### Today screen, end state of this session (`src/app/(tabs)/index.tsx`)
- Order, top to bottom: header, membership strip (only when expired, see below), greeting, updates stack, Today card, then the other cards by time of day.
- Cards below the Today card follow the time: workout at workout time, meals at meal time, the week at the end of the day. When every meal is logged the meals card moves below the trackers.
- Demo panel "Top card" switches the Today card for the original goal card (`GoalTickCard`). Default is the Today card.
- Comeback day keeps its own welcome line and the easy session card; the new greeting is hidden then.
- No plans assigned: greeting, one note card and the trackers only (see below).

### Greeting (`src/lib/microcopy.ts`, `src/features/today/TodayGreeting.tsx`)
- Two lines in one light grey (`c.muted`): a greeting with the name, then a line whose key phrase is brighter (`c.ink`). Example: "Hey! Rohitashav" over "It's your **Leg day**".
- The name is only ever in the first line. Copy is English only (Hinglish was built and removed on request).
- States (the demo panel "Greeting line" previews all of them): workout live, workout soon, workout later today, workout done with a streak ("3 week streak"), done without one, rest day, meal next ("Lunch is next"), week progress, membership expired, no plan ("Your plan is on the way").
- First lines: time of day greeting, "Hey!", "Hello!", "Good job!", "Keep going!". The day of the month rotates them.
- Size: 32 px Geist regular when this session ended, both lines stepping down to 28 px when the first line is longer than 19 characters. `main` has since set it to the page title size.
- All copy sits in `microcopy.ts`. `todayLine` and the hint line were removed: no hint under the greeting.

### Today card (`src/features/today/TodayBudget.tsx`)
- Eat today and Burn today side by side. Number 36 px regular white, "/ 1,800" and "/ 350 planned" small grey, unit "kcal" top right, divider between.
- Eat bar mint `#2EE6A8`, Burn bar orange `#FF9A4D`, track `rgba(255,255,255,0.18)`. Burn is a plan number (350) unless Health and a wearable are connected; then it says "watch", and after a workout "done".
- Background: diagonal gradient `#1B1D22`, `#1E2438`, `#2A3860` (charcoal to slate blue), border `rgba(255,255,255,0.1)`, radius 28. No glow.
- Goal strip along the bottom, lighter (`rgba(255,255,255,0.07)`): white target icon 22 px, "Goal" small, goal name 18 px, "27% completed", chevron. Opens `/goal-detail`.
- It replaced the big goal card on Today. The goal is not on Today any more except in this strip.

### Meals card (`src/features/today/MealsCard.tsx`)
- The "Eaten today" box is gone (the number lives on the Today card).
- Orange wash behind it: one big radial fade from the top right corner (460 by 340, peak 0.34 dark and 0.26 light). A band or a linear gradient showed a hard edge; do not go back to those.
- Header: "Meals", a dotted rule under it (1 px, 40% white, 3 px dots and gaps, drawn as blocks), a "3 of 4 done" pill (38 px tall, transparent with a light dark tint), and a glass time capsule (28 px, clock icon) for the shown meal.
- Eaten items are solid dark green `#1E4A3F` with a thin green edge, not transparent green.
- All meals logged: a summary card with a green check, protein line and one row per meal (kcal and time, or "Skipped"). Tapping a row opens that meal. Demo panel row "Meals today", "All logged".
- The "wasn't logged" banner is not shown for the meal that is already on screen. A missed meal shows its planned time in the capsule instead of "Not logged".

### Updates stack (`src/features/today/ForYou.tsx`)
- Cards: PT confirm, "Membership ends in 12 days" (dismissible), coach reply, plan change, reassessment, "Log your meal" (a meal is due or overdue), "Log your workout" (planned workout more than 2 hours past), water, weight and steps reminders.
- Log prompts and reminders are hidden when the membership is expired and when no plans are assigned. The PT confirm is hidden when expired.
- Swipe motion: the next card takes its place at the end of the gesture and the deck height eases (`LinearTransition`), so the content below no longer jumps.
- The meals and workout cards still show their own missed prompts, so a missed meal can appear twice.

### Expired membership is view-only
- Membership has three states: Active, Expiring, Expired. The grace period was removed; expired pauses logging at once.
- `src/lib/logGate.ts`: `useLogsPaused`, `useLogGate` (a toast instead of the action), `useLeaveIfPaused` (action pages go back).
- Today: the grey strip stays pinned and cannot be dismissed. Workout and meals show flat locked cards ("Workouts are paused", "Meal logging is paused") with the history kept. Check-in bar hidden. Dimming wrapper `ViewOnly` for trackers and meals.
- Plans: a "Plans are view only" note, no plan menu, no start bar, no create. Diet changes toast. Any planned day that was not logged shows the real plan behind a strong full-width blur that fades into the page, with a lock and "This plan is locked". Logged days stay readable. The day strip shows a lock under those days.
- Chat is read-only ("Messaging is paused").
- Not done: the Diet tab is not locked for future meals. The designer said "diet part, ask after this"; it was never asked.

### Plans tab, logged day
- A finished day shows a green check beside the title, "Logged 6:40 to 7:25 pm", a summary card (Logged "3 of 4", Not logged, Swapped) with one bar segment per exercise, and a status mark on each row: green check, dashed circle with amber "Not logged", and "Swapped from X".
- Day strip: a green check under a logged day, a dashed amber ring under a planned past day nobody logged.
- Data: `PlanEx.res` (`'skip'` or `'swap'`) and `from` in `src/lib/data.ts`. Monday's sample day carries one swap and one skip.
- A past day that was never logged has its "Not logged" line built but no sample day shows it.

### Progress tab
- The dark `GoalTickCard` sits below the Day, Week, Month, Year tabs and the date row, replacing the blue card. The other session later tried a container-less goal strip (`GoalStrip.tsx`, now unused).

### No plans assigned
- `src/lib/planState.ts` (`planStore.assigned`), `src/features/today/NoPlanCard.tsx`, demo panel Member card row "Plans" (Assigned or Not assigned).
- Today shows the greeting ("Your plan is on the way"), the note "No plan assigned yet. Your coach shares your workout and diet plan after your assessment. Until then, track your weight, water and Health data here.", then the trackers (weight, water, Health or wearable data). The calories card, workout card, meals card and week card are hidden.
- The Plans tab uses its existing "plan on the way" cards (starter workout, "Log a meal").

### Copy
- 26 toast messages rewritten without " · " (for example "Goal saved. Coach Vikram notified").
- About 250 dot-separated strings remain in sheets, subtitles and screens (sweep screen by screen, never in bulk).

### Colours and type used
- Mint `#2EE6A8` progress and done. Orange `#FF9A4D` burn and the meals glow. Blue `#2F6BEA` goal glow and accent. Amber for caution, never red.
- Today card text: `#F3F4F6` white, `#C9CDD6` labels, `#9AA0AD` muted.
- Geist for body and labels; Outfit 600 and 700 for display. The designer asked for weight 550: only 600 and 700 are loaded, so 600 was used. A real 550 needs a variable font or the 500 file.
- Chips and pills are translucent, never a solid dark rectangle. A backdrop blur layer drew a square of the glow on web; use a plain tint.

### Demo panel rows added (Member card, `src/web/WebFrame.tsx`)
Membership (Active, Expiring, Expired), Plans, Top card, Meals today, Greeting line. Page rows registered with `useScenarios` do not show in the panel; only fixed rows do.

### Open questions
- Should the time of day greeting ("Good evening") show every day, or keep rotating with "Hey!" and "Hello!"? It rotates today.
- Should the streak appear on every greeting or only after a workout? Today it is only a "3 week streak" line after a workout.
- Weight 550 for the greeting: add the Outfit 500 file, or keep 600?
- Should the goal still be visible on Today in the no plans state? The calories card is hidden there, so the goal strip is too.
- Lock the Diet tab for an expired member, like the workout plans?
- Keep or remove the duplicate missed prompts on the meals and workout cards now that the stack has "Log your meal" and "Log your workout".
- Microcopy plan not finished: milestone lines (streak and personal best), reminder and notification wording, one liners on Plans and Progress.
- Light mode was not checked for any of this session's work. Expo Go was not run on a phone.
- Unused code left: `GoalStrip.tsx`, the old meals `lead` variant remnants in `MealsCard.tsx`.
