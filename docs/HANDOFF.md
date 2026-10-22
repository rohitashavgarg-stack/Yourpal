# YourPal member app: developer handoff

The member app is Expo (SDK 57) with Expo Router and TypeScript. It runs on iOS, Android and the web (react-native-web, deployed to Vercel). This page explains the design system and the everyday commands. The rules every change follows are in `CLAUDE.md`.

## Structure

```
src/
  app/                    routes (Expo Router): every file is a screen, _layout.tsx files are navigators
  features/               feature code: containers that read app state and feed the patterns
  design-system/
    tokens/               colours (light and dark palettes, fixed, onDark, gradients), type, spacing, radius, shadows, motion
    primitives/           small building blocks: Button and IconButton, Card, Chip, Pill, Input, Sheet and SheetFooter, Snackbar, Stepper, ...
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

## Screenshots and the review page

The baselines are in `docs/visual-baseline/` (every screen, light and dark, 390 x 844 on web). The capture scripts need the web dev server on port 8082 and Microsoft Edge or Chrome.

```bash
npx expo start --web --port 8082                                    # in one terminal
node scripts/visual/capture.js .visual-current                      # every screen, both themes (about 10 minutes)
node scripts/visual/capture.js .visual-current --only=today,plans   # only some screens
node scripts/visual/review.js docs/visual-baseline .visual-current  # writes .visual-current/review.html
```

Open `.visual-current/review.html`: every changed screenshot with before, after and the diff (changed pixels in red), flagged ones first. Add `--all` to list unchanged screens too.

The same works for the other capture scripts and their baselines:
- `scripts/visual/capture-cards.js` with `docs/visual-baseline/cards`: the Today cards in every state.
- `scripts/visual/shots.js` with `docs/visual-baseline/shots`: sheets, onboarding steps, empty and error states.

After you have looked at every change and it is intended, refresh the baseline. For example, `node scripts/visual/check.js --screens=today --update`, or capture straight into `docs/visual-baseline`.

Known: the baselines were taken before the October Today redesign (budget card, meals card, week card, goal page), so those screens show as changed until the baseline is refreshed.

## Where to read more

- `CLAUDE.md`: the rules for every change.
- `docs/design-system-components.md`: the component index.
- `docs/coverage.md` and `docs/coverage-decisions.md`: what is still hand-built, and the near-matches that need a design decision.
- `docs/personalisation-gap.md`: which personalisation features are built, partial or missing.
- `docs/SESSION_HANDOFF.md` and `docs/PHASE2_HANDOFF.md`: product history and design decisions.
