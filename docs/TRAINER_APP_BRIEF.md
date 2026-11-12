# Brief: building the YourPal trainer app

For Claude Cowork. Written 12 Nov 2026 from the member app work. Everything marked "inferred" comes from what the member app expects of a trainer; confirm scope with the designer (Rohitashav) before building.

## What exists
- **YourPal member app** (a gym programme member and Coach Vikram): Expo SDK 58, React Native 0.88, Expo Router (`src/app`), TypeScript, Reanimated, react-native-web. It runs as a web prototype in a phone frame with a demo panel at https://yourpal-psi.vercel.app (the `main` branch). Data is sample data in local stores (`src/lib/domain.tsx`, `src/lib/data.ts`); there is no backend.
- **Design system** in `src/design-system/` (tokens, primitives, patterns) with docs in `src/design-system/docs/` and an index in `docs/design-system-components.md`. Read `AGENTS.md`, `CLAUDE.md`, `docs/SESSION_HANDOFF.md` and `.claude/skills/yourpal-mobile-ui/SKILL.md` first.
- The designer has no code background. He sends screenshots with a one-line correction and wants each one folded in at once. When he says "show here first", draw a wireframe in chat and wait.

## What the member app already expects from the trainer (inferred)
- **Assessments:** the trainer records them at the gym. Seven tests: weight, waist, body fat, leg press (5 reps), bench press (5 reps), toe touch, resting heart rate. Plus notes (activity, frequency, water, level, flexibility, injuries) and the next assessment date. The member sees them read only (Gym, Assessments).
- **Plans:** only the trainer creates or edits workout and diet plans. The member can ask for a change (`/plans/ask`) and can edit what they logged.
- **PT sessions:** the trainer logs a session, the member confirms or rejects it ("Did your session happen?", confirms itself after 3 days). Sessions come in packs (for example 8 of 12 left).
- **Chat:** Coach Vikram chats with the member (text, photos, voice, food cards). Trainer notes, plan changes and replies show on the member's Today as updates.
- **Membership:** statuses come from the gym admin (Active, Frozen shown as Paused, Suspended, Expired, Transferred). The member sees them view only. No Pay or Renew buttons in the app.
- Also: check-in and attendance, the signed waiver, goals (the trainer sets the goal and target).

## Look and feel to reuse
- Dark first. Charcoal cards (`c.cardLift`) with a thin gradient stroke (`CardEdge`). Accent blue `#2F6BEA`, mint `#2EE6A8` for done, orange `#FF9A4D`, amber for warnings (never red for a pause or a comeback). Geist for text, Outfit for display. Lucide icons.
- Glass round back and close buttons. Headers float with the progressive blur (`ProgressiveBlur`). Bottom buttons float (no footer bars). A soft top glow on pages (`TopGlow`). 44 px tap targets.
- **Tokens only** for colour, spacing, radius and type (`useTheme()`, `fixed`, `onDark`, `radii`, `fontSizes`). `node scripts/lint-changed.js` fails a branch that adds a hard-coded value. Use components from the design system before making new ones; add a variant instead of restyling.
- **Navigation motion:** pages with a back button slide in from the right and out to the right; pages with a cross come up from the bottom and go down; card pages grow from the card; sheets are bottom sheets. No springs on entering (plain 180 ms fade, `FadeIn`). Respect Reduce Motion (`useReduce()`).
- **Copy voice:** say the number, fact first, then the smallest next step. Name the coach ("Coach Vikram"). No emoji, no exclamation marks except where a reference shows one, no dot separators in text, sentence case. Chips are information, not actions.

## How we work
- Check the screen before reporting. Do not change what was not asked. Fix, then report briefly.
- Commands: `npx tsc --noEmit`, `npm run lint`, `node scripts/lint-changed.js`. Publish with `node scripts/publish.js web --direct --yes --message "..."` (checks, merges into `main`, pushes, waits for Vercel). The designer said to put every change on `main`.
- Windows quirks: Metro does not see edits to existing files, so restart `npx expo start --web --port 8082 --clear` before looking. Files can have CRLF line endings, and bash heredocs mangle backslashes and backticks, so write scripts with the Write tool.
- A headless Chrome (puppeteer-core) check on the live site is the reliable way to look at screens without the designer's window.

## Suggested shape of the trainer app (a proposal, not decided)
- Share the design system (a package or a route group in the same Expo project) so both apps look the same.
- Screens: Today (clients today, sessions waiting for confirmation, assessments due), Members (list and detail with goal, progress, logs, notes), Assessment entry (the seven tests and notes), Plan builder (reuse the member app's create and edit workout pages), PT sessions (log and confirm), Chat inbox, Notifications, Profile.
- Start with wireframes in chat, one flow at a time, then build behind demo-panel switches as the member app does.

## Open
- No backend yet; the trainer app will need sample data first.
- Nothing has been tested on a physical phone (Expo Go).
- Decide with the designer which of the trainer features above are in the first release.
