# SectionLabel

`src/design-system/primitives/SectionLabel.tsx`

## Purpose

The small heading above a group of cards. It replaces four separate `Label` components. `import { Label } from '@/features/shell/parts'` still works (it is `SectionLabel` with the default variant).

```tsx
<SectionLabel>Account</SectionLabel>
<SectionLabel variant="overline" inset={4}>THIS MONTH</SectionLabel>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `children` | node | required | The text |
| `variant` | `'overline' \| 'quiet' \| 'label'` | `label` | One of the looks below |
| `inset` | number | 6 for `label`, 0 for the others | Horizontal padding |
| `style` | TextStyle | none | Merged last |

## States

| Variant | Look | Was |
|---|---|---|
| `overline` | 11 / 15 semibold, letter-spacing 1.3, muted | `Label` in `app/coach.tsx` and `app/progress/streaks.tsx` (streaks adds `inset={4}`) |
| `quiet` | 13 / 19 medium, muted | `Label` in `app/goal-detail.tsx` |
| `label` (default) | `Txt` variant "label", 6 px inset | `Label` in `features/shell/parts.tsx` |

## Do and don't

- Do use one variant per screen.
- Don't use it inside a card as the card title; the card has its own title.
- Don't make it a link.

## Accessibility

- It is text with no `header` role, and it takes no accessibility props. The cards under it carry their own titles. If a screen needs headings for navigation, mark the card titles as headers.

## Copy rules

- One or two words, a noun: "Account", "Reminders", "This month".
- No dot separators, no counts in brackets.
