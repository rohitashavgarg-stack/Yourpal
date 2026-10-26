# CheckCircle

`src/design-system/primitives/CheckCircle.tsx`

## Purpose

A round check box with a tick that draws itself in 380 ms. Used for meal items and set rows. The circle can be small; the tap area is always at least 44 px (`hit`).

```tsx
<CheckCircle on={done} size={28} tone="good" label="Oats, done" onPress={toggle} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `on` | boolean | required | Checked |
| `size` | number | 40 | Diameter of the circle |
| `tone` | `accent \| good` | `accent` | Fill colour when on |
| `onPress` | () => void | none | Toggle |
| `label` | string | required | Accessibility label |
| `hit` | number | 44 | Side of the tap area |

## States

| State | Look |
|---|---|
| off | outline (`surface3` or `chipLine`), no fill |
| on | filled with the tone, white tick, scale 1.05 |

## Do and don't

- Do give every check a label that names the item: "Oats, done".
- Don't make the circle bigger to get a bigger tap area: raise `hit`.

## Accessibility

- Role `checkbox`, `checked` state, the label you pass.
- Tap area 44 px.

## Copy rules

- The label names the item, not the action.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
