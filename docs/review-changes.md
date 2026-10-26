# Visible changes for review

Every value that changed on screen on the `design-system-handoff` branch. Each section is named after the screenshot that shows it in `docs/review/` (before on the left, after on the right). Nothing else should look different; anything else that does is a bug to report.

The rule used: an element that differed from a library variant by 2 px or less now uses the variant (listed here); an element that differed by more got its own variant and looks exactly as before (not listed).

## Copy changes (decided in Phase A)

<a id="state-today-expired"></a>
### Membership strip and banners (`state-today-expired`, `banner-strip`)

| Element | Old | New |
|---|---|---|
| Strip button label | View plan | See plan |
| Spoken label | "... View plan" | "... See plan" |

<a id="today"></a>
### Daily budget card with no goal (`budget-goal-noGoal`)

| Element | Old | New |
|---|---|---|
| Goal row second line | Set one to see your progress here | (none: the row says only "No goal set yet") |

Storybook: Patterns / BudgetCard / No Goal, and Patterns / GoalCard / Strip All States.

## Size and spacing (2 px or less)

<a id="sheet-LogMealsSheet"></a>
### Log meal sheet (`sheet-LogMealsSheet`, `sheet-LogMealsSheet-extra`)

"Save meal" is now pinned at the bottom of the sheet, under the list, instead of at the end of it: when a meal has many foods the list scrolls and the button stays in view (requested). "Ate something else?" and "Skip meal" use Button size `fill` (no side padding, gap 6 px), which is exactly what they had.

<a id="plans"></a>
### Plans, diet day and week header (`plans`, `state-plans-diet`)

The diet card's "Ate something else?" is unchanged (Button size `fill`).

| Element | Old | New |
|---|---|---|
| "This week" pill corner radius (shown away from this week) | 18 px | 16 px (both fully round at 32 px high) |

<a id="plans-create"></a>
### Plans, create a plan (`plans-create`)

| Element | Old | New |
|---|---|---|
| "+ Add exercise" height | 48 px | 50 px |
| "+ Add exercise" corner radius | 24 px | 25 px (fully round) |
| "+ Add exercise" text size | 14 px | 15 px |

<a id="plans-edit"></a>
### Plans, edit a plan (`plans-edit`)

| Element | Old | New |
|---|---|---|
| "+ Add item" / "+ Add exercise" height | 48 px | 50 px |
| Same, corner radius | 24 px | 25 px |
| Same, text size | 14 px | 15 px |

<a id="workout"></a>
### Workout (`flow-workout-warmup`, `flow-workout-main`, `sheet-WorkoutSwapSheet`, `sheet-FormTipsSheet`, `sheet-SetMenuSheet`, `sheet-FinishConfirmSheet`, `sheet-WkMenuSheet`)

| Element | Old | New |
|---|---|---|
| "Add set" height | 48 px | 50 px |
| "Add set" corner radius | 24 px | 25 px |
| "Add set" text size | 14 px | 15 px |
| "Add set" gap between + and text | 6 px | 8 px |
| "Finish" (white clip stage) side padding | 18 px | 20 px |
| "Finish" text size | 15 px | 14 px |
| "Hide" (clip) text size | 13 px | 12 px |
| "Hide" corner radius | 18 px | 16 px (both fully round at 32 px high) |

<a id="gym-chat"></a>
### Gym, chat with coach (`gym-chat`)

| Element | Old | New |
|---|---|---|
| "About: ..." pill gap between text and X | 6 px | 4 px |
| "About: ..." pill corner radius | 18 px | 16 px (both fully round at 32 px high) |

Shown only after a topic is picked, so not in the default screenshot.

<a id="profile"></a>
### Profile (`profile`)

| Element | Old | New |
|---|---|---|
| "Edit" side padding | 18 px | 20 px |
| "Edit" text line height | 20 px | 18 px (inside a fixed 44 px button: no visible move) |

<a id="progress-metric"></a>
### Progress, trend pages (`progress-metric`, `progress-lift`)

| Element | Old | New |
|---|---|---|
| "Back to today" side padding | 14 px | 12 px |
| "Back to today" corner radius | 18 px | 16 px (both fully round at 32 px high) |

Shown only after the chart is dragged away from today.

<a id="step-sched"></a>
### Onboarding, days a week (`step-sched`)

| Element | Old | New |
|---|---|---|
| Selected day: line | none | 1 px ink line on the ink fill (same colour, so it does not show) |
| Selected day: number and "days" | at the box edge + 0 | 1 px further in (the line takes 1 px each side) |

## Soft panels and notices (Callout)

Fifteen hand-built soft blocks now use `Callout` (or `Card tone`). Seven were an exact match. These moved by 2 px or less because they now share the nearest standard size:

<a id="progress-streaks"></a>
### Streaks and badges, Progress, Membership, sheets (`progress-streaks`, `progress--bottom`, `gym-membership`, `state-plans-expired`, `sheet-FormTipsSheet`, `sheet-HistSheet`)

| Where | Element | Old | New |
|---|---|---|---|
| Streaks and badges | "1 rest pass a month" note | side padding 14 px | 16 px |
| Progress (health tiles row) | the small stat tiles | top and bottom padding 10 px | 12 px (each tile 4 px taller) |
| Membership | "Renewals and freezes happen at the front desk" note | side padding 18 px | 16 px |
| Workout form tips sheet | the cue panel | corner radius 20 px | 22 px |
| Plans history sheet | the monospace note | corner radius 18 px | 20 px |
| Plans, "Plans are view only" row | the row | side padding 14 px | 16 px |
| Plans nutrition sheet | the stat tiles | padding 14 px | 12 px |
| Login | "Too many wrong tries" notice | padding 14 px | 12 px |

Exact (no change): the chat "away" notice, the composer's microphone notice, the login "couldn't find this number" notice, Delete account, Logging paused, the "What did you eat?" calorie line, the plans info box, and the confirmed session card on Confirm.

## Rendering noise to expect

Not value changes, listed so they are not a surprise on the review page:
- A shift of under 1 px of centred button content (an icon and its label) on a few screens: `coach` ("Assessment"), `sheet-QuickLogSheet` (the camera icon), `profile-appearance` (the theme tiles). Sizes, colours and text are the same. The cause is not isolated; it is below what the screenshots can show.
- Timers and animations differ between any two captures: the workout timer (`flow-workout-main`), the onboarding "building" step (`step-building`), the water ripple (`trackers-tiles-health`).
- A few screens show a small red message at the bottom, "<button> cannot contain a nested <button>". It is a development-mode warning from the web build, present before and after this branch (it is in both columns); it is not part of the app.

## Tap areas (no visible change)

Raised to 44 px with a hit slop; the drawn size is the same: Snackbar Undo (40 to 44), workout card Undo (34 to 44), tight buttons 40 px incl. the missed-workout answers (40 to 44), week card day columns (about 41 to 45 wide), chat remove-photo (24, slop 10), add-steps (30, slop 10).
