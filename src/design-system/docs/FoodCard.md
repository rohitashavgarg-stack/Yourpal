# FoodCard

`src/design-system/patterns/FoodCard.tsx`

Storybook: Patterns / FoodCard

## Purpose

One food as its own card. It replaces the old food rows on the Plans diet page and is used by the meal log sheet, the quick log sheet (suggestions and library) and the swap sheet. The container decides what a tap does; the card only draws the three states and the swipe.

```tsx
<FoodCard state="todo" name="Curd" type="veg" amount={<AmountStepper ... />} kcal="100 kcal" macros="P 6 · C 7 · F 5 g"
  onCheck={eat} onSwap={swap} onSkip={skip} onHold={openFoodPage} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `state` | `'todo' \| 'eaten' \| 'skipped'` | required | Which look |
| `solid` | boolean | false | A not-eaten card drawn solid: no dashed line, a 40 px tick circle. The Plans diet page uses it |
| `pick` | boolean | false | The look for a list that is ticked and then saved: solid card, tick circle on the right, no dashed line |
| `name` | string | required | The food |
| `type` | `'veg' \| 'egg' \| 'nv'` | none | The veg, egg or non-veg mark. Left out, no mark |
| `amount` | node | none | The amount control of a not-eaten card (the stepper) |
| `amountText` | string | none | The amount as plain text on an eaten card ("1 plate"): locked |
| `kcal` | string | none | "140 kcal" |
| `macros` | string | none | "P 4 · C 26 · F 1 g". On an eaten card it fills the darker strip |
| `tag` | string | none | A small tag after the name ("Yours") |
| `note` | string | none | The line under a skipped name |
| `onPress` | () => void | none | Tap the card. A pick list uses it to toggle; the diet page leaves it out |
| `onCheck` | () => void | none | Tap the check circle (not-eaten and skipped cards) |
| `onMenu` | () => void | none | The three-dot button of an eaten card ("Mark as not eaten") |
| `onHold` | () => void | none | Hold the card: the food page |
| `onSwap`, `onSkip` | () => void | none | Both set: swipe left shows Swap and Skip |
| `skipLabel` | string | `Skip` | The second swipe button. "Delete" for a food the member added |
| `checkLabel`, `label` | string | built from the name | Spoken labels of the check and the card |

## Pick look

`pick` is for a list the member ticks and then saves (the meal log sheet with Save meal). A solid card (soft green when ticked), the amount stepper before the tick and plain text after, the calories, and the tick circle on the right in both states. No dashed line and no darker macros strip. Use it only where changes are a draft until Save.

## States

| State | Look |
|---|---|
| todo | Dashed outline (`chipLine`), no fill. Name with the veg mark, then the amount control and the calories, then the macros. The check circle (34 px, 44 px tap area) on the right |
| eaten | Solid `surface2` card. Name, then the amount as text on the left and the calories on the right. A darker `surface3` strip holds the macros and the three-dot button (36 px, 44 px tap area). No check circle |
| skipped | The todo card faded to 55%, name struck through, the note under it. The check is still there so the food can be eaten |
| swipe open | Todo card only. Swap (44 px rounded square with the arrows icon) and Skip (44 px high, 64 px wide, the word) on the right, 8 px apart |

## Do and don't

- Do lock the amount once a food is eaten: pass `amountText`, not `amount`.
- Do put Swap and Skip behind the swipe only. They are also offered to screen readers as actions.
- Don't add a check circle to an eaten card. The solid look says it is done.
- Don't use red for a skipped food. It is faded, never an error.

## Accessibility

- The card is one button with the spoken label; Swap, Skip (or Delete) and Open details are accessibility actions, because swipe and hold cannot be discovered.
- Swap and Skip are 44 px. The check and the menu button have a 44 px tap area.

## Copy rules

- Amounts and calories say the number and the unit: "1 katori", "100 kcal".
- The macros line keeps the middle-dot separators the app uses today (the separator rule is being reviewed screen by screen).
