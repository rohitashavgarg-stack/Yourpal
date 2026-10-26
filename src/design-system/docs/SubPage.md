# SubPage

`src/design-system/primitives/SubPage.tsx`

## Purpose

The full-screen pushed page: a round 44 px glass back (or close) button, a centred title, an optional right slot, a header that floats over the scrolling content (with a progressive blur once you scroll), and an optional footer. Also exports `goBack(fallback)`: back to the previous screen, or replace with `fallback` (default `/(tabs)`) when there is nothing to go back to.

There were two SubPages with small differences, so there are two variants. Both old import paths keep working: `features/shell/parts` and `features/progress/parts` each re-export `SubPage` with their own variant preset.

## Props

| Prop | Type | Default | Variant | What it does |
|---|---|---|---|---|
| `title` | string | required | both | Centred title, 17 px semibold |
| `children` | node | required | both | The page content |
| `right` | node | none | both | Right slot (shell: in a 44 px min box; progress: as given, or a 44 px spacer) |
| `footer` | node | none | both | Under the scroll (shell: in a bar with a top border) |
| `fallback` | string | `'/(tabs)'` | both | Where back goes when there is no history |
| `variant` | `'shell' \| 'progress'` | `shell` | | |
| `close` | boolean | false | shell | An X instead of the back chevron, labelled "Close" |
| `gap` | number | 12 | shell | Space between children |
| `backdrop` | node | none | both | Drawn behind the top of the content and scrolls with it (a tinted gradient). Position it absolutely |
| `titleIcon` | node | none | progress | An icon or avatar before the title |
| `onTitlePress` | () => void | none | progress | Makes the title (with `titleIcon`) pressable |
| `scroll` | boolean | true | progress | false: no ScrollView, the header sits above the children |
| `toastLift` | number | 24 | progress | Raises the snackbar this much above the safe area |
| `onBack` | () => boolean | none | progress | Runs first on back; return true when handled |

## States

| | `shell` (default) | `progress` |
|---|---|---|
| Used by | Profile, Settings, Notifications, Goal setup | Progress, Gym, Goal, Coach pages |
| Scrolls | always | `scroll` |
| Bottom padding | footer ? 24 : 40 + safe area | safe area + 28 |
| Back icon | 22 px (X when `close`) | 20 px |
| Toast lift | none | `toastLift` |

Header states: at rest (transparent), scrolled (progressive blur behind the header).

## Do and don't

- Do use it for every pushed page so back, title and safe area are the same everywhere.
- Do put the page's one main action in `footer`.
- Don't add a second back button in the content.
- Don't put a long title; it is one line and truncates.

## Accessibility

- Back is a 44 px button labelled "Back" (or "Close").
- The title has role `header`.
- With `titleIcon` and `onTitlePress`, the title is a button labelled "<title>. View profile" (44 px min height).
- On iOS the page avoids the keyboard (`KeyboardAvoidingView` with padding).

## Copy rules

- Title is a noun, one to three words: "Notifications", "Body", "Coach Vikram".
- No dot separators in the title or the right slot.
