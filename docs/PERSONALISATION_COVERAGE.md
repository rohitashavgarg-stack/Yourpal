# Personalisation proposal: what the app covers (11 Nov 2026)

Checked against "YourPal Personalisation Proposal" (Sarvika technical proposal for a rule engine that decides the home screen and pushes). The proposal is mostly a backend service (a Kotlin decision service, rules as JSON, events, timers, a decision log, `GET /home`). This app is the member-facing prototype, so only the member-visible parts can be covered here. The engine itself is out of scope for this repo.

Status words: **Built** (works in the app), **Partly** (the screen exists, the rule behind it does not), **Not built**.

## Feature set (section 2)

| Proposal feature | Status | Where in the app |
|---|---|---|
| Tell us your goal (goal, target weight, how active) | Built | Onboarding questions (goal, experience, schedule, age, height, weight, target) |
| Trainer assessment and re-assessment | Built | Gym, Assessments (list, one assessment, next assessment with Remind me) |
| One small profile question a day (profile steps) | Not built | Nothing yet |
| Sign the waiver | Built | Today card, waiver sign page (Skip for now), signed screen, Profile row |
| Day greeting with name, day number and one fact | Partly | Today greeting (name, state, streak line). No "Day 12 of 90" count |
| Today snapshot (calories left, workout, steps) | Built | Today card (Eat and Burn with kcal), trackers (steps with Health) |
| Check-in near the gym | Built | Today check-in bar, full page map, 20 m area, location off fallback |
| Usual times (learned habits, one push when late) | Not built | Needs history and real pushes |
| Fast logging (recent foods, repeat last meal, log as planned) | Partly | Library shelves (Most eaten), quick picks in the log chat. No "Repeat last meal" or "Log as planned" button |
| Health Connect and Apple Health | Partly | Connect Health card and Health tiles. No real link |
| PT session confirmation | Built | Update card, Sessions, Confirm and rate |
| Weekly streak | Built | Progress, Streaks and badges |
| Daily content (tip, quick workout, recipe) | Not built | No tips or recipes |
| Gym-specific ads (sponsored card) | Not built | Nothing |
| Comeback (push at 3, 7, 14, 30 days, welcome back, easy session) | Partly | Comeback day, easy session card, greeting. No scheduled pushes |
| Membership and renewal (banner, Renew card, reminders at 30, 7, 3, 1 days) | Partly | Membership strip and Gym card. Renew and Pay buttons are left out on purpose (membership is view only in the app) |
| Challenges and leaderboards | Not built | Outside the proposal too (the engine only reads their state) |

## The 17 big card states (section 4)

Built or close: Sign the waiver, Tell us your goal (onboarding), Check in, Workout due, Welcome back, Renew (as the membership strip), Goal reached (goal card complete state), Workout done, Log a meal, Confirm PT session, Trainer note (Coach reply and plan change cards), Today's plan (the default Today card).

Partly: Day done (all meals logged summary, no "See tomorrow" card).

Not built: Protein is low (6:30 to 8:30 pm below 60% of target), Challenge ends soon, One session moves you up, Challenge result.

The ranking rules (tier, score, a card stays 4 to 6 hours) are not in the app: Today orders cards by time of day with fixed code.

## Widgets (section 5)

Built: day greeting, today snapshot, streak, trainer chat, trainer note, plan and days left, the empty state card (No plan assigned).
Partly: quick log.
Not built: content card, profile step, sponsored card.

## Backend and events (sections 3, 6 to 9)

Not in the app and not planned here: the rule store, the CEL conditions, events and timers, the decision log, `GET /home`, the "degraded" safe home. The app does have a few local stand-ins: the demo panel, scenarios, and the push preview ("Send reminder push"). Real scheduled pushes are not built.

## Plan: things to add later

1. **Log protein, creatine and other supplements** (decided 11 Nov 2026: later, keep it in the plan). Today the app logs meals, water, weight and workouts only. Idea: a "Supplements" shelf in the food library and the log chat (protein powder, creatine, others), one tap to log a scoop, counted into the day's protein, feeding the "Protein is low" card. The designer confirmed it is creatine (written "keratin" at first).
2. Protein is low card and push (needs supplement logging so the number is right).
3. Profile step: one small question a day as a card, never a push.
4. Daily content: tip, quick workout or recipe, one a day.
5. Fast logging: "Repeat last meal" and "Log as planned" in the log sheet and on Today.
6. Day count in the greeting ("Day 12 of 90") once a goal has a length.
7. Sponsored card (gym ads) and challenges with opt-in leaderboards.
