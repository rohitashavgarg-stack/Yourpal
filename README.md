# YourPal member app

The member app for a gym programme (Gold's Gym, member Ankit, Coach Vikram): Today, Plans, Progress and Gym tabs, workouts, meals, goals and check-in. React Native on Expo SDK 57 with Expo Router and TypeScript, for iOS, Android and the web (deployed to Vercel as a preview of the app).

## Run it

```bash
npm install
npx expo start                       # press i for the iOS simulator, a for Android, or scan the QR code with Expo Go
npx expo start --web --port 8082     # browser: a phone frame plus the demo controls panel on wide screens (open /?signedin=1)
npm run build:web                    # the static web build in dist/
```

## Design system

Everything visual is built from `src/design-system/`: tokens, primitives (Button, Card, Option, Sheet, ...) and patterns (GoalCard, WorkoutCard, MealsCard, ...). Look at it before building anything new.

```bash
npm run storybook                    # every component, every variant and state, light and dark, on http://localhost:6006
npm run build-storybook              # static files in storybook-static/
npm run deploy-storybook             # publish it to https://yourpal-storybook.vercel.app (needs `vercel login`)
```

Live Storybook: https://yourpal-storybook.vercel.app

- Component pages: `src/design-system/docs/<Name>.md`, listed in `docs/design-system-components.md`.
- Rules for every change (also read by coding agents): `CLAUDE.md`. Tokens only for colour, spacing, radius and type; add a variant instead of restyling a component.
- Checks before a PR: `npx tsc --noEmit`, `npm run lint`, `npm run lint:changed`.

## Review the screenshots

```bash
npx expo start --web --port 8082                                   # the branch to review
node scripts/visual/capture-all.js docs/review/after               # about 20 minutes, both themes
node scripts/visual/review.js docs/review/before docs/review/after # writes docs/review/index.html
```

`docs/review/index.html` shows every screen, sheet, onboarding step and state with before on the left and after on the right, and a light / dark switch. Rows that changed on purpose link to `docs/review-changes.md`. Details in `docs/HANDOFF.md`.

## Hand the design system to someone

```bash
npm run handoff                      # builds Storybook, writes handoff/yourpal-design-system-handoff.zip
```

The zip holds the Storybook build, the design-system docs and tokens, `docs/`, the review page and `docs/HANDOFF-INDEX.md`, the list of everything delivered and where it is.

## Where things live

- `src/app/` routes (Expo Router): `login`, `onboarding`, `(tabs)/` for Today, Plans, Progress and Gym, and the pushed pages.
- `src/features/` feature code: containers that read app state and feed the design-system patterns.
- `src/design-system/` `tokens/`, `primitives/`, `patterns/`, `stories/` (Storybook), `docs/` (one page per component), `_archive/` (retired components).
- `src/components/` older shared pieces; `ui.tsx` re-exports the primitives under their old names.
- `src/lib/` app state (`store.tsx`, `domain.tsx`), sample data (`data.ts`) and copy (`microcopy.ts`).
- `src/web/` the web phone frame and the demo controls panel (every screen registers its edge cases with `useScenarios`).
- `scripts/visual/` screenshot capture and the review page; `scripts/audit/` the coverage audit; `scripts/ship.sh` merge, push and wait for Vercel.
- `docs/` handoff, coverage, review, deploy and gap documents. Start with `docs/HANDOFF.md` and `docs/HANDOFF-INDEX.md`.
- `prototype/` the original HTML prototype (reference only, not bundled). `assets/` icon, splash, images.

## Docs

- `AGENTS.md` and `CLAUDE.md`: rules for coding agents working in the repo.
- `docs/HANDOFF.md`: structure, how to find and add a component, how to run the app, Storybook and the review page.
- `docs/HANDOFF-INDEX.md`: every deliverable with its path.
- `docs/SESSION_HANDOFF.md` and `docs/PHASE2_HANDOFF.md`: product history, decisions and design rules.
- `docs/DEPLOY.md` (the web preview) and `docs/DEPLOY-STORYBOOK.md` (Storybook, with the steps that need a Vercel login).
