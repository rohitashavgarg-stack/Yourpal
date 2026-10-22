# WorkoutCard

`src/design-system/patterns/WorkoutCard.tsx`. Today's workout. The state is a prop; `TodayWorkoutCard` (old name `WorkoutCard`, with `restart`) reads the day and picks it.

| `state` | Look |
|---|---|
| upcoming | blue dark card, "in 2 h" chip, Start workout |
| due | same with a mint edge and a "Now" chip |
| live | green card, timer, one segment per exercise, Resume workout (`live`) |
| missed | muted amber edge, time crossed out, I did it / Move / Skip, Start it now anyway |
| moved, skipped | one small row with Undo |
| done | green card, time, exercises, kcal (`done`) |
| rest | purple card, "Next: ..." chip (`restNext`) |
| paused | flat grey card, no Start (membership ended) |
| comeback | flat grey "Easy session", Start and Do regular instead |

Other props: `name`, `time`, `when`, `meta` (exercises and minutes as icon lines, see MetaRow), `coachUnread`, `burned` (the watch row, on upcoming, due, rest and done), and callbacks `onStart onResume onDidIt onMove onSkip onStartAnyway onUndo onStartRegular onOpenCoach`. There is no Full / Quick / Low energy choice on the card; it lives in the Start sheet. Images: `workout-<state>` (live has a running timer, so its digits differ between runs).
