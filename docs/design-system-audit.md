# YourPal design-system audit

## Final counts (end of the developer handoff)

| Measure | Count |
|---|---|
| Hand-built elements left | **84** outside the dev-only demo panel, 3 of them on purpose, so 81 still to build (222 at the first audit, 216 after the first handoff round, 179 after the near-match round, 152 after round 3; the earlier "95" included 7 elements of the demo panel and was not the same count as the Storybook page; one script, `scripts/audit/hand-built.js`, now gives the number for `docs/coverage.md` and the Storybook Coverage page) |
| Library components | **44** `.tsx` files: 36 in `src/design-system/primitives/` (22 at the end of round 3, plus 14 shared components moved in round 4), 8 in `src/design-system/patterns/` (FoodCard added in round 5) |
| Near-matches resolved | **41**: 37 use the library, 4 stay hand-built with a reason (`docs/coverage-exceptions.md`; 3 are in the app, 1 in the demo panel) |
| Added after that | Callout (15 notices and soft panels), ProgressBar and ProgressSegments (10 bars), IconBadge and StatusDot adopted (61 tiles, 4 dots) |

Hand-built elements by kind (the 84 in `docs/coverage.md` and on the Storybook Coverage page, web demo panel left out):

| Kind | Count |
|---|---|
| button or pill | 28 |
| icon badge | 20 |
| card | 15 |
| bar | 9 |
| chip | 7 |
| input | 5 |
| icon button | 2 |
| **Total** | **86** |

The web-only demo panel (`src/web/`) has 21 more elements. They are not counted anywhere: it is dev tooling, not the app. Run `npm run audit:coverage` to regenerate the number everywhere.

The rest of this file is the original audit, unchanged.

Read-only audit of the repository at the time of writing. No code was changed. Every number below comes from a script run over `src/` (regex counts over `.ts` and `.tsx`, CRLF normalised), so counts are exact for what the patterns match and approximate for what a human would call "the same thing". The method and its limits are listed at the end. Anything that could not be settled from the code is under **Questions**.

## Contents
1. Stack
2. Component inventory
3. Hard-coded values
4. Five components with the most duplication
5. Proposed `/design-system` structure
6. Questions
7. Method and limits
8. After phase 2 (tokens): before and after
Appendix A: every component. Appendix B: every hard-coded colour.

## 1. Stack

| Item | Finding | Evidence |
|---|---|---|
| Framework | Expo SDK 57 (`expo ~57.0.26`), React 19.2.3, React Native 0.86.3, TypeScript | `package.json` |
| Styling approach | Inline style objects on RN components. No styling library. `StyleSheet.create` is used 0 times; `style={{` appears 2,403 times in 117 files | grep over `src/`; no NativeWind, styled-components or Tailwind in `dependencies` |
| Theming | Two palettes (`light`, `dark`) in `src/theme/tokens.ts`, served by `ThemeProvider` / `useTheme()` returning `{ c, isDark }`. The mode comes from the store (`System`, `Light`, `Dark`) plus `useColorScheme` | `src/theme/ThemeProvider.tsx`; `useTheme()` is called 251 times in 100 files |
| Token files | `src/theme/tokens.ts` (palettes, `radius`, `space`, `font`, `spring`), `src/theme/motion.ts` (`fade`, `fadeOut`), `src/theme/ThemeProvider.tsx` | The palette has 33 keys per mode |
| Typography | Geist (body, 300 to 700), Outfit (display, 600 and 700), Geist Mono (500, 600), through `font.*`. Text goes through `Txt` with 8 variants (`display`, `title`, `headline`, `body`, `label`, `caption`, `mono`, `number`) | `src/theme/tokens.ts`, `src/components/ui.tsx` |
| Navigation | Expo Router, file based. 54 files in `src/app/`; four tabs (`index`, `plans`, `progress`, `gym`) with a custom `FloatingTabBar`; stack screens for goal, workout, food, check-in, profile, gym and plans sub pages | `src/app/(tabs)/_layout.tsx` |
| Web support | Yes. `react-native-web` is installed, `app.json` sets `web.bundler: "metro"` and `output: "single"`, `vercel.json` builds with `expo export --platform web`. `src/web/` holds a phone frame and a demo control panel that only appear on web | `app.json`, `vercel.json`, `src/web/WebFrame.tsx` |
| Icons | Lucide, imported one by one through `src/lib/icons.ts` | `src/lib/icons.ts` |
| Motion | Reanimated 4. `spring` presets in `tokens.ts`; a plain 180 ms fade for entering (`fade()`) | `src/theme/motion.ts` |
| Shared UI | `src/components/ui.tsx` (Txt, Pressy, Button, Card, Chip, Pill, Segmented, Field, NoteField, Row, hairline) and `src/components/bits.tsx` (foodTypeLabel, FoodMark, CheckCircle, Skeleton, Tag, PillBtn, Ring, Beat, Glow, HeartIcon, RoundBtn, popIn, UnitPill) | export lists read from the files |
| Size | 181 source files, 19,528 lines. By folder: src/app 54, src/components 14, src/features 94, src/lib 14, src/theme 3, src/web 2 | script count |
| Feature folders | today (23), workout (12), plans (11), progress (9), shell (7), checkin (5), goalv2 (5), streak (5), chat (3), gym (3), onboarding (3), reminders (3), trackers (3), body (1), coach (1) | files per folder under `src/features/` |
| Existing design guidance | `.claude/skills/yourpal-mobile-ui` (design rules for this repo) and `docs/PHASE2_HANDOFF.md` list the intended primitives and rules. `radius` and `space()` exist in `tokens.ts` but are barely used (see section 3) | files present |

## 2. Component inventory

**413 components** were found (a function or arrow component starting with a capital letter whose body contains JSX). The full list, with where each is defined and used, is in Appendix A. Summary:

| Where defined | Components |
|---|---|
| `src/components/` (shared) | 47 |
| `src/features/` | 220 |
| `src/app/` (screens and screen-local pieces) | 125 |
| Other (`src/web`, `src/lib`) | 21 |

### 2.1 The shared primitives and how much they are used

| Component | Defined | JSX uses | Files using it |
|---|---|---|---|
| `Txt` | `components/ui.tsx:21` | 1077 | 96 |
| `Pressy` | `components/ui.tsx:32` | 190 | 64 |
| `Button` | `components/ui.tsx:50` | 131 | 56 |
| `Card` | `app/goal-detail.tsx:26`<br>`components/ui.tsx:75` | 60 | 23 |
| `Chip` | `components/ui.tsx:88`<br>`features/today/GoalCards.tsx:66` | 20 | 8 |
| `Pill` | `components/ui.tsx:101` | 40 | 19 |
| `Segmented` | `components/ui.tsx:117` | 4 | 4 |
| `Field` | `components/ui.tsx:143` | 18 | 13 |
| `Row` | `components/ui.tsx:189` | 271 | 64 |
| `Tag` | `components/bits.tsx:64` | 28 | 18 |
| `CheckCircle` | `components/bits.tsx:30` | 11 | 8 |
| `FoodMark` | `components/bits.tsx:18` | 13 | 8 |
| `Skeleton` | `components/bits.tsx:55` | 12 | 2 |
| `PillBtn` | `components/bits.tsx:73` | 9 | 6 |
| `RoundBtn` | `components/bits.tsx:123` | 23 | 14 |
| `Ring` | `components/bits.tsx:88` | 3 | 3 |
| `UnitPill` | `components/bits.tsx:143` | 2 | 1 |

### 2.2 How much UI bypasses the primitives

| Pattern | Lines | Files | Example locations |
|---|---|---|---|
| `<Txt>` (the text primitive) | 1011 | 96 |  |
| `<Txt>` with `v=` variant | 254 | 63 |  |
| `<Txt>` that also sets its own `fontSize` on the same line | 660 | 95 | app/(tabs)/gym.tsx:35, app/(tabs)/gym.tsx:48, app/(tabs)/gym.tsx:49 |
| Raw `<Text>` (not the primitive) | 44 | 10 | components/bits.tsx:67, components/bits.tsx:81, components/bits.tsx:152 |
| `<Card>` (primitive) | 60 | 23 |  |
| Inline container with `backgroundColor: c.surface` and a radius from 18 to 32 on the same line | 67 | 39 | app/(tabs)/gym.tsx:33, app/(tabs)/plans.tsx:164, app/exercise-search.tsx:72 |
| Inline container with `backgroundColor: c.surface2` and a radius of 12 or more on the same line | 45 | 27 | app/(tabs)/plans.tsx:147, app/(tabs)/progress.tsx:117, app/(tabs)/progress.tsx:135 |
| `<Button>` (primitive) | 130 | 56 |  |
| Inline ink-coloured pill or button (`backgroundColor: c.ink`, radius 14 or more) | 5 | 5 | components/Overlay.tsx:158, components/ui.tsx:127, features/today/ForYou.tsx:164 |
| `<Pressy>` with its own `backgroundColor` on the same line | 22 | 12 | app/(tabs)/plans.tsx:51, app/food.tsx:102, app/gym/chat.tsx:116 |
| `<CheckCircle>` (primitive) | 11 | 8 |  |
| Inline green circle (`backgroundColor: c.good`, radius 6 to 20) | 6 | 4 | app/(tabs)/plans.tsx:77, app/plans/history.tsx:29, features/plans/WorkoutPlan.tsx:149 |
| Dashed circles (`borderStyle: 'dashed'`) | 16 | 16 | app/(tabs)/plans.tsx:78, app/food.tsx:150, app/goal-detail.tsx:110 |
| `<Chip>` / `<Pill>` / `<Tag>` | 20 / 40 / 28 |  | three similar primitives |
| `<LinearGradient>` | 34 | 22 |  |
| `<BlurView>` | 6 | 4 |  |
| Shadow written inline (`shadowOpacity` or `boxShadow`) | 33 | 23 | app/checkin.tsx:108, app/checkin.tsx:119, app/food.tsx:89 |
| `cardShadow()` helper | 25 | 13 | defined in `features/progress/parts.tsx` |
| `entering={fade(` (the plain fade) | 108 | 50 |  |
| `openSheet(` calls | 65 | 33 |  |
| `toast(` calls | 91 | 48 |  |

### 2.3 Components defined more than once under the same name

| Name | Definitions | Total JSX uses | Where |
|---|---|---|---|
| `Card` | 2 | 60 | `app/goal-detail.tsx:26`<br>`components/ui.tsx:75` |
| `SubPage` | 2 | 29 | `features/progress/parts.tsx:17`<br>`features/shell/parts.tsx:22` |
| `ListCard` | 3 | 24 | `features/plans/WorkoutPlan.tsx:28`<br>`features/progress/parts.tsx:113`<br>`features/shell/parts.tsx:94` |
| `Enter` | 2 | 22 | `app/(tabs)/gym.tsx:22`<br>`app/(tabs)/index.tsx:44` |
| `Chip` | 2 | 20 | `components/ui.tsx:88`<br>`features/today/GoalCards.tsx:66` |
| `Label` | 4 | 18 | `app/coach.tsx:16`<br>`app/goal-detail.tsx:30`<br>`app/progress/streaks.tsx:19`<br>`features/shell/parts.tsx:104` |
| `E` | 2 | 17 | `features/plans/DietPlan.tsx:30`<br>`features/plans/WorkoutPlan.tsx:26` |
| `Title` | 2 | 13 | `app/onboarding.tsx:209`<br>`features/today/WorkoutCard.tsx:46` |
| `Shell` | 3 | 10 | `app/_layout.tsx:158`<br>`features/today/GoalCards.tsx:44`<br>`features/today/WorkoutCard.tsx:72` |
| `Stepper` | 3 | 8 | `app/onboarding.tsx:249`<br>`features/plans/parts.tsx:103`<br>`features/workout/SetRow.tsx:18` |
| `Bracket` | 2 | 8 | `app/plans/log.tsx:33`<br>`features/today/QuickLogSheet.tsx:31` |
| `Dot` | 3 | 7 | `app/gym/chat.tsx:31`<br>`features/today/ForYou.tsx:179`<br>`features/today/WeekCard.tsx:43` |
| `DateSheet` | 3 | 6 | `features/body/BodyLog.tsx:153`<br>`features/goalv2/FinishBy.tsx:35`<br>`features/progress/TrendUI.tsx:96` |
| `Segments` | 2 | 5 | `features/today/GoalTickCard.tsx:48`<br>`features/trackers/Widgets.tsx:61` |
| `Glow` | 3 | 4 | `app/welcome.tsx:15`<br>`components/bits.tsx:111`<br>`features/today/GoalTickCard.tsx:30` |
| `SwapSheet` | 2 | 4 | `features/plans/Sheets.tsx:217`<br>`features/workout/WorkoutSheets.tsx:67` |
| `Marker` | 2 | 4 | `features/today/GoalStrip.tsx:50`<br>`features/today/GoalTickCard.tsx:58` |
| `GoalTile` | 2 | 3 | `app/onboarding.tsx:289`<br>`app/profile/index.tsx:137` |
| `Bar` | 2 | 3 | `features/progress/TrendUI.tsx:142`<br>`features/today/WeekCard.tsx:48` |
| `Item` | 2 | 2 | `app/profile/help.tsx:21`<br>`components/Wheel.tsx:13` |
| `Chevron` | 2 | 2 | `features/plans/DietPlan.tsx:224`<br>`features/today/MealsCard.tsx:37` |
| `Journey` | 2 | 2 | `features/today/GoalStrip.tsx:68`<br>`features/today/GoalTickCard.tsx:76` |
| `MembershipCard` | 2 | 1 | `app/(tabs)/gym.tsx:24`<br>`features/today/PaymentBanner.tsx:36` |
| `Progress` | 2 | 1 | `app/(tabs)/progress.tsx:177`<br>`app/onboarding.tsx:197` |
| `Welcome` | 2 | 1 | `app/onboarding.tsx:218`<br>`app/welcome.tsx:163` |
| `Trackers` | 2 | 1 | `app/profile/trackers.tsx:9`<br>`features/today/Trackers.tsx:338` |
| `ICONS` | 2 | 0 | `app/progress/streaks.tsx:17`<br>`components/FloatingTabBar.tsx:44` |
| `GoalStrip` | 2 | 0 | `features/today/ForYou.tsx:34`<br>`features/today/GoalStrip.tsx:91` |

