# Banner

`src/design-system/patterns/Banner.tsx`

## Purpose

The account banner: what is happening with the membership, and a way to open the plan. It is information, not a form. Membership is view-only in the app, so the only action is to open the plan. It was two components, the Today strip (`PaymentBanner`) and the Gym card (`MembershipCard`); the old names stay as containers in `features/today/PaymentBanner.tsx`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'strip' \| 'card'` | required | strip: edge to edge under the header on Today. card: a full width card on the Gym tab and in the updates stack |
| `icon` | `'clock' \| 'pause' \| 'ok'` | required | The icon in the tile. A strip draws pause or clock only (`ok` falls back to clock) |
| `tone` | `'warn' \| 'plain'` | required | card only. warn: amber fill. plain: the surface with a green icon. A strip is always amber |
| `title` | string | required | What is happening |
| `line` | string | required | What it means |
| `act` | string | none | What to do, as a quiet line under `line`. Card only |
| `once` | boolean | false | strip only: a one-time notice with a cross to dismiss |
| `onPress` | () => void | required | Opens the plan |
| `onDismiss` | () => void | none | The cross on a `once` strip |

## States

| State | Look |
|---|---|
| strip | Amber soft fill, edge to edge (-16 px margins), 40 px amber icon tile, title and line, outlined "View plan" pill on the right |
| strip, `once` | Same, plus a 44 px cross to dismiss |
| card, warn | Amber soft fill, 20 px corners, amber icon tile, title, line, optional `act`, underlined "See plan" |
| card, plain | Surface fill, green icon tile (for an active membership, icon `ok`) |

Membership states, as the container (`features/today/PaymentBanner.tsx`) maps them: Active is a plain card with the `ok` icon; Expiring is an amber card with the clock (on Today it sits in the updates stack, not as a strip); Expired is amber with the pause icon and is the only state that gets the strip on Today.

Baseline images in `docs/visual-baseline/cards/`: `banner-strip`, `banner-card-active`, `banner-card-expiring`, `banner-card-expired`.

## Do and don't

- Do show one account banner at a time. If several things are true, show the most urgent.
- Do say a membership pause here and only here. A goal is never frozen or paused.
- Don't add Pay, Renew or Resume buttons. Members never see them; the action is "View plan" / "See plan".
- Don't use red. Amber for warnings, green for all good.
- Don't style a paused membership as a failure: amber, a pause icon, calm words.

## Accessibility

- strip: one button labelled "<title>. <line> View plan". The dismiss cross is a separate 44 px button labelled "Dismiss".
- card: one button labelled "<title>. <line> <act> See plan".
- The whole strip or card is the tap target (well over 44 px).

## Copy rules

- Title says what is happening, with the number: "Membership ends in 12 days", "Membership expired", "Annual plan is active".
- Line says what it means, one sentence: "Expires on 6 Oct.", "Logging and other features are paused. Your history is safe."
- `act` says the smallest next step, quietly: "Renew at Wulf Fitness reception."
- No dot separators, no guilt, no emoji. Never "Pay now".
