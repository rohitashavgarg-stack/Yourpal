# Design system handoff: progress

Branch: `design-system-handoff` (not merged into main). Resume with "Continue from docs/progress.md".

| Step | What | Status | Commit |
|---|---|---|---|
| 1a | Buttons: replace exact matches with Button | done (earlier pass, no new exact matches after re-audit) | e19a3fc |
| 1b | Cards: replace exact matches with Card | done (earlier pass, no new exact matches after re-audit) | 1e1271a |
| 1c | Icon buttons: replace exact matches with IconButton | done | 05bff48 |
| 2 | Storybook for web, light/dark toggle, 26 story files (128 stories), static build, docs/DEPLOY-STORYBOOK.md | done (all 128 stories open without errors; not deployed) | 3cb75d2 (tokens), 1e14461 (Storybook) |
| 3 | Component docs for every component, docs/design-system-components.md index | in progress: all 26 docs and the index are written, not reviewed or committed yet | |
| 4 | Handoff pack: CLAUDE.md rules, PR template, ESLint error rule, docs/HANDOFF.md | in progress: eslint.config.js and scripts/lint-changed.js written, not committed; CLAUDE.md, PR template, HANDOFF.md not started | |
| 5 | docs/personalisation-gap.md | in progress: written (0 Built, 9 Partial, 9 Missing), not reviewed or committed yet | |
| Final | Report | not started | |

**Step 1 done, ready for screenshots.**

**Paused after Step 2 at the designer's request: waiting for input before Step 3.**

Notes
- Commit 0c811d9 (IconBadge, StatusDot) and the capture tooling (scripts/visual) are kept.
- Step 2 needed two Storybook-only shims: require() of images and clips becomes an import, and expo-router is a no-op stand-in (.storybook/mocks/expo-router.tsx). The app is unchanged by them.
- ThemeProvider gained an optional  prop (Storybook pins light or dark); the app does not pass it.
