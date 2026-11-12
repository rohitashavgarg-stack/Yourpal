---
name: yourpal-mobile-app-ui
description: The one design skill for the YourPal member app (and the trainer app): the standards and design system it follows, the page, card, header, footer, sheet, navigation and motion patterns as the app is built now, how data, goals, trackers, food, plans and assessments are shown, the copy voice, the states every screen needs, accessibility, and every correction the designer (Rohitashav) has given, old and new, with the old rules that were replaced marked. Use for ANY design or UI work on YourPal, so decisions already made are not lost or re-argued.
---

# YourPal design standards (one skill: older rules, newer rules, everything)

The memory of how the app is designed. Built from the app as it is now, from every correction the designer gave (26 Oct to 12 Nov 2026 and the earlier playbook), and from the design system's own docs. **Read this file fully, then the reference file for the area you touch.** Where an older rule and a newer one disagree, the newer one wins; the replaced old rules are listed in `reference/replaced-rules.md` so nobody brings them back.

Reference files (all in `reference/`):
- `designer-inputs.md`: every correction as a rule, grouped by area, with its date. The first place to look for "what did he say about X".
- `screens-and-patterns.md`: how each screen and pattern is designed now (Today, Plans, Progress, Gym, assessments, workout, goals, trackers, login, onboarding, profile, waiver, notifications, memberships).
- `replaced-rules.md`: old rules that no longer apply, and what replaced them.

## 0. Which source wins
1. The designer's latest instruction in the chat.
2. `reference/designer-inputs.md` and this file.
3. The design system docs (`src/design-system/docs/*.md`, `docs/design-system-components.md`).
4. Apple's Human Interface Guidelines (principles: purpose, accessibility, haptics, motion; it gives no durations).
5. General taste. When two sources disagree, follow the higher one and fix the lower one.

## 1. What the app should feel like
A health and fitness app a member gets through a gym, not a "gym app" (demo: Wulf Fitness, member Rohitashav, Coach Vikram). Calm, dark-first in review (light mode exists and must work), iOS feel: press feedback, haptics, drag to dismiss, glass buttons, undo toasts. Big light titles, thin lines, charcoal cards, a blue accent, colour only where it means something. The coach is named. No guilt, no fake cheer, no emoji. Membership is view only; a goal is never frozen or paused.

## 2. Standards the app follows
- **One design system.** Use components from `src/design-system/` (primitives, then patterns) before making anything. A different look is a variant (a prop) with a doc and a story, never a restyle in place. A state is a prop, never a copy.
- **Tokens only** for colour, spacing, radius and type: `useTheme()` colours, `fixed`, `onDark`, `radii`, `round(h)`, `fontSizes`, `spring`. `node scripts/lint-changed.js` fails a branch that adds a hard-coded value.
- **Both themes.** Never hard-code a light-only colour. Cards that are always dark use `onDark`.
- **Accessibility.** Every pressable has a label and a role. Tap targets are 44 px (use hit slop when the drawn size must stay smaller). Icon-only buttons use `IconButton` (it announces disabled). Headings use `SectionLabel` or `accessibilityRole="header"`. State is never carried by colour alone. Reduce Motion is respected on phones (`useReduce()`).
- **Expo and React Native rules** (`AGENTS.md`): Expo Router, `npx expo install`, tsc and lint before done. Platforms: Expo SDK 58; Expo Go only opens the latest SDK.
- **HIG principles:** motion has a purpose and follows the gesture, short and precise, never makes people wait; haptics match the animation; show something at once instead of a blank page.

