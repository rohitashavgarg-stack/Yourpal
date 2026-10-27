# Handoff status

Checked on 26 Oct 2026 on branch `design-system-handoff`, after round 5 (see `docs/progress.md`). Each line was checked by running the command or opening the file or link. Light mode is out of scope by the designer's instruction, so nothing here covers it.

<!-- numbers:start -->
Numbers written by `scripts/publish.js` on 2026-10-27 11:55 from branch `experiment-blue-glass` at `66d0d8a`:

| Measure | Value |
|---|---|
| Typecheck | 0 errors |
| Lint | 0 errors, 674 warnings |
| New hard-coded values on changed lines | 0 |
| Library files | 45 (36 primitives, 9 patterns) |
| Storybook stories | 241 |
| Hand-built elements (outside the demo panel) | 88 (3 on purpose, 85 to build) |
| Dot-separator lines left | 233 in 73 files |
<!-- numbers:end -->

## What changed since the last status (23 Oct)

- **Expo SDK 58.** The app moved from SDK 57 to 58 (Expo 58.0.19, React Native 0.88, React 19.3, Expo Router 58). Expo Go on a phone only opens the latest SDK. Install with `npm install --legacy-peer-deps`. Details: `docs/HANDOFF.md`, "Running it".
- **New library component: FoodCard** (pattern, 44 library files now: 36 primitives, 8 patterns). Used by the Plans diet page, the meal log sheet, the quick log sheet and the swap sheet.
- **New Button kinds:** `glassAccent` (blue glass, "Start workout" on Plans) and `glassPrimary` (white glass, "Save meal").
- **Plans screen:** icon-only Workout and Diet tabs beside the heading; the Veg, Egg, Non-veg row separates the calorie card from the meals; the weekly line is a big number.
- **Not changed on purpose:** the dot separators (the designer guides them screen by screen) and light mode.

| # | Item | Status | Evidence | What is missing | Next step |
|---|---|---|---|---|---|
| 1 | Repo and branch | READY | Branch `design-system-handoff` pushed, working tree clean. Not merged into `main`, as asked. | | Open the PR when you decide. |
| 2 | Typecheck | READY | `npx tsc --noEmit`: 0 errors on SDK 58. | | |
| 3 | Lint | READY | `npx eslint .`: 0 errors, 669 warnings (62 inside `src/design-system`, none of them hard-coded values). `npm run lint:changed -- main`: 0 new hard-coded values. | The warnings (unused variables, hook dependencies). | Tidy later; they do not block. |
| 4 | Tokens | PARTIAL | Token files complete. 365 hard-coded values remain outside the library: 223 colours, 79 radii, 63 font sizes. Counted by folder in `docs/HANDOFF.md`; `lint:changed` stops new ones. | The 365 (left on purpose). | Move them to tokens one folder at a time, `src/features/today` first. |
| 5 | Components | READY | 44 library files (36 primitives, 8 patterns), each with a story, a doc and a row in `docs/design-system-components.md`. Left outside, with reasons: `docs/coverage-exceptions.md`. | | |
| 6 | Storybook | READY | `npm run build-storybook`: passes, 237 stories, 45 docs pages. Every story and the Coverage page opened with 0 errors (served from the build, dark). Live: https://yourpal-storybook.vercel.app. | A look at every story in light mode (out of scope). | |
| 7 | Coverage | READY | One count from `scripts/audit/hand-built.js`: **84 hand-built** outside the demo panel (3 on purpose, 81 to build). Shown the same in `docs/coverage.md` and the Storybook Coverage page. | | |
| 8 | Inner pages by group | PARTIAL | Per-group table in `docs/progress.md`: 81 elements still to build. | 81 hand-built elements. | Close Workout and Today first. |
| 9 | Screenshot review page | PARTIAL | `docs/review/index.html`: 181 screens, dark only, before and after. | About 11 images missing; the review images were taken before round 5 (Plans and the sheets look different now). Capture entries for the missing ones are in `scripts/visual/shots-list.js`. | Run `node scripts/visual/capture-all.js` in dark when you want the page refreshed. |
| 10 | Docs | READY | `HANDOFF.md`, `HANDOFF-INDEX.md`, `SCREEN-MAP.md` (regenerated, 51 screens), `design-system-components.md` (FoodCard and the glass kinds added), `FoodCard.md`, `Button.md`. | | |
| 11 | Developer rules | READY | `CLAUDE.md` rules; PR template; the lint rule is an error in `src/design-system` and for changed lines. | | |
| 12 | Handoff zip | READY | `npm run handoff` rebuilt after the last commit. | | Send it. |
| 13 | Open decisions | PARTIAL | None in the docs. The designer will decide the 247 dot-separator lines one screen at a time (`docs/copy-separators.md`). | The separator decisions. | Wait for the designer's guidance. |
| 14 | Accessibility and tap targets | PARTIAL | Library tap targets are 44 px or have a hit slop to 44. FoodCard: Swap and Skip are 44 px, the check and the menu button have a 44 px tap area, swipe and hold are also offered as screen-reader actions. | Not tested on a phone by the team that built it; swipe and hold in particular. | Test on an iPhone and an Android phone before release. |

## Summary

**READY 9** (1, 2, 3, 5, 6, 7, 10, 11, 12), **PARTIAL 5** (4, 8, 9, 13, 14), **NOT READY 0.**

Do first:

1. **Test on real phones** (iPhone and Android, Expo Go on SDK 58). Swipe, hold and the glass buttons have only been checked in the web version.
2. **Burn down the 365 hard-coded values and the 81 hand-built elements**, one folder at a time, Today first.
3. **Refresh the review page in dark** so it shows round 5.

## Known limits

- Previous-day food cards (view-only eaten, skipped) are supported by FoodCard, but the sample app only has today's data. Past days need a stored history from the backend (unlogged foods become skipped when the day ends).
- The Expo SDK 58 upgrade needs `--legacy-peer-deps` until Expo Router's optional `@expo/ui` peer is resolved upstream.
- The real orb and the gooey menu were tried and removed; previews only.
