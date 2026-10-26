@AGENTS.md

@docs/PHASE2_HANDOFF.md

@docs/SESSION_HANDOFF.md

## Design system rules (for every change)

- Use components from `src/design-system/` (primitives, then patterns) before creating any new one. Check the docs index `docs/design-system-components.md` or Storybook (`npm run storybook`) first.
- Tokens only for colour, spacing, radius and type: `useTheme()` colours, or `fixed` / `onDark` / `gradients`, `radii` / `round(h)`, `fontSizes` from `@/design-system/tokens`. No hard-coded values. `npm run lint:changed` fails a branch that adds one.
- Do not restyle a component in place. If a screen needs a different look, add a variant (a prop) to the component, document it and add its story.
- States are props on the component, never copies of it.
- Tap targets are 44 px. Where the drawn size must stay smaller, add a hit slop (Button and Option do it for you); do not make the drawn element bigger.
- Accessibility: every pressable has a label, an icon-only button uses `IconButton` (it announces its disabled state), headings use `SectionLabel` or `accessibilityRole="header"`, entrance animation uses `FadeIn` (it respects reduce motion).
- Choices in a set (one of several) use `Option`; actions use `Button`. A look that exists is a kind or a size, not a new component.
- A goal is never frozen or paused. A membership pause shows as the account banner and as the paused state of the workout card (shown only while the membership is paused); never on the goal.
- Members never see Pay or Resume buttons. Membership is view-only in the app.
- One account banner and one top snackbar at a time.
- Voice: say the number, put the fact first and then the smallest next step, credit the coach by name ("Coach Vikram"), no guilt, no emoji. No dot separators ("text · text"); chips are not actions; amber for warnings, never red for frozen, paused or comeback.
- Check your branch before a PR: `npx tsc --noEmit`, `npm run lint`, `npm run lint:changed`; look at the review page (`docs/HANDOFF.md`) for any screen you touched.
- How the folders fit together, how to add a component and how to check screenshots: `docs/HANDOFF.md`.
