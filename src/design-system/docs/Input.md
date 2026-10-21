# Field and NoteField

`src/design-system/primitives/Input.tsx`. The two text inputs.

```tsx
<Field value={v} onChangeText={setV} placeholder="Phone number" prefix="+91" error={bad} />
<NoteField value={note} onChangeText={setNote} placeholder="Anything for your coach?" maxLength={300} />
```

| Prop | Field | NoteField |
|---|---|---|
| Height | 56 px, `radii.xl` | `minHeight` 112, `radii.lg` |
| `prefix` | text before the input | no |
| `error` | 1.5 px amber line | same |
| Focus | 1.5 px accent line | same |
| `maxLength` | pass it through | default 500, shows a count at the bottom right |
| Other props | every `TextInput` prop, and a ref | `value`, `onChangeText`, `placeholder`, `accessibilityLabel`, `autoFocus`, `minHeight` |

States: rest (1 px line), focus, error. Placeholder colour is the muted text colour.

Not merged: `OtpInput` (six boxes), the chat `Composer` (grows with the text, has a send button), and the number inputs on the log and body pages. They are different controls with their own layout.
