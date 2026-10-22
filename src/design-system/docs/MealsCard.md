# MealsCard

`src/design-system/patterns/MealsCard.tsx`

## Purpose

The Today meals card: the meal for right now. It does not log; its one button opens the log sheet (`LogMealsSheet`, the same one the update card opens), where each item has a tick and an amount stepper and the calories follow. `TodayMealNowCard` (old name `MealNowCard`) feeds it. The old all-meals accordion is in `_archive/MealsAccordion.tsx`, still exported as `MealsCard` from `features/today/MealsCard`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `state` | `'now' \| 'complete' \| 'paused'` | required | Which look |
| `done` | number | required | Meals logged so far |
| `total` | number | required | Meals in a day (4) |
| `meal` | `ShownMeal` | required for `now` | The meal on screen (below) |
| `ask` | `MissedAsk` | none | now: adds the "Did you have your lunch?" prompt for the most recent missed meal |
| `onLogMeal` | () => void | none | "Log meal" / "Edit log": opens the sheet for the meal on screen |
| `onAskLog` | () => void | none | The button on the missed-meal prompt |
| `completeLine` | string | none | complete: the line under the title, "All 4 meals logged. Protein 88 of 120 g." |
| `rows` | `MealSummaryRow[]` | none | complete: one row per meal `{ id, name, skipped, sub }` |
| `onOpenMeal` | (id) => void | none | complete: a row was tapped |
| `pausedLine` | string | none | paused: the day's total, "1,150 of 1,800 kcal, 3 of 4 meals logged" |

`ShownMeal`: `name`; `meta { time, kcal, protein }` ("650 kcal planned" or "290 kcal eaten", "22 g protein"); `status` `'todo' | 'logged' | 'skipped'`; `loggedAt` ("1:10 pm"); `skipped` (boolean); `items` `{ name, amount, type, eaten }[]`; `extras` `{ name, type, est }[]` (foods eaten that were not on the plan; `est` shows "estimated").

`MissedAsk`: `name`, `planned` ("3:30 pm"), `more` (how many more missed meals after this one).

## States

Header in `now` and `complete`: "Meals" (34 px light) on a soft orange wash from the top right, a dotted rule under it. `now` adds a "3 of 4 done" chip on the right; `complete` a green tick.

| State | Look |
|---|---|
| now, todo | Meal name with a time pill ("1:30 pm"), a MetaRow (kcal, protein), the foods one per row (food type mark, name, amount on the right, 44 px rows), one ink **Log meal** button |
| now, logged | Pill turns soft green with a tick: "Logged 1:10 pm". Eaten foods get a green tick and are struck through (a done list). Foods not eaten get an empty ring, muted name, and an amber **Skipped** tag in place of the amount. The button is grey **Edit log** |
| now, skipped | Pill "Skipped" with a cross, muted. Food names muted, marks at 45% |
| now + `ask` | An amber-soft prompt above the meal: clock tile, "Did you have your lunch?", "It was planned for 3:30 pm." (plus "N earlier meals still to log."), and a compact **Log lunch** button |
| complete | Every meal logged: `completeLine`, then one 56 px row per meal (green tick, or a dashed box when skipped), name, `sub`, chevron |
| paused | Membership ended: flat grey card, lock tile, "Meal logging is paused", "Renew at Wulf Fitness reception to log again. Your meals and plan stay here.", then "Eaten today" and `pausedLine` |

Extras show as rows after the planned foods, ticked as eaten.

Baseline images in `docs/visual-baseline/cards/`: `meals-now`, `meals-missed`, `meals-complete`, `meals-paused`, `meals-other`, `meals-nothing`.

## Do and don't

- Do open the log sheet from the button; never log by tapping the card.
- Do show only one missed-meal prompt (the most recent) and count the rest in its line.
- Don't style a skipped meal or a skipped food as a failure: muted text and an amber tag, never red.
- Don't show Pay or Renew buttons on the paused card. It says where to renew, as text.
- Don't repeat the day's calorie total here when the BudgetCard shows it.

## Accessibility

- "Meals" has role `header`.
- The food list is one element: "<meal>: 2 bowl dal, 4 roti, 1 bowl salad".
- Log meal / Edit log is a 56 px button. The prompt's button is "Log <meal>" (compact, 44 px tap area).
- complete rows are 56 px buttons: "<meal>, logged. Open" or "<meal>, skipped. Open".
- paused: the card is labelled "Meal logging is paused".
- The dotted rule is hidden from screen readers.

## Copy rules

- Say the number: "650 kcal planned", "22 g protein", "3 of 4 done".
- Status words are plain: "Logged 1:10 pm", "Skipped". No "Missed!" and no guilt.
- Prompt: a question, then the fact: "Did you have your lunch?" / "It was planned for 3:30 pm."
- Food amounts in the member's words: "2 bowl", "4 roti".
- No dot separators; the meta uses MetaRow.
