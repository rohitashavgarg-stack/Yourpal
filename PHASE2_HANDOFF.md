# YourPal member app — Phase 2 handoff (for Claude Code)

You are continuing a React Native (Expo SDK 57, Expo Router, TypeScript) app for YourPal, a health and fitness app inside a gym programme ("Gold's Gym", member Ankit, Coach Vikram). Phase 1 is done and runs. Read this file fully, then read `AGENTS.md` and `README.md`. Do not trust memory for Expo APIs; check https://docs.expo.dev/llms.txt when unsure.

## Status
- DONE (Phase 1): design tokens (`src/theme/tokens.ts`, light + dark), Geist / Outfit fonts, Lucide icons, `src/components/ui.tsx` (Txt, Button, Card, Chip, Pill, Segmented, Field), bottom sheets + toasts (`Overlay.tsx`), floating pill tab bar that hides on scroll (`FloatingTabBar.tsx`), collapsing large titles (`TabScreen.tsx`), login (phone + OTP + join code, all error states), onboarding (7 steps), web phone frame with the edge-case panel OUTSIDE the phone (`src/web/WebFrame.tsx`), scenario registry (`useScenarios`).
- SHARED STATE ALREADY ADDED (if present): `src/lib/data.ts` (meals, food details, catalogue, workouts, plans, mock progress data) and `src/lib/domain.tsx` (DomainProvider / useDomain: meals log, workout session, check-in, time of day, plans, goal, membership, chat).
- TODO (Phase 2 = Today + Active workout; then Phase 3 Plans; Phase 4 Progress, Gym, Profile): the tab screens `src/app/(tabs)/*.tsx` are placeholders. The full HTML prototype in `reference/` is the source of truth for every screen, state and interaction. Port it faithfully.

## How to work
1. Open `reference/*.dc.html`. Markup is inside `<x-dc>`; logic is in `class Component` → `renderVals()`. Grep for the feature you are porting.
2. Build one area at a time, run `npx tsc --noEmit` and `npx expo start --web` (wide window shows the phone frame + edge-case panel).
3. Every screen registers its edge cases with `useScenarios({ title, rows, actions }, deps)`.
4. Use `npx expo install <pkg>` for any new package (never plain npm install).

## Phase 2 scope — Today
Order on the page: Updates card (only in the "With updates" variant) → Goal card (blue gradient, ring, tap opens Progress) → Trackers slider (water, weight, steps; heart rate / sleep / active energy when the wearable is connected, else a "Connect Health Connect" card) → Workout card → Meals card → This week card. Floating check-in bar above the tab bar.
- Workout card: dark card, same layout in every state (Now / late / In progress / Done / Rest day). Tiles "Planned 6:30 pm" and "You did it". NO Full / Quick / Low energy selector on the card: that choice lives only in the Start sheet. "Burned today N kcal" row at the bottom.
- Meals card: "Eaten today" tile (kcal vs 1,800, protein), 4 meals as an accordion with time capsules and status text. The next un-logged meal is open by default; ticking an item does not collapse it. Each item has its own small (28 px, 44 px hit area) checkbox. Tap a food name to open the food detail page. One "Ate something else" button (opens Scan / Write / Catalogue sheet) plus a real "Skip meal" button. Scan = plate photo only (no barcode). Replace flow for a planned item.
- Food detail page `/food`: macros, expandable micronutrients, ingredients, recipe, Replace / Mark as eaten.
- Check-in: manual only, only inside the 20 m area, full-page map `/checkin` (not a sheet), location-off fallback.
- This week: 7-day strip; past day → summary sheet; future day → Plans.
- Updates: ONE compact card with pager, "See all" sheet.
- Active workout `/workout`: warm-up list → main sets → cool-down. One line per set with a checkbox and inline steppers; timed sets get a timer; warm-up sets show a "Warm-up" pill (never a bare "W"); one ⋯ menu for Swap / Ask coach / Form tips / Skip; "Skip to next" quiet text until all sets are done, then a blue "Next: …"; "Finish" pill top right with a confirm when sets are open; "+ Add set"; rest timer panel; finish screen with confetti and stats.

## Design rules (agreed with the designer, Rohitashav)
- Health & fitness feel, not a "gym app": light-first, blue accent #2F6BEA, blue gradient hero cards, dark cards with a soft glow, white data cards. Big light-weight titles, outline chips with Lucide icons, small black pill buttons, thin rings and bars. Mint only for live states.
- iOS feel: springs, press scale, haptics, drag-to-dismiss sheets, undo toasts, swipe and long-press where the prototype has them. 44 px minimum tap targets.
- Membership is VIEW-ONLY in the app. No QR check-in (location only, manual). Exercises can be reps, time, or weight based. Diet items show veg / egg / non-veg marks.
- Treat the designer as a colleague: push back when something is not the best UX.
- Every screen must work in dark mode and on web + native.