## 3. Tokens at a glance (the files have the exact values)
- **Colour** (`src/design-system/tokens/colors.ts`): page `bg` (light `#F5F7FA`, dark `#0E1116`), `surface`, `surface2`, `surface3`, `cardLift` (card fill), `ink`, `muted`, `line`, `chipLine`, accent blue (`c.accent`, `accentText`, `accentSoft`; brand `#2F6BEA`), `good` (green, mint `#2EE6A8` on dark cards), `warn` (amber), `danger` (rare). Category pairs: heart pink (`tHeart/cHeart`), sleep violet, nutrition green, activity orange, fat yellow, water blue. `fixed.white`, `fixed.dark`, `onDark.card/text/soft/muted/mint/burn/amber/lilac` for colour that must not change.
- **Type:** Geist (light, regular, medium, semibold), Outfit for display, Geist Mono for numbers. Sizes `fontSizes.xs2` 11 up to `xl6` 42, each with a line height about 1.3 times (34 to 44, 28 to 37, 24 to 32, 17 to 25, 15 to 23, 13 to 19, 12 to 18). Geist crops when tight. Page titles and the Today greeting share one style: 28 px, line height 37, letter spacing -1.1. Use `Txt` variants. Long names never truncate with an ellipsis: two lines and step the size down.
- **Spacing** on a 4 px grid (`spacing`: 4, 8, 12, 16, 20, 24, 32, 40). In one component use one gap value for its rows. A numbers row sits close (about 8 px) to the bar it describes.
- **Radii:** `xs 4, sm 12, md 18, lg 22, card 24, xl 28, sheet 30, pill 999`. A nested radius equals the parent radius minus the inset (a picture inset 10 px in a 28 px card is 18).
- **Motion:** `FadeIn` 180 ms for anything entering (no springs, no overshoot); spring presets for press, sheets, toasts and the nav pill; page slides use the phone curve `bezier(0.32, 0.72, 0, 1)`.

## 4. Page anatomy (top to bottom)
- **Header:** floats over the content with the progressive blur (`ProgressiveBlur`), no colour behind it; round glass back or close button (`IconButton glass`); the first content starts clear of the blur. Large titles collapse on tab pages (`TabScreen`). The first screen of a flow has no back arrow.
- **Backdrop:** a soft top glow (`TopGlow`) on detail pages, in the colour of the page's meaning (accent blue by default, green when signed, amber while pending). Backgrounds that depend on the screen size measure their own container, never the browser window.
- **Cards:** a standalone card = lighter fill (`c.cardLift`) plus the thin gradient stroke (`CardEdge`); the stroke radius equals the card's radius. Never stroke a nested item a second time. Dotted food cards stay dotted inside a stroked meal card. Green only on checks and numbers, never a card fill. Amber for warnings, never red for paused, frozen or comeback. A section heading belongs to the card under it (more space above than below).
- **Buttons:** actions use `Button`; one of several uses `Option`; chips and pills are information, never actions. Primary is white in dark and black in light. Secondary actions are plain secondary buttons. Glass only for the round back, close and bell buttons and the one main action floating over scrolling content. A bottom button floats (no bar, no line) and the page keeps room under its content. Icon buttons swell a little when pressed; cards shrink. Destructive action: `Button kind="warn"` (soft red tint), only for something the member must confirm.
- **Sheets and pages:** a bottom sheet for a short task or choice (drags down, closes on the phone curve); a page for anything longer. A cross page (a task) comes up from the bottom and goes down; a back-button page slides in from the right and out to the right; a page opened from a card grows from the card, has no back button and a drag handle. The page behind stays visible during a slide.
- **Nav:** a floating pill of four tabs; on scroll it shrinks to its icons (still a pill), never hides. Floating buttons follow it down.
- **Page end:** `PageEnd` (illustration, a quiet line, the YourPal mark); the picture is drawn at about a third of its strength; no quote above it.

## 5. Showing data
- Say the number, then what it means, then the smallest next step. Lead with the number people came for, large, with a short caption.
- The answer goes in the headline; the chart is the proof ("5% ahead of the pace you need"). Each fact lives in one place; check the page does not already say it. Prefer a visual per metric (bar, ticks, slots, ruler, sparkline); text explains, visuals show. Weekly goals reset, so never a percent bar.
- Status colour carries meaning: green ahead or reached, amber a bit behind or ending soon, blue on track. For calories: on target green, off target grey, never amber or red. Category colour carries meaning (workout orange, diet green, heart pink, sleep violet, water blue); a row of drivers is never all one blue.
- Extremes are named and dated ("Most steps, 9,200, Wed 22 Oct"), never a bare "Highest". Trend lines have dots; targets are dashed lines.
- One headline line on a card: the number big with its unit beside it, the change underneath. A count of done out of target is segments, one per item.
- Hierarchy over decoration: a small coloured label above a larger title; never three facts on one line joined by dots, commas or "and".

