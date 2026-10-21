# WeekCard

`src/design-system/patterns/WeekCard.tsx`. This week: a seven day strip, a workout dot and a meals bar under each day, a summary line and a legend. `TodayWeekCard` (old name `WeekCard` in `features/today/WeekCard.tsx`) builds the days from the member's data.

| Prop | What it does |
|---|---|
| `days` | `{ num, letter, name, workout: 'done' \| 'rest' \| '', mealsPct, future?, today? }[]` |
| `workoutsDone`, `workoutsTarget` | the chip, "2 of 4 workouts" (target 4) |
| `summary` | the line under the strip |
| `onDayPress(i)` | past day opens its summary, future day opens the plan (decided by the container) |

Day states: today (ink pill), past, future (55% opacity). Images: `week-default`, `week-done`, `week-checked-in`.
