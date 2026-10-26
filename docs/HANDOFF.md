# YourPal member app: developer handoff

The member app is Expo (SDK 58) with Expo Router and TypeScript. It runs on iOS, Android and the web (react-native-web, deployed to Vercel). This page explains the design system and the everyday commands. The rules every change follows are in `CLAUDE.md`.

## Structure

```
src/
  app/                    routes (Expo Router): every file is a screen, _layout.tsx files are navigators
  features/               feature code: containers that read app state and feed the patterns
  design-system/
    tokens/               colours (light and dark palettes, fixed, onDark, gradients), type, spacing, radius, shadows, motion
    primitives/           small building blocks: Button and IconButton, Card, Option, Chip, Pill, Input, Sheet and SheetFooter, Snackbar, Stepper, ...
    patterns/             whole cards with their states as props: GoalCard, BudgetCard, WorkoutCard, MealsCard, FoodCard, TrackerRow, WeekCard, Banner
    stories/              one Storybook file per primitive and pattern
    docs/                 one page per component: purpose, props, states, do and don't, accessibility, copy rules
    _archive/             retired components kept so old imports still resolve; do not use them in new code
  components/             older shared pieces; ui.tsx re-exports the primitives under their old names
  lib/                    app state (store.tsx, domain.tsx), sample data, copy (microcopy.ts)
  theme/                  ThemeProvider (useTheme) on top of the tokens
```

How the layers depend on each other: tokens, then primitives (use tokens only), then patterns (use primitives and tokens, take every state as a prop, read no app state), then features and routes (read app state and pass it into patterns).

## Running it (Expo SDK 58)

- The app is on **Expo SDK 58** (Expo 58, React Native 0.88, React 19.3, Expo Router 58). Expo Go on a phone only opens the latest SDK, so use the current Expo Go from the App Store or Play Store.
- Install with `npm install --legacy-peer-deps`. Expo Router 58 lists an optional extra package (`@expo/ui`) that this app does not use, and npm stops on it without the flag.
- `npx expo start`, then scan the QR code with Expo Go (same Wi-Fi), or press `w` for the web version.
- Router 58 changed what a custom tab bar receives: `emitter` and `navigateToTab` replace `navigation` (see `src/components/FloatingTabBar.tsx`). React Native 0.88 types a ScrollView ref as `ScrollViewInstance` and a TextInput ref as `TextInputInstance`.
- Storybook builds with `npm run build-storybook`. It carries a small stand-in for `@react-native/assets-registry` (`.storybook/mocks/assets-registry.ts`) because react-native-svg 15.16 imports it.

## Find a component

0. What is built and what is still drawn by hand: the Coverage page in Storybook, and `docs/coverage.md`.
1. The index: `docs/design-system-components.md`, grouped by primitive and pattern, with variants and states in one line each.
2. Storybook: `npm run storybook`, then search by name. Switch Light / Dark in the toolbar; change props in Controls; copy the usage from the Code tab.
3. The page for one component: `src/design-system/docs/<Name>.md`.
4. Not sure it exists? Search the code: `grep -rn "export function" src/design-system/primitives src/design-system/patterns`.

## Add a component (or a variant)

1. Check the index and Storybook first. A different look of something that exists is a new variant (a prop), not a new component.
2. Primitive or pattern? A primitive is one control or surface. A pattern is a whole card or block with its states.
3. Write it in `src/design-system/primitives/` or `patterns/`. Tokens only: the lint rule is an error in this folder.
4. Every state is a prop with a comment saying what it shows. Patterns take data, not app state; the container in `src/features/` reads the state.
5. Add `src/design-system/stories/<Name>.stories.tsx`: one story per variant and state.
6. Add `src/design-system/docs/<Name>.md` and a row in `docs/design-system-components.md`.
7. Run the checks below and fill in the PR template (`.github/pull_request_template.md`).

## Run the app

```bash
npm install
npx expo start                       # dev server; press w for web, or scan the QR code with Expo Go
npx expo start --web --port 8082     # web on http://localhost:8082 (open /?signedin=1 to skip sign-in)
npm run build:web                    # the static web build in dist/, what Vercel serves
```

On a wide web window the phone frame has the demo controls panel beside it: time of day, situation, member type, membership and so on.

## Run Storybook

```bash
npm run storybook          # http://localhost:6006
npm run build-storybook    # static files in storybook-static/
```

Deploying it as its own Vercel project is described in `docs/DEPLOY-STORYBOOK.md`.

## Checks before a PR

```bash
npx tsc --noEmit           # types
npm run lint               # whole project
npm run lint:changed       # fails if the branch adds a hard-coded colour, radius or font size
```

## Hand the package to someone

```bash
npm run handoff     # builds Storybook, writes handoff/yourpal-design-system-handoff.zip
```

The zip holds the Storybook build, the design-system docs and tokens, `docs/`, the review page and `docs/HANDOFF-INDEX.md` (every deliverable and where it is). It needs `docs/review/index.html` to exist, so make the review page first (next section).

## Screenshots and the review page

`docs/review/index.html` puts every screen, sheet, onboarding step and state side by side: before on the left, after on the right, with a light / dark switch. A row that changed on purpose links to its entry in `docs/review-changes.md`. The page does not compare anything; you look.

