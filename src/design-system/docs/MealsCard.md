# MealsCard

`src/design-system/patterns/MealsCard.tsx`. The Today meals card: the meal for right now. `TodayMealNowCard` (old name `MealNowCard`) feeds it. The old all-meals accordion is in `_archive/MealsAccordion.tsx`, still exported as `MealsCard` from `features/today/MealsCard`.

| `state` | Look |
|---|---|
| now | the meal on screen: its name, the food names with their amount (a small tick on logged ones) and one **Log meal** button. The card does not log: the button opens the log sheet (`LogMealsSheet`, the same one the update card opens), where each item has a tick and an amount stepper (halves for a katori, 25 for grams) and the calories follow. `ask` adds the "Did you have lunch?" prompt with a Log button |
| complete | all meals logged: plain list, tap to open |
| paused | membership ended: logging off, day total shown (`pausedLine`) |

Data props: `done`, `total`, `meal` (name, caption, pill, clock, skipped, items with their amount, extras), `ask`, `rows`, `completeLine`. Callbacks: `onLogMeal`, `onAskLog`, `onOpenFood`, `onOpenMeal`. Images: `meals-now`, `-missed`, `-complete`, `-paused`, `-other`, `-nothing`.
