# Decisions for the designer

Hand-built elements that are close to a library component but not the same, so they were left alone. Each row gives both sets of values. Say which way to go (change the element to the library look, or add a variant to the library) and it can be done in one pass.

## Buttons: near-matches left as they are

The four repeated button patterns (44 px, 32 px, 48 px and 72 px high). No element matches a `Button` preset exactly, so none was replaced. "Library" is the nearest preset. Library kinds: primary (ink fill), accent, secondary (c.surface2 fill), ghost, outline (1 px c.line), white, glass.

| Where | Hand-built | Nearest library | Differs by |
|---|---|---|---|
| `features/today/LogMealsSheet.tsx:125` | 44 high, radius radii.lg, border 1 c.chipLine dashed | small: 44 high, radius radii.lg, side padding 20, text 13/18 | dashed border (no preset); selectable or sized by its row (not a plain Button) |
| `features/today/LogMealsSheet.tsx:129` | 44 high, radius radii.lg, border 1 c.line | small: 44 high, radius radii.lg, side padding 20, text 13/18 | border 1 c.line (only outline has one: 1 px c.line); selectable or sized by its row (not a plain Button) |
| `app/(tabs)/plans.tsx:51` | 32 high, radius radii.md, side padding 12, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `features/plans/DietPlan.tsx:268` | 44 high, radius radii.lg, border 1 c.chipLine dashed | small: 44 high, radius radii.lg, side padding 20, text 13/18 | dashed border (no preset) |
| `app/coach.tsx:80` | 44 high, radius radii.lg, side padding 16, border 1 c.chipLine | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; border 1 c.chipLine (only outline has one: 1 px c.line) |
| `app/gym/chat.tsx:117` | 32 high, radius radii.md, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `app/gym/chat.tsx:153` | 44 high, radius radii.lg, side padding 16, border 1 c.chipLine | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; border 1 c.chipLine (only outline has one: 1 px c.line) |
| `app/onboarding.tsx:303` | 72 high, radius radii.lg, side padding 16, fill c.surface, border on ? 2 : 1 on ? c.ink : c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 2 : 1 on ? c.ink : c.line (only outline has one: 1 px c.line); fill c.surface; selectable or sized by its row (not a plain Button) |
| `app/onboarding.tsx:329` | 72 high, radius radii.lg, side padding 18, fill c.surface, border on ? 2 : 1 on ? c.ink : c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 2 : 1 on ? c.ink : c.line (only outline has one: 1 px c.line); fill c.surface; selectable or sized by its row (not a plain Button) |
| `app/onboarding.tsx:357` | 72 high, radius radii.lg, fill on ? c.ink : c.surface, border on ? 0 : 1 c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 0 : 1 c.line (only outline has one: 1 px c.line); fill on ? c.ink : c.surface; selectable or sized by its row (not a plain Button) |
| `app/plans/create.tsx:85` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `app/plans/edit.tsx:149` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `app/plans/log.tsx:212` | 44 high, radius radii.lg, fill wType === t ? c.ink : 'transparent', border 1 wType === t ? c.ink : c.surface3 | small: 44 high, radius radii.lg, side padding 20, text 13/18 | border 1 wType === t ? c.ink : c.surface3 (only outline has one: 1 px c.line); fill wType === t ? c.ink : 'transparent'; selectable or sized by its row (not a plain Button) |
| `app/profile/index.tsx:80` | 44 high, radius radii.lg, side padding 18, fill c.surface | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 18 vs 20; fill c.surface |
| `app/workout.tsx:228` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `features/workout/NewWorkoutUI.tsx:66` | 44 high, radius radii.lg, side padding 18, fill fixed.white, border 1 '#C9D1DD' | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 18 vs 20; border 1 '#C9D1DD' (only outline has one: 1 px c.line); fill fixed.white |
| `features/workout/NewWorkoutUI.tsx:99` | 32 high, radius radii.md, side padding 12, fill fixed.white, border 1 '#C9D1DD' | none at 32 px (presets are 56, 50, 44, 40, 36) | height; border 1 '#C9D1DD' (only outline has one: 1 px c.line); fill fixed.white; radius radii.md |
| `components/bits.tsx:130` | 44 high, radius radii.lg, side padding 16, fill on ? c.ink : 'transparent' | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; fill on ? c.ink : 'transparent'; selectable or sized by its row (not a plain Button) |
| `features/trackers/Widgets.tsx:46` | 44 high, radius radii.lg, side padding 12, fill 'rgba(255 | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 12 vs 20; fill 'rgba(255; selectable or sized by its row (not a plain Button) |
| `features/progress/TrendUI.tsx:51` | 32 high, radius radii.md, side padding 14, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `features/progress/TrendUI.tsx:80` | 32 high, radius radii.md, fill on ? c.ink : 'transparent' | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill on ? c.ink : 'transparent'; radius radii.md; selectable or sized by its row (not a plain Button) |

## Cards: near-matches left as they are

The three repeated card patterns. `Card` has three looks: default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode; compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode; dark. No element matches one exactly (radius, padding, fill and shadow together), so none was replaced.

| Where | Hand-built | Nearest library | Differs by |
|---|---|---|---|
| `features/today/ForYou.tsx:121` | radius radii.card, padding 16, fill c.surface, card shadow (same as Card in light mode), gap 12, border 1 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18; border 1; clips its content (overflow hidden) |
| `features/today/NoPlanCard.tsx:13` | radius radii.card, padding 16, fill c.surface, no shadow, gap 12 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18; Card adds the light-mode shadow; this has none |
| `app/gym/assessments.tsx:90` | radius radii.xl, padding per side, fill c.surface, card shadow (same as Card in light mode) | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding is per side, not one value |
| `app/gym/attendance.tsx:105` | radius radii.xl, padding per side, fill c.surface, card shadow (same as Card in light mode) | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding is per side, not one value |
| `app/gym/break.tsx:33` | radius radii.card, padding 16, fill c.surface, card shadow (same as Card in light mode), gap 4, border 1.5 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18; border 1.5 |
| `app/gym/break.tsx:39` | radius radii.xl, padding 18, fill c.surface, card shadow (same as Card in light mode), gap 10 | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding 18 vs 20; radius 28 matches default |
| `app/gym/break.tsx:53` | radius radii.card, padding 16, fill c.surface, card shadow (same as Card in light mode), gap 6 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18 |
| `features/onboarding/Steps.tsx:272` | radius radii.card, padding 16, fill c.surface, no shadow, gap 4 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18; Card adds the light-mode shadow; this has none |
| `features/onboarding/Steps.tsx:282` | radius radii.card, padding 16, fill c.surface, no shadow, gap 6 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18; Card adds the light-mode shadow; this has none |
| `app/plans/log.tsx:38` | radius radii.xl, padding per side, fill c.surface, no shadow, gap 6, border 1 | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding is per side, not one value; Card adds the light-mode shadow; this has none; border 1; a field, not a card |
| `app/profile/health.tsx:44` | radius radii.xl, padding 18, fill c.surface, no shadow, gap 14, border 1 | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding 18 vs 20; radius 28 matches default; Card adds the light-mode shadow; this has none; border 1 |
| `app/progress/lift.tsx:53` | radius radii.xl, padding per side, fill c.surface, card shadow (same as Card in light mode), gap 6 | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding is per side, not one value |
| `app/progress/metric.tsx:62` | radius radii.xl, padding 18, fill c.surface, card shadow (same as Card in light mode), gap 8 | default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode | padding 18 vs 20; radius 28 matches default; clips its content (overflow hidden) |
| `app/progress/streaks.tsx:70` | radius radii.card, padding 16, fill c.surface, card shadow (same as Card in light mode), gap 10 | compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode | padding 16 vs 18 |

## Icon buttons: near-matches left as they are

`IconButton` (src/design-system/primitives/Button.tsx): any size (default 44), any radius (default radii.lg), fill `bg` (default c.surface2), optional border, press scale from Pressy, no hitSlop, no absolute position of its own beyond `style`. Eight hand-built icon buttons matched exactly and now use it (plans menu 52, amount sheet 56, onboarding camera 68, exercise play 64, workout back 56 in two files, finish trophy 52, clip play 64).

| Where | Hand-built | Nearest library | Differs by |
|---|---|---|---|
| `features/chat/Composer.tsx:39` | 44 wide x 40 high, radius radii.sm, fill on ? c.accentSoft : 'transparent' | IconButton is square (size x size) | not square (44 x 40) |
| `features/chat/Composer.tsx:187` | 24 px, radius radii.sm, fill c.ink, hitSlop 10, absolute top -6 right -6 | IconButton 24, radius radii.sm, bg c.ink | hitSlop 10 (IconButton has no hitSlop prop; the tap area would shrink) |
| `features/today/StepsCards.tsx:57` | 30 px, radius 15, fill rgba white 0.16 / 0.22, hitSlop 10, zIndex 3 | IconButton 30, radius 15 | hitSlop 10 (no prop) |
| `features/workout/NewWorkoutUI.tsx:52` | 64 px, radius radii.sm, fill still ? fixed.white : c.surface2, border 1 c.line, overflow hidden, image behind the icon | IconButton 64, radius radii.sm | overflow hidden for the image (IconButton does not clip) |
| `web/WebFrame.tsx:316` | 30 px, radius 15, fill P.tint, plain Pressable (no press scale, no haptic) | IconButton 30, radius 15 | press scale and haptic would be added (behaviour change); demo panel only |
| `app/welcome.tsx:157` | 28 x 4 bar, radius radii.xs | none | not an icon button: a story progress segment the audit counts as one |
