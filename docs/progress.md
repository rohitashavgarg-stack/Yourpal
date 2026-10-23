# Design system handoff: progress

Branch: `design-system-handoff` (not merged into main). Resume with "Continue from docs/progress.md".

| Step | What | Status | Commit |
|---|---|---|---|
| 1a | Buttons: replace exact matches with Button | done (earlier pass, no new exact matches after re-audit) | e19a3fc |
| 1b | Cards: replace exact matches with Card | done (earlier pass, no new exact matches after re-audit) | 1e1271a |
| 1c | Icon buttons: replace exact matches with IconButton | done | 05bff48 |
| 2 | Storybook for web, light/dark toggle, 26 story files (128 stories), static build, docs/DEPLOY-STORYBOOK.md | done (all 128 stories open without errors; not deployed) | 3cb75d2 (tokens), 1e14461 (Storybook) |
| 3 | Component docs for every component, docs/design-system-components.md index | done | 52db975 |
| 4 | Handoff pack: CLAUDE.md rules, PR template, ESLint error rule, docs/HANDOFF.md | done | 296e5e5 (lint), 3a29d3d (CLAUDE.md, PR template, HANDOFF.md, review page script) |
| 5 | docs/personalisation-gap.md | done | f76d8c9 |
| Final | Report | done (given in chat) | |

**Step 1 done, ready for screenshots.**

**Steps 1 to 5 done.** Not merged into main.

After Step 2: the 9 px coach unread dot is back to radius 5 (d86a0ac). The water tile icon radius was already 20.

Notes
- Commit 0c811d9 (IconBadge, StatusDot) and the capture tooling (scripts/visual) are kept.
- Step 2 needed two Storybook-only shims: require() of images and clips becomes an import, and expo-router is a no-op stand-in (.storybook/mocks/expo-router.tsx). The app is unchanged by them.
- ThemeProvider gained an optional `scheme` prop (Storybook pins light or dark); the app does not pass it.

## Round 2 (phases A to E)

| Phase | What | Status | Commit |
|---|---|---|---|
| A | Decisions already made: no-goal copy, banner wording, comeback docs, tap targets, accessibility, IconButton hitSlop | done (A3 decided and built in round 4, step 1) | db5706f |
| B | Near-matches from docs/coverage-decisions.md: new variants, replacements, docs/review-changes.md, docs/coverage-exceptions.md | done: 37 of 41 use the library, 4 exceptions; hand-built count 216 to 179 | 499a9c8 |
| C | Stories and docs for what changed, Coverage page in Storybook, rebuild and open every story | done: 158 stories plus the Coverage page open without errors | 6c4560b |
| D | Screenshots before (main) and after (this branch), docs/review/index.html | done in dark mode only (light mode left for later, as asked): 181 screens, sheets, onboarding steps and states per side; before = main at 42859d8; page has before left, after right, links to review-changes.md | e631b5d |
| E | Handoff package: CLAUDE.md, PR template, HANDOFF.md, README, HANDOFF-INDEX.md, npm run handoff zip, DEPLOY-STORYBOOK.md | done: zip is 40 MB, reopened (1,145 entries) and extracted to check | e631b5d |

**Round 2 (phases A to E) done.** Not merged into main. Not deployed.

**Storybook deployed** to https://yourpal-storybook.vercel.app (Vercel project yourpal-storybook, free Hobby plan, deployed by hand, git disconnected). Vercel CLI 65.1.0 installed globally and signed in as rohitashavgarg-7341; Vercel plugin installed for Claude Code (user scope); Vercel MCP added but not yet authorized by the user.

## Round 3 (phase F: remaining components from the pages)

Same rules as round 2: no behaviour change, 2 px or less uses the variant and is recorded in docs/review-changes.md, more than that adds a variant, never change a value silently. After every step: typecheck, lint, story, doc, audit.

| Step | What | Status | Commit |
|---|---|---|---|
| F1 | Cards the library does not know: soft panel and callout (new Callout primitive, InfoBox built on it, Card tone) | done: 15 hand-built blocks replaced, 7 exact, 8 within 2 px (recorded in docs/review-changes.md); hand-built 179 to 163 | 8e14d87 |
| F2 | ProgressBar primitive (3, 4, 6, 8 px) and ProgressSegments; 10 hand-built bars replaced | done: all exact (no visible change in the screenshots); hand-built 163 to 152; pager dots, ruler ticks, chart bars and the check-in line stay as they are | 83f29a3 |
| F3 | IconBadge and StatusDot adopted for the small icon tiles and dots | done: 61 tiles and 4 dots swapped by a codemod, all exact (full dark capture compared: only rotating greeting and quote text differ); tokens onDark.ember and onDark.gold | c52c290 |
| F4 | Move Txt, Row, Segmented, Tag and the rest of group 1 into the design-system folder | not done, left out on purpose: it is a refactor beyond the developer handoff; listed in docs/HANDOFF-INDEX.md and docs/design-system-components.md ("Still in components/ui.tsx") as the next step | |
| F5 | Handoff refresh: counts, index, Storybook rebuilt and redeployed (180 stories, live), zip rebuilt | done | c038bb6 |

