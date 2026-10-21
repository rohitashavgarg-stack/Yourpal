# Programme goal (GoalCard)

`src/design-system/patterns/GoalCard.tsx`. The member's goal, in three looks that share one state. It was `GoalTickCard`; that name still works (`src/features/today/GoalTickCard.tsx` re-exports it with its old props).

```tsx
<GoalCard variant="card" />                       // Progress, and Today when the demo switch "Top card" is "Goal card"
<GoalCard variant="flat" />                       // header of the goal page, not tappable
<GoalCard variant="strip" />                      // the goal row inside the Daily budget card
<GoalCard variant="card" state="behind" weighDays={12} />   // pin a state (demo panel, screenshots)
```

| Prop | Type | What it does |
|---|---|---|
| `variant` | `'card' \| 'flat' \| 'strip'` | Which look. Default `card` |
| `state` | `GoalCardState` | Pin a state and show the sample numbers (kg goals). Without it the state comes from the member's data |
| `weighDays` | number | Days since the last weigh-in. Without it, the demo panel value (default 2) |

## Where the state comes from

`useGoalCardState` (`src/features/today/goalCardState.ts`) checks in this order and takes the first that fits:

1. the demo panel's pin ("Goal card state"), if set
2. goal type "Not sure yet" gives **noGoal**
3. membership hold "Frozen" gives **frozen**, "Paused" gives **paused**
4. the Comeback day gives **comeback**
5. the goal's end date has passed gives **complete**
6. goal status "a bit behind" gives **behind**; "ending soon" gives **almost**
7. otherwise **onTrack**

`backOn` is only reachable from the demo panel today.

## Card variant: the numbers

| Item | Value |
|---|---|
| Segments | **36**, each `flex: 1`, 14 px high, 2 px gap, corner radius `radii.xs` (4) |
| Segments filled | `round(36 x share of the goal's time that has passed)`, at least 1 once the goal has started; **complete** fills all 36 |
| Where the bar is used | weight and muscle goals only. Body fat, strength, flexibility, agility and "train 4 times a week" keep their own picture (ticks, staircase, ruler, race lane, workout slots) in the state colour |
| Card corner radius | **24**, border 1 px `#3A3D48`, padding 16 top and bottom, 15 left and right, content clipped to the corners |
| Card colours | background `#1A1D22` and border `#3A3D48`, the same in light and dark mode |
| Pill | corner radius `radii.pill` (999), 6 px by 13 px padding, 13 px semibold, never wraps, never moves below the title |
| Title | name in 24 px Outfit, white `#F3F4F6`; the line under it in 14 px, `rgba(243,244,246,0.8)` |
| Bottom row | 13 px; the bold part is white, the rest `#C3C7D0`; the right text is 13 px medium |
| Unfilled segment | `rgba(255,255,255,0.2)` |
| Tap | opens `/goal-detail` (not in the flat variant) |

### Glow and colours per state

The glow is a radial ellipse in a 340 x 260 box placed 60 px past the left edge of the card and 90 px below its bottom, so only part of it shows inside the card. Colour and strength per state:

| State | Glow colour | Glow strength | Segment colour | Pill |
|---|---|---|---|---|
| onTrack | `#2F6BEA` blue | 0.8 | mint `#2EE6A8` | white fill, ink `#0B0E14` text |
| behind | amber `#E8A33D` | 0.6 | amber | amber at 20% fill, amber text |
| almost | mint `#2EE6A8` | 0.6 | mint | mint at 20% fill, mint text |
| complete | grey `#787E8C` | 0.4 | mint | mint at 20% fill, mint text |
| frozen | grey `#787E8C` | 0.4 | grey `#5B5D66` | amber at 20% fill, amber text |
| paused | grey `#787E8C` | 0.4 | grey `#5B5D66` | outlined: 1 px `#3A3B42`, text `#C3C7D0` |
| comeback | `#2F6BEA` blue | 0.8 | mint | outlined, same as paused |
| backOn | mint `#2EE6A8` | 0.6 | mint | mint at 20% fill, mint text |
| noGoal | none | none | none | none |

Fill at 20% means `rgba(46,230,168,0.2)` for mint and `rgba(232,163,61,0.2)` for amber. Comeback is blue and lit like on track on purpose: a returning member is not stalled. Amber is for caution; red is never used for "behind".

### Exact copy per state (card variant)

The sample numbers are what the demo panel and the screenshots show for a "Lose 6 kg, by 30 Nov" goal. A real member sees their own.

