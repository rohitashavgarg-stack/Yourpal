# YourPal member app (React Native · Expo SDK 57)

Phase 1 of the React Native build: design system, iOS-style motion, floating tab bar, sheets, toasts, login and onboarding. Today, Plans, Progress and Gym are placeholder shells that later phases fill in from the HTML prototype.

## Run it

```bash
npm install
npx expo start          # press i for iOS simulator, or scan the QR with Expo Go on your iPhone
npx expo start --web    # browser: phone frame + edge-case panel on wide screens
```

Build the web version: `npx expo export -p web` (output in `dist/`).

## Where things live

- `src/app/` — routes (Expo Router). `login.tsx`, `onboarding.tsx`, `(tabs)/` for Today · Plans · Progress · Gym.
- `src/components/` — `ui.tsx` (Txt, Button, Card, Chip, Pill, Segmented, Field), `Overlay.tsx` (bottom sheets + toasts), `FloatingTabBar.tsx` (hide on scroll), `TabScreen.tsx` (large title that collapses), `OtpInput.tsx`.
- `src/theme/tokens.ts` — colours (light + dark), fonts, springs. Same tokens as the HTML prototype.
- `src/lib/store.tsx` — mock backend on the device, plus the edge-case registry.
- `prototype/` — the original HTML/CSS/JS design prototype (reference only, not bundled).
- `assets/` — app icon, splash and favicon.
- `src/web/WebFrame.tsx` — web-only phone frame with the edge-case panel outside the phone.

## Edge cases

Every screen registers its scenarios with `useScenarios(...)`. On a wide browser they show in the side panel; on a phone, tap the slim blue tab on the right edge.

Login: number not found, wrong code (3 tries → lock), Android SMS auto-read, offline, join code (`GOLD21`).
Onboarding: jump to any step, assessment not scheduled, offline, required injury note, skip height/weight, notifications allow / not now.
