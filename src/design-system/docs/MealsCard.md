# MealsCard

`src/design-system/patterns/MealsCard.tsx`. The Today meals card: the meal for right now. `TodayMealNowCard` (old name `MealNowCard`) feeds it. The old all-meals accordion is in `_archive/MealsAccordion.tsx`, still exported as `MealsCard` from `features/today/MealsCard`.

| `state` | Look |
|---|---|
| now | meal on screen (one tick per item, Ate something else, Skip meal). `ask` adds the "Did you have lunch?" prompt |
| complete | all meals logged: plain list, tap to open |
| paused | membership ended: logging off, day total shown (`pausedLine`) |

Data props: `done`, `total`, `meal` (name, caption, pill, clock, skipped, items, extras, allLabel, allActive), `ask`, `rows`, `completeLine`. Callbacks: `onToggleItem onOpenFood onRemoveExtra onAteElse onAll onPick onOpenMeal onAskAteIt onAskSomethingElse onAskSkipped`. Images: `meals-now`, `-missed`, `-complete`, `-paused`, `-other`, `-nothing`.
