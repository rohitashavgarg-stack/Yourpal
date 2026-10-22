# YourPal member app: developer handoff

The member app is Expo (SDK 57) with Expo Router and TypeScript. It runs on iOS, Android and the web (react-native-web, deployed to Vercel). This page explains the design system and the everyday commands. The rules every change follows are in `CLAUDE.md`.

## Structure

```
src/
  app/                    routes (Expo Router): every file is a screen, _layout.tsx files are navigators
  features/               feature code: containers that read app state and feed the patterns
  design-system/
    tokens/               colours (light and dark palettes, fixed, onDark, gradients), type, spacing, radius, shadows, motion
    primitives/           small building blocks: Button and IconButton, Card, Option, Chip, Pill, Input, Sheet and SheetFooter, Snackbar, Stepper, ...
    patterns/             whole cards with their states as props: GoalCard, BudgetCard, WorkoutCard, MealsCard, TrackerRow, WeekCard, Banner
    stories/              one Storybook file per primitive and pattern
    docs/                 one page per component: purpose, props, states, do and don't, accessibility, copy rules
    _archive/             retired components kept so old imports still resolve; do not use them in new code
  components/             older shared pieces; ui.tsx re-exports the primitives under their old names
  lib/                    app state (store.tsx, domain.tsx), sample data, copy (microcopy.ts)
  theme/                  ThemeProvider (useTheme) on top of the tokens
```

How the layers depend on each other: tokens, then primitives (use tokens only), then patterns (use primitives and tokens, take every state as a prop, read no app state), then features and routes (read app state and pass it into patterns).

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

## Where to read more

- `CLAUDE.md`: the rules for every change.
- `docs/design-system-components.md`: the component index.
- `docs/coverage.md`, `docs/coverage-decisions.md` and `docs/coverage-exceptions.md`: what is still hand-built, how the near-matches were resolved, and what stays hand-built on purpose.
- `docs/review-changes.md`: every value that changed on screen on this branch.
- `docs/HANDOFF-INDEX.md`: every deliverable and where it is.
- `docs/personalisation-gap.md`: which personalisation features are built, partial or missing.
- `docs/SESSION_HANDOFF.md` and `docs/PHASE2_HANDOFF.md`: product history and design decisions.
