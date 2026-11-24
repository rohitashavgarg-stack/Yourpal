# Trainer app: UI kit handoff

For the session that builds the YourPal trainer app. Written 20 Nov 2026. This file says which parts of the member app to reuse, how they look and behave, and what is new. For what the member app expects from a trainer (assessments, plans, PT sessions, chat), read `docs/TRAINER_APP_BRIEF.md` and `docs/TRAINER_APP_DATA.md` next to it.

Read first, in this order: `AGENTS.md`, `CLAUDE.md`, `.claude/skills/yourpal-mobile-app-ui/SKILL.md`, `.claude/skills/yourpal-trainer-app/SKILL.md`, `docs/design-system-components.md`.

## Decision already made
- The trainer app is a separate project, `C:\Users\rohitashav.garg\Desktop\yourpal-trainer-v1`. It holds an earlier, unfinished start (React Navigation, zustand, its own themes and components, uncommitted). The designer said to remove what is there and build the new one. Clear `src`, `App.tsx`, `public`, `scripts` and `docs` there first, then follow the setup below. Do not touch the member app folder while doing it.
- The trainer app must look and behave like the member app: same back button, glow, headers, nav bar, cards, sheets, motion and copy voice. Nothing is redesigned. Copy the kit; do not rebuild it.
- Do not edit `docs/TRAINER_APP_DATA.md` (the designer said to leave it alone).

## Stack (same as the member app)
Expo SDK 58, React Native 0.88, Expo Router (routes in `src/app`), TypeScript, Reanimated 4, react-native-web, `lucide-react-native`, Geist and Outfit fonts. Take `package.json`, `app.json`, `tsconfig.json` (the `@/` alias to `src/`), `eslint.config.js` and `vercel.json` from the member app and rename the project. Install packages with `npx expo install`, never plain npm. Packages the kit uses: `expo-blur`, `expo-glass-effect`, `expo-haptics`, `expo-linear-gradient`, `react-native-svg`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens`, `expo-font`, `@expo-google-fonts/geist`, `@expo-google-fonts/outfit`.

## What to copy, and where it lives in the member app

### Tokens and theme (copy whole)
- `src/design-system/tokens/` (colors, typography, spacing, radius, shadows, motion). Colours are `light`, `dark`, `fixed`, `onDark`, `gradients`. Type is `fontSizes`, `lineHeights`, `font`. Radius is `radii` and `round(h)`.
- `src/theme/ThemeProvider.tsx` (`useTheme()` returns `c`, `isDark`), `src/theme/tokens.ts`, `src/theme/motion.ts`.
- `src/lib/haptics.ts`, `src/lib/motionSafe.ts` (`useReduce()`), `src/lib/createStore.ts`, `src/lib/icons.ts`.
- Dark first. Accent blue `#2F6BEA`, mint `#2EE6A8` for done only, orange `#FF9A4D`, amber for warnings, never red for a pause or a comeback.

### Primitives (copy `src/design-system/primitives/`, all of it except the member-only ones)
| Group | Components |
|---|---|
| Page shell | `SubPage` (back button, title, floating header with blur, floating footer, `close`, `right`, `progress`), `PageGlow`, `TopGlow`, `Glass` (`GlassBackdrop`, `ProgressiveBlur`, `WebLiquidGlass`), `CardEdge` |
| Actions | `Button` (kinds primary, accent, secondary, ghost, outline, white, glass, dashed, line, quiet, soft, grey, glassAccent, glassPrimary; sizes large 56 to xs 32), `IconButton`, `Pressy` (press scale and haptic) |
| Choices and input | `Option`, `Pill`, `Chip`, `Field`, `NoteField`, `Stepper`, `AmountStepper`, `Wheel`, `Ruler`, `CheckCircle` |
| Display | `Card`, `ListCard`, `Callout`, `Tag`, `IconBadge`, `StatusDot`, `ProgressBar`, `ProgressSegments`, `Ring`, `MetaRow`, `SectionLabel`, `Row`, `Txt`, `Chevron`, `FadeIn`, `Brand` (`PersonAvatar`, `GymLogoMark`), `YourPalLogo` |
| Overlays | `Sheet`, `SheetFooter`, `Snackbar` |

Member-only, leave out: `FoodMark`, `ScanBracket`, `MuscleBody`, `MuscleRings`, `MuscleThumb`, `Beat`, `HeartIcon`, `EffortSlider`, `TrendsButton` (keep the last one if trend pages are built).

### Patterns (copy only what applies)
Keep `Banner` (account or alert strip), `ChatBar` (the glass message bar), `PageEnd`. Leave out `BudgetCard`, `FoodCard`, `GoalCard`, `MealsCard`, `TrackerRow`, `WeekCard`, `WorkoutCard`. The trainer app gets its own patterns (below), built from the primitives.

### Shell (copy from `src/components/` and `src/app/_layout.tsx`)
- `FloatingTabBar.tsx` (the pill nav; it shrinks on scroll, no names when shrunk, `NavHideProvider`, `useHideOnScroll`).
- `TabScreen.tsx` (large collapsing page title, `title`, `titleRight`, `header`, `pinned`, 130 px bottom padding for the nav).
- `Overlay.tsx` (`useOverlay()`: `openSheet(<Content/>, { label })`, `closeSheet(after?)`, `toast(msg, { undo })`; one top snackbar at a time).
- `GymHeader.tsx` as the model for the Today header (avatar left, actions right). Replace the gym logo and member avatar with the trainer's.
- `_layout.tsx`: the Slide wrapper, `installSlideBack()`, `FROM_BOTTOM`, `NO_TRANSITION`, `PageGlow` mounted once over the whole app, and the web phone frame in `src/web/WebFrame.tsx` (phone with the demo panel beside it).
- `src/lib/cardGrow.ts` and `GrowFrame` in `SubPage` (card pages that grow out of the card and close by dragging the handle).

