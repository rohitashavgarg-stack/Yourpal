# Two workouts in one day

A day in the plan can hold more than one workout (for example Mobility at 7:00 am and Leg workout at 6:30 pm). Only the trainer adds a second workout; the member never creates one. Built 16 Nov 2026. Everything below is on the Plans tab and Today.

## How it is stored
- `PlanDay` in `src/lib/data.ts` has an optional `more: PlanMore[]`. Each extra workout has its own `name`, `time`, `mins`, `wu` (warm-up), `ex` (exercises), `cd` (cool-down) and `done`.
- A day with no `more` is exactly one workout, as before. Wednesday is the sample: Leg workout 6:30 pm plus Mobility 7:00 am (done, 7:00 to 7:42 am).
- `src/features/plans/store.ts`:
  - `dayWorkouts(d, p, day)` returns every workout of the day in time order.
  - `dayPlan(d, p, day)` still returns one workout: the one picked (`p.wi`), or the next one that is not done.
  - `timeMin("7:00 am")` turns a time into minutes of the day.
  - `PlansState.wi`: which workout is open, `-1` = the next one not done.
- A day made by the member (Create a workout) is always one workout.

## Plans tab
- A day with two or more workouts shows `DayTimeline` (`src/features/plans/DayTimeline.tsx`) instead of the inline plan.
- The line and a dot sit on the left. The time is right of the dot, with the card under it. Done is a green dot with a check.
- Each card is a plain grey card (`c.cardLift` and `CardEdge`): the name, one line ("5 exercises, 15 min"), a "Next" chip on the next one, and on the right a green check (done) or an arrow.
- Under that, matched to Outcurve's Plan tab. A workout still to do shows the figures of its exercises in a row, straight on the card with no tile and no white (the stills have their backgrounds cut out: `assets/exercises/thumbs-clear/`, `THUMBS_CLEAR` in `src/features/workout/clips.ts`). A done workout shows one smooth hill (`SessionBlob`) that rises and falls with the work in each exercise and slopes down at both ends, with a grey pill on each side for the warm-up and cool-down.
- Tapping a card opens `/plans/workout`, a full page that grows out of the card (it is in `CARD_PAGES` in `src/lib/cardGrow.ts`: drag handle, no back button, like Memberships). It shows that workout with the normal plan layout (`WorkoutPlan`) and no small title. Start (or Resume) floats at the bottom. A completed workout has a green top glow and a green Completed chip first in the header's chip row, before the date and time.
- The Plans tab hides its floating Start, Log and Edit buttons for a day with a timeline; Start lives on the workout's own page.
- The day strip shows a green check only when every workout of the day is logged (`allDone` in `src/app/(tabs)/plans.tsx`).

## Today
- The main workout card keeps its behaviour. The other workout of the day sits in its own lighter container at the bottom of the card: the label ("Then", "Done" or "Not logged"), the name, and the time on the right (mint when done).
- It is the `also` option of the `WorkoutCard` pattern (`src/design-system/patterns/WorkoutCard.tsx`, doc row and story `WithAnotherWorkout`). `src/features/today/WorkoutCard.tsx` builds it from `d.plans[TODAY_IDX].more[0]`.

## Not done yet
- A second workout cannot be started or logged on its own. A session still runs the main workout (`legDay()` in `src/lib/data.ts`), so the second workout has no Start button (`useCanStart` returns false for it).
- Today always shows the main workout as the big card. The card does not swap to the second workout when it is the next one.
- The weekly "sessions" count still counts days, not workouts.
- The plan PDF lists one workout per day.
- Progress and the streak do not count workouts separately.

## Where to look
`src/lib/data.ts`, `src/features/plans/store.ts`, `src/features/plans/DayTimeline.tsx`, `src/features/plans/parts.tsx` (`ExTile`), `src/app/plans/workout.tsx`, `src/app/(tabs)/plans.tsx`, `src/features/today/WorkoutCard.tsx`, `src/design-system/patterns/WorkoutCard.tsx`, `src/lib/cardGrow.ts`.
