# EffortSlider

`src/design-system/primitives/EffortSlider.tsx`. Storybook: Primitives / EffortSlider.

## Purpose

A drag slider for "how hard was it" on a logged workout. One continuous track from easy (blue) through green and yellow to max (red), fine tick marks, and a round white handle with a grey centre.

```tsx
const [v, setV] = useState(0.55);
<EffortSlider value={v} onChange={setV} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | number | required | 0 is easy, 1 is max |
| `onChange` | (v) => void | none | Called while dragging, in steps of 0.05. Not needed with `readOnly` |
| `readOnly` | boolean | false | Shows a logged value; the handle cannot be dragged |
| `label` | string | Effort | The accessibility label |

## States

| State | Look |
|---|---|
| resting | handle at the value |
| read only | the same look, no dragging, announced as an image |
| dragging | handle follows the finger; a light tap on each new position |

## Do and don't

- Do put the words "Easy" and "Max" under the ends, and say the level in text beside it for people who cannot see colour.
- Don't use it for a value that has a unit.
- Do use `readOnly` on a page that shows what was logged: the member should see their answer, not a question.

## Accessibility

- It announces as adjustable. Swipe up or down to change by one tenth. The value is read as Easy, Moderate, Hard, Very hard or Max.