Some copied files import member-only modules (`@/features/...`, `@/lib/store`, `@/lib/domain`). Copy, run `npx tsc --noEmit`, and cut or replace those imports. Do not copy member features to satisfy an import.

## How things must look and behave (do not change)
- **Back button:** a glass round button, 44 px, top left, on every pushed page. Pages with a back button slide in from the right and out to the right. Pages with a cross (create or edit flows) come up from the bottom and slide down. Detail cards grow from the card. Sheets are bottom sheets with a drag handle.
- **Headers:** never a hard bar. The header floats over the content with the progressive blur under it. Large title on tab pages that collapses on scroll; centred title on pushed pages.
- **Footers:** the main button floats at the bottom. No footer bar, no line.
- **Glow:** a faint blue `PageGlow` in the top left of every page (mounted once). `TopGlow` in the colour of the topic on inner pages. `CornerGlow` (`src/features/progress/parts.tsx`) inside a card, needs a parent with `position: 'relative'`, `zIndex: 0` and `overflow: 'hidden'`.
- **Cards:** `Card` or `c.cardLift` plus `CardEdge` (thin gradient stroke) on plain standalone cards. Do not stroke nested items twice. Radius 24 for cards, 28 for hero cards.
- **Nav bar:** the floating pill with Lucide icons and names, shrinking on scroll. Trainer tabs (proposal, confirm with the designer): Today, Clients, Plans, Chat, Profile.
- **Motion:** no springs or bounce when a screen or card enters. Plain 180 ms fade (`FadeIn`), at most a tiny slide. Press scale, sheet drag, tab pill and toasts keep their springs. Respect Reduce Motion with `useReduce()`.
- **Type:** every `fontSize` needs a `lineHeight` of about 1.3 times. Prefer `Txt`. Page titles are 28 px, line height 37, letter spacing -1.1.
- **Tap targets:** 44 px. Where the drawn size is smaller, add hit slop. `Button` and `Option` already do it.
- **Tokens only** for colour, spacing, radius and type. No hard-coded values (copy `scripts/lint-changed.js` so a branch that adds one fails).
- **Copy:** say the number, fact first, then the smallest next step. Name people ("Coach Vikram", member first names). No emoji. No dot separators ("text · text"). Sentence case. Chips are information, never actions. Amber for warnings, never red for pause or frozen. Green only on checks and numbers, never as a card fill.
- **States are props** on the component, never copies of it. A look that exists is a kind or a size, not a new component.

## New components the trainer app needs (build from the primitives, add a story and a doc for each)
| Component | Built from | Purpose |
|---|---|---|
| `ClientRow` | `Card` or `ListCard`, `PersonAvatar`, `Txt`, `StatusDot`, `Tag` | A client in a list: name, goal line, last activity, flag dot |
| `SessionRow` | `ListCard`, `Tag`, `MetaRow` | A PT session: time, client, status tag (upcoming, awaiting, confirmed, rejected, skipped) |
| `StatTile` | `Card` compact, `Txt` | A number with a small label, grey tile, optional icon |
| `DayTimeline` | `Row`, `StatusDot`, `Txt` | Today's sessions and tasks in time order |
| `AlertRow` | `Callout` or `Banner` | A client needs attention (missed workouts, no weigh-in, plan change asked) |
| `PlanRow` | `ListCard` | One exercise or one meal in the plan editor, with reorder and edit |
| `ChatListRow` | `ListCard`, `PersonAvatar`, `StatusDot` | Chat inbox row: client, last message, unread dot |
| `AssessmentForm` | `Field`, `Stepper`, `Ruler`, `Option` | The seven tests and notes |

## Proposed screens (confirm with the designer, one flow at a time)
1. Today: greeting, alerts, today's sessions (`DayTimeline`), sessions waiting for the member's confirmation, assessments due.
2. Clients: list with search and filter chips, client page (goal, progress, logs, notes, plan, PT pack).
3. Plans: workout and diet plans, builder reusing the member app's create and edit workout pages as the model.
4. Assessment entry: weight, waist, body fat, leg press (5 reps), bench press (5 reps), toe touch, resting heart rate, plus notes and the next assessment date.
5. PT sessions: log a session, see its status (the member confirms or rejects; it confirms itself after 3 days).
6. Chat inbox and thread (`ChatBar`), Notifications, Profile.

## How to work
- Start with wireframes in chat when the designer asks ("show here first"); otherwise build, then show a short table of changes, then ask in one line whether to commit and push.
- Every screen is checked on screen before reporting (headless Chrome with puppeteer-core is the reliable way on this machine).
- Sample data first, in local stores (`createStore`); no backend yet. Demo switches live in the web demo panel beside the phone.
- Commands: `npx tsc --noEmit`, `npm run lint`, `node scripts/lint-changed.js`.
- Windows: Metro often misses edits to existing files, so restart `npx expo start --web --port 8082 --clear` before looking. Files may have CRLF line endings. Write edit scripts with the Write tool (bash heredocs mangle backticks and backslashes).
- Expo APIs change every SDK: check https://docs.expo.dev/versions/v58.0.0/ before using one.

## Open
- Trainer tabs and the first-release scope are proposals; the designer has not confirmed them.
- Whether the two apps later share one kit package (a monorepo) or stay as copies. Start as copies, kept in one folder per layer so a shared package is easy later.
- Nothing has been tested on a physical phone (Expo Go).