Same name does not always mean same thing. `Glow` is three unrelated components (a pulsing dot in `bits.tsx`, a radial background in `GoalTickCard.tsx`, a welcome-screen background in `welcome.tsx`). `Label` is four text styles. Section 4 looks at which of these are real copies.

### 2.4 Families of near-duplicates (grouped by the last word of the name)

| Family (last word) | Components | Total JSX uses | Names (up to 12) |
|---|---|---|---|
| Sheet | 36 | 64 | `QuickLogSheet`, `DateSheet`, `SwapSheet`, `WaterSheet`, `FlagSheet`, `LibrarySheet`, `PhotoSheet`, `UndoEatenSheet`, `ResetSheet`, `LogoutSheet`, `StepsSheet`, `HealthSheet` |
| Card | 28 | 128 | `Card`, `ListCard`, `PCard`, `PanelCard`, `GoalTickCard`, `WaterCard`, `NoPlanCard`, `TodayBudgetCard`, `WeightCard`, `WorkoutCard`, `MembershipCard`, `BreakCard` |
| Step | 17 | 14 | `GoalStep`, `FacilityStep`, `ExpStep`, `SchedStep`, `AgeStep`, `TargetStep`, `BuildingStep`, `HeightStep`, `WeightStep`, `BasicsStep`, `ConsentStep`, `ReadyStep` |
| Row | 12 | 319 | `Row`, `ListRow`, `MenuRow`, `LineRow`, `InfoRow`, `BodyRow`, `MealRow`, `ItemRow`, `DragRow`, `MissedRow`, `ClipRow`, `SetRow` |
| Bar | 9 | 17 | `GrowBar`, `MacroBar`, `Bar`, `RangeBar`, `PlayBar`, `FloatingTabBar`, `PillBar`, `CheckInBar`, `JourneyBar` |
| Tile | 8 | 24 | `WTile`, `Tile`, `GoalTile`, `ExTile`, `StepsTile`, `PhotoTile`, `ThemeTile`, `WeekTile` |
| Dot | 7 | 15 | `Dot`, `LiveDot`, `HrDot`, `EnergyDot`, `WaterDot`, `WeightDot`, `SleepDot` |
| Btn | 6 | 40 | `RoundBtn`, `PillBtn`, `SmallBtn`, `StepBtn`, `Btn`, `StarBtn` |
| Provider | 6 | 7 | `OverlayProvider`, `NavHideProvider`, `DomainProvider`, `StoreProvider`, `ScenarioRegistryProvider`, `ThemeProvider` |
| Face | 6 | 7 | `Face`, `CurrentFace`, `RulerFace`, `DotFace`, `BarsPlusFace`, `BarsFace` |
| Chip | 5 | 28 | `Chip`, `SwitchChip`, `StatusChip`, `ActionChip`, `StreakChip` |
| Screen | 5 | 7 | `TabScreen`, `BodyScreen`, `FinishScreen`, `WeightScreen`, `HeightScreen` |
| Ring | 5 | 8 | `Ring`, `MacroRing`, `KcalRing`, `WeekRing`, `GoalRing` |
| Line | 5 | 6 | `DrawLine`, `ScanLine`, `DashedLine`, `StreakLine`, `GoalLine` |
| Plan | 5 | 3 | `DietPlan`, `LockedPlan`, `WorkoutPlan`, `EditPlan`, `ComebackPlan` |
| Detail | 5 | 0 | `FoodDetail`, `GoalDetail`, `ExerciseDetail`, `LiftDetail`, `MetricDetail` |
| E | 4 | 17 | `E`, `TILE`, `STYLE`, `NAME` |
| Mock | 4 | 1 | `StatusBarMock`, `TodayMock`, `WorkoutMock`, `ProgressMock` |

A family is only a hint that several components may overlap. It does not prove they do. The ones with different jobs and similar names (for example `Sheet` content screens) are expected.

### 2.5 Components with no `<Name` usage found

95 of 413 components have no `<Name ...>` in the source. Many are screens (default exports used by Expo Router) or components rendered through a variable or `createElement`. The script cannot tell those from dead code, so this is a list to check, not a list to delete. It is in Appendix A (uses = 0).

## 3. Hard-coded values

Counts exclude `src/theme/tokens.ts` itself. "Token" means the value equals a value in `light` or `dark` in `tokens.ts`.

### 3.1 Colours

| Measure | Value |
|---|---|
| Distinct hex colours | 238 (659 uses) |
| Distinct `rgb()` / `rgba()` colours | 83 (207 uses) |
| Hex colours whose value equals a palette token | 13 of 238 (93 of 659 uses) |
| Style lines that set `color`, `backgroundColor` or `borderColor` to a literal | 228 lines in 44 files |
| Style lines that set them from the theme (`c.something`) | 467 lines in 88 files |
| `isDark ? … : …` branches in components | 74 lines in 31 files (each is a place where the dark value is chosen by hand) |

Top 40 hex colours (all are in Appendix B):

| Hex | Uses | Files | Token with this value |
|---|---|---|---|
| `#FFF` | 209 | 50 |  |
| `#FFFFFF` | 36 | 17 | `surface`, `accentInk`, `accentInk` |
| `#2F6BEA` | 22 | 15 | `accent`, `heroFrom`, `heroFrom` |
| `#0B0E14` | 19 | 9 | `dark`, `dark` |
| `#101828` | 17 | 13 |  |
| `#000` | 13 | 9 |  |
| `#F0692C` | 9 | 3 |  |
| `#5CC2E6` | 7 | 6 |  |
| `#0B0B0D` | 7 | 3 |  |
| `#1B3FB8` | 6 | 3 |  |
| `#3E8FEA` | 5 | 5 |  |
| `#FF8A3D` | 5 | 3 |  |
| `#FF8A96` | 5 | 4 |  |
| `#7CF0C8` | 5 | 4 | `live`, `live` |
| `#0C307E` | 5 | 2 |  |
| `#3478F6` | 4 | 2 |  |
| `#06150E` | 4 | 3 |  |
| `#F4F6FA` | 4 | 4 |  |
| `#B5543C` | 4 | 2 |  |
| `#FF9A4D` | 4 | 2 |  |
| `#C9D1DD` | 4 | 2 |  |
| `#F4F4F6` | 3 | 2 |  |
| `#6FA0FF` | 3 | 3 |  |
| `#8A9BFF` | 3 | 3 |  |
| `#3346E8` | 3 | 3 |  |
| `#F3F4F6` | 3 | 3 |  |
| `#1B2440` | 3 | 1 |  |
| `#F2B35B` | 2 | 2 | `warn` |
| `#0B0F16` | 2 | 2 |  |
| `#E9E4DA` | 2 | 2 |  |
| `#F7F3EC` | 2 | 2 |  |
| `#8C3B2A` | 2 | 2 |  |
| `#FFFDF6` | 2 | 2 |  |
| `#D9A45A` | 2 | 2 |  |
| `#F5B301` | 2 | 2 |  |
| `#3A2A00` | 2 | 2 |  |
| `#161B26` | 2 | 2 |  |
| `#2B2118` | 2 | 1 |  |
| `#D4A45C` | 2 | 1 |  |
| `#E2B970` | 2 | 1 |  |

Obvious same-value pairs: `#FFF` (209) and `#FFFFFF` (36) are the same colour written two ways; `#000` and its long form likewise. In the palette, `surface` is `#FFFFFF` in light mode.

Near-duplicate colours (every channel within 8 of another used colour; the pairs with the most combined uses):

| Colour A | Uses | Colour B | Uses | Max channel gap |
|---|---|---|---|---|
| `#0B0E14` | 19 | `#0B0B0D` | 7 | 7 |
| `#2F6BEA` | 22 | `#3563F2` | 1 | 8 |
| `#0B0E14` | 19 | `#06150E` | 4 | 7 |
| `#0B0E14` | 19 | `#0B0F16` | 2 | 2 |
| `#0B0E14` | 19 | `#0D1119` | 1 | 5 |
| `#0B0E14` | 19 | `#111` | 1 | 6 |
| `#0B0E14` | 19 | `#0F1218` | 1 | 4 |
| `#0B0E14` | 19 | `#0B0C0F` | 1 | 5 |
| `#0B0E14` | 19 | `#0A0C12` | 1 | 2 |
| `#0B0E14` | 19 | `#07130F` | 1 | 5 |
| `#0B0E14` | 19 | `#0E1116` | 1 | 3 |
| `#0B0E14` | 19 | `#0C0E13` | 1 | 1 |
| `#0B0E14` | 19 | `#12151C` | 1 | 8 |
| `#101828` | 17 | `#161B26` | 2 | 6 |
| `#101828` | 17 | `#171B26` | 1 | 7 |
| `#101828` | 17 | `#141130` | 1 | 8 |
| `#101828` | 17 | `#171A22` | 1 | 7 |
| `#0B0B0D` | 7 | `#111` | 1 | 6 |
| `#0B0B0D` | 7 | `#0B0C0F` | 1 | 2 |
| `#0B0B0D` | 7 | `#0A0C12` | 1 | 5 |
| `#0B0B0D` | 7 | `#07130F` | 1 | 8 |
| `#0B0B0D` | 7 | `#0C0E13` | 1 | 6 |
| `#1B3FB8` | 6 | `#1D46B5` | 1 | 7 |
| `#0C307E` | 5 | `#13327A` | 2 | 7 |
| `#F4F6FA` | 4 | `#F4F4F6` | 3 | 4 |

Top 25 `rgba()` colours:

| Value | Uses | Files | Token |
|---|---|---|---|
| `rgba(255,255,255,0.22)` | 12 | 8 |  |
| `rgba(255,255,255,0.8)` | 12 | 5 |  |
| `rgba(255,255,255,0.75)` | 12 | 6 |  |
| `rgba(255,255,255,0.6)` | 9 | 6 |  |
| `rgba(255,255,255,0.7)` | 8 | 7 |  |
| `rgba(255,255,255,0.1)` | 7 | 6 |  |
| `rgba(255,255,255,0.85)` | 7 | 5 |  |
| `rgba(255,255,255,0.9)` | 6 | 6 |  |
| `rgba(255,255,255,0.25)` | 6 | 4 |  |
| `rgba(255,255,255,0.16)` | 6 | 5 |  |
| `rgba(255,255,255,0.12)` | 6 | 3 |  |
| `rgba(255,138,61,0.16)` | 5 | 4 |  |
| `rgba(0,0,0,0.6)` | 5 | 4 | `scrim` |
| `rgba(255,255,255,0.5)` | 4 | 4 |  |
| `rgba(255,255,255,0.14)` | 4 | 4 |  |
| `rgba(255,255,255,0.2)` | 4 | 4 |  |
| `rgba(11,14,20,0.72)` | 4 | 2 |  |
| `rgba(0,0,0,0.55)` | 3 | 3 |  |
| `rgba(255,255,255,0.3)` | 3 | 3 |  |
| `rgba(255,255,255,0.10)` | 3 | 3 |  |
| `rgba(255,255,255,0.28)` | 3 | 2 |  |
| `rgba(0,0,0,0)` | 3 | 3 |  |
| `rgba(255,255,255,0.55)` | 3 | 3 |  |
| `rgba(255,255,255,0.4)` | 3 | 3 |  |
| `rgba(255,255,255,0.18)` | 3 | 3 | `chipLine` |

### 3.2 Font families

| Style | Uses |
|---|---|
| `font.semibold` | 269 |
| `font.medium` | 115 |
| `font.display` | 57 |
| `font.regular` | 48 |
| `font.displayBold` | 33 |
| `font.bold` | 9 |
| `font.mono` | 7 |
| `font.monoBold` | 6 |
| `font.light` | 5 |
| A string literal font name (`'Geist…'`) | 0 |

Font families are used through `font.*` everywhere; no literal family names were found. The `fontFamily` lines that show an expression (for example `on ? font.semibold : font.medium`) still use tokens.

### 3.3 Font sizes