## Shared building blocks (reference)

- `@/components/ui`: Txt (v: display|title|headline|body|label|caption|mono|number; muted; color), Pressy (pressable with iOS scale + haptic), Button (kind primary|accent|secondary|ghost|white|outline; small; icon), Card (dark prop for dark cards), Chip (outline chip, tone default|good|warn|live, onDark), Pill (selectable), Segmented (sliding-thumb segmented control), Field (text input, prefix, error), Row.
- `@/components/Overlay`: `const { openSheet, closeSheet, toast } = useOverlay()`; openSheet(<Content/>, {label}) shows a draggable bottom sheet; closeSheet(after?) ; toast(msg, { undo }).
- `@/components/TabScreen`: tab page with large collapsing title + hides the floating nav on scroll. Props: title, header?, compactTitle?. Children go in a padded scroll with gap 12. Tabs have 130px bottom padding for the floating nav.
- For full-screen pushed pages (not tabs) build your own header: back/close button (44×44 round, surface2), title; use useSafeAreaInsets for top padding; ScrollView content.
- `@/theme/ThemeProvider`: `const { c, isDark } = useTheme()` — palette tokens in src/theme/tokens.ts (bg, surface, surface2, surface3, ink, muted, line, chipLine, accent, accentText, accentSoft, good, goodSoft, warn, warnSoft, tNutri/cNutri, tAct/cAct, tHeart/cHeart, tSleep/cSleep, tWater/cWater, live, heroFrom/heroMid/heroTo, dark). `font` (regular, medium, semibold, bold, display, displayBold, mono, monoBold). `spring` (snappy, soft, bouncy). NEVER hardcode light-only colours; everything must look right in dark mode.
- `@/lib/haptics`: haptic.tap/light/medium/success/error.
- `@/lib/store`: `useStore()` → state.profile (name 'Ankit', goal, diet…), state.sc.member ('Regular'|'PT member'). `useScenarios({ title, rows: [{label, options, value, onPick}], actions: [{label, run}] }, deps)` registers the edge-case panel rows for the screen (shown OUTSIDE the phone on web). Every screen you build must register its edge cases this way.
- `@/lib/domain`: `const { d, set } = useDomain()` shared state (meals, workout session, check-in, time of day, plans, goal, membership, chat…). Helpers: nowMin, mealLog, itemNow, totals, workoutState, wkDoneInfo, burned, useMeals(). Read the file first.
- `@/lib/data`: MEALS, FOOD_DB (macros, micros, ingredients, recipe), CATALOG, parseFood, SCAN_RESULT, SWAPS, legDay(), WARMUP, COOLDOWN, basePlans(), WEEK, TODAY_IDX, LIBRARY, WEIGHT_TREND, LIFTS, ASSESSMENTS, fmtT, dur, KCAL_TARGET, MACRO_TARGET.
- Contracts between builders (fill in if you own it, import if you don't):
  - `@/features/workout/StartSheet` → `StartWorkoutSheet({ onStarted? })` (Workout builder owns)
  - `@/features/today/QuickLogSheet` → `QuickLogSheet({ mealId, mode?: 'scan'|'write'|'cat', replaceIdx? })` (Today builder owns)
  - `@/features/shell/Switcher` → `ProgrammeSwitcherSheet()` (Profile builder owns)
  - Routes: `/workout` (Workout builder), `/food?mid=bf&k=0&extra=0` (Today builder: food detail page), `/checkin` (Today builder: full-page map), `/profile`, `/notifications`, `/goal` (Profile builder), `/plans/...` (Plans builder), `/progress/...`, `/gym/...` (Progress/Gym builder).


## Overrides to the reference prototype (the app wins over reference/)

- Workout card on Today: NO Full / Quick / Low energy selector. The card shows only the workout and its Start button. The version choice lives only in the Start sheet. reference/Prototype.dc.html still shows the old tiles; do not copy them.

## Motion and text rules (apply to every new screen)

- Screen and card entering/exiting: no springs, bounce, overshoot or wiggle. Use a plain short fade (max 150-200 ms, ease-out, optional tiny slide, no overshoot). All other animations (press scale, sheet drag, tab pill, toasts, progress) stay as they are.
- Every `fontSize` needs a `lineHeight` of about 1.3x (34→44, 28→37, 17→25, 15→23, 13→19, 12→18). Geist crops at the top when lineHeight is tight. Prefer the `Txt` variants in `src/components/ui.tsx`; for raw `Text`/`Animated.Text` set lineHeight yourself.
