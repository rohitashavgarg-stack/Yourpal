# Pill

`src/design-system/primitives/Pill.tsx`. A selectable pill for filters and options (44 px high, `radii.lg`). Selecting it fills it with ink over 220 ms. Not for actions: use a Button.

```tsx
<Pill label="Today" on={value === 0} onPress={() => setValue(0)} />
```

| Prop | Type | What it does |
|---|---|---|
| `label` | string | text |
| `on` | boolean | selected: ink fill, background-coloured text |
| `onPress` | () => void | |
| `style` | ViewStyle | for width, for example `flex: 1` |

Accessibility: role `radio`, state `selected`.

Near-copies that were left alone because they are not the same look: the food-type picker on the log page (has a veg or egg mark inside and does not animate), the range switch on Trends (32 px high, `radii.md`), the option rows in the scan sheet (list rows, not pills). The `SwitchChip` and `ActionChip` on the demo panel are web-only developer controls.