```bash
# 1. the "after": the branch you are on
npx expo start --web --port 8082                                    # terminal 1
node scripts/visual/capture-all.js docs/review/after                # terminal 2, about 20 minutes, both themes

# 2. the "before": main in a second checkout, on another port
git worktree add --detach ../Yourpal-main main                      # once; then link node_modules into it
cd ../Yourpal-main && npx expo start --web --port 8083              # terminal 3
APP_URL=http://localhost:8083 node scripts/visual/capture-all.js docs/review/before   # from the first checkout

# 3. the page
node scripts/visual/review.js docs/review/before docs/review/after  # writes docs/review/index.html
```

Open `docs/review/index.html` in a browser (a double click works; the images are next to it). The capture scripts need Microsoft Edge or Chrome. `capture-all.js` runs four scripts that can also be used alone: `capture.js` (every screen and the bottom of the tab screens), `capture-cards.js` (the Today cards in every state), `shots.js` (sheets, onboarding steps, empty, loading and error states) and `capture-flows.js` (the workout in progress). Add `--only=today,plans` to `capture.js` or `--only=sheet-,state-` to `shots.js` for a part.

`docs/visual-baseline/` holds the older baselines from before the October Today redesign; `scripts/visual/compare.js` and `check.js` still compare a run against them by pixels if you want a number. They are not used by the review page.

## Known follow-up: hard-coded values outside the library

Inside `src/design-system` there are none (the lint rule is an error there). In the rest of `src` there are **368** left: 223 colours, 81 radii, 64 font sizes (23 Oct 2026). Nothing was changed for these on purpose: each one is a value that could change how a screen looks, so they are moved to tokens one folder at a time, with a screenshot check. `npm run lint:changed` stops new ones: it fails a branch that adds a hard-coded value on any line it adds or changes, so the number can only go down. Count again with `node scripts/audit/hardcoded-by-folder.js` (about a minute).

| Folder | Colours | Radii | Font sizes | Total |
|---|---|---|---|---|
| `src/features/today` | 45 | 7 | 10 | 62 |
| `src/features/streak` | 36 | 2 | 2 | 40 |
| `src/features/trackers` | 32 | 5 | 1 | 38 |
| `src/features/workout` | 14 | 10 | 9 | 33 |
| `src/features/progress` | 22 | 0 | 1 | 23 |
| `src/features/onboarding` | 14 | 2 | 3 | 19 |
| `src/app/gym` | 7 | 4 | 4 | 15 |
| `src/app/plans` | 10 | 3 | 1 | 14 |
| `src/web/WebFrame.tsx` | 6 | 7 | 1 | 14 |
| `src/features/shell` | 10 | 3 | 0 | 13 |
| `src/app/welcome.tsx` | 6 | 5 | 1 | 12 |
| `src/app/workout.tsx` | 8 | 2 | 1 | 11 |
| `src/web/ControlParts.tsx` | 0 | 6 | 4 | 10 |
| `src/app/goal-detail.tsx` | 3 | 3 | 2 | 8 |
| `src/app/profile` | 3 | 2 | 3 | 8 |
| `src/features/chat` | 1 | 4 | 2 | 7 |
| `src/features/plans` | 1 | 2 | 4 | 7 |
| `src/app/checkin.tsx` | 3 | 2 | 1 | 6 |
| `src/app/(tabs)` | 0 | 2 | 2 | 4 |
| `src/app/food.tsx` | 0 | 2 | 1 | 3 |
| `src/app/onboarding.tsx` | 0 | 0 | 3 | 3 |
| `src/app/progress` | 0 | 2 | 1 | 3 |
| `src/features/checkin` | 1 | 1 | 1 | 3 |
| `src/app/login.tsx` | 0 | 1 | 1 | 2 |
| `src/components/FloatingTabBar.tsx` | 0 | 2 | 0 | 2 |
| `src/features/goalv2` | 1 | 1 | 0 | 2 |
| `src/features/reminders` | 0 | 0 | 2 | 2 |
| `src/app/exercise-search.tsx` | 0 | 1 | 0 | 1 |
| `src/app/goal.tsx` | 0 | 0 | 1 | 1 |
| `src/components/TabScreen.tsx` | 0 | 0 | 1 | 1 |
| `src/features/body` | 0 | 0 | 1 | 1 |
| **Total** | **223** | **81** | **64** | **368** |

The `src/web` rows (24) are the dev-only demo panel. Suggested order: `src/features/today`, then `streak`, `trackers`, `workout`, `progress`.

## Where to read more

- `CLAUDE.md`: the rules for every change.
- `docs/design-system-components.md`: the component index.
- `docs/coverage.md`, `docs/coverage-decisions.md` and `docs/coverage-exceptions.md`: what is still hand-built, how the near-matches were resolved, and what stays hand-built on purpose.
- `docs/review-changes.md`: every value that changed on screen on this branch.
- `docs/HANDOFF-INDEX.md`: every deliverable and where it is.
- `docs/personalisation-gap.md`: which personalisation features are built, partial or missing.
- `docs/SESSION_HANDOFF.md` and `docs/PHASE2_HANDOFF.md`: product history and design decisions.
