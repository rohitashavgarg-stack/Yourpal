# Chip

`src/design-system/primitives/Chip.tsx`

## Purpose

An outline chip for information: 28 px high, 14 px corner, 1 px line. A chip is never an action. It looks like a button, so actions use `Button`, and facts in a row use `MetaRow`.

```tsx
<Chip label="Leg day" icon={<Dumbbell size={13} color={c.ink} />} />
<Chip label="Live" tone="live" onDark />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | Text, 12 px medium |
| `icon` | node | none | Before the text, 6 px gap |
| `tone` | `'default' \| 'good' \| 'warn' \| 'live'` | `default` | Text and line colour |
| `onDark` | boolean | false | White text and a white 28% line, for dark cards (default tone only) |
| `style` | ViewStyle | none | Merged last |

## States

| Tone | Text and line |
|---|---|
| default | ink text, `c.chipLine` line |
| default + `onDark` | white text, white 28% line |
| good | `c.good` |
| warn | `c.warn` (amber) |
| live | `c.live` (mint), for a running session only |

## Do and don't

- Do use it for a label that names a thing or a state: "Leg day", "In 2 h", "Next: Pull, Thu 6:30 pm".
- Don't put `onPress` on it (it has none) or wrap it in a Pressy. Chips are not for actions.
- Don't line up several chips as a row of facts: use `MetaRow`.
- Don't use `warn` for frozen, paused or comeback. Those are not failures.
- Mint (`live`) is only for live states.

## Accessibility

- A View with a Text: read as its text. No role.
- Not a tap target.

## Copy rules

- One to four words. No dot separators, no emoji.
- Fact first: "3 of 4 done", not "Done: 3/4".

Near-copies left alone: five 28 px bordered Views on the workout card, the meals card and the comeback card. Each has a custom line colour, a fill, or a 1 px different line height, so using Chip would move pixels.
