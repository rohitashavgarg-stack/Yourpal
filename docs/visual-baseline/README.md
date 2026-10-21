# Visual baseline

Screenshots of every screen in light and dark on web, taken before the Phase 3 component merges. Every later change is compared against these.

- Taken at commit `17c1095` (plus the `?theme=` hook in `src/lib/store.tsx`), 390 x 844, web, Edge headless.
- 108 images: `light/` and `dark/`, 54 each: 50 screens plus the bottom of the four tab screens (`<name>--bottom.png`).
- Signed in with `?signedin=1` (PT member, the demo defaults) except `welcome`, `login` and `onboarding`, which are signed out.
- Screens that need app state show what the app shows without it: `workout` has no running session, so it shows Today; `plans-edit` and similar redirect or show an empty state. That is the baseline for them too.
- The "tune" handle on the right edge is the demo panel handle; it is in every image on purpose.

## Re-run

```bash
npx expo start --port 8082 --web                                  # in one terminal
node scripts/visual/capture.js .visual-current                    # every screen, both themes (about 10 minutes)
node scripts/visual/capture.js .visual-current --only=today,plans # only the screens whose name contains a word (about 20 s each)
node scripts/visual/compare.js docs/visual-baseline .visual-current [--save-diff=.visual-diff]
```

`compare.js` counts pixels where any colour channel differs by more than 8 (of 255) and flags a screen when more than 0.3 percent of its pixels changed. Two runs of the same code give 0.00 percent, so any flagged screen is a real change.

Things that change by themselves and will show up: the quote and greeting wording rotate by the day of the month, so re-take the baseline after midnight. The `?theme=` and `?signedin=1` hooks are in `src/lib/store.tsx`.

## Screens that need a tap

`scripts/visual/capture-flows.js <outDir>` reaches three screens the plain capture cannot: the workout warm-up, the workout in progress (steppers in the set rows) and the plan editor's change-an-exercise sheet (row steppers). They are not in the baseline folder, so run it once before a change and once after, and compare the two folders with `compare.js`.

## The two Today cards in every state

`cards/` holds the goal card (all 9 states, the stale weigh-in overlay, and the flat goal-page header) and the Today calories card (5 states, plus its goal row in each of the 9 goal states), 25 images per theme. They are drawn alone on the developer page `/dev-cards` (`src/app/dev-cards.tsx`, redirects to Today in a production build) and captured with `scripts/visual/capture-cards.js`:

```bash
node scripts/visual/capture-cards.js .visual-cards
node scripts/visual/compare.js docs/visual-baseline/cards .visual-cards
```
