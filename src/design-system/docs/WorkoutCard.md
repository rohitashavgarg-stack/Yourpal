# WorkoutCard

`src/design-system/patterns/WorkoutCard.tsx`

Storybook: Patterns / WorkoutCard

## Purpose

Today's workout, one look per state. The state is a prop; `TodayWorkoutCard` (old name `WorkoutCard`, with `restart`) reads the day and picks it. There is no Full / Quick / Low energy choice on the card: that choice lives only in the Start sheet.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `state` | `WorkoutCardState` | required | See States |
| `name` | string | required | The workout name, "Leg day" |
| `time` | string | none | The planned time, "6:30 pm", as a small pill after the name |
| `when` | string | none | upcoming: the chip at the top right, "in 2 h" |
| `meta` | `{ kind: 'exercises' \| 'time', text }[]` | `[]` | upcoming and due: facts under the name as a MetaRow ("7 exercises", "~50 min") |
| `coachUnread` | boolean | false | A mint dot on the coach's photo for an unread reply |
| `onOpenCoach` | () => void | none | The coach line was tapped |
| `burned` | number | none | With a watch: the "Burned today N kcal" row at the bottom (upcoming, due, rest, done) |
| `live` | `{ elapsed, done, total, next? }` | none | live: timer and exercise count |
| `done` | `{ at, stats: [value, unit, label][] }` | none | done: "Done at 6:58 pm" and three stats |
| `restNext` | string | none | rest: the chip "Next: Pull, Thu 6:30 pm" |
| `onStart` | () => void | no-op | Start workout (upcoming, due); Start easy session (comeback) |
| `onResume` | () => void | no-op | live |
| `onDidIt`, `onMove`, `onSkip`, `onStartAnyway` | () => void | no-op | missed: the three answers and the quiet link |
| `onUndo` | () => void | no-op | moved, skipped: the Undo button |
| `tomorrow` | string | none | moved: where it moved to, "Thu 25 at 6:30 pm" |
| `onNotToday` | () => void | no-op | comeback: the second button, "Not today" (the container answers it as a skip, with Undo) |

## States

`WorkoutCardState`: upcoming, due, live, missed, moved, skipped, done, rest, paused, comeback.

| State | Look |
|---|---|
| upcoming | Dark blue gradient card with a faint ring top right. Coach line ("Today's workout", "Planned by Coach Vikram"), "in 2 h" chip, name and time pill, MetaRow, white **Start workout** |
| due | Same with a thin mint edge and a mint "Now" chip with a live dot (15 minutes before the planned time or later) |
| live | Green gradient. "Running" with a mint dot, name chip (live tone), the mono timer and "elapsed", "3 of 7 exercises" with "Next: ...", one segment per exercise, white **Resume workout** |
| missed | Two hours past the plan with nothing logged. Muted dark card with an amber edge, dimmed coach line, amber "Missed" chip, the time struck through in amber, "Did you train without the app, or should it move?", **I did it** (white), **Move to tomorrow** and **Skip** (glass), and an underlined "Start it now anyway" |
| moved | The same full card as the other states, blue-tinted. Coach line, a neutral outlined chip "Moved" with a calendar icon, the name, "Moved to tomorrow, Thu 25 at 6:30 pm. Coach Vikram is told.", a white **Undo** button (44 px) and the link "Start it today anyway" |
| skipped | The same full card on a flat dark fill. Coach line, a neutral outlined chip "Skipped" with the skip icon, the name faded and struck through, "Skipped for today. Your plan picks up tomorrow.", "Next: Pull, Thu 6:30 pm", a white **Undo** button (44 px) and the link "Start it today anyway" |
| done | Dark green gradient. Mint tick and "Done at 6:58 pm", name chip, "Workout complete", three stats (value, unit, label) |
| rest | Dark purple gradient. Lilac moon and "Recovery", "Next: ..." chip, "Rest day", "Muscles grow on rest days. A 20 minute walk still counts." |
| paused | Shown only while the membership is paused or ended, never the goal. Membership ended. Flat grey card (no gradient, no Start): lock tile, "Workouts are paused", "Renew at Wulf Fitness reception to see your plan and start again. Your history stays here." |
| comeback | After a break. One small flat card (no gradient, no coach line): `surface2` fill, `radii.card` corners, 16 px padding. Title "Easy session" (semibold 17 / 24), a muted line "20 min", two chips "4 exercises" and "Half your usual load", then two buttons side by side: **Start easy session** (primary) and **Not today** (`surface`). No exercise names. The greeting is not in the card: the screen shows it as plain text above (`ComebackGreeting`: "Good to see you back, <first name>." and "It's been <n> days. Coach <coach> picked an easy one to ease you in.") with the card directly beneath |

The "Burned today N kcal / From your watch" row appears at the bottom of upcoming, due, rest and done when `burned` is set.


Baseline images in `docs/visual-baseline/cards/`: `workout-<state>`, `workout-done-watch` (live has a running timer, so its digits differ between runs).

## Do and don't

- Do keep the same layout in every state so the card does not jump.
- Do put the version choice (Full, Quick, Low energy) in the Start sheet, never on the card.
- Do treat missed, moved and skipped calmly: amber edge at most (missed only; moved and skipped use a neutral chip), and always an Undo. Starting the workout anyway clears the answer.
- Don't use red anywhere on this card.
- Don't style comeback or paused as failure. Comeback is a fresh, easy start. Paused is shown when the membership is paused, never because of the goal; it says where to renew, with no Pay or Resume button.
- Mint only for live and due.

## Accessibility

- Each state card has a label: "Today's workout, <name>", "Workout running, 12:30 elapsed, 3 of 7 exercises", "<name> missed", "<name> moved to tomorrow", "<name> skipped today", "Workout complete", "Rest day", "Workouts are paused", "Easy session".
- The coach line is a button: "Today's workout, planned by Coach Vikram. Open your coach". The unread dot is labelled "Unread reply".
- Main buttons are 50 px (medium); the missed answers are 40 px (tight), with 8 px between them. Undo is drawn 34 px high with a 5 px hit slop above and below, so its tap area is 44 px. The missed answers (tight, 40 px) get a hit slop to 44 px from Button. Comeback buttons are 44 px and labelled "Start the easy session" and "Do today's regular workout instead".
- "Start it now anyway" is a button with an 8 px hit slop.

## Copy rules

- Credit the coach by name: "Planned by Coach Vikram", "Coach Vikram is told".
- Fact first, then the smallest next step: "Did you train without the app, or should it move?"
- No guilt on missed or skipped: "Your plan picks up tomorrow".
- Say the number: "7 exercises", "~50 min", "Burned today 320 kcal".
- No dot separators, no emoji.