| fontSize | Uses | Files | Matches a `Txt` variant |
|---|---|---|---|
| 13 | 163 | 65 | label / mono |
| 14 | 148 | 66 |  |
| 12 | 100 | 47 | caption |
| 15 | 50 | 35 | body |
| 11 | 34 | 22 |  |
| 17 | 28 | 17 | headline |
| 16 | 24 | 18 |  |
| 22 | 24 | 19 |  |
| 10 | 21 | 7 |  |
| 26 | 20 | 18 |  |
| 20 | 19 | 15 |  |
| 18 | 16 | 11 |  |
| 28 | 16 | 12 | title |
| 30 | 14 | 10 | number |
| 32 | 12 | 10 |  |
| 24 | 10 | 10 |  |
| 34 | 8 | 8 | display |
| 25 | 5 | 5 |  |
| 13.5 | 4 | 3 |  |
| 12.5 | 4 | 3 |  |
| 19 | 3 | 3 |  |
| 38 | 3 | 3 |  |
| 44 | 3 | 3 |  |
| 11.5 | 3 | 2 |  |
| 36 | 2 | 2 |  |
| 40 | 2 | 2 |  |
| 42 | 2 | 2 |  |
| 48 | 2 | 2 |  |
| 50 | 2 | 2 |  |
| 10.5 | 2 | 1 |  |
| 29 | 1 | 1 |  |
| 37 | 1 | 1 |  |
| 52 | 1 | 1 |  |
| 150 | 1 | 1 |  |

There are 34 distinct font sizes. The `Txt` variants cover 7 of them (34, 28, 17, 15, 13, 12, 30). `Txt` is used with its own `fontSize` on the same line 660 times. Pairs that differ by 1 or less and could be one step: 10/10.5, 10.5/11, 11/11.5, 11.5/12, 12/12.5, 12.5/13, 13/13.5, 13.5/14, 14/15, 15/16, 16/17, 17/18, 18/19, 19/20, 24/25, 25/26, 28/29, 29/30, 36/37, 37/38.

### 3.4 Border radius

| borderRadius | Uses | Files | In `radius` token (14, 20, 28, 999) |
|---|---|---|---|
| 22 | 63 | 40 |  |
| 20 | 47 | 33 | yes |
| 18 | 44 | 28 |  |
| 28 | 38 | 27 | yes |
| 24 | 37 | 24 |  |
| 14 | 32 | 18 | yes |
| 26 | 26 | 19 |  |
| 2 | 25 | 16 |  |
| 16 | 25 | 17 |  |
| 3 | 23 | 15 |  |
| 12 | 18 | 12 |  |
| 4 | 13 | 11 |  |
| 13 | 11 | 10 |  |
| 15 | 11 | 8 |  |
| 5 | 9 | 7 |  |
| 999 | 9 | 8 | yes |
| 19 | 8 | 7 |  |
| 8 | 7 | 6 |  |
| 11 | 7 | 6 |  |
| 32 | 7 | 5 |  |
| 7 | 6 | 5 |  |
| 30 | 6 | 4 |  |
| 1 | 5 | 4 |  |
| 17 | 5 | 5 |  |
| 6 | 4 | 3 |  |
| 25 | 4 | 4 |  |
| 10 | 3 | 3 |  |
| 23 | 3 | 2 |  |
| 34 | 3 | 2 |  |
| 9 | 2 | 2 |  |
| 31 | 1 | 1 |  |
| 33 | 1 | 1 |  |
| 44 | 1 | 1 |  |
| 48 | 1 | 1 |  |
| 56 | 1 | 1 |  |
| 110 | 1 | 1 |  |

The `radius` token has 4 values (sm 14, md 20, lg 28, pill 999) and is read once in the whole code base (`ui.tsx`). Meanwhile 36 different radii appear. Values that sit next to each other and could plausibly be one step: 10/11, 11/12, 12/13, 13/14, 14/15, 15/16, 16/17, 17/18, 18/19, 19/20, 20/22, 22/23, 23/24, 24/25, 25/26, 26/28, 28/30, 30/31, 31/32, 32/33, 33/34.

### 3.5 Spacing

`space(n)` (n × 4) exists in `tokens.ts` and is used 0 times. All spacing is written as numbers.

**gap, rowGap, columnGap**

| Value | Uses | Files |
|---|---|---|
| 8 | 155 | 63 |
| 6 | 119 | 58 |
| 12 | 117 | 55 |
| 10 | 87 | 55 |
| 4 | 54 | 37 |
| 2 | 49 | 36 |
| 14 | 46 | 26 |
| 16 | 13 | 11 |
| 3 | 10 | 9 |
| 1 | 9 | 8 |
| 5 | 9 | 7 |
| 18 | 4 | 3 |
| 0 | 2 | 2 |
| 22 | 2 | 2 |
| 7 | 1 | 1 |
| 20 | 1 | 1 |
| 28 | 1 | 1 |

**padding (all sides and each side)**

| Value | Uses | Files |
|---|---|---|
| 16 | 124 | 55 |
| 4 | 112 | 52 |
| 12 | 79 | 40 |
| 14 | 78 | 39 |
| 8 | 66 | 37 |
| 6 | 65 | 38 |
| 10 | 58 | 36 |
| 18 | 56 | 36 |
| 20 | 26 | 14 |
| 2 | 14 | 13 |
| 24 | 8 | 7 |
| 3 | 7 | 7 |
| 11 | 6 | 5 |
| 0 | 5 | 5 |
| 22 | 5 | 5 |
| 9 | 4 | 4 |
| 13 | 3 | 3 |
| 36 | 3 | 3 |
| 7 | 2 | 2 |
| 30 | 2 | 2 |
| 40 | 2 | 2 |
| 52 | 2 | 1 |
| 1 | 1 | 1 |
| 15 | 1 | 1 |
| 26 | 1 | 1 |
| 28 | 1 | 1 |
| 38 | 1 | 1 |
| 44 | 1 | 1 |
| 54 | 1 | 1 |
| 110 | 1 | 1 |

**margin (top 14)**

| Value | Uses | Files |
|---|---|---|
| 4 | 23 | 14 |
| 6 | 14 | 10 |
| 8 | 14 | 10 |
| -6 | 11 | 8 |
| 16 | 8 | 3 |
| 2 | 7 | 7 |
| 14 | 6 | 5 |
| 22 | 6 | 2 |
| -16 | 6 | 6 |
| 12 | 5 | 3 |
| -4 | 5 | 2 |
| 3 | 4 | 4 |
| 10 | 4 | 4 |
| -12 | 3 | 2 |

On a 4 px grid (multiples of 4) the `gap` values 4, 8, 12, 16 cover 339 of 679 uses. The rest (6 ×119, 10 ×87, 2 ×49, 14 ×46, 3 ×10, 1 ×9, 5 ×9, 18 ×4, 0 ×2, 22 ×2, 7 ×1, 20 ×1, 28 ×1) are off that grid. For `padding`, 430 of 737 uses are multiples of 4.

## 4. Five components with the most duplication

Chosen by the number of separate copies (definitions plus inline re-implementations the script could count). Each row says how the number was reached.

| # | Component | Copies | What the copies are | Where |
|---|---|---|---|---|
| 1 | **Card surface** | 2 definitions, 60 `<Card>` uses, 67 inline equivalents (+45 on `surface2`) | `Card` in `ui.tsx` (radius `lg` 28, padding 20, optional dark) and a second `Card` in `goal-detail.tsx` (radius 24, padding 18, `cardShadow`). 67 more lines build the same white rounded container by hand with a radius between 18 and 32 | `components/ui.tsx:75`, `app/goal-detail.tsx:26`, `app/(tabs)/gym.tsx:33`, `app/(tabs)/plans.tsx:164`, `app/exercise-search.tsx:72` |
| 2 | **Fade-in wrapper** | 4 definitions, 108 `entering={fade(` uses | `E` (plans) and `Enter` (Today, Gym) are the same one-line wrapper `<Animated.View entering={fade(i * 40)}>`; 108 other call sites apply `fade()` directly | `app/(tabs)/index.tsx:44`, `app/(tabs)/gym.tsx:22`, `features/plans/DietPlan.tsx:30`, `features/plans/WorkoutPlan.tsx:26` |
| 3 | **Section label and list card** | `Label` ×4, `ListCard` ×3, `SubPage` ×2 | Four `Label` components with three different looks (11 px letter-spaced semibold, 13 px medium, and `Txt v="label"` with 6 px padding). Three `ListCard`s and two `SubPage`s in different feature folders | `app/coach.tsx:16`, `app/goal-detail.tsx:30`, `app/progress/streaks.tsx:19`, `features/shell/parts.tsx:104`; `ListCard` in `plans/WorkoutPlan.tsx:28`, `progress/parts.tsx:113`, `shell/parts.tsx:94`; `SubPage` in `progress/parts.tsx:17`, `shell/parts.tsx:22` |
| 4 | **Stepper (− value +)** | 3 definitions | Three steppers with different props: onboarding (`value, onChange, step, unit, label`), plans (`label, value, onMinus, onPlus` labels) and the workout set row (adds `min` and a gesture `block`) | `app/onboarding.tsx:249`, `features/plans/parts.tsx:103`, `features/workout/SetRow.tsx:18` |
| 5 | **Goal summary** | 5 implementations of "the goal at a glance" | `GoalTickCard.tsx` (dark card), `GoalStrip.tsx` (a copy of an older `GoalTickCard` with its own `Marker`, `Journey` and `StripGlow`), `GoalCards.tsx` (older designs), `goalv2/GoalCard2.tsx` (ring card), and the goal row inside `TodayBudget.tsx`. A second `GoalStrip` is defined in `ForYou.tsx`. `Marker` and `Journey` each exist twice (`Segments` also exists twice: `GoalTickCard.tsx` and `trackers/Widgets.tsx`) | `features/today/GoalTickCard.tsx`, `GoalStrip.tsx`, `GoalCards.tsx`, `features/goalv2/GoalCard2.tsx`, `features/today/TodayBudget.tsx`, `features/today/ForYou.tsx:34` |

Also worth a look but not in the five: `Chip` is defined in `ui.tsx` and again in `features/today/GoalCards.tsx`; `Shell` ×3, `Dot` ×3, `DateSheet` ×3, `Bar` ×2, `Chevron` ×2, `SwapSheet` ×2, `MembershipCard` ×2 (all in section 2.3). Three similar pill primitives (`Chip`, `Pill`, `Tag`) are used 20, 40 and 28 times.

## 5. Proposed `/design-system` structure

This is a proposal that fits what is already in the repo: tokens in `src/theme/`, primitives in `src/components/ui.tsx` and `bits.tsx`, patterns scattered in `src/features/*/parts.tsx`. It moves nothing yet. The `@/` alias (to `src/`) is already used (`@/components/ui`, `@/theme/tokens`), so imports can keep working through re-export files during a migration.

```
src/design-system/
  tokens/
    colors.ts        light and dark palettes (today: src/theme/tokens.ts) plus the extra colours that repeat in code
    typography.ts    font families, the type scale and the Txt variants
    spacing.ts       one spacing scale (today: space() is unused)
    radius.ts        radius steps (today: 4 steps, 36 distinct values in use)
    shadows.ts       the shadow recipes (today: cardShadow in features/progress/parts.tsx and 33 inline shadow lines)
    motion.ts        fade, fadeOut, spring presets (today: src/theme/motion.ts and spring in tokens.ts)
    index.ts         re-exports, so `@/design-system/tokens` is the single entry
  theme/
    ThemeProvider.tsx   useTheme() (moved from src/theme)
  primitives/        one folder per component, each with the component and its variants
    Text/            Txt
    Pressable/       Pressy
    Button/          Button, RoundBtn, PillBtn
    Card/            Card (one definition; replaces goal-detail Card and the inline containers)
    Chip/            Chip, Pill, Tag, UnitPill (three similar components today)
    Field/           Field, NoteField, OtpInput
    Segmented/       Segmented
    Selection/       CheckCircle, FoodMark, Stepper
    Layout/          Row, Skeleton, FadeIn (replaces E / Enter)
  patterns/          compositions used on more than one screen
    SectionLabel/    replaces the four Label components
    ListCard/        replaces the three ListCard components
    ScreenHeader/    SubPage, GymHeader, TabScreen title
    Sheet/           bottom sheet content shell (65 openSheet calls today)
    Glow/            the radial glows (GoalTickCard, GoalStrip, welcome)
    GoalSummary/     the goal card family (section 4, row 5)
  docs/
    README.md        what is in the layer and the rule for adding to it
    tokens.md        every token with its light and dark value
    components.md    one entry per primitive and pattern: props, variants, an example
    migration.md     the mapping from old value or component to the new one (built from this audit)
```

Notes on the fit:

| Decision | Reason from this audit |
|---|---|
| Keep primitives and patterns separate | The code already splits shared components (`src/components`) from feature pieces (`src/features/*/parts.tsx`); the duplicates in section 4 sit in the second group |
| Put `FadeIn` in primitives | Four copies of the same wrapper |
| Keep `src/theme` as a re-export for a while | 102 files import from `@/theme/tokens`; changing the path in one go touches all of them |
| Docs inside the layer, not in `/docs` | `/docs` already holds handoff notes; token and component docs are easier to keep current next to the code |
| Leave `src/web` outside | The phone frame and demo panel are tooling, not product UI |

## 6. Questions

