# Callout

`src/design-system/primitives/Callout.tsx`. Storybook: Primitives / Callout.

## Purpose

A soft block inside a page or a sheet: a notice (something to know), a tip, or a quiet panel that holds a note, a row or a stat. It draws the fill, the corners and the padding only. No shadow, no line. What goes inside is the caller's: a title and a sentence, a row, a number. It replaced fifteen hand-built blocks and is what `InfoBox` in Plans is built on.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `tone` | `'warn' | 'accent' | 'plain'` | `plain` | The fill: soft amber, soft blue, or the quiet surface |
| `size` | `'compact' | 'sm' | 'md' | 'lg' | 'xl'` | `md` | Padding and corners, see States |
| `gap` | number | none | Space between the children |
| `style` | ViewStyle | none | Layout only: flex, width, margins, alignment. Not colours, radius or padding |
| other View props | | | Passed on (`accessibilityRole="alert"`, `accessibilityLabel`, `accessible`, `onLayout`) |

`calloutInk(tone, colours)` returns the text colour that goes with a tone, for callers that draw their own text.

## States

| Size | Padding | Corner | Used for |
|---|---|---|---|
| compact | 10 | 14 | the microphone notice under the chat composer |
| sm | 12 | 18 (`radii.md`) | stat tiles, a short notice (chat "away") |
| md | 14 top and bottom, 16 sides | 20 (`radii.block`) | notes and hints, the plans info box, the calorie line |
| lg | 16 | 22 (`radii.lg`) | a notice with a title and a sentence, a panel with a note |
| xl | 18 | 24 (`radii.card`) | a notice that is a whole card, such as Delete account |

| Tone | Fill | Text colour |
|---|---|---|
| warn | `warnSoft` | the warn colour |
| accent | `accentSoft` | the accent text colour |
| plain | `surface2` | the normal or the muted colour |

## Do and don't

- Do use warn for amber. Never red: frozen, paused and a comeback are not failures.
- Do pick the nearest size instead of tuning padding; add a size if a real design needs one.
- Don't put an action inside as a chip. Use a Button.
- Don't use it for a card the member taps. That is a Card (or a PCard).
- Don't stack two warn callouts on one screen.

## Accessibility

- A notice that appears after something happened (an error, "away") gets `accessibilityRole="alert"` so it is read out.
- A tile read as one thing gets `accessible` and an `accessibilityLabel` with its words and number ("Sets 12").
- Text on warn uses the warn colour, which has enough contrast on the soft fill in both themes.

## Copy rules

- Say the number or the fact first, then the smallest next step: "Coach Vikram is away until Mon 10:00 am, so replies will be slower. Something urgent? Ask the front desk."
- Credit the coach by name. No guilt, no emoji, no dot separators.