## 6. Copy and voice
Fact first, then the smallest next step. Credit the coach by name ("Coach Vikram"). Sentence case. No emoji, no guilt, no exclamation marks except where a reference shows one, **no dot separators** ("text · text") (never bulk-replace the old ones; fix the screens he points at). Title, one line, a quieter line. Short labels ("Add height", "Log dinner"). English only. Never show a time or a detail the product does not have ("Coach Vikram will confirm the day and time"). All non-label lines live in `src/lib/microcopy.ts`. Membership copy is view only ("View membership", never "Renew").

## 7. States every screen needs
Loading (a skeleton, not a blank page), empty (an invitation), no plan assigned, view only (expired membership: locked cards, a toast instead of the action), paused membership (account banner plus a paused card), comeback after days away (warm, never a failure), offline (works and saves on the phone), error (what happened, then what to do). New features get a switch in the web demo panel so each state can be shown.

## 8. How to work with the designer
- He sends a screenshot and a line. Fold each correction in at once; do not finish the old plan first. Change only what he named; keep colours, copy and layout he did not mention; never remove functionality as a side effect.
- **Answer first** when he asks "why", "what is left" or "how will it work". "Just tell me" means do not change code.
- "Show here first", "wireframe" or "tell me what you will do" means draw it in chat (hi-fi in the app's colours) and wait for a yes. "Do what you understand" means build and list the assumptions. Give one recommendation, not a menu.
- When he says an earlier version "was better", go back to that version. "Put it in a card" means the standard card. Do not apply a style everywhere for consistency unless he says so.
- Treat him as a colleague: push back when something is worse UX. He cannot code: say what is ready, what is left and what he needs to do.
- Do not add buttons or features he did not ask for.
- Report plainly what you saw and what you did not check. Say whether it is live.
- Figma node shared: it is the source of truth (map Space Grotesk and Inter to Outfit and Geist; blur and inner shadow filters need rebuilding with gradients).

## 9. Process checklist (every UI change)
1. Read the files the change touches and every other surface that shows the same thing ("do not miss anything": grep every use).
2. New direction or options asked for: mock it in chat and wait.
3. Components from the design system, tokens only, both themes, 44 px targets and labels, the states in section 7, motion and copy rules, header and footer patterns. Register edge cases with `useScenarios` and a demo-panel switch.
4. `npx tsc --noEmit`, `npm run lint`, `node scripts/lint-changed.js` (0 new). Adding a component: the component, a story, a doc page, a row in `docs/design-system-components.md`, then `npm run audit:coverage`.
5. Look at it on screen: web preview `http://localhost:8082/?signedin=1` (restart Metro with `--clear` after edits on Windows), the demo panel to walk every state, or headless Chrome (`puppeteer-core`) on the live site. The in-app browser only paints while the Claude window shows it.
6. Publish: `node scripts/publish.js web --direct --yes --message "..."` (commits source files, merges into `main`, pushes, waits for Vercel). He wants changes on `main`; publish in batches. Docs and skill files are not committed by the script: `git add` them. Another session may be editing the same folder: run `git status` first.

## 10. Where things are
`src/design-system/` (tokens, primitives, patterns, docs, stories), `docs/design-system-components.md`, `docs/ANIMATION_PATTERNS.md`, `docs/SESSION_HANDOFF.md`, `docs/SCREEN-MAP.md`, `docs/CHANGES_NOV_2026.md`, `docs/PERSONALISATION_COVERAGE.md`, `docs/TRAINER_APP_BRIEF.md`, `.claude/skills/yourpal-trainer-app/`, `.claude/skills/yourpal-publish/`. The older `yourpal-mobile-ui` skill is superseded by this one (its `catalog.md` is still generated from the code by `scripts/skill/learn.js`).