1. Are the older goal card designs (`GoalCards.tsx`, `GoalCard2.tsx`, `GoalStrip.tsx`, `GoalTickCard.tsx`) all still wanted, or are some kept only as options in the demo panel? This decides how many of the section 4 copies are real duplication and how many are alternatives on purpose.
2. Is light mode a shipping target? The tokens define it fully, but several recent cards (the Today card, the meals card backdrop, the quote) use fixed dark colours with `isDark` branches, and most checking has been on dark.
3. The `radius` token has 4 values and the code uses 36. Should the scale be the 4 steps (and the other values snapped to them), or should the tokens grow to match what the designs actually use?
4. `space()` is unused and padding and gap values are written by hand. Is a 4 px grid the intended system? About 51% of `gap` uses already sit on it.
5. Only 13 of 238 hard-coded hex values equal a palette token. Are the fixed colours on the dark gradient cards (for example `#1A1D22`, `#2F6BEA`, the mint and amber of the goal card) meant to be part of the palette, or deliberately outside it?
6. 95 components have no `<Name` usage. How many are screens (Expo Router default exports) and how many are unused? The script cannot tell.
7. `tokens.ts` says it "mirrors the HTML prototype" in `reference/`, and `docs/PHASE2_HANDOFF.md` points to `reference/*.dc.html`. There is no `reference/` folder in the repo. Where is the source of truth for the tokens now?
8. Should `src/web` (phone frame, demo panel) be styled with the same tokens, or is it outside the design system?
9. Three pill-like primitives exist (`Chip`, `Pill`, `Tag`). Are they three intended components or one that grew three versions?
10. Hard-coded text colours `#FFF`/`#FFFFFF` (245 uses) appear mostly on dark or coloured cards. Is "white on a fixed dark card" a token of its own (for example `onDark`)?

## 7. Method and limits

- Scope: every `.ts` and `.tsx` under `src/` (181 files). `node_modules`, `dist`, `assets` and `docs` were not scanned.
- Components: a top-level `function Name(`, `const Name = (...) =>` or `const Name = React.memo(` / `React.forwardRef(` whose name starts with a capital and whose next 120 lines contain JSX. Usage is the count of `<Name` followed by a space, `/`, `>` or `<` (generic components). Components used only through a variable, a prop or a route are counted as 0.
- Colours: `#rgb`, `#rrggbb`, `#rrggbbaa` and `rgb()` / `rgba()` string literals. Case is normalised. Values inside `src/theme/tokens.ts` are the tokens, not counted as hard-coded.
- Numbers: `fontSize`, `borderRadius` (and the four corner variants), `gap`, `rowGap`, `columnGap`, `padding*` and `margin*` followed by a numeric literal. Values computed from expressions or variables are not counted.
- Inline-pattern counts in section 2.2 are single-line regex matches. A style written across several lines is missed, so those counts are lower bounds.
- "Near-duplicate" for colours means every RGB channel within 8. For numbers it means a gap of 1 (font size) or 2 (radius). These are prompts for a decision, not decisions.
- Nothing was run on a device. Counts do not say which screens users see.

## 8. After phase 2 (tokens): before and after

Phase 2 added `src/design-system/tokens/` (colour, typography, spacing, radius, shadows, motion), kept `src/theme/tokens.ts`, `src/theme/motion.ts` and `ThemeProvider` as re-exports, and ran a codemod (`scripts/codemods/apply-tokens.js`) in three commits. Counts are the same script as the rest of this file, re-run after the change; the token files themselves are not counted as hard-coded.

| Measure | Before | After |
|---|---|---|
| Distinct hard-coded hex colours | 238 | 214 |
| Hex colour uses | 659 | 311 |
| Hex colours that equal a palette value | 13 of 238 | 7 of 214 |
| Distinct `rgba()` colours | 83 | 83 |
| `rgba()` uses | 207 | 207 |
| Distinct literal font sizes | 34 | 17 |
| Literal `fontSize` uses | 748 | 88 |
| Distinct literal border radii | 36 | 23 |
| Literal border radius uses | 507 | 189 |
| `gap` uses (not changed in this phase) | 679 | 679 |
| Components found | 413 | 413 |

What the codemod changed:

| Step | Exact matches | Snapped (within the tolerance) | Total values | Files |
|---|---|---|---|---|
| Colours to `fixed.*` (white, black, blue, dark, live, shadow); tolerance 8 per channel | 320 | 28 | 348 | 65 |
| Font sizes to `fontSizes.*`; tolerance 2 px | 617 | 63 | 680 | 103 |
| Radii to `radii.*`; tolerance 2 px, and a smaller step only when the element is clearly not a circle or pill | 189 | 135 | 324 | 90 |

The new scales (from `src/design-system/tokens/`):

| Scale | Steps |
|---|---|
| `fontSizes` (10) | 11, 12, 13, 14, 15, 17, 20, 22, 26, 30 |
| `radii` (6 and the pill) | 4, 12, 18, 22, 24, 28, 999 |
| `spacing` (4 px grid) | 0, 4, 8, 12, 16, 20, 24, 32, 40 (defined, not applied yet) |
| `fixed` colours | white `#FFFFFF`, black `#000000`, blue `#2F6BEA`, dark `#0B0E14`, live `#7CF0C8`, shadow `#101828` |
| `semantic` roles | success, warning, danger, info, progress, muted (each with fg and bg), also on `useTheme()` as `s` |

What was left alone, and where to decide: `docs/tokens-review.md` (305 hex, 204 rgba, 4 colours inside strings, 95 font sizes, 191 radii, and a summary of off-grid spacing). Regenerate it with `node scripts/codemods/apply-tokens.js --review`.

The new ESLint rule (warn level, `no-restricted-syntax` in `eslint.config.js`) reports hard-coded hex colours, border radii and font sizes outside `src/design-system/` and `src/theme/`. It reports 582 existing leftovers in 88 files today. ESLint also reports 109 errors from other rules (`react-hooks/*`, `react/no-unescaped-entities`, `react/jsx-key`); none come from this phase.

## Appendix A: every component

Sorted by file, then line. "Uses" is JSX occurrences found; "Files" is the number of files that use it.

