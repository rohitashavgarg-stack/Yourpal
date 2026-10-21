# Chip

`src/design-system/primitives/Chip.tsx`. An outline chip for information (28 px high, 14 px corner, 1 px line). A chip is never an action: it looks like a button, so actions use Button.

```tsx
<Chip label="Leg day" icon={<Dumbbell size={13} color={c.ink} />} />
<Chip label="Live" tone="live" onDark />
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | | text, 12 px medium |
| `icon` | node | | before the text, 6 px gap |
| `tone` | `'default' \| 'good' \| 'warn' \| 'live'` | `default` | text and line colour; `default` is ink with the chip line |
| `onDark` | boolean | false | white text and a white 28% line, for dark cards |
| `style` | ViewStyle | | |

Near-copies left alone: five 28 px bordered Views on the workout card, the meals card and the comeback card. Each has a custom line colour, a fill, or a 1 px different line height, so using Chip would move pixels. They are listed in `docs/design-system-components.md` under "Not yet merged".
