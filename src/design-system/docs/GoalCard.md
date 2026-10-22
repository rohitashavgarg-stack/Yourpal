# GoalCard

`src/design-system/patterns/GoalCard.tsx`. States, colours and sample numbers live in `src/features/today/goalCardState.ts`. It was `GoalTickCard` in `features/today`.

## Purpose

The member's Programme goal, in three looks that all follow one goal state (`GoalCardState`). The state comes from the member's data (`useGoalCardState`); the `state` and `weighDays` props pin it for the demo panel and the screenshot page. It also exports `RadialGlow` (old name `Glow`), the soft radial glow used behind it and behind the BudgetCard.

```tsx
<GoalCard />                                 // card, state from data
<GoalCard variant="strip" state="behind" />  // the row inside BudgetCard
<GoalCard variant="flat" />                  // header of the goal page
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'card' \| 'flat' \| 'strip'` | `card` | One of the three looks |
| `state` | `GoalCardState` | from the member's data | Pins a state; kg goals then show the sample numbers (`DEMO`) |
| `weighDays` | number | `goalCardStore.weighDays` (2) | Days since the last weigh-in; 10 or more shows "Needs a weigh-in" |

`RadialGlow` props: `color` (string), `a` (peak opacity), `side` (`'left' \| 'right'`, default left), `top` (boolean: anchor to the top instead of the bottom).

## Variants

| Variant | Where | Look |
|---|---|---|
| `card` | Progress (and Today when the demo "Top card" switch is "Goal card") | Dark card `#1A1D22`, 1 px `#3A3D48` edge, state-coloured glow from the bottom left. Name (24 px) with the date as subtext under it, state pill in front on the same row, the progress picture, then the numbers row |
| `flat` | Header of the goal page | No card, page colours. Large name, "N% of the way there", a status pill, then the large visual with a "now" bubble and Start / Goal at the ends. Not tappable |
| `strip` | Top row of BudgetCard on Today | A 44 px thin ring with the % in it, the name with the state pill beside it, one line under it ("1.6 of 6.0 kg lost, by 30 Nov"), a chevron. 76 px min high |

The progress picture on `card`: a 36-segment bar (14 px high, 2 px gaps) for weight and muscle goals only. Other kinds keep their own mini picture in the state colour (`GoalVisual`: ticks for body fat, staircase, stopwatch ruler, race lane, workout slots).

## States

`GoalCardState`: onTrack, behind, almost, complete, comeback, backOn, noGoal. Frozen and paused were removed: a goal is never frozen or paused. A membership pause shows only as the account banner.

| State | Pill | Glow | Bar and ring | Right of the numbers row (card) |
|---|---|---|---|---|
| onTrack | "On track", white pill (strip: mint on mint 16%) | blue, 0.8 | mint | time elapsed % |
| behind | "Behind", amber on amber 20% | amber, 0.6 | amber | time elapsed % |
| almost | "Almost there", mint on mint 20% | mint, 0.6 | mint | time elapsed % |
| complete | "Complete", mint | grey, 0.4 | mint, all 36 filled (ring full) | 100%; the date reads "ended <date>" |
| comeback | none (a returning member is not stalled) | blue, 0.8 | mint | nothing |
| backOn | "Back on", mint | mint, 0.6 | mint | "Day 1 back" (fixed sample) |
| noGoal | none | none | none | card: dashed quiet card "No goal set yet", "Your coach sets this after your assessment". strip: target icon in the ring, "No goal set yet", "Set one to see your progress here" |

Overlay: **Needs a weigh-in**. A weight or muscle goal whose last weigh-in is 10 days or more old (`STALE_WEIGH_DAYS`) says "Needs a weigh-in" in amber in place of the % (card), or in place of the line (strip; not on complete or backOn).

Numbers: the % is the share of the goal's time that has passed, never the share of the target hit, so the amount beside it always says how far the member got ("1.6 kg lost of 6.0 kg"). It is never shown as "0%". A weekly consistency goal has no end date: it shows "2 workouts of 4 this week", "standing goal" as the date line, and the streak (flame and weeks, or "No streak yet") on the right. Verbs by kind: weight "lost", muscle "gained", lean "lower", agility "faster", others "added".

`flat` uses the goal model's own status instead: ahead or reached is green, a bit behind or ending soon is amber, otherwise blue; the pill says `statusLine(g)` (consistency: "Week complete" or "N to go").

Baseline images in `docs/visual-baseline/cards/`: `goal-<state>`, `goal-onTrack-stale`, `goal-flat`, and `budget-goal-<state>` for the strip.

## Do and don't

- Do let the state come from data. Pin `state` only in the demo panel and screenshots.
- Do keep the amount beside the %; the % alone is time, not progress.
- Do show comeback and backOn as good news: blue or mint, no warning colour.
- Don't add frozen or paused states. A membership pause belongs to the Banner.
- Don't use red for behind. Amber.
- Don't put a button on the card; the whole card opens the goal page.

## Accessibility

- `card`: a link that opens `/goal-detail`, labelled "<name>, <date>. <amount>. <pill>. <right text>. Open goal details".
- `card`, noGoal: a link labelled "No goal set yet. Your coach sets this after your assessment. Open goal details".
- `strip`: a link labelled "Your goal: <name>, <n> percent, <pill>. <line>. Open" (or "No goal set yet. Open").
- `flat`: not pressable; text is read in order.
- Press scale 0.98. The card and the strip are well over 44 px.

## Copy rules

- Say the number: "1.6 of 6.0 kg lost, by 30 Nov". Comma between the amount and the date, never a dot separator.
- Pills are short state words: "On track", "Behind", "Almost there", "Complete", "Back on".
- No guilt for behind or comeback. Credit the coach by name where the goal comes from the coach.
- The noGoal copy differs between `card` ("Your coach sets this after your assessment") and `strip` ("Set one to see your progress here"); see the report.