| Component | Defined | Uses | Files | Same name elsewhere |
|---|---|---|---|---|
| `Transition` | `app/_layout.tsx:48` | 1 | 1 |  |
| `IN` | `app/_layout.tsx:82` | 0 | 0 |  |
| `OUT` | `app/_layout.tsx:83` | 0 | 0 |  |
| `Slide` | `app/_layout.tsx:85` | 1 | 1 |  |
| `Shell` | `app/_layout.tsx:158` | 10 | 3 | 3 definitions |
| `RootLayout` | `app/_layout.tsx:188` | 0 | 0 |  |
| `TabsLayout` | `app/(tabs)/_layout.tsx:8` | 0 | 0 |  |
| `Enter` | `app/(tabs)/gym.tsx:22` | 22 | 2 | 2 definitions |
| `MembershipCard` | `app/(tabs)/gym.tsx:24` | 1 | 1 | 2 definitions |
| `BreakCard` | `app/(tabs)/gym.tsx:28` | 1 | 1 |  |
| `AttendanceCard` | `app/(tabs)/gym.tsx:40` | 1 | 1 |  |
| `AssessCard` | `app/(tabs)/gym.tsx:60` | 1 | 1 |  |
| `ChatCard` | `app/(tabs)/gym.tsx:82` | 1 | 1 |  |
| `PTCard` | `app/(tabs)/gym.tsx:110` | 1 | 1 |  |
| `Gym` | `app/(tabs)/gym.tsx:131` | 0 | 0 |  |
| `Enter` | `app/(tabs)/index.tsx:44` | 22 | 2 | 2 definitions |
| `Today` | `app/(tabs)/index.tsx:48` | 0 | 0 |  |
| `DayStrip` | `app/(tabs)/plans.tsx:30` | 1 | 1 |  |
| `Plans` | `app/(tabs)/plans.tsx:91` | 0 | 0 |  |
| `Big` | `app/(tabs)/progress.tsx:35` | 4 | 1 |  |
| `ProgressCard` | `app/(tabs)/progress.tsx:44` | 1 | 1 |  |
| `StreakEntry` | `app/(tabs)/progress.tsx:160` | 1 | 1 |  |
| `Progress` | `app/(tabs)/progress.tsx:177` | 1 | 1 | 2 definitions |
| `NotFound` | `app/+not-found.tsx:4` | 0 | 0 |  |
| `CheckIn` | `app/checkin.tsx:28` | 0 | 0 |  |
| `Label` | `app/coach.tsx:16` | 18 | 8 | 4 definitions |
| `CoachHub` | `app/coach.tsx:22` | 0 | 0 |  |
| `ExerciseSearch` | `app/exercise-search.tsx:23` | 0 | 0 |  |
| `FoodDetail` | `app/food.tsx:23` | 0 | 0 |  |
| `Card` | `app/goal-detail.tsx:26` | 60 | 23 | 2 definitions |
| `Label` | `app/goal-detail.tsx:30` | 18 | 8 | 4 definitions |
| `Section` | `app/goal-detail.tsx:35` | 6 | 1 |  |
| `LeftTiles` | `app/goal-detail.tsx:42` | 1 | 1 |  |
| `ProgressChart` | `app/goal-detail.tsx:69` | 1 | 1 |  |
| `Drivers` | `app/goal-detail.tsx:121` | 1 | 1 |  |
| `History` | `app/goal-detail.tsx:149` | 1 | 1 |  |
| `GoalDetail` | `app/goal-detail.tsx:176` | 0 | 0 |  |
| `Goal` | `app/goal.tsx:24` | 0 | 0 |  |
| `GymAssessments` | `app/gym/assessments.tsx:21` | 0 | 0 |  |
| `Attendance` | `app/gym/attendance.tsx:18` | 0 | 0 |  |
| `MembershipPauses` | `app/gym/break.tsx:15` | 0 | 0 |  |
| `Dot` | `app/gym/chat.tsx:31` | 7 | 3 | 3 definitions |
| `CoachChat` | `app/gym/chat.tsx:51` | 0 | 0 |  |
| `StarBtn` | `app/gym/confirm.tsx:23` | 1 | 1 |  |
| `DoneTick` | `app/gym/confirm.tsx:38` | 1 | 1 |  |
| `ConfirmSession` | `app/gym/confirm.tsx:45` | 0 | 0 |  |
| `Membership` | `app/gym/membership.tsx:15` | 0 | 0 |  |
| `PersonalTraining` | `app/gym/pt.tsx:14` | 0 | 0 |  |
| `Index` | `app/index.tsx:5` | 0 | 0 |  |
| `Login` | `app/login.tsx:23` | 0 | 0 |  |
| `OfflineBanner` | `app/login.tsx:241` | 2 | 1 |  |
| `JoinCode` | `app/login.tsx:253` | 1 | 1 |  |
| `Notifications` | `app/notifications.tsx:18` | 0 | 0 |  |
| `Onboarding` | `app/onboarding.tsx:47` | 0 | 0 |  |
| `Progress` | `app/onboarding.tsx:197` | 1 | 1 | 2 definitions |
| `Title` | `app/onboarding.tsx:209` | 13 | 2 | 2 definitions |
| `Welcome` | `app/onboarding.tsx:218` | 1 | 1 | 2 definitions |
| `InfoRow` | `app/onboarding.tsx:236` | 3 | 1 |  |
| `Stepper` | `app/onboarding.tsx:249` | 8 | 2 | 3 definitions |
| `GoalStep` | `app/onboarding.tsx:263` | 1 | 1 |  |
| `GoalTile` | `app/onboarding.tsx:289` | 3 | 2 | 2 definitions |
| `FacilityStep` | `app/onboarding.tsx:305` | 1 | 1 |  |
| `ExpStep` | `app/onboarding.tsx:332` | 1 | 1 |  |
| `SchedStep` | `app/onboarding.tsx:358` | 1 | 1 |  |
| `AgeStep` | `app/onboarding.tsx:386` | 1 | 1 |  |
| `TargetStep` | `app/onboarding.tsx:396` | 1 | 1 |  |
| `BuildingStep` | `app/onboarding.tsx:419` | 1 | 1 |  |
| `HeightStep` | `app/onboarding.tsx:449` | 1 | 1 |  |
| `WeightStep` | `app/onboarding.tsx:460` | 1 | 1 |  |
| `BasicsStep` | `app/onboarding.tsx:471` | 1 | 1 |  |
| `ConsentStep` | `app/onboarding.tsx:500` | 1 | 1 |  |
| `ReadyStep` | `app/onboarding.tsx:529` | 1 | 1 |  |
| `SwipeToStart` | `app/onboarding.tsx:534` | 1 | 1 |  |
| `AskCoach` | `app/plans/ask.tsx:20` | 0 | 0 |  |
| `CreateWorkout` | `app/plans/create.tsx:18` | 0 | 0 |  |
| `EditPlan` | `app/plans/edit.tsx:20` | 0 | 0 |  |
| `PlanClip` | `app/plans/exercise.tsx:22` | 1 | 1 |  |
| `PlayBar` | `app/plans/exercise.tsx:33` | 1 | 1 |  |
| `ExerciseDetail` | `app/plans/exercise.tsx:44` | 0 | 0 |  |
| `WorkoutHistory` | `app/plans/history.tsx:14` | 0 | 0 |  |
| `ScanBeam` | `app/plans/log.tsx:27` | 1 | 1 |  |
| `Bracket` | `app/plans/log.tsx:33` | 8 | 2 | 2 definitions |
| `NumField` | `app/plans/log.tsx:39` | 2 | 1 |  |
| `LogFood` | `app/plans/log.tsx:50` | 0 | 0 |  |
| `WhatChanged` | `app/plans/updated.tsx:20` | 0 | 0 |  |
| `Appearance` | `app/profile/appearance.tsx:8` | 0 | 0 |  |
| `DeleteAccount` | `app/profile/delete.tsx:12` | 0 | 0 |  |
| `ChangePhoneSheet` | `app/profile/details.tsx:26` | 1 | 1 |  |
| `PhotoSheet` | `app/profile/details.tsx:60` | 2 | 1 |  |
| `DobSheet` | `app/profile/details.tsx:80` | 1 | 1 |  |
| `BodyRow` | `app/profile/details.tsx:93` | 3 | 1 |  |
| `MyDetails` | `app/profile/details.tsx:108` | 0 | 0 |  |
| `ExportData` | `app/profile/export.tsx:15` | 0 | 0 |  |
| `ConnectedApps` | `app/profile/health.tsx:22` | 0 | 0 |  |
| `Item` | `app/profile/help.tsx:21` | 2 | 2 | 2 definitions |
| `Help` | `app/profile/help.tsx:38` | 0 | 0 |  |
| `Profile` | `app/profile/index.tsx:33` | 2 | 1 |  |
| `GoalTile` | `app/profile/index.tsx:137` | 3 | 2 | 2 definitions |
| `TrackerPromo` | `app/profile/index.tsx:152` | 1 | 1 |  |
| `Peek` | `app/profile/index.tsx:177` | 3 | 1 |  |
| `DashedLine` | `app/profile/index.tsx:188` | 1 | 1 |  |
| `BigFooter` | `app/profile/index.tsx:196` | 1 | 1 |  |
| `JoinProgramme` | `app/profile/join.tsx:16` | 0 | 0 |  |
| `PERM` | `app/profile/notifications.tsx:14` | 0 | 0 |  |
| `NotificationSettings` | `app/profile/notifications.tsx:16` | 0 | 0 |  |
| `Privacy` | `app/profile/privacy.tsx:11` | 0 | 0 |  |
| `Option` | `app/profile/tracker-designs.tsx:14` | 1 | 1 |  |
| `TrackerDesigns` | `app/profile/tracker-designs.tsx:28` | 0 | 0 |  |
| `Trackers` | `app/profile/trackers.tsx:9` | 1 | 1 | 2 definitions |
| `Units` | `app/profile/units.tsx:8` | 0 | 0 |  |
| `ProgressAssessments` | `app/progress/assess.tsx:16` | 0 | 0 |  |
| `EditGoal` | `app/progress/goal.tsx:19` | 0 | 0 |  |
| `LiftDetail` | `app/progress/lift.tsx:19` | 0 | 0 |  |
| `MetricDetail` | `app/progress/metric.tsx:28` | 0 | 0 |  |
| `PhotoTile` | `app/progress/photos.tsx:19` | 1 | 1 |  |
| `Compare` | `app/progress/photos.tsx:35` | 1 | 1 |  |
| `Photos` | `app/progress/photos.tsx:70` | 0 | 0 |  |
| `ICONS` | `app/progress/streaks.tsx:17` | 0 | 0 | 2 definitions |
| `Label` | `app/progress/streaks.tsx:19` | 18 | 8 | 4 definitions |
| `BadgeCard` | `app/progress/streaks.tsx:24` | 1 | 1 |  |
| `Streaks` | `app/progress/streaks.tsx:49` | 0 | 0 |  |
| `Glow` | `app/welcome.tsx:15` | 4 | 4 | 3 definitions |
| `TILE` | `app/welcome.tsx:33` | 0 | 0 |  |
| `TodayMock` | `app/welcome.tsx:37` | 0 | 0 |  |
| `WorkoutMock` | `app/welcome.tsx:83` | 0 | 0 |  |
| `ProgressMock` | `app/welcome.tsx:103` | 0 | 0 |  |
| `Segment` | `app/welcome.tsx:145` | 1 | 1 |  |
| `Welcome` | `app/welcome.tsx:163` | 1 | 1 | 2 definitions |
| `Bars` | `app/workout.tsx:32` | 2 | 1 |  |
| `HeroBg` | `app/workout.tsx:41` | 1 | 1 |  |
| `Workout` | `app/workout.tsx:53` | 0 | 0 |  |
| `MARK` | `components/bits.tsx:12` | 0 | 0 |  |
| `FoodMark` | `components/bits.tsx:18` | 13 | 8 |  |
| `CheckCircle` | `components/bits.tsx:30` | 11 | 8 |  |
| `Skeleton` | `components/bits.tsx:55` | 12 | 2 |  |
| `Tag` | `components/bits.tsx:64` | 28 | 18 |  |
| `PillBtn` | `components/bits.tsx:73` | 9 | 6 |  |
| `Ring` | `components/bits.tsx:88` | 3 | 3 |  |
| `Beat` | `components/bits.tsx:102` | 2 | 2 |  |
| `Glow` | `components/bits.tsx:111` | 4 | 4 | 3 definitions |
| `HeartIcon` | `components/bits.tsx:118` | 4 | 3 |  |
| `RoundBtn` | `components/bits.tsx:123` | 23 | 14 |  |
| `UnitPill` | `components/bits.tsx:143` | 2 | 1 |  |
| `Photo` | `components/Brand.tsx:16` | 2 | 1 |  |
| `GymLogoMark` | `components/Brand.tsx:23` | 2 | 2 |  |
| `PremiumBadge` | `components/Brand.tsx:34` | 1 | 1 |  |
| `PersonAvatar` | `components/Brand.tsx:43` | 20 | 18 |  |
| `NavHideProvider` | `components/FloatingTabBar.tsx:19` | 1 | 1 |  |
| `ICONS` | `components/FloatingTabBar.tsx:44` | 0 | 0 | 2 definitions |
| `LABELS` | `components/FloatingTabBar.tsx:45` | 0 | 0 |  |
| `CircleNav` | `components/FloatingTabBar.tsx:48` | 1 | 1 |  |
| `MergedNav` | `components/FloatingTabBar.tsx:106` | 1 | 1 |  |
| `FloatingTabBar` | `components/FloatingTabBar.tsx:200` | 1 | 1 |  |
| `PillBar` | `components/FloatingTabBar.tsx:210` | 1 | 1 |  |
| `GlassBackdrop` | `components/Glass.tsx:15` | 14 | 9 |  |
| `WebLiquidGlass` | `components/Glass.tsx:38` | 1 | 1 |  |
| `ProgressiveBlur` | `components/Glass.tsx:56` | 3 | 3 |  |
| `Avatar` | `components/GymHeader.tsx:19` | 2 | 2 |  |
| `GlassShell` | `components/GymHeader.tsx:25` | 1 | 1 |  |
| `GymHeader` | `components/GymHeader.tsx:37` | 4 | 4 |  |
| `OtpInput` | `components/OtpInput.tsx:8` | 1 | 1 |  |
| `Box` | `components/OtpInput.tsx:43` | 1 | 1 |  |
| `OverlayProvider` | `components/Overlay.tsx:31` | 2 | 1 |  |
| `Sheet` | `components/Overlay.tsx:74` | 1 | 1 |  |
| `Toast` | `components/Overlay.tsx:142` | 1 | 1 |  |
| `Ruler` | `components/Ruler.tsx:29` | 3 | 1 |  |
| `TabScreen` | `components/TabScreen.tsx:15` | 4 | 4 |  |
| `TrendsButton` | `components/TrendsButton.tsx:10` | 2 | 2 |  |
| `V` | `components/ui.tsx:10` | 0 | 0 |  |
| `Txt` | `components/ui.tsx:21` | 1077 | 96 |  |
| `Pressy` | `components/ui.tsx:32` | 190 | 64 |  |
| `Button` | `components/ui.tsx:50` | 131 | 56 |  |
| `Card` | `components/ui.tsx:75` | 60 | 23 | 2 definitions |
| `Chip` | `components/ui.tsx:88` | 20 | 8 | 2 definitions |
| `Pill` | `components/ui.tsx:101` | 40 | 19 |  |
| `Segmented` | `components/ui.tsx:117` | 4 | 4 |  |
| `Field` | `components/ui.tsx:143` | 18 | 13 |  |
| `NoteField` | `components/ui.tsx:161` | 3 | 3 |  |
| `Row` | `components/ui.tsx:189` | 271 | 64 |  |
| `Item` | `components/Wheel.tsx:13` | 2 | 2 | 2 definitions |
| `Wheel` | `components/Wheel.tsx:27` | 6 | 2 |  |
| `YourPalLogo` | `components/YourPalLogo.tsx:8` | 5 | 5 |  |
| `BigNumber` | `features/body/BodyLog.tsx:32` | 2 | 1 |  |
| `WeightPicker` | `features/body/BodyLog.tsx:64` | 3 | 2 |  |
| `HeightPicker` | `features/body/BodyLog.tsx:86` | 2 | 2 |  |
| `DobPicker` | `features/body/BodyLog.tsx:114` | 2 | 2 |  |
| `BodyScreen` | `features/body/BodyLog.tsx:133` | 2 | 1 |  |
| `DateSheet` | `features/body/BodyLog.tsx:153` | 6 | 5 | 3 definitions |
| `Trend` | `features/body/BodyLog.tsx:164` | 1 | 1 |  |
| `WeightScreen` | `features/body/BodyLog.tsx:187` | 0 | 0 |  |
| `HeightScreen` | `features/body/BodyLog.tsx:233` | 0 | 0 |  |
| `AudioBubble` | `features/chat/AudioBubble.tsx:18` | 1 | 1 |  |
| `Pulse` | `features/chat/Composer.tsx:21` | 1 | 1 |  |
| `EmojiPanel` | `features/chat/Composer.tsx:30` | 1 | 1 |  |
| `AttachSheet` | `features/chat/Composer.tsx:55` | 1 | 1 |  |
| `Composer` | `features/chat/Composer.tsx:77` | 1 | 1 |  |
| `StillTrainingSheet` | `features/checkin/CheckInEngine.tsx:13` | 1 | 1 |  |
| `CheckInEngine` | `features/checkin/CheckInEngine.tsx:38` | 1 | 1 |  |
| `GYM` | `features/checkin/GymMap.native.tsx:10` | 0 | 0 |  |
| `OFFSET` | `features/checkin/GymMap.native.tsx:14` | 0 | 0 |  |
| `GymMap` | `features/checkin/GymMap.native.tsx:20` | 1 | 1 |  |
| `FinishBy` | `features/goalv2/FinishBy.tsx:14` | 2 | 2 |  |
| `DateSheet` | `features/goalv2/FinishBy.tsx:35` | 6 | 5 | 3 definitions |
| `STYLE` | `features/goalv2/GoalCard2.tsx:17` | 0 | 0 |  |
| `GoalRing` | `features/goalv2/GoalCard2.tsx:29` | 0 | 0 |  |
| `StatusChip` | `features/goalv2/GoalCard2.tsx:49` | 2 | 2 |  |
| `GoalCard2` | `features/goalv2/GoalCard2.tsx:60` | 1 | 1 |  |
| `GoalVisual` | `features/goalv2/GoalVisual.tsx:50` | 5 | 3 |  |
| `H` | `features/gym/sheets.tsx:13` | 0 | 0 |  |
| `FlagSheet` | `features/gym/sheets.tsx:16` | 3 | 3 |  |
| `ChatOptionsSheet` | `features/gym/sheets.tsx:37` | 1 | 1 |  |
| `Headline` | `features/onboarding/Steps.tsx:21` | 4 | 1 |  |
| `ProjectionStep` | `features/onboarding/Steps.tsx:31` | 1 | 1 |  |
| `HowStep` | `features/onboarding/Steps.tsx:92` | 0 | 0 |  |
| `MacroRing` | `features/onboarding/Steps.tsx:137` | 3 | 1 |  |
| `MealStep` | `features/onboarding/Steps.tsx:155` | 0 | 0 |  |
| `SignStep` | `features/onboarding/Steps.tsx:203` | 0 | 0 |  |
| `StyleAbs` | `features/onboarding/Steps.tsx:234` | 0 | 0 |  |
| `ReadyContent` | `features/onboarding/Steps.tsx:237` | 1 | 1 |  |
| `HealthStep` | `features/onboarding/Steps.tsx:298` | 1 | 1 |  |
| `E` | `features/plans/DietPlan.tsx:30` | 17 | 2 | 2 definitions |
| `KcalRing` | `features/plans/DietPlan.tsx:33` | 1 | 1 |  |
| `MacroBar` | `features/plans/DietPlan.tsx:54` | 3 | 1 |  |
| `UndoEatenSheet` | `features/plans/DietPlan.tsx:74` | 2 | 1 |  |
| `QtyControl` | `features/plans/DietPlan.tsx:87` | 1 | 1 |  |
| `ItemRow` | `features/plans/DietPlan.tsx:127` | 1 | 1 |  |
| `Chevron` | `features/plans/DietPlan.tsx:224` | 2 | 2 | 2 definitions |
| `MealCard` | `features/plans/DietPlan.tsx:232` | 1 | 1 |  |
| `AteElse` | `features/plans/DietPlan.tsx:283` | 1 | 1 |  |
| `DietPlan` | `features/plans/DietPlan.tsx:294` | 1 | 1 |  |
| `DragList` | `features/plans/DragList.tsx:24` | 1 | 1 |  |
| `DragRow` | `features/plans/DragList.tsx:47` | 1 | 1 |  |
| `PageHeader` | `features/plans/parts.tsx:20` | 8 | 7 |  |
| `BigTitle` | `features/plans/parts.tsx:35` | 12 | 2 |  |
| `ListRow` | `features/plans/parts.tsx:40` | 20 | 1 |  |
| `InfoBox` | `features/plans/parts.tsx:55` | 4 | 3 |  |
| `ShakeText` | `features/plans/parts.tsx:67` | 2 | 2 |  |
| `ExTile` | `features/plans/parts.tsx:81` | 3 | 3 |  |
| `Stepper` | `features/plans/parts.tsx:103` | 8 | 2 | 3 definitions |
| `Highlight` | `features/plans/parts.tsx:116` | 2 | 2 |  |
| `Moon` | `features/plans/parts.tsx:132` | 3 | 3 |  |
| `QtySheet` | `features/plans/QtySheet.tsx:16` | 1 | 1 |  |
| `PlanMenuSheet` | `features/plans/Sheets.tsx:19` | 1 | 1 |  |
| `DietMenuSheet` | `features/plans/Sheets.tsx:41` | 1 | 1 |  |
| `ResetSheet` | `features/plans/Sheets.tsx:62` | 2 | 1 |  |
| `DiscardSheet` | `features/plans/Sheets.tsx:81` | 1 | 1 |  |
| `LibrarySheet` | `features/plans/Sheets.tsx:94` | 3 | 3 |  |
| `EditItemSheet` | `features/plans/Sheets.tsx:123` | 1 | 1 |  |
| `ItemMenuSheet` | `features/plans/Sheets.tsx:171` | 1 | 1 |  |
| `NutritionSheet` | `features/plans/Sheets.tsx:196` | 1 | 1 |  |
| `SwapSheet` | `features/plans/Sheets.tsx:217` | 4 | 3 | 2 definitions |
| `HistSheet` | `features/plans/Sheets.tsx:247` | 1 | 1 |  |
| `E` | `features/plans/WorkoutPlan.tsx:26` | 17 | 2 | 2 definitions |
| `ListCard` | `features/plans/WorkoutPlan.tsx:28` | 24 | 18 | 3 definitions |
| `LockedPlan` | `features/plans/WorkoutPlan.tsx:48` | 1 | 1 |  |
| `WorkoutPlan` | `features/plans/WorkoutPlan.tsx:67` | 1 | 1 |  |
| `StickyStart` | `features/plans/WorkoutPlan.tsx:233` | 1 | 1 |  |
| `ManualLogSheet` | `features/progress/LogSheets.tsx:11` | 1 | 1 |  |
| `LOOK` | `features/progress/look.tsx:7` | 0 | 0 |  |
| `SubPage` | `features/progress/parts.tsx:17` | 29 | 29 | 2 definitions |
| `PCard` | `features/progress/parts.tsx:73` | 7 | 2 |  |
| `CornerGlow` | `features/progress/parts.tsx:86` | 7 | 6 |  |
| `CardTitle` | `features/progress/parts.tsx:99` | 5 | 2 |  |
| `ListCard` | `features/progress/parts.tsx:113` | 24 | 18 | 3 definitions |
| `DrawLine` | `features/progress/parts.tsx:147` | 2 | 2 |  |
| `Spark` | `features/progress/parts.tsx:158` | 1 | 1 |  |
| `GrowBar` | `features/progress/parts.tsx:167` | 4 | 4 |  |
| `StepBtn` | `features/progress/parts.tsx:180` | 2 | 1 |  |
| `Hint` | `features/progress/parts.tsx:198` | 9 | 7 |  |
| `RangeBar` | `features/progress/TrendUI.tsx:17` | 2 | 2 |  |
| `RangeBarSlim` | `features/progress/TrendUI.tsx:58` | 1 | 1 |  |
| `DateSheet` | `features/progress/TrendUI.tsx:96` | 6 | 5 | 3 definitions |
| `Bar` | `features/progress/TrendUI.tsx:142` | 3 | 2 | 2 definitions |
| `TrendChart` | `features/progress/TrendUI.tsx:149` | 1 | 1 |  |
| `MiniBars` | `features/progress/TrendUI.tsx:226` | 2 | 1 |  |
| `PushBanner` | `features/reminders/PushBanner.tsx:11` | 1 | 1 |  |
| `SubPage` | `features/shell/parts.tsx:22` | 29 | 29 | 2 definitions |
| `ProgLogo` | `features/shell/parts.tsx:49` | 8 | 6 |  |
| `Switch` | `features/shell/parts.tsx:59` | 7 | 6 |  |
| `LineRow` | `features/shell/parts.tsx:78` | 7 | 5 |  |
| `ListCard` | `features/shell/parts.tsx:94` | 24 | 18 | 3 definitions |
| `Label` | `features/shell/parts.tsx:104` | 18 | 8 | 4 definitions |
| `Note` | `features/shell/parts.tsx:108` | 14 | 9 |  |
| `LogoutSheet` | `features/shell/sheets.tsx:12` | 2 | 1 |  |
| `ProgrammeSwitcherSheet` | `features/shell/Switcher.tsx:15` | 1 | 1 |  |
| `JoinConsentSheet` | `features/shell/Switcher.tsx:61` | 1 | 1 |  |
| `MOCK` | `features/shell/ThemeTile.tsx:9` | 0 | 0 |  |
| `ThemeTile` | `features/shell/ThemeTile.tsx:13` | 1 | 1 |  |
| `Outline` | `features/streak/BadgeArt.tsx:30` | 5 | 1 |  |
| `BadgeArt` | `features/streak/BadgeArt.tsx:39` | 1 | 1 |  |
| `WeekRing` | `features/streak/StreakChip.tsx:14` | 1 | 1 |  |
| `StreakChip` | `features/streak/StreakChip.tsx:29` | 1 | 1 |  |
| `Milestone` | `features/streak/StreakHero.tsx:18` | 1 | 1 |  |
| `StreakHero` | `features/streak/StreakHero.tsx:33` | 1 | 1 |  |
| `Floating` | `features/today/CheckInBar.tsx:34` | 2 | 1 |  |
| `BAR` | `features/today/CheckInBar.tsx:46` | 0 | 0 |  |
| `MiniWorkout` | `features/today/CheckInBar.tsx:48` | 1 | 1 |  |
| `CheckInBar` | `features/today/CheckInBar.tsx:65` | 1 | 1 |  |
| `DayQuote` | `features/today/DayQuote.tsx:11` | 1 | 1 |  |
| `GoalStrip` | `features/today/ForYou.tsx:34` | 0 | 0 | 2 definitions |
| `StackCard` | `features/today/ForYou.tsx:126` | 1 | 1 |  |
| `Dot` | `features/today/ForYou.tsx:179` | 7 | 3 | 3 definitions |
| `ForYouStack` | `features/today/ForYou.tsx:189` | 2 | 1 |  |
| `ComebackPlan` | `features/today/ForYou.tsx:237` | 0 | 0 |  |
| `NOW` | `features/today/GoalCards.tsx:24` | 0 | 0 |  |
| `CHIP` | `features/today/GoalCards.tsx:25` | 0 | 0 |  |
| `Shell` | `features/today/GoalCards.tsx:44` | 10 | 3 | 3 definitions |
| `Top` | `features/today/GoalCards.tsx:57` | 3 | 1 |  |
| `Chip` | `features/today/GoalCards.tsx:66` | 20 | 8 | 2 definitions |
| `JourneyBar` | `features/today/GoalCards.tsx:86` | 1 | 1 |  |
| `DesignA` | `features/today/GoalCards.tsx:101` | 1 | 1 |  |
| `DesignB` | `features/today/GoalCards.tsx:123` | 1 | 1 |  |
| `DesignC` | `features/today/GoalCards.tsx:150` | 1 | 1 |  |
| `GoalSwitch` | `features/today/GoalCards.tsx:180` | 0 | 0 |  |
| `StripGlow` | `features/today/GoalStrip.tsx:22` | 1 | 1 |  |
| `Marker` | `features/today/GoalStrip.tsx:50` | 4 | 3 | 2 definitions |
| `Journey` | `features/today/GoalStrip.tsx:68` | 2 | 2 | 2 definitions |
| `GoalStrip` | `features/today/GoalStrip.tsx:91` | 0 | 0 | 2 definitions |
| `Glow` | `features/today/GoalTickCard.tsx:30` | 4 | 4 | 3 definitions |
| `Segments` | `features/today/GoalTickCard.tsx:48` | 5 | 2 | 2 definitions |
| `Marker` | `features/today/GoalTickCard.tsx:58` | 4 | 3 | 2 definitions |
| `Journey` | `features/today/GoalTickCard.tsx:76` | 2 | 2 | 2 definitions |
| `GoalTickCard` | `features/today/GoalTickCard.tsx:99` | 4 | 3 |  |
| `LogMealsSheet` | `features/today/LogMealsSheet.tsx:17` | 1 | 1 |  |
| `Capsule` | `features/today/MealsCard.tsx:20` | 1 | 1 |  |
| `Chevron` | `features/today/MealsCard.tsx:37` | 2 | 2 | 2 definitions |
| `MealRow` | `features/today/MealsCard.tsx:45` | 2 | 1 |  |
| `MealsCard` | `features/today/MealsCard.tsx:132` | 0 | 0 |  |
| `MissedRow` | `features/today/MealsCard.tsx:181` | 1 | 1 |  |
| `MealsBackdrop` | `features/today/MealsCard.tsx:218` | 2 | 1 |  |
| `DotRule` | `features/today/MealsCard.tsx:242` | 2 | 1 |  |
| `MealNowCard` | `features/today/MealsCard.tsx:252` | 1 | 1 |  |
| `NoPlanCard` | `features/today/NoPlanCard.tsx:9` | 2 | 1 |  |
| `MembershipCard` | `features/today/PaymentBanner.tsx:36` | 1 | 1 | 2 definitions |
| `PaymentBanner` | `features/today/PaymentBanner.tsx:59` | 3 | 1 |  |
| `ScanLine` | `features/today/QuickLogSheet.tsx:24` | 2 | 2 |  |
| `Bracket` | `features/today/QuickLogSheet.tsx:31` | 8 | 2 | 2 definitions |
| `QuickLogSheet` | `features/today/QuickLogSheet.tsx:38` | 7 | 6 |  |
| `NAME` | `features/today/StepsCards.tsx:41` | 0 | 0 |  |
| `StepsTile` | `features/today/StepsCards.tsx:43` | 2 | 1 |  |
| `Face` | `features/today/StepsCards.tsx:68` | 2 | 1 |  |
| `StepsPreview` | `features/today/StepsCards.tsx:80` | 2 | 2 |  |
| `CurrentFace` | `features/today/StepsCards.tsx:93` | 1 | 1 |  |
| `RulerFace` | `features/today/StepsCards.tsx:116` | 1 | 1 |  |
| `DotFace` | `features/today/StepsCards.tsx:141` | 1 | 1 |  |
| `BarsPlusFace` | `features/today/StepsCards.tsx:160` | 1 | 1 |  |
| `BarsFace` | `features/today/StepsCards.tsx:177` | 1 | 1 |  |
| `StepsSheet` | `features/today/StepsCards.tsx:201` | 2 | 2 |  |
| `Half` | `features/today/TodayBudget.tsx:23` | 2 | 1 |  |
| `TodayBudgetCard` | `features/today/TodayBudget.tsx:40` | 2 | 1 |  |
| `TodayGreeting` | `features/today/TodayGreeting.tsx:20` | 1 | 1 |  |
| `GoalLine` | `features/today/TopCards.tsx:34` | 0 | 0 |  |
| `GoalCard` | `features/today/TopCards.tsx:52` | 1 | 1 |  |
| `PtConfirmCard` | `features/today/TopCards.tsx:110` | 1 | 1 |  |
| `ComebackGreeting` | `features/today/TopCards.tsx:134` | 2 | 2 |  |
| `ComebackCard` | `features/today/TopCards.tsx:151` | 1 | 1 |  |
| `UpdIcon` | `features/today/TopCards.tsx:203` | 1 | 1 |  |
| `PlanChanges` | `features/today/TopCards.tsx:213` | 1 | 1 |  |
| `UpdatesCard` | `features/today/TopCards.tsx:226` | 1 | 1 |  |
| `UpdatesSheet` | `features/today/TopCards.tsx:310` | 1 | 1 |  |
| `Bottle` | `features/today/Trackers.tsx:34` | 0 | 0 |  |
| `Ripple` | `features/today/Trackers.tsx:59` | 2 | 1 |  |
| `SQ` | `features/today/Trackers.tsx:85` | 0 | 0 |  |
| `BottleFigma` | `features/today/Trackers.tsx:94` | 2 | 1 |  |
| `BottleArt` | `features/today/Trackers.tsx:122` | 0 | 0 |  |
| `WaterCard` | `features/today/Trackers.tsx:154` | 3 | 2 |  |
| `NUM` | `features/today/Trackers.tsx:186` | 0 | 0 |  |
| `Tile` | `features/today/Trackers.tsx:190` | 4 | 1 |  |
| `WeightCard` | `features/today/Trackers.tsx:210` | 2 | 1 |  |
| `Sneaker` | `features/today/Trackers.tsx:242` | 0 | 0 |  |
| `HealthCards` | `features/today/Trackers.tsx:257` | 4 | 1 |  |
| `ConnectCard` | `features/today/Trackers.tsx:294` | 1 | 1 |  |
| `TileFor` | `features/today/Trackers.tsx:309` | 1 | 1 |  |
| `Trackers` | `features/today/Trackers.tsx:338` | 1 | 1 | 2 definitions |
| `WaterSheet` | `features/today/Trackers.tsx:355` | 4 | 2 |  |
| `HEALTH` | `features/today/Trackers.tsx:396` | 0 | 0 |  |
| `HealthSheet` | `features/today/Trackers.tsx:401` | 2 | 1 |  |
| `ViewOnly` | `features/today/ViewOnly.tsx:6` | 2 | 1 |  |
| `Dot` | `features/today/WeekCard.tsx:43` | 7 | 3 | 3 definitions |
| `Bar` | `features/today/WeekCard.tsx:48` | 3 | 2 | 2 definitions |
| `WeekCard` | `features/today/WeekCard.tsx:53` | 1 | 1 |  |
| `DaySheet` | `features/today/WeekCard.tsx:91` | 1 | 1 |  |
| `Coach` | `features/today/WorkoutCard.tsx:32` | 2 | 1 |  |
| `Title` | `features/today/WorkoutCard.tsx:46` | 13 | 2 | 2 definitions |
| `Btn` | `features/today/WorkoutCard.tsx:60` | 2 | 1 |  |
| `SmallBtn` | `features/today/WorkoutCard.tsx:65` | 3 | 1 |  |
| `LiveDot` | `features/today/WorkoutCard.tsx:70` | 2 | 1 |  |
| `Shell` | `features/today/WorkoutCard.tsx:72` | 10 | 3 | 3 definitions |
| `WorkoutCard` | `features/today/WorkoutCard.tsx:84` | 2 | 1 |  |
| `G` | `features/trackers/DotText.tsx:5` | 9 | 5 |  |
| `DotText` | `features/trackers/DotText.tsx:25` | 6 | 2 |  |
| `WTile` | `features/trackers/Widgets.tsx:17` | 10 | 1 |  |
| `AddButton` | `features/trackers/Widgets.tsx:42` | 1 | 1 |  |
| `Segments` | `features/trackers/Widgets.tsx:61` | 5 | 2 | 2 definitions |
| `EnergyDot` | `features/trackers/Widgets.tsx:71` | 1 | 1 |  |
| `EnergyStack` | `features/trackers/Widgets.tsx:80` | 1 | 1 |  |
| `WaterDot` | `features/trackers/Widgets.tsx:97` | 1 | 1 |  |
| `WaterGlasses` | `features/trackers/Widgets.tsx:106` | 1 | 1 |  |
| `WeightDot` | `features/trackers/Widgets.tsx:117` | 1 | 1 |  |
| `WeightRuler` | `features/trackers/Widgets.tsx:126` | 1 | 1 |  |
| `HrDot` | `features/trackers/Widgets.tsx:140` | 2 | 2 |  |
| `SleepStages` | `features/trackers/Widgets.tsx:151` | 1 | 1 |  |
| `SleepDot` | `features/trackers/Widgets.tsx:163` | 1 | 1 |  |
| `WeekTile` | `features/trackers/Widgets.tsx:174` | 0 | 0 |  |
| `Clip` | `features/workout/ClipStage.tsx:14` | 1 | 1 |  |
| `ClipStage` | `features/workout/ClipStage.tsx:47` | 0 | 0 |  |
| `PHOTOS` | `features/workout/ExerciseArt.tsx:11` | 0 | 0 |  |
| `ExerciseArt` | `features/workout/ExerciseArt.tsx:30` | 4 | 3 |  |
| `Particle` | `features/workout/FinishScreen.tsx:26` | 1 | 1 |  |
| `PopCheck` | `features/workout/FinishScreen.tsx:33` | 1 | 1 |  |
| `StreakLine` | `features/workout/FinishScreen.tsx:42` | 1 | 1 |  |
| `FinishScreen` | `features/workout/FinishScreen.tsx:58` | 1 | 1 |  |
| `ClipPopup` | `features/workout/NewWorkoutUI.tsx:23` | 2 | 1 |  |
| `MoveThumb` | `features/workout/NewWorkoutUI.tsx:46` | 1 | 1 |  |
| `FinishPill` | `features/workout/NewWorkoutUI.tsx:63` | 1 | 1 |  |
| `ClipCardInner` | `features/workout/NewWorkoutUI.tsx:76` | 1 | 1 |  |
| `ClipRow` | `features/workout/NewWorkoutUI.tsx:113` | 1 | 1 |  |
| `NewExercise` | `features/workout/NewWorkoutUI.tsx:128` | 1 | 1 |  |
| `NewList` | `features/workout/NewWorkoutUI.tsx:202` | 1 | 1 |  |
| `RestPanel` | `features/workout/RestPanel.tsx:18` | 3 | 2 |  |
| `Stepper` | `features/workout/SetRow.tsx:18` | 8 | 2 | 3 definitions |
| `SetRow` | `features/workout/SetRow.tsx:58` | 1 | 1 |  |
| `MenuRow` | `features/workout/WorkoutSheets.tsx:22` | 8 | 1 |  |
| `WkMenuSheet` | `features/workout/WorkoutSheets.tsx:32` | 2 | 1 |  |
| `FormTipsSheet` | `features/workout/WorkoutSheets.tsx:51` | 1 | 1 |  |
| `SwapSheet` | `features/workout/WorkoutSheets.tsx:67` | 4 | 3 | 2 definitions |
| `SetMenuSheet` | `features/workout/WorkoutSheets.tsx:115` | 1 | 1 |  |
| `FinishConfirmSheet` | `features/workout/WorkoutSheets.tsx:136` | 1 | 1 |  |
| `NOWS` | `lib/domain.tsx:64` | 0 | 0 |  |
| `DomainProvider` | `lib/domain.tsx:111` | 1 | 1 |  |
| `StoreProvider` | `lib/store.tsx:104` | 1 | 1 |  |
| `ScenarioRegistryProvider` | `lib/store.tsx:136` | 1 | 1 |  |
| `ThemeProvider` | `theme/ThemeProvider.tsx:8` | 1 | 1 |  |
| `P` | `web/ControlParts.tsx:8` | 0 | 0 |  |
| `PanelCard` | `web/ControlParts.tsx:12` | 5 | 1 |  |
| `FieldLabel` | `web/ControlParts.tsx:27` | 2 | 1 |  |
| `Choice` | `web/ControlParts.tsx:32` | 1 | 1 |  |
| `Actions` | `web/ControlParts.tsx:67` | 0 | 0 |  |
| `QuickTime` | `web/ControlParts.tsx:82` | 0 | 0 |  |
| `ScreenItem` | `web/ControlParts.tsx:95` | 0 | 0 |  |
| `Dropdown` | `web/ControlParts.tsx:106` | 6 | 1 |  |
| `SwitchChip` | `web/ControlParts.tsx:136` | 3 | 1 |  |
| `ActionChip` | `web/ControlParts.tsx:147` | 2 | 1 |  |
| `WebFrame` | `web/WebFrame.tsx:67` | 1 | 1 |  |
| `StatusBarMock` | `web/WebFrame.tsx:90` | 1 | 1 |  |
| `TimeSlider` | `web/WebFrame.tsx:103` | 1 | 1 |  |
| `PanelBody` | `web/WebFrame.tsx:130` | 3 | 1 |  |
| `SidePanel` | `web/WebFrame.tsx:330` | 1 | 1 |  |
| `EdgeTab` | `web/WebFrame.tsx:348` | 1 | 1 |  |

