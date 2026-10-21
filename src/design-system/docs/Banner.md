# Banner

`src/design-system/patterns/Banner.tsx`. The account banner: what is happening with the membership, and a way to open the plan. It was two components, the Today strip (`PaymentBanner`) and the Gym card (`MembershipCard`). The old names stay as containers in `features/today/PaymentBanner.tsx`.

| Prop | Type | What it does |
|---|---|---|
| `variant` | `'strip' \| 'card'` | strip: edge to edge under the header. card: full width card |
| `icon` | `'clock' \| 'pause' \| 'ok'` | strip draws pause or clock only |
| `tone` | `'warn' \| 'plain'` | card only; a strip is always amber |
| `title`, `line` | string | what is happening, what it means |
| `act` | string | what to do, quiet line. Card only |
| `once` | boolean | strip: shows a cross to dismiss |
| `onPress`, `onDismiss` | | |

States in `docs/visual-baseline/cards/`: `banner-strip`, `banner-card-active`, `banner-card-expiring`, `banner-card-expired`.
