# Daily budget (BudgetCard)

`src/design-system/patterns/BudgetCard.tsx`. Today's calories, eaten and burned, on one dark card, with the Programme goal as a strip along the top. This is the live top card on Today. It is a separate component from the goal card; it only uses the goal card's `strip` variant for its last row.

The card draws what it is given. `TodayBudgetCard` (`src/features/today/TodayBudget.tsx`) is the container that reads the member's day and passes the numbers in.

```tsx
<BudgetCard eaten={1150} eatTarget={1800} burned={0} burnTarget={350} burnSource="plan" />
<BudgetCard eaten={1150} eatTarget={1800} burned={320} burnTarget={350} burnSource="watch" goalState="behind" />
```

## Props (every state is a prop)

| Prop | Type | What it does |
|---|---|---|
| `eaten` | number | kcal eaten so far today |
| `eatTarget` | number | the day's kcal target (1,800 today) |
| `burned` | number | kcal burned |
| `burnTarget` | number | the planned burn of today's workout (350 today) |
| `burnSource` | `'plan' \| 'done' \| 'watch'` | where the burn number comes from. Default `plan` |
| `goalState` | `GoalCardState` | pin the goal strip to a state. Leave it out to follow the member's data |

`burnSource` decides the word after the target in the Burn half:

| burnSource | Word | When the container uses it |
|---|---|---|
| `plan` | `/ 350 planned` | nothing measured: no watch and the workout is not done. The number is 0 |
| `done` | `/ 350 done` | the workout was logged. The number is that workout's burn (380 in the demo) |
| `watch` | `/ 350` (no word) | Health and a wearable are both connected. The number is the live burn |

## How the container fills it

| Prop | From |
|---|---|
| `eaten` | the kcal total of everything logged today (`totals(d).k`) |
| `eatTarget` | `KCAL_TARGET`, 1,800 |
| `burned` | `burned(d)` with a watch, the logged workout's kcal when it is done, otherwise 0 |
| `burnTarget` | 350, a fixed planned burn |
| `burnSource` | `watch` if Health and a wearable are connected, else `done` if the workout is done, else `plan` |

A burned number needs a watch; without one the card shows the plan, not a measurement.

## Look

| Item | Value |
|---|---|
| Card | corner radius `radii.xl` (28), 1 px border `rgba(255,255,255,0.1)`, content clipped |
| Background | diagonal gradient from top left to bottom right: `#1B1D22`, `#1E2438`, `#2A3860` (charcoal to blue). Same in light and dark mode |
| Top block | two halves side by side, 16 px apart, with a 1 px divider `rgba(255,255,255,0.12)`; padding 18 left, right and top, 16 bottom |
| Each half | icon (17 px) and label (14 px, `#C9CDD6`) with the unit "kcal" on the right (13 px, `#9AA0AD`); the number in 36 px on a 44 px line, letter-spacing -1, `#F3F4F6`; " / target" in 15 px `#9AA0AD` after it; a 5 px bar under it |
| Bar | track `rgba(255,255,255,0.18)`, corner radius `radii.xs` (4); the fill is clamped between 0 and 100 percent, the number is not |
| Eat | label "Eat today", fork and knife icon and bar in mint `#2EE6A8` |
| Burn | label "Burn today", flame icon and bar in orange `#FF9A4D` |
| Goal row | the first row, above Eat and Burn: `GoalCard variant="strip"`, see `docs/goal-card.md`. Its divider line is under it. With no goal it says only "No goal set yet" (no second line); a goal is never frozen or paused |

## States

Drawn alone on the developer page `/dev-cards?c=budget` (`src/app/dev-cards.tsx`, development builds only) and captured in both themes into `docs/visual-baseline/cards/`:

| Image | What it shows |
|---|---|
| `budget-default` | evening: 1,150 / 1,800 eaten, 0 / 350 planned, goal on track |
| `budget-nothing-eaten` | nothing logged: 0 / 1,800 |
| `budget-all-logged` | every meal logged |
| `budget-workout-done` | burn 380, "350 done" |
| `budget-watch` | live burn 320, "350 watch" |
| `budget-goal-onTrack-stale` | the default day with a weigh-in 12 days old: "Needs a weigh-in" |
| `budget-goal-<state>` | the default day with the goal row pinned to each of the 7 goal states |

## Known behaviour

- The word after the burn target can push "350 watch" or "350 planned" onto a second line on a narrow card. That is how it looked before the move into the pattern and was left alone.
- The calories shown are not capped: eating more than the target shows the real number with a full bar.
- The card does not know about membership. When logging is paused the container still shows what was logged.

## Checked

After the move into the pattern, 28 images (14 per theme) were compared with the baseline taken before. The 12 that are not about a goal state, or are on track, were identical (0.00% of pixels). The other 16 (the 8 non-on-track goal states, in both themes) changed only in the goal row, on purpose: the strip now follows the goal state (Behind in amber, Almost there in mint, Complete and Back on in words, and "No goal set yet"). Before, the strip ignored the goal state and always showed a percentage. A later fix replaced the percentage with the kg line and added the stale weigh-in.
