---
name: yourpal-mobile-ui
description: How we design and build the YourPal member app (Expo / React Native) — visual language, data presentation rules, goal and tracker patterns, motion, copy, and the working process agreed with the designer (Rohitashav). Use for ANY UI or UX work in this repo — new screens, cards, Today, goal page, Progress, trackers, porting a Figma node, design suggestions or mockups — before writing UI code or proposing a design.
---

# YourPal mobile app — UI and UX playbook

YourPal is a health and fitness app a member gets through their gym (demo: Gold's Gym / Wulf Fitness, member Ankit or Rohitashav, Coach Vikram). It should feel like a **health app, not a gym app**: calm, light-first, data you understand at a glance. Read `AGENTS.md` and `docs/PHASE2_HANDOFF.md` for the stack and shared building blocks; this file is the design and process layer on top.

## 1. Working with the designer

- **Treat the designer as a colleague.** Push back when something is worse UX, give one recommendation, not a menu of five.
- **Explore first, build second.** When the direction is open (a new visual, a redesign, several options), mock it up in chat first (show_widget, dark phone-width cards, real app colours), get a yes, then build. When he says "show me here first", never touch the app.
- **Figma is the source of truth when he shares a node.** Load `figma:figma-design-to-code`, call `get_design_context` with the node, match spacing, sizes and colours exactly, map Space Grotesk / Inter to our fonts (Outfit display, Geist body). SVGs he uploads are art to reproduce faithfully (filters like blur / inner shadow do not run in Expo Go — rebuild them with gradients and say so).
- **He sends corrections mid-task.** Fold each one into the current work immediately; do not finish the old plan first.
- **"Do not miss anything"** means: when a pattern changes, change it on every surface that shows it (Today, the detail page, Progress, the alternate design versions, sheets). Grep for every use before saying done.
- **Verify on screen before reporting.** Typecheck + lint, then look at it in the web preview (section 9). Say plainly what you saw and what you did not check.

## 2. Visual language

- Light-first with full dark mode. Blue accent `#2F6BEA` (`c.accent`), mint `#3CCB9A` for progress fills and live states, dark cards with a soft glow, white data cards. Never hardcode a light-only colour: use `useTheme()` tokens (`c.ink`, `c.muted`, `c.surface`, `c.surface2/3`, `c.line`, `c.accentSoft`, `c.good/goodSoft`, `c.warn/warnSoft`, category pairs `tAct/cAct`, `tNutri/cNutri`, `tHeart/cHeart`, `tSleep/cSleep`, `tWater/cWater`).
- Status colour carries meaning: **green** = ahead / reached, **amber** = a bit behind / ending soon, **blue** = on track. Never one colour for every state.
- Category colour carries meaning: workouts orange (`cAct`), diet green (`cNutri`), heart pink, sleep purple, water blue. A row of drivers is never all one blue.
- **Small status dots have no dark outline ring** (notification dot, unread dot, "changed" dot, the agility runner). A plain dot, or a dot with a white core if it must stand out from a same-colour fill.
- Big, light-weight titles; small pill buttons; thin bars, ticks and rings; outline chips with Lucide icons (`@/lib/icons`).
- Glow (the tilted blue ellipse) belongs to the **Today goal hero only**, never inside a detail page.

## 3. Type, spacing, layout

- Use `Txt` variants; for raw text always set `lineHeight` ≈ 1.3–1.4× size (34→44, 28→39, 24→32, 17→24, 15→22, 13→19, 12→17). Geist crops when tight.
- Spacing on an even scale (4 / 8 / 12 / 16 / 24). Inside one component use **one gap value** for its rows; never let a fixed-height box with centred content create uneven gaps. A numbers row sits **close** to the bar it describes (≈8 px), not a full section gap away.
- Cards: 24 px radius, 16–18 px padding. Tracker tiles: 160 × 160, radius 24, padding 16, 12 px apart (all tiles the same size).
- Group a long page with **section headings above the cards** (sentence case, 18 semibold), not tiny ALL-CAPS labels inside every card.
- Minimum touch target 44 px (use `hitSlop` when the visible control is smaller, e.g. a 32 px pill).
- Long names never truncate with "…": allow two lines and step the size down (32 → 26).

## 4. Presenting data (the most important rules)

- **Never "text · text · text".** No dot-joined subtitles, chips, toasts or buttons. Split into hierarchy: big number + small unit, caption label over a value, an icon row, a thin bar, a mini chart. ("Adjust target to 71.2 kg", not "Adjust target · suggest 71.2 kg"; toasts are short sentences.)
- **Lead with the number people came for**, large, with a short caption: "4.4 kg / of 6.0 kg", "67 days / Day 23 of 89".
- **Put the answer in the headline, the chart is the proof**: "5% ahead of the pace you need" as the chart title (status-coloured), legend under the chart.
- **No duplicates on a page.** Each fact lives in one place. If the hero shows start / now / goal, the chart only shows dates and pace. Before adding a card, check the page does not already say it.
- **Prefer a visual per metric** (bar, ticks, slots, ruler, sparkline) over a sentence. Text explains; visuals show.
- Weekly goals reset, so never show them as a percent bar.

## 5. Goal patterns

One goal model (`useGoalV2`, `src/features/goalv2/model.ts`) feeds every surface, so numbers can never disagree. One shared visual (`src/features/goalv2/GoalVisual.tsx`), always **full width**, in `compact` (Today, Progress card) and `large` (goal page) sizes:

| Goal kind | Visual | Why |
|---|---|---|
| Weight, muscle, body fat | 36 ticks filling mint | value moves steadily start → target |
| Weekly workouts (consistency) | one slot per workout: done (mint), next (dashed), to come | resets every week |
| Strength | staircase of 18 steps rising left → right | moves at tests, in steps |
| Flexibility | stopwatch ruler, 1 mark per second (long 10 s, medium 5 s) | it is a hold time |
| Agility (lower is better) | race lane to a finish flag, mint runner with white core | going down still reads as forward |
| Body fat (proposed) | zone scale (Athletic / Fit / Average / Above) with marker + target notch | a % only means something as a range |

- **Today card order follows the time of day** (app/(tabs)/index.tsx, `order`): the goal and anything that needs an answer (membership, PT confirm, updates, comeback) stay pinned on top; under them what matters now comes first (workout time: workout then meals; mealtime: meals first, workout lower once done or on a rest day; end of day: week and streak first; all meals logged: meals move below the streak).
- **Today goal hero**: no card container, sits on the page over the glow. "Your goal", name (+ "by date" inline if short, own line if long), status pill (Figma white pill), compact visual, one numbers row (amount moved + "of" total, % right; weekly goals show the streak instead). **No marker bubble on Today** (too much height).
- **Goal page (`/goal-detail`)**: header button says **"Change"**, not "Edit". Hero = name, status pill coloured by status, "27% of the way there"; large visual with a "now" bubble whose pointer sits exactly on the tick / step / second / runner (`markerX`, measured with `onLayout`); Start and Goal at the two ends. Then: action card if ending soon / reached → To go + Time left tiles → Pace chart (headline sentence, dates at the ends, legend) → What is moving it (icon + label + thin category-coloured bar + one big number; drop the weight row on body goals) → assessment card (icon row + next-step chip) → Past goals (check icon, amount large, result small).
- **Progress card** uses the same visual in white on the blue gradient, the progress line + %, and the drivers as three number columns.

## 6. Trackers (Today)

- Tiles from Figma node 40165-13849: Weight (glass card, value 28 bold + unit, delta, edge-to-edge sparkline with white end dot), Water (deep blue gradient, the Bottle.svg art with a rising water level, value + "ml", 32 px glass+plus pill), Connect Health (dashed card). Steps default design: **the green dot-matrix card**.
- Tracker-level actions (+ glass, + weight) are small pills that sit above the tile's own press target.

## 7. Motion and interaction

- Screens and cards enter with a plain short fade (`fade()` from `@/theme/motion`, ≤ 200 ms, no spring / bounce / overshoot). Press scale, sheet drag, toasts and progress fills keep their springs.
- iOS feel: `Pressy` press scale + haptics, drag-to-dismiss sheets (`useOverlay().openSheet`), undo toasts.
- Status pills, chips and markers never animate position on every render; animate the fill, not the layout.

## 8. Copy

- Sentence case everywhere. Plain, neutral, never shaming ("A bit behind", "one good week catches up"). Membership is view-only ("View membership", never "Renew").
- Numbers with units close together ("72.4 kg"), captions short ("of 6.0 kg", "best hold", "Day 23 of 89").

## 9. Process checklist (every UI change)

1. Read the files the change touches and every other surface showing the same thing.
2. If the direction is new or he asked for options → mock up in chat, wait for a yes.
3. Build with tokens and shared components; register edge cases with `useScenarios` on new screens.
4. `npx tsc --noEmit` and `npx expo lint <files>`.
5. Look at it: dev server (`npx expo start --port 8082`), web preview `http://localhost:8082/?signedin=1` (skips login; append to any route, e.g. `/goal-detail?signedin=1`). Use the Demo controls panel (goal type, time of day, situation, member type) to walk every state. Check light and dark.
6. Report what changed per surface, what you saw on screen, and anything not checked. Keep `docs/PHASE2_HANDOFF.md` overrides in mind (e.g. no Full / Quick / Low energy selector on the Today workout card).
