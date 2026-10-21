# SubPage

`src/design-system/primitives/SubPage.tsx`. The full-screen pushed page: round glass back (or close) button, centred title, optional right slot, a header that floats over scrolling content, and an optional footer. Also exports `goBack`.

There were two SubPages with small differences, so there are two `variant`s. Nothing was unified that would move a pixel.

| | `shell` (default) | `progress` |
|---|---|---|
| Was | `features/shell/parts.tsx` (Profile, Settings, Notifications, Goal setup) | `features/progress/parts.tsx` (Progress, Gym, Goal, Coach) |
| Scrolls | always | `scroll` (default true) |
| Gap | `gap` (default 12), children inside a View | 12, children directly |
| Bottom padding | footer ? 24 : 40 + safe area | safe area + 28 |
| Footer | in a bar with a top border | as given |
| Right slot | in a box of at least 44 px, aligned right | as given, or a 44 px spacer |
| Back icon | 22 px (X when `close`) | 20 px |
| Toast lift | none | `toastLift` (default 24) |
| Back | `goBack(fallback)` | `onBack` first (return true when handled), then `goBack(fallback)` |

Props: `title`, `children`, `right`, `footer`, `fallback`, `variant`; shell only: `close`, `gap`; progress only: `titleIcon`, `onTitlePress`, `scroll`, `toastLift`, `onBack`.

Both old import paths keep working: each file re-exports `SubPage` with its own variant preset, so existing pages are unchanged. `goBack` is still exported from `features/shell/parts`.
