# Field and NoteField

`src/design-system/primitives/Input.tsx`

## Purpose

The two text inputs. `Field` is the one-line field (56 px, optional prefix). `NoteField` is the multi-line note with a character count.

```tsx
<Field value={v} onChangeText={setV} placeholder="Phone number" prefix="+91" error={bad} accessibilityLabel="Phone number" />
<NoteField value={note} onChangeText={setNote} placeholder="Anything for your coach?" maxLength={300} />
```

## Props: Field

Every `TextInput` prop, a ref (`forwardRef`), and:

| Prop | Type | Default | What it does |
|---|---|---|---|
| `prefix` | string | none | Muted text before the input ("+91") |
| `onPrefixPress` | () => void | none | Makes the prefix a button with a small arrow (a country code the member can change). `prefixLabel` is its spoken label |
| `error` | boolean | false | 1.5 px amber line |
| `style` | TextStyle | none | Applied to the inner TextInput |

## Props: NoteField

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | string | required | |
| `onChangeText` | (t: string) => void | required | |
| `placeholder` | string | none | |
| `accessibilityLabel` | string | none | Spoken label of the input |
| `autoFocus` | boolean | false | |
| `error` | boolean | false | 1.5 px amber line |
| `maxLength` | number | 500 | Limit; the count "n/max" shows at the bottom right |
| `minHeight` | number | 112 | Box height; the text grows to 220 px then scrolls |

## States

| State | Line |
|---|---|
| Rest | 1 px `c.line` |
| Focus | 1.5 px accent |
| Error | 1.5 px amber (`c.warn`), wins over focus |

| | Field | NoteField |
|---|---|---|
| Height | 56 px, `radii.xl` | `minHeight` 112, `radii.lg` |
| Text | 16 px medium | 16 / 23 medium, multi-line |
| Placeholder | muted | muted |

## Do and don't

- Do show the error message as a line of text under the field; the amber line alone is not enough.
- Do use `prefix` for a fixed part of the value (country code, currency).
- Don't use red for errors: amber.
- Don't use `Field` for OTP boxes, the chat composer or number entry on the log and body pages; those are their own controls.

## Accessibility

- Field: pass `accessibilityLabel` (it goes to the TextInput). The placeholder is not a label.
- NoteField: pass `accessibilityLabel`. The character count is plain text and is read in order.
- Both are 56 px or taller, above the 44 px minimum.

## Copy rules

- Placeholder is an example or a short question ("Anything for your coach?"), not an instruction in capitals.
- Error text says what to do next in one sentence: "Enter the 10 digit number". No blame, no "Invalid".
