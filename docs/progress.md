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
| A | Decisions already made: no-goal copy, banner wording, comeback docs, tap targets, accessibility, IconButton hitSlop | done except A3: needs my decision (the comeback card described in the brief is not the one in the code) | db5706f |
| B | Near-matches from docs/coverage-decisions.md: new variants, replacements, docs/review-changes.md, docs/coverage-exceptions.md | done: 37 of 41 use the library, 4 exceptions; hand-built count 216 to 179 | 499a9c8 |
| C | Stories and docs for what changed, Coverage page in Storybook, rebuild and open every story | done: 158 stories plus the Coverage page open without errors | 6c4560b |
| D | Screenshots before (main) and after (this branch), docs/review/index.html | done in dark mode only (light mode left for later, as asked): 181 screens, sheets, onboarding steps and states per side; before = main at 42859d8; page has before left, after right, links to review-changes.md | e631b5d |
| E | Handoff package: CLAUDE.md, PR template, HANDOFF.md, README, HANDOFF-INDEX.md, npm run handoff zip, DEPLOY-STORYBOOK.md | done: zip is 40 MB, reopened (1,145 entries) and extracted to check | e631b5d |

**Round 2 (phases A to E) done.** Not merged into main. Not deployed. One decision is open: the comeback workout card (see docs/review-changes.md and src/design-system/docs/WorkoutCard.md).

**Storybook deployed** to https://yourpal-storybook.vercel.app (Vercel project yourpal-storybook, free Hobby plan, deployed by hand, git disconnected). Vercel CLI 65.1.0 installed globally and signed in as rohitashavgarg-7341; Vercel plugin installed for Claude Code (user scope); Vercel MCP added but not yet authorized by the user.

## Round 3 (phase F: remaining components from the pages)

Same rules as round 2: no behaviour change, 2 px or less uses the variant and is recorded in docs/review-changes.md, more than that adds a variant, never change a value silently. After every step: typecheck, lint, story, doc, audit.

| Step | What | Status | Commit |
|---|---|---|---|
| F1 | Cards the library does not know: soft panel and callout (new Callout primitive, InfoBox built on it, Card tone) | done: 15 hand-built blocks replaced, 7 exact, 8 within 2 px (recorded in docs/review-changes.md); hand-built 179 to 163 | 8e14d87 |
| F2 | ProgressBar primitive (3, 4, 5, 6 px bars) and adopt it | not started | |
| F3 | IconBadge size presets and StatusDot adopted for the small tiles and dots | not started | |
| F4 | Move Txt, Row, Segmented, Tag, CheckCircle, FoodMark, Ring, Avatar and the rest of group 1 into the design-system folder | not started | |
| F5 | Refresh review screenshots (dark), coverage page, docs, zip | not started | |
