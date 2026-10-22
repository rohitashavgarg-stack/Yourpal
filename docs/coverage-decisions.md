# Near-matches: how each one was resolved

The 41 hand-built elements that were close to a library component but not the same (buttons 21, cards 14, icon buttons 6). The rule: where an element differs from a library variant by 2 px or less, it uses the variant and the change is recorded in [review-changes.md](review-changes.md); where it differs by more, the library gets a variant and the element uses it unchanged.

Result: 37 now use the library, 4 stay hand-built with a reason in [coverage-exceptions.md](coverage-exceptions.md). Nothing is waiting for a decision.

## What the library gained

| Component | Added | For |
|---|---|---|
| `Button` kind | `dashed` (1 px dashed line, medium label) | "Ate something else?", "+ Add exercise", "+ Add item", "Add set" |
| `Button` kind | `line` (1 px chip line, medium label) | coach and chat topic choices |
| `Button` kind | `quiet` (1 px line, medium label) with `muted` | "Skip meal" / "Undo skip" |
| `Button` kind | `soft` (accent-soft fill, accent text) | "This week", "Back to today", "About: ..." |
| `Button` kind | `whiteLine` (white, 1 px `fixed.lineOnWhite`) | workout "Finish" and "Hide" on the white clip stage |
| `Button` kind | `surface` (white surface fill) | Profile "Edit" |
| `Button` size | `xs` (32 px pill), `chip` (44 px, 16 px sides) | the 32 px pills; rows of choices |
| `Button` props | `iconAfter`, `weight`, `muted`, `scaleTo` | a trailing X, a label weight different from the kind, a quiet label, the old press scale |
| `Option` (new primitive) | looks `fill` and `outline`, `selected` | programme and experience choices, days a week, food type, Progress range, segmented tabs |
| `Card` variant | `tight` (radius 24, padding 16), `roomy` (radius 28, padding 18) | the paddings that recur (7 and 3 cards) |
| `Card` props | `flat`, `border`, `clip`, `padding` (per side) | cards without a shadow, with a line, clipping a chart, list cards |
| `IconButton` props | `width` (non-square), `hitSlop` | the 44 x 40 emoji tab, the water pill with two icons, small buttons that need a 44 px tap area |

## Buttons (21)

| Where | Now | Change |
|---|---|---|
| `features/today/LogMealsSheet.tsx` Ate something else? | `Button` dashed small | [recorded](review-changes.md#log-meal-sheet) |
| `features/today/LogMealsSheet.tsx` Skip meal | `Button` quiet small, muted | [recorded](review-changes.md#log-meal-sheet) |
| `features/plans/DietPlan.tsx` Ate something else? | `Button` dashed small | [recorded](review-changes.md#plans-diet) |
| `app/plans/create.tsx` + Add exercise | `Button` dashed medium | [recorded](review-changes.md#plans-create) |
| `app/plans/edit.tsx` + Add item / exercise | `Button` dashed medium | [recorded](review-changes.md#plans-edit) |
| `app/workout.tsx` Add set | `Button` dashed medium | [recorded](review-changes.md#workout) |
| `app/(tabs)/plans.tsx` This week | `Button` soft xs | [recorded](review-changes.md#plans) |
| `app/coach.tsx` topics | `Button` line chip | exact |
| `app/gym/chat.tsx` About: ... | `Button` soft xs, medium, iconAfter | [recorded](review-changes.md#gym-chat) |
| `app/gym/chat.tsx` topics | `Button` line chip | exact |
| `app/profile/index.tsx` Edit | `Button` surface small | [recorded](review-changes.md#profile) |
| `features/workout/NewWorkoutUI.tsx` Finish | `Button` whiteLine small | [recorded](review-changes.md#workout) |
| `features/workout/NewWorkoutUI.tsx` Hide | `Button` whiteLine xs, medium | [recorded](review-changes.md#workout) |
| `features/progress/TrendUI.tsx` Back to today | `Button` soft xs | [recorded](review-changes.md#progress-trend) |
| `features/progress/TrendUI.tsx` range (1W, 1M, ...) | `Option` fill, 32 px | exact |
| `features/trackers/Widgets.tsx` water pill | `IconButton` 44 x 74 | exact |
| `app/onboarding.tsx` programme | `Option` outline | exact |
| `app/onboarding.tsx` experience | `Option` outline | exact |
| `app/onboarding.tsx` days a week | `Option` fill | [recorded](review-changes.md#onboarding) |
| `app/plans/log.tsx` food type | `Option` fill with a line | exact |
| `components/bits.tsx` segmented tabs | `Option` fill, tab | exact |

## Cards (14)

| Where | Now | Change |
|---|---|---|
| `features/today/ForYou.tsx` update card | `Card` tight, border, clip | exact |
| `features/today/NoPlanCard.tsx` | `Card` tight, flat | exact |
| `app/gym/assessments.tsx` list | `Card` padding per side | exact |
| `app/gym/attendance.tsx` list | `Card` padding per side | exact |
| `app/gym/break.tsx` selected plan | `Card` tight, 1.5 px accent border | exact |
| `app/gym/break.tsx` summary | `Card` roomy | exact |
| `app/gym/break.tsx` history rows | `Card` tight | exact |
| `features/onboarding/Steps.tsx` shared with your coach | `Card` tight, flat | exact |
| `features/onboarding/Steps.tsx` what happens next | `Card` tight, flat | exact |
| `app/profile/health.tsx` | `Card` roomy, flat | exact |
| `app/progress/lift.tsx` chart | `Card` padding per side | exact |
| `app/progress/metric.tsx` chart | `Card` roomy, clip | exact |
| `app/progress/streaks.tsx` | `Card` tight | exact |
| `app/plans/log.tsx` search field | stays | [exception](coverage-exceptions.md) |

## Icon buttons (6)

| Where | Now | Change |
|---|---|---|
| `features/chat/Composer.tsx` emoji group tab | `IconButton` 44 x 40 | exact |
| `features/chat/Composer.tsx` remove photo | `IconButton` 24 with `hitSlop` 10 | exact (Phase A) |
| `features/today/StepsCards.tsx` add steps | `IconButton` 30 with `hitSlop` 10 | exact (Phase A) |
| `features/workout/NewWorkoutUI.tsx` clip thumbnail | stays | [exception](coverage-exceptions.md) |
| `web/WebFrame.tsx` demo panel collapse | stays | [exception](coverage-exceptions.md) |
| `app/welcome.tsx` story progress segment | stays | [exception](coverage-exceptions.md) |