## Appendix B: every hard-coded colour

Hex colours, most used first. "Token" is shown when the value equals a palette value.

| Hex | Uses | Files | Token with this value |
|---|---|---|---|
| `#FFF` | 209 | 50 |  |
| `#FFFFFF` | 36 | 17 | `surface`, `accentInk`, `accentInk` |
| `#2F6BEA` | 22 | 15 | `accent`, `heroFrom`, `heroFrom` |
| `#0B0E14` | 19 | 9 | `dark`, `dark` |
| `#101828` | 17 | 13 |  |
| `#000` | 13 | 9 |  |
| `#F0692C` | 9 | 3 |  |
| `#5CC2E6` | 7 | 6 |  |
| `#0B0B0D` | 7 | 3 |  |
| `#1B3FB8` | 6 | 3 |  |
| `#3E8FEA` | 5 | 5 |  |
| `#FF8A3D` | 5 | 3 |  |
| `#FF8A96` | 5 | 4 |  |
| `#7CF0C8` | 5 | 4 | `live`, `live` |
| `#0C307E` | 5 | 2 |  |
| `#3478F6` | 4 | 2 |  |
| `#06150E` | 4 | 3 |  |
| `#F4F6FA` | 4 | 4 |  |
| `#B5543C` | 4 | 2 |  |
| `#FF9A4D` | 4 | 2 |  |
| `#C9D1DD` | 4 | 2 |  |
| `#F4F4F6` | 3 | 2 |  |
| `#6FA0FF` | 3 | 3 |  |
| `#8A9BFF` | 3 | 3 |  |
| `#3346E8` | 3 | 3 |  |
| `#F3F4F6` | 3 | 3 |  |
| `#1B2440` | 3 | 1 |  |
| `#F2B35B` | 2 | 2 | `warn` |
| `#0B0F16` | 2 | 2 |  |
| `#E9E4DA` | 2 | 2 |  |
| `#F7F3EC` | 2 | 2 |  |
| `#8C3B2A` | 2 | 2 |  |
| `#FFFDF6` | 2 | 2 |  |
| `#D9A45A` | 2 | 2 |  |
| `#F5B301` | 2 | 2 |  |
| `#3A2A00` | 2 | 2 |  |
| `#161B26` | 2 | 2 |  |
| `#2B2118` | 2 | 1 |  |
| `#D4A45C` | 2 | 1 |  |
| `#E2B970` | 2 | 1 |  |
| `#FF375F` | 2 | 1 |  |
| `#0F8A5F` | 2 | 2 |  |
| `#0E8FA0` | 2 | 2 |  |
| `#C2408A` | 2 | 2 |  |
| `#FF8FC4` | 2 | 2 |  |
| `#2371C9` | 2 | 2 |  |
| `#B3A8FF` | 2 | 2 |  |
| `#FFB347` | 2 | 2 |  |
| `#EEF1F6` | 2 | 2 | `ink` |
| `#0B7A54` | 2 | 1 |  |
| `#FFE7B8` | 2 | 1 |  |
| `#7A4700` | 2 | 1 |  |
| `#2EE6A8` | 2 | 2 |  |
| `#1E4A3F` | 2 | 2 |  |
| `#4B5CF5` | 2 | 1 |  |
| `#2F3FD6` | 2 | 1 |  |
| `#1E2A9E` | 2 | 1 |  |
| `#8CBBFF` | 2 | 1 |  |
| `#3D6BFF` | 2 | 1 |  |
| `#0E1B45` | 2 | 1 |  |
| `#13327A` | 2 | 1 |  |
| `#17140F` | 2 | 1 |  |
| `#7FE3D6` | 2 | 1 |  |
| `#E08A0B` | 1 | 1 |  |
| `#FF3B5C` | 1 | 1 |  |
| `#0D1119` | 1 | 1 |  |
| `#2A3242` | 1 | 1 |  |
| `#3E7BF0` | 1 | 1 |  |
| `#1D46B5` | 1 | 1 |  |
| `#3563F2` | 1 | 1 |  |
| `#5B6577` | 1 | 1 |  |
| `#DDE6FF` | 1 | 1 |  |
| `#1E9E5A` | 1 | 1 |  |
| `#E0A526` | 1 | 1 |  |
| `#A0522D` | 1 | 1 |  |
| `#17120E` | 1 | 1 |  |
| `#E8C89A` | 1 | 1 |  |
| `#303F9F` | 1 | 1 |  |
| `#FF4D4F` | 1 | 1 |  |
| `#3A35B5` | 1 | 1 |  |
| `#5A54DD` | 1 | 1 |  |
| `#8E80F5` | 1 | 1 |  |
| `#2E2A9A` | 1 | 1 |  |
| `#0E7E58` | 1 | 1 |  |
| `#1FA67C` | 1 | 1 |  |
| `#5CCDA8` | 1 | 1 |  |
| `#0B6A49` | 1 | 1 |  |
| `#3CCB9A` | 1 | 1 | `good` |
| `#ECE8E1` | 1 | 1 |  |
| `#F8F5EF` | 1 | 1 |  |
| `#F1EFEA` | 1 | 1 |  |
| `#C9862B` | 1 | 1 |  |
| `#DDA13F` | 1 | 1 |  |
| `#B5541F` | 1 | 1 |  |
| `#111` | 1 | 1 |  |
| `#C4610E` | 1 | 1 |  |
| `#5E9E1A` | 1 | 1 |  |
| `#A5D75C` | 1 | 1 |  |
| `#5ED9AE` | 1 | 1 |  |
| `#C98A00` | 1 | 1 |  |
| `#F2C14E` | 1 | 1 |  |
| `#5CD0E0` | 1 | 1 |  |
| `#8B4FE0` | 1 | 1 |  |
| `#BE98FF` | 1 | 1 |  |
| `#8CC4FF` | 1 | 1 |  |
| `#D6404F` | 1 | 1 |  |
| `#5B4BD1` | 1 | 1 |  |
| `#B5541A` | 1 | 1 |  |
| `#128A62` | 1 | 1 |  |
| `#B8532B` | 1 | 1 |  |
| `#7B4FD6` | 1 | 1 |  |
| `#F4F6F9` | 1 | 1 |  |
| `#14171C` | 1 | 1 |  |
| `#C9CFD8` | 1 | 1 |  |
| `#0F1218` | 1 | 1 |  |
| `#1A1F29` | 1 | 1 |  |
| `#F1F3F6` | 1 | 1 |  |
| `#3A4250` | 1 | 1 |  |
| `#FF8A5C` | 1 | 1 |  |
| `#D6342C` | 1 | 1 |  |
| `#FFD966` | 1 | 1 |  |
| `#E0A100` | 1 | 1 |  |
| `#FFC46B` | 1 | 1 |  |
| `#D9701A` | 1 | 1 |  |
| `#5EE0B0` | 1 | 1 |  |
| `#0F9D74` | 1 | 1 | `good` |
| `#5CD5E6` | 1 | 1 |  |
| `#7CC4FF` | 1 | 1 |  |
| `#232A36` | 1 | 1 |  |
| `#3A4252` | 1 | 1 |  |
| `#CBD2DE` | 1 | 1 |  |
| `#48526A` | 1 | 1 |  |
| `#C9D0DD` | 1 | 1 |  |
| `#7A86A0` | 1 | 1 |  |
| `#98A2B6` | 1 | 1 |  |
| `#E3E8F3` | 1 | 1 |  |
| `#4A5468` | 1 | 1 |  |
| `#2B3342` | 1 | 1 |  |
| `#DDE2EB` | 1 | 1 |  |
| `#8FB2FF` | 1 | 1 | `accentText` |
| `#3B86EA` | 1 | 1 |  |
| `#4FB0E6` | 1 | 1 |  |
| `#1A1D22` | 1 | 1 |  |
| `#3A3D48` | 1 | 1 |  |
| `#0B0C0F` | 1 | 1 |  |
| `#2E3038` | 1 | 1 |  |
| `#8C8E97` | 1 | 1 |  |
| `#5E6069` | 1 | 1 |  |
| `#C3C7D0` | 1 | 1 |  |
| `#E8A33D` | 1 | 1 |  |
| `#5B5D66` | 1 | 1 |  |
| `#3A3B42` | 1 | 1 |  |
| `#787E8C` | 1 | 1 |  |
| `#1F5FDB` | 1 | 1 |  |
| `#5C8DF0` | 1 | 1 |  |
| `#2034E6` | 1 | 1 |  |
| `#5468FF` | 1 | 1 |  |
| `#222FB5` | 1 | 1 |  |
| `#000000` | 1 | 1 |  |
| `#0A0C12` | 1 | 1 |  |
| `#171B26` | 1 | 1 |  |
| `#1F7A52` | 1 | 1 |  |
| `#0E3B2C` | 1 | 1 |  |
| `#07130F` | 1 | 1 |  |
| `#C9CDD6` | 1 | 1 |  |
| `#9AA0AD` | 1 | 1 |  |
| `#1B1D22` | 1 | 1 |  |
| `#1E2438` | 1 | 1 |  |
| `#2A3860` | 1 | 1 |  |
| `#FFB27A` | 1 | 1 |  |
| `#B5500F` | 1 | 1 |  |
| `#999999` | 1 | 1 |  |
| `#9294A8` | 1 | 1 |  |
| `#EAE6E6` | 1 | 1 |  |
| `#D9D9D9` | 1 | 1 |  |
| `#F4F7FF` | 1 | 1 |  |
| `#070B2B` | 1 | 1 |  |
| `#1C2BC0` | 1 | 1 |  |
| `#7FB4FF` | 1 | 1 |  |
| `#7C93FF` | 1 | 1 |  |
| `#3145F0` | 1 | 1 |  |
| `#5D74FF` | 1 | 1 |  |
| `#8AA0FF` | 1 | 1 |  |
| `#0E1116` | 1 | 1 | `bg` |
| `#FF6B7A` | 1 | 1 |  |
| `#5B8DFF` | 1 | 1 |  |
| `#B9A8FF` | 1 | 1 |  |
| `#141130` | 1 | 1 |  |
| `#1A1636` | 1 | 1 |  |
| `#0D2A22` | 1 | 1 |  |
| `#124A3A` | 1 | 1 |  |
| `#06231B` | 1 | 1 |  |
| `#0B3A2C` | 1 | 1 |  |
| `#0F5A42` | 1 | 1 |  |
| `#1B1710` | 1 | 1 |  |
| `#8A3A12` | 1 | 1 |  |
| `#1A0D06` | 1 | 1 |  |
| `#FFB072` | 1 | 1 |  |
| `#D4521A` | 1 | 1 |  |
| `#8F2E0F` | 1 | 1 |  |
| `#0E4A8A` | 1 | 1 |  |
| `#07192F` | 1 | 1 |  |
| `#CBE9FF` | 1 | 1 |  |
| `#0B2A4A` | 1 | 1 |  |
| `#061424` | 1 | 1 |  |
| `#27A9FF` | 1 | 1 |  |
| `#14595F` | 1 | 1 |  |
| `#061A1D` | 1 | 1 |  |
| `#1FB5A6` | 1 | 1 |  |
| `#0A6F78` | 1 | 1 |  |
| `#0A4A55` | 1 | 1 |  |
| `#7A1828` | 1 | 1 |  |
| `#1A0A10` | 1 | 1 |  |
| `#FF5A6E` | 1 | 1 |  |
| `#7E6BFF` | 1 | 1 |  |
| `#4A3BC4` | 1 | 1 |  |
| `#2B2080` | 1 | 1 |  |
| `#35288F` | 1 | 1 |  |
| `#0D0B24` | 1 | 1 |  |
| `#8C7DFF` | 1 | 1 |  |
| `#171A22` | 1 | 1 |  |
| `#0C0E13` | 1 | 1 |  |
| `#FF7A45` | 1 | 1 |  |
| `#66718A` | 1 | 1 |  |
| `#B5BFCE` | 1 | 1 |  |
| `#12151C` | 1 | 1 | `ink` |
| `#2C323E` | 1 | 1 | `surface3` |
| `#E1E6EC` | 1 | 1 | `surface3` |
| `#3A36C9` | 1 | 1 |  |
| `#B9B6FF` | 1 | 1 |  |
| `#F2B544` | 1 | 1 |  |
| `#1F6E63` | 1 | 1 |  |
| `#0F0E3C` | 1 | 1 |  |
| `#E6EAF0` | 1 | 1 |  |
| `#15181E` | 1 | 1 |  |
| `#FFF4E0` | 1 | 1 |  |
| `#9A5A00` | 1 | 1 |  |
| `#E6F6EE` | 1 | 1 |  |

