# ChatBar

`src/design-system/patterns/ChatBar.tsx`. Storybook: Patterns / ChatBar.

## Purpose

The message bar of a chat, the same one the Coach Vikram chat has: a glass round button on the left (an action of the chat: the food library, attach), a glass pill with the text field, and at the right end of the pill a small camera and a glass round mic that becomes a send button once there is text. Use it for every chat so they all look the same: "Ate something else" uses it in its sheet and on its page.

```tsx
<ChatBar value={t} onChangeText={setT} placeholder="Anything else?" leftIcon={<Library size={22} color={c.ink} />} leftLabel="Open the food library"
  onLeft={openLibrary} onCamera={pickPhoto} onMic={dictate} onSend={send} bottomInset={insets.bottom} />
```

## Props

| Prop | Type | What it does |
|---|---|---|
| `value`, `onChangeText`, `placeholder` | string | The text field |
| `leftIcon`, `leftLabel`, `onLeft` | node, string, fn | The glass round button on the left and what it does |
| `onCamera` | fn | Shows the small camera inside the pill. Left out, no camera |
| `onMic` | fn | The glass round mic at the right end |
| `onSend` | fn | Send (the mic turns into the send arrow when there is text) |
| `onFocus`, `autoFocus` | | Passed to the field |
| `bottomInset` | number | Space under the bar |
| `onSheet` | boolean | Inside a bottom sheet: no page-colour strip behind the bar |

## States

| State | Look |
|---|---|
| empty | glass mic (accent tint) at the right end |
| typed | glass send arrow (stronger accent tint) |

## Do and don't

- Do keep the sizes: left button 46, pill height 46 and up, inner buttons 38.
- Don't draw a different message bar for another chat.

## Accessibility

- Every button has a spoken label. The field is labelled with its placeholder.
