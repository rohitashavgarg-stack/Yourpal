# WeekCard

`src/design-system/patterns/WeekCard.tsx`

Storybook: Patterns / WeekCard

## Purpose

"This week" on Today: two stat tiles (Workouts, Meals on plan), then the seven days, each with its workout mark and its meals dots, and a one-line legend. `TodayWeekCard` (old name `WeekCard` in `features/today/WeekCard.tsx`) builds the days from the member's data.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `days` | `WeekDay[]` | required | The seven days (below) |
| `workouts` | `{ done, target }` | required | The Workouts tile, "2/4" |
| `meals` | `{ onPlan, total }` | required | The Meals on plan tile, "9/12" (`TodayWeekCard` passes a total of 12) |
| `summary` | string | required | The whole week in one sentence. Screen reader only: it is the label of the title and tiles, never shown |
| `onDayPress` | (i) => void | required | A day was tapped. The container decides: past day opens its summary sheet, future day opens the plan |

`WeekDay`: `num` (day of month), `letter` (one letter above the number), `name` (weekday, for the spoken label), `workout` `'done' | 'rest' | ''`, `mealsOnPlan` (0 to 4), `future?`, `today?`.

## States

| Part | States |
|---|---|
| Stat tiles | Two soft tiles side by side: icon and label, then "value/target" (target muted) |
| Day column | today: soft surface fill and semibold number. past: plain. future: letter at 60%, number at 45% |
| Workout mark (24 px) | done: green circle with a tick. rest: moon. today, not done: solid ink ring. future or past, not done: dashed ring |
| Meals mark (24 px) | Four 7 px dots in a 2 x 2 square, one per meal: green when on plan, grey (`surface3`) when not, faint (`surface2`) on a future day |
| Legend | One line under the days: a green tick "Workout", a small 2 x 2 dot square "Meals on plan" |

Baseline images in `docs/visual-baseline/cards/`: `week-default`, `week-done`, `week-checked-in`.

## Do and don't

- Do keep the summary sentence for screen readers; don't print it on the card.
- Do treat a rest day as a good day (moon, muted), not as a missed workout.
- Don't use red or crosses for a missed day. A past day without a workout is a dashed ring.
- Don't add a streak to this card; Progress has Streaks and badges.

## Accessibility

- The title and the two tiles are one element whose label is `summary`.
- "This week" has role `header`.
- Each day is a button: "<weekday> <num>, today, open summary" or "<weekday> <num>, open plan". Columns share the card width, so on a 375 px phone each is drawn about 41 px wide; a 2 px hit slop on each side fills the 4 px gap, so each tap area is about 45 px wide and over 100 px tall.
- The day row is labelled "Days this week. Tap a past day for its summary, a future day to open its plan".
- The legend is hidden from screen readers (the labels already say it).

## Copy rules

- Tile labels are nouns: "Workouts", "Meals on plan". Numbers as "2/4".
- The summary sentence says the numbers first, as the container writes it: "This week: 2 of 4 workouts, 9 of 12 meals on plan, 3 check-ins."
- No dot separators, no guilt.