`rgb()` / `rgba()` colours, most used first.

| Value | Uses | Files | Token |
|---|---|---|---|
| `rgba(255,255,255,0.22)` | 12 | 8 |  |
| `rgba(255,255,255,0.8)` | 12 | 5 |  |
| `rgba(255,255,255,0.75)` | 12 | 6 |  |
| `rgba(255,255,255,0.6)` | 9 | 6 |  |
| `rgba(255,255,255,0.7)` | 8 | 7 |  |
| `rgba(255,255,255,0.1)` | 7 | 6 |  |
| `rgba(255,255,255,0.85)` | 7 | 5 |  |
| `rgba(255,255,255,0.9)` | 6 | 6 |  |
| `rgba(255,255,255,0.25)` | 6 | 4 |  |
| `rgba(255,255,255,0.16)` | 6 | 5 |  |
| `rgba(255,255,255,0.12)` | 6 | 3 |  |
| `rgba(255,138,61,0.16)` | 5 | 4 |  |
| `rgba(0,0,0,0.6)` | 5 | 4 | `scrim` |
| `rgba(255,255,255,0.5)` | 4 | 4 |  |
| `rgba(255,255,255,0.14)` | 4 | 4 |  |
| `rgba(255,255,255,0.2)` | 4 | 4 |  |
| `rgba(11,14,20,0.72)` | 4 | 2 |  |
| `rgba(0,0,0,0.55)` | 3 | 3 |  |
| `rgba(255,255,255,0.3)` | 3 | 3 |  |
| `rgba(255,255,255,0.10)` | 3 | 3 |  |
| `rgba(255,255,255,0.28)` | 3 | 2 |  |
| `rgba(0,0,0,0)` | 3 | 3 |  |
| `rgba(255,255,255,0.55)` | 3 | 3 |  |
| `rgba(255,255,255,0.4)` | 3 | 3 |  |
| `rgba(255,255,255,0.18)` | 3 | 3 | `chipLine` |
| `rgba(224,128,48,0)` | 2 | 1 |  |
| `rgba(11,11,13,0.72)` | 2 | 1 |  |
| `rgba(255,255,255,0.92)` | 2 | 2 | `navBg` |
| `rgba(255,255,255,0.45)` | 2 | 2 |  |
| `rgba(255,255,255,0.07)` | 2 | 2 |  |
| `rgba(255,255,255,0.05)` | 2 | 2 |  |
| `rgba(255,255,255,0.35)` | 2 | 2 |  |
| `rgba(255,255,255,0.65)` | 2 | 2 |  |
| `rgba(14,17,22,0)` | 1 | 1 |  |
| `rgba(245,247,250,0)` | 1 | 1 |  |
| `rgba(240,105,44,0.55)` | 1 | 1 |  |
| `rgba(224,128,48,0.30)` | 1 | 1 |  |
| `rgba(224,128,48,0.09)` | 1 | 1 |  |
| `rgba(224,128,48,0.42)` | 1 | 1 |  |
| `rgba(224,128,48,0.13)` | 1 | 1 |  |
| `rgba(11,11,13,0.15)` | 1 | 1 |  |
| `rgba(255,255,255,0.13)` | 1 | 1 |  |
| `rgba(10,20,40,0.10)` | 1 | 1 |  |
| `rgba(255,255,255,0.15)` | 1 | 1 |  |
| `rgba(15,138,95,0.25)` | 1 | 1 |  |
| `rgba(11,14,20,0.08)` | 1 | 1 |  |
| `rgba(244,244,246,0.8)` | 1 | 1 |  |
| `rgba(11,14,20,0.82)` | 1 | 1 |  |
| `rgba(0,0,0,0.45)` | 1 | 1 |  |
| `rgba(255,255,255,0.82)` | 1 | 1 |  |
| `rgba(18,21,28,0.13)` | 1 | 1 |  |
| `rgba(30,35,46,0.42)` | 1 | 1 |  |
| `rgba(30,35,46,0.93)` | 1 | 1 |  |
| `rgba(255,255,255,0.95)` | 1 | 1 |  |
| `rgba(11,14,20,0.05)` | 1 | 1 |  |
| `rgba(52,120,246,0.22)` | 1 | 1 |  |
| `rgba(255,255,255,0.88)` | 1 | 1 |  |
| `rgba(255,255,255,0.24)` | 1 | 1 |  |
| `rgba(60,203,154,0.15)` | 1 | 1 |  |
| `rgba(60,203,154,0.6)` | 1 | 1 |  |
| `rgba(255,255,255,0.04)` | 1 | 1 |  |
| `rgba(0,0,0,0.72)` | 1 | 1 |  |
| `rgba(38,40,46,0.96)` | 1 | 1 |  |
| `rgba(243,244,246,0.58)` | 1 | 1 |  |
| `rgba(243,244,246,0.8)` | 1 | 1 |  |
| `rgba(46,230,168,0.2)` | 1 | 1 |  |
| `rgba(232,163,61,0.2)` | 1 | 1 |  |
| `rgba(0,0,0,0.3)` | 1 | 1 |  |
| `rgba(10,12,16,0.22)` | 1 | 1 |  |
| `rgba(255,255,255,0.08)` | 1 | 1 | `navLine` |
| `rgba(0,0,0,0.04)` | 1 | 1 |  |
| `rgba(27,36,64,0.35)` | 1 | 1 |  |
| `rgba(47,107,234,0.08)` | 1 | 1 |  |
| `rgba(255,255,255,0.30)` | 1 | 1 |  |
| `rgba(27,36,64,0.5)` | 1 | 1 |  |
| `rgba(196,97,14,0.15)` | 1 | 1 |  |
| `rgba(242,179,91,0.14)` | 1 | 1 |  |
| `rgba(242,179,91,0.28)` | 1 | 1 |  |
| `rgba(242,179,91,0.5)` | 1 | 1 |  |
| `rgba(124,240,200,0.45)` | 1 | 1 |  |
| `rgba(124,240,200,0.6)` | 1 | 1 |  |
| `rgba(255,138,61,0.14)` | 1 | 1 |  |
| `rgba(255,107,122,0.16)` | 1 | 1 |  |
