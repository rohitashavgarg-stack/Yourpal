# Visible changes for review

Every value that changed on screen on the `design-system-handoff` branch. Each section is named after the screenshot that shows it in `docs/review/` (before on the left, after on the right). Nothing else should look different; anything else that does is a bug to report.

The rule used: an element that differed from a library variant by 2 px or less now uses the variant (listed here); an element that differed by more got its own variant and looks exactly as before (not listed).

## Copy changes (decided in Phase A)

<a id="state-today-expired"></a>
### Today, membership strip (`state-today-expired`)

| Element | Old | New |
|---|---|---|
| Strip button label | View plan | See plan |
| Spoken label | "... View plan" | "... See plan" |

<a id="today"></a>
### Today, Daily budget card with no goal (budget card goal row, state no goal)

| Element | Old | New |
|---|---|---|
| Goal row second line | Set one to see your progress here | (none: the row says only "No goal set yet") |

Not in the default screenshots (they show a goal). Storybook: Patterns / BudgetCard / No Goal, and Patterns / GoalCard / Strip All States.

## Size and spacing (2 px or less)

<a id="sheet-LogMealsSheet"></a>
### Log meal sheet (`sheet-LogMealsSheet`, `sheet-LogMealsSheet-extra`)

| Element | Old | New |
|---|---|---|
| "Ate something else?" gap between + and text | 6 px | 8 px |
| "Ate something else?" side padding | 0 (centred in its flex space) | 20 px (still centred; no visible move at phone width) |
| "Skip meal" side padding | 0 (centred) | 20 px (still centred) |

<a id="plans"></a>
### Plans, diet day and week header (`plans`, `state-plans-diet`)

| Element | Old | New |
|---|---|---|
| Diet card "Ate something else?" gap between + and text | 6 px | 8 px |
| Diet card "Ate something else?" side padding | 0 (full width) | 20 px (full width, text centred) |
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
### Workout (`flow-workout-warmup`, `flow-workout-main`, the running workout)

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

## Tap areas (no visible change)

Raised to 44 px with a hit slop; the drawn size is the same: Snackbar Undo (40 to 44), workout card Undo (34 to 44), tight buttons 40 px incl. the missed-workout answers (40 to 44), week card day columns (about 41 to 45 wide), chat remove-photo (24, slop 10), add-steps (30, slop 10).
