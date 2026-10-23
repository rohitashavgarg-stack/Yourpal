# Handoff status

Checked on 23 Oct 2026 on branch `design-system-handoff`, after round 4 (see `docs/progress.md`). Each line was checked by running the command or opening the file or link. Light mode is out of scope by your instruction, so nothing here covers it.

| # | Item | Status | Evidence | What is missing | Next step |
|---|---|---|---|---|---|
| 1 | Repo and branch | READY | Branch pushed, working tree clean. `main` (freeze fix, sticky Save meal) merged into it with no conflicts. Not merged into `main`, as asked. | | Open the PR when you decide. |
| 2 | Typecheck | READY | `npx tsc --noEmit`: 0 errors. | | |
| 3 | Lint | READY | `npx eslint .`: 0 errors, 657 warnings. In `src/design-system`: 0 errors and 0 hard-coded-value warnings (61 other warnings: unused variables, hook dependencies). `npm run lint:changed -- main`: 0 new hard-coded values. | The 61 library warnings. | Tidy later; they do not block. |
| 4 | Tokens | PARTIAL | Token files complete (colours, type, spacing, radius, shadows, motion; round 4 added `logoBlue`, `foodVeg`, `foodEgg`, `foodNonVeg`, `sand`, `goldInk`). 368 hard-coded values remain outside the library: 223 colours, 81 radii, 64 font sizes. Listed by folder in `docs/HANDOFF.md`; `lint:changed` stops new ones. | The 368 (left on purpose). | Move them to tokens one folder at a time, `src/features/today` first. |
| 5 | Components | READY | 43 library files (36 primitives, 7 patterns), each with a story, a doc and a row in `docs/design-system-components.md`. 14 shared components moved in this round. The ones left outside, with reasons, are in `docs/coverage-exceptions.md`. | | |
| 6 | Storybook | READY | `npm run build-storybook`: passes, 228 stories, 44 docs pages. All 228 stories and the Coverage page opened with 0 errors and 0 empty (served from the build, dark). Live at https://yourpal-storybook.vercel.app: redeployed, 228 stories. | A look at every story in light mode (out of scope). | |
| 7 | Coverage | READY | One count from `scripts/audit/hand-built.js` feeds `docs/coverage.md` and the Storybook Coverage page: **86 hand-built** outside the dev-only demo panel (3 on purpose, 83 to build; 21 more in the demo panel are not counted). `docs/coverage-exceptions.md` lists 4 on-purpose items plus the shared components kept outside the library. `docs/coverage-decisions.md`: 41 near-matches, 37 moved to the library, 4 exceptions. | | |
| 8 | Inner pages by group | PARTIAL | Per-group table in `docs/progress.md` (still to build): Today 12, Progress 11, Plans and food logging 15, Workout 5, Gym 7, Profile and settings 11, Onboarding and login 9, Bottom sheets 10, Modals and toasts 0, Empty, loading and error states 0, Shared components 3. | 83 elements still hand-built; two groups are at 0. | Close Workout and Today first (smallest). |
| 9 | Screenshot review page | PARTIAL | `docs/review/index.html` works: 181 screens, dark only, before and after. | About 11 images are missing (3 sheets, toast, rest timer, finish screen, streak broken, login errors, push banner, Today loading). Capture entries for them are in `scripts/visual/shots-list.js`; the push banner and loading skeleton need timing work. The review images were taken before this round's moves and are not refreshed. | Run `node scripts/visual/capture-all.js` in dark when you want the page refreshed. |
| 10 | Docs | READY | All eight docs exist and are current. Decisions checked in code and docs: goal never frozen or paused; no Pay or Resume for members; one banner and one snackbar; "See plan" everywhere (0 "View plan" left); comeback card is "Easy session", 20 min, "4 exercises", "Half your usual load", "Start easy session", "Not today"; the paused state shows only when the membership is paused, never on the goal. | | |
| 11 | Developer rules | READY | `CLAUDE.md` rules (updated for the paused state), PR template (checklist now asks for dark screenshots), `no-restricted-syntax` is an error in `src/design-system` and for changed lines. | | |
| 12 | Handoff zip | READY | `npm run handoff` rebuilt after the last commit: `handoff/yourpal-design-system-handoff.zip`. | The zip is not committed (gitignored). | Send it. |
| 13 | Open decisions | READY | No "needs my decision" left in the docs (`coverage.md` shows 0). The comeback card and "See plan" are decided and built. | | |
| 14 | Accessibility and tap targets | PARTIAL | `IconButton` announces disabled, `SectionLabel` is a header, `FadeIn` respects reduce motion. Library tap targets are 44 px or have a hit slop to 44 (the Stepper minus and plus buttons were the last: fixed). | Not tested on a phone. Expo Go and a device have never been run. | Run the app on a phone before release. |

## Summary

**READY 10** (1, 2, 3, 5, 6, 7, 10, 11, 12, 13), **PARTIAL 4** (4, 8, 9, 14), **NOT READY 0.**

Do first:

1. **Test on a phone** (Expo Go or a build). It is the one thing nobody has done.
2. **Burn down the 368 hard-coded values and the 83 hand-built elements**, one folder at a time, Today first. The rules already stop new ones.
3. **Refresh the review page in dark** with the 11 missing images when you want the page to match this round exactly.

## Not blockers, listed for your decision

- 249 lines of copy still use dot separators: `docs/copy-separators.md`.
- App-structure components stay outside the library on purpose (tab bar, screen shell, header): `docs/coverage-exceptions.md`.
- The comeback session itself is unchanged: the card now says 4 exercises and 20 minutes, but the session it starts is the old one.
