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


## From: Plans, Progress, Gym and login cleanup (27 to 29 Oct 2026)

Everything below is on `main` (last publish `50a8a8b`, live at https://yourpal-psi.vercel.app). Storybook (https://yourpal-storybook.vercel.app) and the handoff zip were refreshed on 28 Oct, **before** the last web push: they do not yet show the country code picker on the text field (`Field`, prop `onPrefixPress`). Run `node scripts/publish.js all --yes --message "..."` to refresh them.

### Working rules the designer repeated this session
- He asks "show here what you will do, then do it" and "do changes one by one". Show a wireframe or a short plan first when he asks; he confirms with "go" or "yes please do the changes".
- Fix hierarchy, not creativity: same pattern as the rest of the app (title, one sentence, a quiet info line on its own line). Never three lines side by side that look cramped.
- No dot separators in text he points at; never bulk-change the other ~238 by yourself.
- A glass button only where he asks. Secondary actions ("Start today anyway", "Log this workout") are plain secondary buttons, not primary and not glass.
- Green only on checks and stat numbers, never as a card fill. Stat tiles are grey (`c.surface2`) with an icon. Checks sit on the right.
- Flame icon only for the streak. Heading icons have no coloured container.
- "More padding" means padding, not letter spacing.
- Page titles and the Today greeting share one style: 28 px (`xl3Plus`), line height 37, letter spacing -1.1.
- Metro on this Windows machine does not notice file edits: restart `npx expo start --web --port 8082 --clear` before every screenshot. After a restart the first bundle takes about a minute.
- Multi-line string replacements fail on files with CRLF (`src/app/gym/assessments.tsx`, `src/app/(tabs)/gym.tsx`); use line edits or the Edit tool. In Node scripts written through bash heredocs, `\n` inside strings becomes a real line break: use the Write tool for scripts.
- Publishing: `node scripts/publish.js web --yes --message "..."` does checks, merges into `main` with a real merge commit, pushes and waits for Vercel (about 3 minutes). `all` also rebuilds Storybook and the handoff zip. The "no new hard-coded colours, radii or font sizes" check fails the publish: use `fontSizes.*`, `fixed`, `onDark`, palette `c`.

### Plans tab (`src/app/(tabs)/plans.tsx`, `src/features/plans/`)
- Week strip: the month heading is a button that opens `PlansCalendarSheet` (month calendar in a bottom sheet; only two weeks back and three ahead can be picked). A chip with a direction icon appears when you are on another week. Grey full-width strip, day pills 66 high with 2 px gap, a fixed 16 px slot for the indicator, selected day with more padding.
- Header of a day: "Leg day", then "by Coach Vikram" small with the coach photo, then a facts row with dumbbell and calendar-clock icons. Planned time sits in the facts row. Dashed separator above Warm-up.
- Sections (Warm-up, exercises, Cool-down) use `SectionLabel variant="section"` with an icon and `ListCard` titled (icon, title, numbered rows, right check, `done` state). Warm-up uses the new `StretchIcon` (`src/lib/StretchIcon.tsx`). Planned and exercises are separate categories. Section gap 24 on web, 12 elsewhere.
- Start flow: "Start workout" inline in the page, then a floating `StickyStart` (blue glass) once the inline one scrolls out of view (`useAnimatedReaction` on a shared scroll value plus `measureInWindow`).
- Past days: "Log this workout" is a secondary button and also floats (`StickyLog`). `LogPastWorkoutSheet` lets him mark each set, weight and reps (steppers; timed sets use seconds; reps-only rows show "Set 1, Planned 8 reps"), start time and duration. Saved to `pastLogs` in `src/lib/domain.tsx`. Logged days look "done": Logged and Not logged tags, grey stat tiles without zeros, no progress indicator, no "3 of 4 logged" detail.
- Diet plan cards are solid cards (not dotted) and the open meal stays open after ticking an item.
- Moved and skipped workouts show as full cards in the library `WorkoutCard`, with a secondary "Start it anyway" button instead of a plain link.

### Progress tab
- Chart dots on trend lines (`Spark` in `features/progress/parts.tsx`); the Lifts line follows the same pattern.
- The streak entry is the Streak hero card style (`features/streak/StreakHero.tsx`), only on Progress. "1 of 4 this week" has a progress bar inside a nested card. No footer note.
- **Assessments are no longer on Progress.** The card, the `assess` card key, its look, the route `/progress/assess` and the page are deleted. Links from goal detail now go to `/gym/assessments`. Notification n3 and the Today "reassess" update point to Gym.
- **Highest and Lowest are named and dated.** `trends.ts` has `EXTREME_LABELS` (Heaviest/Lightest, Most steps/Fewest steps, Most water/Least water, Longest sleep/Shortest sleep, Highest/Lowest reading, Most workouts/Fewest workouts, Most eaten/Least eaten). Each row shows the value, with the day underneath (`sub`), for example "Most workouts, 1 workout, Mon 22 Sep".
- **Diet is calories first.** `dayVal('diet')` returns kcal for the day (sample 1500 to 2020). Target is `KCAL_TARGET` (1,800, set by Coach Vikram); a day is on target within 10% (`KCAL_BAND`, `onKcalTarget` in `trends.ts`). Chart: dashed target line, on-target bars `c.good`, others `c.muted` (grey, never red or amber). Stats: Most eaten, Least eaten, Days on target ("1 of 3", with "Within 10% of 1,800 kcal" underneath), Daily target. Card on Progress: one line "1,766" with small "kcal avg. per day", and only the change ("↓67 kcal vs last week") underneath. Goal "early signs" and drivers use calories too ("Calories a day", percent = closeness to target).

### Gym tab (`src/app/(tabs)/gym.tsx`)
- **Chat with Coach Vikram is the first card** (it is the product's main feature): dark `onDark.card`, coach photo 60 px (opens the coach profile), "Your trainer. Ask about form, your plan or food.", the last coach message in quotes with its time, and a white `Button kind="white"` "Message Coach Vikram". The card is a plain `View` (no pressable inside a pressable: web warns about nested buttons). Order: Chat, membership strip, break card, Attendance, Assessments, PT, links.
- Assessments card: big "6 of 7 improved" (or "To be confirmed" before the first one), sub "Assessment 2, 30 Sep vs Assessment 1".

### Assessments (Gym only: `src/app/gym/assessments.tsx`, `src/features/gym/data.ts`, `src/lib/data.ts`)
- Names: Assessment 1, Assessment 2, Assessment 3 (never "Starting assessment" or "Reassessment"). Pills: "Assessment 2, 30 Sep" and "Assessment 1, 2 Sep" (they wrap on a narrow phone; the redesign below replaces them).
- Tests (7): Weight, Waist, Body fat; Strength = **Leg press (5 reps) 80 to 120 kg** and **Bench press (5 reps) 40 to 60 kg**; Mobility and fitness = **Toe touch** 6 cm to 6 cm ("Same") and Resting heart rate. 6 of 7 improved. Squat, push-ups, deep squat hold and sit-and-reach are gone from assessment copy.
- Goals: the Strength goal is now "Bench press N kg" (start 40, so the old numbers still work; noun "bench press"; `GOAL_VERB` "Bench press target (kg)"). The Flexibility goal is "Toe touch 15 cm" (start 6 cm, unit cm, still drawn as a ruler with a mark per cm). Workout exercises such as Squat in logs and plans are real lifts and were not renamed.
- **No assessment time is shown anywhere** (the gym has not scheduled it with the coach): welcome step 2 says "Your first assessment with Coach Vikram" and "About 30 min. Coach Vikram will confirm the day and time with you."; Gym says "To be confirmed"; onboarding Steps says "Assessment with Coach Vikram".
- **Next assessment card** (approved wireframe C): title "Assessment 3" (or "First assessment", "Assessment 2"), the date in a chip on the right ("Tue 28 Oct", "Due this week" in amber, "Date to be confirmed"), one quiet line ("In 34 days", "Book at the front desk", "Coach Vikram will confirm the day and time"), then a full-width button at the bottom: "Remind me" as `kind="primary"` (white in dark mode, black in light) with a bell, and "Reminder on" as secondary with a check. No tip line and no "every 4 weeks" line.

### Login and onboarding
- **Country code**: `Field` has new props `onPrefixPress` and `prefixLabel`: the prefix becomes a 44 px button with a small down arrow. Login opens `CountrySheet` (`src/features/shell/CountrySheet.tsx`, list in `src/lib/countries.ts`: India first and default, UAE, US, Canada, UK, Singapore, Australia, Saudi Arabia, Qatar, Nepal, Bangladesh, Sri Lanka, each with a digit length; India still checks that the number starts with 6 to 9). The OTP step shows the chosen code in "Sent to +44 xxxxx". Story `Input / WithCountryPicker` and `docs/Input.md` are updated.
- Profile, Change number still has a fixed "+91" (not changed yet).

### Workout
- The three dot menu on the exercise page has Swap exercise, Ask Coach Vikram, Form tips and video, Skip this exercise. "Options for the current set" is removed (the per-set menu stays on the set row).

### Today
- `PageEnd` (`src/design-system/patterns/PageEnd.tsx`) ends both Today layouts: a full-bleed illustration that merges into the background (blue glow, image shifted left, top and bottom fades), two faded text lines, a dashed line and the YourPal logo. The default text "Your pace. / Your pal." is a placeholder.
- The workout complete card on Today shows Exercises (count of marked exercises) and Burned; no Time.
- Icon buttons on web and Android get a border and a grey glass gradient (`mimic` in `IconButton`, tokens `glassEdge`, `glassFrom`, `glassTo`); iOS keeps real glass.

### Open questions and next steps
1. **Assessments page redesign (approved direction, not built).** For a member with 10 assessments: a hero card "Assessment 10, 6 of 7 improved" compared with the previous one; a "Comparing Assessment 10 vs 9, Change" line that opens a bottom sheet to pick any two; quick chips "vs previous" and "vs Assessment 1"; a small trend line per test row across all assessments (tapping a row opens that test's history); History shows the last 3 with "See all 10"; coach note for the selected assessment. The designer saw the wireframe and said the page comes later.
2. Storybook and the handoff zip need a refresh (see the top of this section); the zip on Drive is old.
3. The country code is not yet used in Profile, Change number.
4. Footer text for `PageEnd` (two real lines) is still waiting on the designer.
5. Plans three dot menu (Edit plan, Create a workout, Reset to Coach's version): the designer said **do not change it** for now.
6. Not built: Back Tap logging, Live Activity or a top drop-down for logging a set (needs a dev build; an in-app stand-in was proposed, never confirmed).
7. Nothing was checked on a physical phone (Expo Go). Restart Metro with `npx expo start --clear` there. The Android glass look is only seen through web.
8. The finish-screen "Time" stat on the workout was left unchanged (he only pointed at the Today card).
9. About 238 " · " separators remain in copy; he picks which to change.