| State | Pill | Line under the name | Bottom left | Bottom right |
|---|---|---|---|---|
| onTrack | On track | by 30 Nov | **1.6 kg lost** of 6.0 kg | 27% |
| behind | Behind | by 30 Nov | **0.9 kg lost** of 6.0 kg | 15% |
| almost | Almost there | by 30 Nov | **5.4 kg lost** of 6.0 kg | 90% |
| complete | Complete | ended 30 Nov | **4.8 kg lost** of 6.0 kg | 100% |
| frozen | Frozen | paused | **1.6 kg lost** of 6.0 kg | 30 days left in freeze |
| paused | Paused | paused | **1.6 kg lost** of 6.0 kg | Resumes 8 Oct |
| comeback | Resumes today | by 30 Nov | **1.6 kg lost** of 6.0 kg | (nothing) |
| backOn | Back on | by 30 Nov | **1.6 kg lost** of 6.0 kg | Day 1 back |
| noGoal | (none) | see below | (none) | (none) |

- The percentage is the share of the goal's **time** that has passed, never the target hit, so the kg line next to it always says how far the member got. It is never shown as "0%".
- "kg lost" becomes "kg gained" for a muscle goal; other goal kinds use their own wording ("lower", "added", "faster").
- The frozen and paused strings (30 days left in freeze, Resumes 8 Oct) and "Day 1 back" are fixed samples: the app does not know the freeze dates yet.
- **Stale weigh-in:** when the last weigh-in is 10 days or more old and the goal is a weight or muscle goal, the percentage is replaced by **Needs a weigh-in** in amber. It does not apply to states that already show their own right-hand text (frozen, paused, backOn) or to comeback.
- A weekly goal ("Train 4x weekly", "standing goal") has no date and no percentage: the line under the name says "standing goal", the left text is "1 workout of 4 this week", and the right side shows the streak in weeks ("7 weeks", or "No streak yet").
- **noGoal** is a different, quiet card: dashed 1 px border `#2E3038`, background `#0B0E14`, no glow, no bar, no number. Title "No goal set yet" (20 px Outfit, `#8C8E97`), line "Your coach sets this after your assessment" (`#5E6069`). Tap opens `/goal-detail`.

## Strip variant

One row inside the Daily budget card, edge to edge, 64 px minimum height, `rgba(255,255,255,0.07)` background and a 1 px `rgba(255,255,255,0.14)` line on top. It has no corner radius of its own: the budget card clips it.

Target icon (22 px), the label "Goal" (14 px, `#C9CDD6`), the goal name (17 px, white), the right text (15 px) and a chevron.

| State | Right text | Colour |
|---|---|---|
| onTrack | `{n}% completed` | `#C9CDD6` |
| behind | `{n}% completed` | amber `#E8A33D` |
| almost | `{n}% completed` | mint `#2EE6A8` |
| complete | Complete | mint |
| frozen | Frozen | amber |
| paused | Paused | `#C9CDD6` |
| comeback | Resumes today | `#C9CDD6` |
| backOn | Back on | mint |
| noGoal | (nothing); the name reads "No goal set yet" in `#8C8E97` and the icon is dimmed | |

`{n}` is the goal's progress share (`round(progress x 100)`), the same number the budget card always showed; it is not the time-elapsed share the card variant uses. Tap opens `/goal-detail`.

## Flat variant

The header of the goal page: no card around it, the page's own colours.

- name in 26 px Outfit when longer than 14 characters, otherwise 30 px
- under it: "{n}% of the way there", or "All the way there" once reached
- a status pill whose colour carries the status: green (ahead or reached), amber (a bit behind, ending soon), blue otherwise. Text is the goal's status line, or for a weekly goal "Week complete" / "{n} to go"
- below: the large progress picture with a "now" bubble and what the two ends mean (Start and Goal, or Done this week and Weekly target)
- not tappable

## Checked

`docs/visual-baseline/cards/` has the card in all 9 states, the stale weigh-in and the flat variant, light and dark. After moving the code into this component all 22 images were identical (0.00% of pixels differ). The strip is covered by the Daily budget card images (`budget-goal-*`); see `docs/budget-card.md`.

## Not decided here

- Light mode: the card is dark in both modes by design (spec colours). Nothing here changes that.
- The corner radius 24 is not a step of the `radii` scale (4, 12, 18, 22, 28). It is kept so nothing moves.
- The unused goal designs (the container-less strip, the old A, B and C designs, the ring card, the slim ForYou strip) are in `src/design-system/_archive/`.