**Developer handoff package is current** (F1 to F3 included). Storybook live: https://yourpal-storybook.vercel.app (180 stories). Zip: handoff/yourpal-design-system-handoff.zip. Not merged into main except the two fixes that went straight to main (the freeze fix and the pinned Save meal).

## Round 4 (fix everything PARTIAL or NOT READY in docs/HANDOFF-STATUS.md)

Branch `design-system-handoff`. Not merged into main (main is merged into the branch in step 11). No behaviour changes.

| Step | What | Status | Commit |
|---|---|---|---|
| 1 | Comeback card: code and docs match the decision (title "Easy session", 20 min, chips "4 exercises" and "Half your usual load", buttons "Start easy session" and "Not today", no exercise names); `onStartRegular` became `onNotToday` (answers as a skip with Undo) | done | a2b2c2f |
| 2 | "View plan" to "See plan" (ForYou.tsx update card); the two rows in docs/review-changes.md are the old wording on purpose | done | 2b51cb9 |
| 3 | WorkoutCard paused state kept; docs and CLAUDE.md reworded: a membership pause shows as the account banner and as the workout card's paused state, never on the goal; "frozen" removed from the never-failure lines | done | aaeca11 |
| 4 | Dot separators: none in the library components; CheckInBar "Leg day in progress"; the other 249 lines in 73 files are listed by file in docs/copy-separators.md (script scripts/audit/separators.js), not changed | done | fed49ae |
| 5 | One hand-built count: scripts/audit/hand-built.js (outside the demo panel; 88 when written, 86 after step 7 moved two components out of the counted app code) feeds docs/coverage.md and the Storybook Coverage page; npm run audit:coverage; per-group table below. The earlier 95 was 88 plus 7 demo-panel elements; the 109 was 88 plus 21 | done | b52a4a1 |

| 6 | Unused library components (report only, nothing deleted): all four are in use. **MetaRow**: no screen writes `<MetaRow>`, but WorkoutCard and MealsCard (library patterns) draw it, so it shows on Today. **RadialGlow**: imported as `Glow` (old name) by `features/today/CheckInBar.tsx` and `DayQuote.tsx`, and used by GoalCard (2) and BudgetCard. **MealsCard** (pattern): used by the container `features/today/MealsCard.tsx` as `MealsCardPattern`, which Today renders as `MealNowCard`. **TrackerTile**: the base of the weight, heart rate, sleep and active energy tiles in TrackerRow.tsx (4 uses in that file). The Coverage script now counts imports under another name and uses inside the library, and the Storybook page has a "Used inside the library" column, so these no longer show as 0 | done | STEP6 |
| 7 | Shared components used on 3 or more screens moved into the library (script scripts/audit/shared-usage.js counts screens by import closure): Txt, Row, FoodMark, CheckCircle, Tag, Ring, Beat, HeartIcon, Brand (GymLogoMark, PersonAvatar, PremiumBadge), Glass, TrendsButton, YourPalLogo, Wheel, Ruler; each has a story and a doc, a row in docs/design-system-components.md and a re-export at the old path; new tokens fixed.logoBlue, foodVeg, foodEgg, foodNonVeg, onDark.sand, goldInk. Kept where they are, with the reason, in docs/coverage-exceptions.md: Segmented, Skeleton, Glow, UnitPill, OtpInput (under 3 screens), TabScreen, GymHeader, FloatingTabBar (app structure, not visual components), PillBtn and RoundBtn (old names of Button and IconButton). Library is now 43 files: 36 primitives, 7 patterns | done | 6b2f8e9 |
| 8 | Stepper minus and plus: drawn size unchanged (34 by 44 px), 5 px hit slop each side so the tap area is 44 by 44, role button, Stepper.md updated. Note: the audit table said "row" variant; the 34 px buttons were in the inline variant (the row variant already has 44 px buttons) | done | STEP8 |

### Per screen group (2026-10-23; 86 hand-built outside the demo panel, 3 of them on purpose; script scripts/audit/hand-built.js, run npm run audit:coverage)

| Group | Hand-built | On purpose | Still to build | Status |
|---|---|---|---|---|
| Today | 12 | 0 | 12 | open |
| Progress | 11 | 0 | 11 | open |
| Plans and food logging | 16 | 1 | 15 | open |
| Workout session | 6 | 1 | 5 | open |
| Gym tab | 7 | 0 | 7 | open |
| Profile and settings | 11 | 0 | 11 | open |
| Onboarding and login | 10 | 1 | 9 | open |
| Bottom sheets | 10 | 0 | 10 | open |
| Modals and toasts | 0 | 0 | 0 | done (no hand-built element found) |
| Empty, loading and error states | 0 | 0 | 0 | done (no hand-built element; three of these states still lack a review image, step 9) |
| Shared components (outside the library) | 3 | 0 | 3 | open |
| **Total** | **86** | **3** | **83** | |
