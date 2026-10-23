# Handoff index

Every deliverable of the design-system handoff, where it is in the repo, and how to open it. Paths are from the repo root (inside the handoff zip, `docs/`, `src/design-system/docs/`, `src/design-system/tokens/` and `storybook-static/` are at the same paths). Branch: `design-system-handoff` (not merged into main).

| Deliverable | Path in the repo | How to open it, and its link |
|---|---|---|
| Tokens (colour light and dark, `fixed`, `onDark`, `gradients`, type, spacing, radius, shadows, motion) | `src/design-system/tokens/` | Read the files. Rules for using them: `CLAUDE.md`. Review notes: `docs/tokens-review.md` |
| Primitives (36): Txt, Row, FoodMark, CheckCircle, Tag, Ring, Beat, HeartIcon, Brand (GymLogoMark, PersonAvatar, PremiumBadge), Glass, TrendsButton, YourPalLogo, Wheel, Ruler, Button and IconButton, Card, Callout, ProgressBar and ProgressSegments, Option, Chip, Pill, Input (Field, NoteField), AmountStepper, Stepper, Sheet and SheetFooter, Snackbar, SubPage, ListCard, SectionLabel, IconBadge, StatusDot, MetaRow, Chevron, ScanBracket, Pressy, FadeIn | `src/design-system/primitives/` | In Storybook under Primitives |
| Patterns (7): GoalCard, BudgetCard, WorkoutCard, MealsCard, TrackerRow, WeekCard, Banner | `src/design-system/patterns/` | In Storybook under Patterns |
| Component docs (one page per component: purpose, props, states, do and don't, accessibility, copy rules) | `src/design-system/docs/<Name>.md` | Index: `docs/design-system-components.md` |
| Component index | `docs/design-system-components.md` | Open the file; links to every component page |
| Storybook (228 stories, every variant and state, Light / Dark toolbar switch, controls, usage snippets, Coverage page) | `.storybook/`, `src/design-system/stories/` | Local: `npm run storybook`, then http://localhost:6006. Static build: `npm run build-storybook`, files in `storybook-static/` (also in the handoff zip; serve the folder with any static server). Live: **https://yourpal-storybook.vercel.app** (Vercel project `yourpal-storybook`, free Hobby plan, public link, no login to view). Redeploy: `npm run deploy-storybook`. Details: `docs/DEPLOY-STORYBOOK.md` |
| Storybook Coverage page (what is in the library, what is still hand-built, what is hand-built on purpose) | `src/design-system/stories/Coverage.mdx`, data from `scripts/audit/coverage-storybook.js` | In Storybook, "Coverage" at the top of the sidebar |
| Review page (every screen, sheet, onboarding step and state, before and after, dark mode, links to the changes) | `docs/review/index.html`, screenshots in `docs/review/before/` and `docs/review/after/` | Double-click `docs/review/index.html`. Make it again: `docs/HANDOFF.md`, "Screenshots and the review page" |
| What changed on screen | `docs/review-changes.md` | Open the file; the review page links to its sections |
| Coverage: what is built from the library and what is not | `docs/coverage.md`, `docs/coverage-elements.md`, `docs/coverage-data.json`, `docs/design-system-audit.md` | Open the files. Regenerate: `node scripts/audit/coverage.js --json && node scripts/audit/coverage-md.js` |
| Near-matches and how each was resolved | `docs/coverage-decisions.md` | Open the file |
| Hand-built on purpose | `docs/coverage-exceptions.md` | Open the file |
| Goal card and budget card notes | `docs/goal-card.md`, `docs/budget-card.md` | Open the files |
| Personalisation gap (18 features marked Built, Partial or Missing, with files) | `docs/personalisation-gap.md` | Open the file |
| Rules for every change (also read by coding agents) | `CLAUDE.md`, `AGENTS.md` | Open the files |
| Pull request template | `.github/pull_request_template.md` | Appears when a PR is opened on GitHub |
| Lint: hard-coded colour, radius and font size is an error in `src/design-system` and for new lines in any changed file | `eslint.config.js`, `scripts/lint-changed.js` | `npm run lint`, `npm run lint:changed` |
| Screenshot capture scripts | `scripts/visual/capture-all.js` (runs `capture.js`, `capture-cards.js`, `shots.js`, `capture-flows.js`), `scripts/visual/review.js`, `scripts/visual/compare.js`, `scripts/visual/check.js` | `docs/HANDOFF.md` |
| Older pixel baselines (before the October Today redesign) | `docs/visual-baseline/` | Used by `compare.js` and `check.js` only |
| Developer handoff page (structure, find, add, run, Storybook, review page) | `docs/HANDOFF.md`, `README.md` | Open the files |
| Handoff package | `handoff/yourpal-design-system-handoff.zip` (not committed; made by `npm run handoff`) | Unzip; start with `HANDOFF-INDEX.md` (this file) |
| Progress log of the whole branch | `docs/progress.md` | Open the file |
| Deploy steps for Storybook (the ones that need a login) | `docs/DEPLOY-STORYBOOK.md` | Open the file |
