# MealsCard

`src/design-system/patterns/MealsCard.tsx`. The Today meals card: the meal for right now plus a strip of the day. `TodayMealNowCard` (old name `MealNowCard`) feeds it. The old all-meals accordion is in `_archive/MealsAccordion.tsx`, still exported as `MealsCard` from `features/today/MealsCard`.

| `state` | Look |
|---|---|
| now | meal on screen (one tick per item, Ate something else, Skip meal) and the strip. `ask` adds the "wasn't logged" prompt |
| complete | all meals logged: plain list, tap to open |
| paused | membership ended: logging off, day total shown (`pausedLine`) |

Data props: `done`, `total`, `meal` (name, caption, pill, clock, skipped, items, extras, allLabel, allActive), `strip` (tone skipped, logged, missed, now, later; selected), `ask`, `rows`, `completeLine`. Callbacks: `onToggleItem onOpenFood onRemoveExtra onAteElse onAll onPick onOpenMeal onAskAteIt onAskSomethingElse onAskSkipped`. Images: `meals-now`, `-missed`, `-complete`, `-paused`, `-other`, `-nothing`.
