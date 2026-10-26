# BudgetCard

`src/design-system/patterns/BudgetCard.tsx`

Storybook: Patterns / BudgetCard (no goal: "No Goal").

## Purpose

"Daily budget" on Today: the Programme goal as one row at the top, then today's calories eaten and burned side by side. A charcoal card (`#1A1D22`, the same in light and dark mode) with a soft blue glow from the top right corner and a 1 px white 10% edge. It only draws what it is given; the numbers come from `TodayBudgetCard` in `features/today/TodayBudget.tsx`.

```tsx
<BudgetCard eaten={1150} eatTarget={1800} burned={120} burnTarget={450} burnSource="plan" />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `eaten` | number | required | kcal eaten so far |
| `eatTarget` | number | required | The day's kcal target |
| `burned` | number | required | kcal burned |
| `burnTarget` | number | required | The workout's planned burn |
| `burnSource` | `'plan' \| 'done' \| 'watch'` | `plan` | Where the burn number comes from (see States) |
| `goalState` | `GoalCardState` | from the member's data | Pins the goal row to a state (demo panel, screenshots) |

## States

Layout, top to bottom:

1. **Goal row**: `GoalCard variant="strip"` (see GoalCard). A thin progress ring with the % in it, the goal name, the state pill, and one line: "1.6 of 6.0 kg lost, by 30 Nov". Tapping it opens the goal page.
2. A 1 px divider.
3. **Eat and burn halves**, split by a 1 px line. Each half: icon and label, the number big and light (30 px) with "/ target" after it, and a 5 px bar.
   - Eat today: mint icon and bar, "1,150 / 1,800".
   - Burn today: orange (`#FF9A4D`) icon and bar.

| `burnSource` | Burn half reads |
|---|---|
| `plan` | "120 / 450 planned": nothing measured yet, the target is the plan |
| `done` | "380 / 450 done": the workout was logged |
| `watch` | "210 / 450": the live burn from a connected watch |

Bars are clamped at 100%; the numbers are not. Numbers use Indian grouping (1,800).

Goal row states: every `GoalCardState` (onTrack, behind, almost, complete, comeback, backOn, noGoal) plus "Needs a weigh-in". With no goal the row shows a target icon in the ring and says only "No goal set yet", with no second line. A goal is never frozen or paused; a membership pause is the account Banner.

Baseline images in `docs/visual-baseline/cards/`: `budget-default`, `budget-nothing-eaten`, `budget-all-logged`, `budget-workout-done`, `budget-watch`, `budget-goal-<state>`, `budget-goal-onTrack-stale`.

## Do and don't

- Do let the container compute the numbers; the card does no maths beyond the bar width.
- Do keep the goal row first: the goal is the reason for the budget.
- Don't show the eaten or burned number again elsewhere on Today (no duplicate data on a page).
- Don't colour an over-target eat number red. The bar just stays full.
- Don't put Start or Log buttons on this card.

## Accessibility

- Each half is one element: "Eat today, 1,150 of 1,800 kcal" and "Burn today, 120 of 450 planned kcal".
- The goal row is a link (76 px min high): "Your goal: <name>, <n> percent, <pill>. <line>. Open", or "No goal set yet. Open".

## Copy rules

- Labels "Eat today" and "Burn today". Say the number first, then the target.
- The source word is quiet text after the target ("planned", "done"), not a chip.
- No dot separators; the goal line uses a comma: "1.6 of 6.0 kg lost, by 30 Nov".
- No goal: "No goal set yet", nothing under it.
