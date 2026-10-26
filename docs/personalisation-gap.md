# Personalisation gap audit

Audit of branch `design-system-handoff` (22 Oct). The app is a front-end prototype with no backend: there is no `fetch`, no API client and no analytics library anywhere in `src/`. Anything that only works on this phone, from a fixed sample, or through the demo panel is marked **Partial**, not Built.

## Summary

| Status | Count |
| --- | --- |
| Built | 0 |
| Partial | 9 |
| Missing | 9 |

Partial: profile steps, offline last-saved screen, usual-time learning, Health Connect / Apple Health, server push, near-gym location, daily content, repeat last meal / log as planned, membership expiry reminders.
Missing: waiver, first-week self-assessment, GET /home, card analytics, programme day count, sponsored cards, challenges, leaderboards, "Why am I seeing this" / personalisation off switch.

## Features

| # | Feature | Status | Where (file:line) | What exists, what is missing |
| --- | --- | --- | --- | --- |
| 1 | Waiver | Missing | `src/app/onboarding.tsx:488-517` (ConsentStep, closest), `:143` ("Agree and continue") | The only agreement in onboarding is a privacy screen about what the gym can see; there is no liability or health waiver to read and accept. |
| 2 | First-week self-assessment | Missing | `src/app/onboarding.tsx:226-231` (welcome "how your first week works"), `src/app/gym/assessments.tsx:36-48`, `src/app/progress/assess.tsx` | Assessments exist but are coach-run at the gym (booked at the front desk); there is no self-assessment the member does in the first week. |
| 3 | Profile steps (profile completion) | Partial | `src/app/onboarding.tsx:38` (step order), `:78`, `:100-108` ("Add later" skips body steps), `:459-486` (Basics) | Onboarding collects the profile in steps and lets height, weight and target be skipped, but nothing afterwards (no checklist, percentage or nudge) brings the member back to finish the skipped steps. |
| 4 | GET /home service | Missing | `src/app/(tabs)/index.tsx` (Today composed on the client), `src/lib/domain.tsx:99-105` (local defaults) | Today is built in the client from local domain state and mock data in `src/lib/data.ts`; there is no fetch or endpoint of any kind. |
| 5 | Card shown / tapped / dismissed tracking | Missing | `src/lib/domain.tsx:50` (`dismissed`), `src/features/today/ForYou.tsx:85,185-191`, `src/features/today/TopCards.tsx:202-203`, `src/features/today/PaymentBanner.tsx:43` | Dismissing a card is stored in local state only to hide it; no shown, tapped or dismissed event is logged and no analytics library is installed. |
| 6 | Offline last-saved screen | Partial | `src/app/(tabs)/plans.tsx:124,142-144`, `src/app/gym/chat.tsx:89-92,184`, `src/app/plans/ask.tsx:41`, `src/app/plans/edit.tsx:103`, `src/lib/store.tsx:99-111` | A demo "Offline" switch shows banners and "saved on this phone, syncs later" toasts on Plans and Chat, and the app store persists to `localStorage` on web; Today has no offline state and there is no "last updated at" view of cached data. |
| 7 | Programme day count in greeting | Missing | `src/features/today/TodayGreeting.tsx:28-36`, `src/lib/microcopy.ts:14,23,28-38` | The greeting uses the day of the month only to rotate wording; no programme start date or "Day N of your programme" exists. |
| 8 | Usual-time learning | Partial | `src/app/onboarding.tsx:366-369` ("Usual time" pills), `src/lib/domain.tsx:130` (`plannedMin`), `src/features/today/TodayGreeting.tsx:30` | The workout time comes from a fixed onboarding answer mapped to a constant; meal times are fixed in `MEALS`; nothing learns from when the member actually trains or eats. |
| 9 | Real Health Connect / Apple Health data | Partial | `src/lib/health.ts:4`, `src/app/profile/health.tsx:27-36`, `src/app/onboarding.tsx:88`, `src/lib/domain.tsx:133-134`, `src/features/today/StepsCards.tsx:27` | Connect and disconnect only flip `d.hc` and show a toast; steps are the constant `SENSOR = 5230` and heart rate, sleep and energy are sample values; no health package is installed. |
| 10 | Server push (comeback 3/7/14/30 days, renewal) | Partial | `src/features/reminders/push.ts:10-24`, `src/lib/notify.ts:13-32`, `src/web/WebFrame.tsx:189,292-294`, `src/features/today/TopCards.tsx:143` | Only local notifications exist (an immediate reminder preview fired from the demo panel and a scheduled "Still training?" nudge via `expo-notifications`); comeback is an in-app Today variant with demo "days away" (2/4/8/15), and there is no server, push token or 3/7/14/30-day schedule. |
| 11 | Real location for the near-gym card | Partial | `src/features/today/CheckInBar.tsx:31,86-93`, `src/app/checkin.tsx:46,55,74-75`, `src/features/checkin/GymMap.native.tsx:11-18` | The near / at-gym / location-off states and the map exist, but position comes from the demo "Check-in (location)" row as a fixed metre offset from a hardcoded gym coordinate; "Refresh" is a timer and `expo-location` is not installed. |
| 12 | Daily content | Partial | `src/features/today/DayQuote.tsx:12-31`, `src/lib/microcopy.ts:61-75` (`QUOTES`, `quoteOfDay`), `src/app/(tabs)/index.tsx:158` | Today ends with a "thought for the day" picked by date from 12 hardcoded quotes; there are no articles, tips or content that is fetched or matched to the member. |
| 13 | Sponsored cards | Missing | none (closest: `src/features/today/ForYou.tsx:44-85` card stack) | No sponsored, partner or promoted card type exists. |
| 14 | Challenges | Missing | none (closest: `src/features/streak/data.ts:24` badges, `src/app/progress/streaks.tsx`) | Streaks and badges exist, but there are no challenges to join. |
| 15 | Leaderboards | Missing | none | No leaderboard or ranking against other members anywhere. |
| 16 | "Why am I seeing this" and personalisation off switch | Missing | closest: `src/app/profile/privacy.tsx:28-37` (sharing toggles), `src/app/profile/notifications.tsx:34-39`, `src/features/today/ForYou.tsx:142` (dismiss X) | Cards can be dismissed and sharing / notification switches exist, but no card explains why it is shown and there is no switch to turn personalisation off. |
| 17 | Repeat last meal, and log as planned | Partial (log as planned) / Missing (repeat last meal) | `src/features/today/LogMealsSheet.tsx:40,75` ("Mark all as eaten"), `src/features/plans/dietActions.ts:43-51` (`mealAll`), `src/features/plans/DietPlan.tsx:232,252`, `src/lib/microcopy.ts:118` (`mealAsPlanned`, unused) | Logging a whole planned meal is one tap in the Log meal sheet and in Plans (local only; Today's meals card needs the sheet first, and the "logged as planned" toast copy is never used); nothing repeats yesterday's or the last meal. |
| 18 | Membership expiry reminders | Partial | `src/features/today/PaymentBanner.tsx:12-19,28,43`, `src/features/today/ForYou.tsx:61`, `src/features/today/TopCards.tsx:199`, `src/lib/microcopy.ts:96,100`, `src/app/profile/notifications.tsx:38` | In-app banner and For you / update cards show "ends in 12 days" when the demo membership is "Expiring" (fixed sample dates); a "Membership & payments" notification switch exists but nothing schedules or sends an expiry push. |

## Corrections to the earlier review

- **Daily content was not "not found".** `DayQuote` (`src/features/today/DayQuote.tsx`) shows a quote of the day on Today, picked by date from `QUOTES` in `src/lib/microcopy.ts:61-75`. It is Partial: a fixed local list, not a content feed.
- **Log as planned was not "not found".** "Mark all as eaten" (`src/features/today/LogMealsSheet.tsx:75`) and `mealAll` in Plans (`src/features/plans/dietActions.ts:43`) log every planned item of a meal in one tap. Partial. Repeat last meal is confirmed missing.
- **Profile steps were not "not found".** The 15-step onboarding (`src/app/onboarding.tsx:38`) collects the profile and allows "Add later"; what is missing is a completion prompt afterwards. Partial.
- **Waiver: confirmed missing.** The "Agree and continue" consent step is about data sharing, not a waiver.
- **Self-assessment: confirmed missing.** Only coach-run gym assessments exist.
- **Challenges, leaderboards, sponsored cards, "Why am I seeing this": confirmed missing.**
- **Health Connect and push: confirmed simulated / local only.** One nuance: push is not purely simulated. On native, `expo-notifications` does schedule a real local "Still training?" notification (`src/lib/notify.ts:26`) and fires the reminder preview as a real local notification (`src/features/reminders/push.ts:20`). There is still no server push.
- **Check-in location: confirmed demo only.** The real map component (`react-native-maps`) is used on native, but the member's position is a demo offset, not GPS.
- Not covered by the earlier review: **membership expiry reminders** exist in-app (Partial), **usual time** is asked once but never learned (Partial), and the **offline** state is shown on Plans and Chat but not on Today (Partial).
