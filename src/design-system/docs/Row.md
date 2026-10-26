# Row

`src/design-system/primitives/Row.tsx`

## Purpose

A horizontal row with the children centred on the cross axis. Nothing else: gap, wrap and justify come from `style`.

```tsx
<Row style={{ gap: 8, justifyContent: 'space-between' }}>
  <Txt>Protein</Txt>
  <Txt muted>86 g</Txt>
</Row>
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `style` | ViewStyle | none | Merged after `flexDirection: row` and `alignItems: center` |
| `children` | node | required | The items |
| `collapsable` | boolean | default | Passed to View |

## States

No states.

## Do and don't

- Do use it instead of a `View` with `flexDirection: row` and `alignItems: center`.
- Don't use it for a list of facts: use `MetaRow`.

## Accessibility

- A plain View: no role, no label.

## Copy rules

- Not applicable.

Moved here from `components/ui.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
