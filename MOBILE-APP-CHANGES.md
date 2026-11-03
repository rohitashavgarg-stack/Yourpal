# YourPal mobile app: changes and added features

Status: updated 2 Nov 2026 (later). Ordered from small to major. A ticked box means the change is built in the mobile app on the branch `hide-edit-diet-plan`.
Nothing is pushed yet and none of it has been tested on a phone. All data in the new screens is sample data until the real gym data is connected.
These are for the mobile app only. The admin panel prototype is a separate piece of work.

Nothing is removed from the app. The items below are only left off the to-do list, because no work is needed on them. See "Already in the app" at the end.

## Small

- [x] **1. Hide Edit Diet Plan**
  - Done: a flag (`ALLOW_DIET_EDIT` in `features/plans/Sheets.tsx`) hides the row. The plan stays readable and the row can come back by turning the flag on.
  - Where: Diet plan screen, and any menu or button that opens plan editing.
  - How: remove the entry points (hide behind a flag so it can come back). The plan stays readable.
  - Needs: nothing.

- [x] **2. Privacy policy and Terms and conditions**
  - Done: Privacy Policy and Terms and conditions rows in Profile open the yrpal.com pages. The sign-up screen has tappable Terms and Privacy Policy in the consent line.
  - Where: Profile or Settings, in a "Legal" group. Also a consent line at sign-up.
  - How: two rows that open the documents (in-app web view). Version and date shown.
  - Needs: the final text or links from the business.

- [x] **3. Icon avatar instead of the "RG" initials**
  - Done: a person icon on a soft tint, and the member's photo when one is set.
  - Where: Profile header, Home greeting, anywhere the initials circle shows.
  - How: default avatar is an icon on a soft tint, with the member's photo when one is set. Later: tap to upload.
  - Needs: decision on the icon style (person icon, or a set to pick from).

- [x] **4. Health sync: a toggle on every row**
  - Done: a switch on every row in Connected apps, locked and off without a watch or band.
  - Where: Settings, Health data, the "Syncing" list (and the matching "You will see on Today" list).
  - How: Steps, Heart rate, Sleep, Active energy each get a switch. Without a watch or band the switch is off and disabled, with the hint "Connect a watch or band". With a source it can be paused one by one.
  - Needs: how a paused metric looks on Today (hidden or greyed).

## Small to medium

- [x] **5. More prominent, less texty Personal training card (PT members and regular members)**
  - Done: a dark Personal training card on the Gym tab for both kinds of member, and a new Personal training page (icon, big heading, benefits, a floating button). PT members see sessions left, a bar and a Renews chip. The numbers 48 and 41 on that page are sample numbers and must be replaced with real ones.
  - Where: Home. The same card for both kinds of member.
  - How: a bigger card that stands out (larger icon tile, soft brand tint and stroke, the chevron), with a short title and one very short line instead of the long sentence. The detail moves to the screen it opens.
    - PT member: "Personal training" plus one line about the plan, for example "Adjusted today", with a small status chip.
    - Regular member: the same card as a way in, for example "Personal training" with "Add a coach" or "See plans". It has to be as visible as the PT card, not a smaller text row.
  - Needs: the shortest useful line for each state (PT member, regular member, no plan), and where the regular member's card leads.

- [x] **6. Buzzer on the timer**
  - Done: a generated buzzer plays with a vibration when the rest timer ends. The setting to turn the sound and vibration off, and the notification for the background, were added with item 17.
  - Where: Workout and rest timer.
  - How: sound and vibration when the timer ends, a setting to turn each off, and a local notification if the app is in the background.
  - Needs: the sound file, and the rule for silent mode.

- [x] **14. Meal logging: time the meal was eaten**
  - Done: the time is asked when a meal is saved, with a wheel time picker, same day only and no future time. It is asked on the first food of a meal only when it is far from the meal's usual time.
  - Where: the "Log meal" sheet, and the meal diary list.
  - How: the time is asked while saving the meal. When the member taps Save, a small "Ate at" step appears, already filled with the current time, so the usual case is one tap. They can change it if they ate earlier. The diary sorts meals by that time, and the meal type (breakfast, lunch, dinner, snack) can be suggested from it.
  - Applies to: logging from the Log meal sheet and from the Diet plan page (item 19).
  - Needs: the rules. How far back can the time be set (same day only)? Is a future time blocked?

## Medium

- [x] **7. Waiver form for members**
  - Done: a Waiver page (read, tick agree, sign on a sign pad in a bottom sheet), an animated signed screen, and a details page from Profile. A Waiver row in Profile (Pending or Completed) and a Today card until it is signed. The status is stored on the phone only and does not reach the admin Waiver status column yet. The waiver text is sample text.
  - Where: a prompt after joining, and a "Waiver" row in Profile.
  - How: read, sign on screen, save a copy. Status (Pending, Completed) feeds the admin Waiver status column.
  - Needs: the form text per gym, from the admin Waiver Forms page.

- [ ] **8. Alerts to complete required details (Emergency Contact first)**
  - Built and then removed on request on 2 Nov 2026 (emergency contact form, Today alert card). Not in the app now. Bring it back when the mandatory items are agreed.
  - Where: a banner on Home until done, plus a checklist in Profile.
  - How: a list of required items (Emergency Contact first, others later). Tapping a banner opens the right form. The banner disappears when complete.
  - Needs: the list of mandatory items.

- [x] **9. Download invoice and download progress report**
  - Done: real PDFs with expo-print and expo-sharing (needs one new phone build). An invoice per payment on each membership and an All payments page. A progress report for this week, month or year from the three-dots menu on Progress. The workout plan and the diet plan can also be downloaded as PDFs from the Plans menus.
  - Where: Membership detail, Invoices list. Progress screen, "Download report".
  - How: invoice as PDF per payment. Progress report as PDF with a date range (measurements, goals, attendance).
  - Needs: report contents and layout.

- [x] **10. Periodic feedback**
  - Done: a star rating sheet with what it is about and a note. A Today card after 7 days, then every 30 days after an answer, and Maybe later asks again in 3 days. A Rate your gym row in Profile. Answers are stored on the phone only and do not reach the admin yet.
  - Where: a card or sheet on Home.
  - How: ask for feedback after a set number of days or visits, then at longer intervals. Dismiss means "ask later". Answers go to the admin.
  - Needs: the interval rules and the questions.

- [x] **15. Workout history page: new design**
  - Done (3 Nov 2026, confirmed by you): the date is small above a larger workout name, with more space between rows.
  - Where: Workout, History.
  - How: rebuild the page to match the Figma you will send. Keep the same data (past workouts, date, duration, exercises) and only change the layout.
  - Needs: the Figma link. Blocked until then.

- [x] **19. Diet plan page: log meals by checking foods**
  - Done: no check on the meal card, a check circle on each food, and a three-dots menu on logged foods (replace, delete, mark as not consumed) with a Logged tag. The existing Ate something else option stays as the way to add food.
  - Where: Diet plan page, on each meal card.
  - Changes:
    - **No check on the meal card.** Only the foods inside it are checked. The meal shows progress from its foods, for example "2 of 4 foods".
    - **Checkbox on the right of each food row.**
    - **Checked and unchecked look different, not just a tick:**
      - Unchecked: a dotted outline row, an empty circle on the right, neutral text. It reads as "still to do".
      - Checked: a solid, softly tinted row, a filled tick on the right, muted text. It reads as "done".
    - **"Add food" button in each meal** to add an extra food item that is not in the plan (search, or a custom entry). Extra foods are marked as extra and are counted in calories.
  - How: tapping a food toggles it. When the member saves the meal, the "Ate at" step from item 14 asks for the time (default now).
  - Needs: the rules.
    - When is a meal counted as logged (any food checked, or all)?
    - Can a checked food be unchecked later?
    - Where does the extra-food search get its foods from?

- [x] **20. Attendance and PT sessions (Gym tab)**
  - Done (2 Nov 2026): the attendance page shows gym check-ins only, with earlier months to look back at (six months back). Each visit shows how it was checked in, a phone icon or a fingerprint icon for the biometric device. There is no Home or PT entry on it. The attendance card on the Gym tab keeps the big count with "visits this month" on one line and the dot grid.
  - PT members get their own Sessions page (from View sessions on the PT card, or Your sessions on the Personal training page): the package used (for example 4 of 12), the invite to confirm, then Upcoming and Past tabs. A session opens a detail page with the coach, the date, a status chip, what was done and the coach's note. A waiting session has a floating Confirm and rate button and a quiet "This didn’t happen" link. Sample sessions only; the real list comes from the coach.
  - Booking and cancelling a PT session: dropped on 3 Nov 2026, not being built. The coach's notes and exercises are sample text.

## Major (plan first)

- [x] **11. Membership history: plan the layout first**
  - Partly done. Built: a Memberships card on the Gym tab (active count and a small card per active plan), a Memberships page with Active, Suspended and Past tabs, a detail page per membership (time left, price, PT sessions, pauses shown read-only with a progress bar, payments with the next one due), and All payments. Decisions: one card on the Gym tab, gym plans only, no branch or member ID shown, pauses are set by the front desk. The Gym tab list rows for memberships, pauses and help were removed, and so was the Profile pauses row. Done afterwards (2 Nov 2026): the Today banner, the logging pause and the Progress logging check now read all memberships (logging pauses only when none is active), and the admin statuses are mapped (Frozen counts as Active with the pause shown, Transferred as Past). Also added: an All payments page across memberships, the pauses in one container with a progress bar, and the old pauses page removed. Sample data throughout; the real list comes from the gym.
  - Where: Membership screen.
  - Known: a member can hold several memberships at the same time. We need to see Active, Suspended and Past ones.
  - Open question, to plan before building: is this tabs (Active, Suspended, Past), a list grouped into sections, or one list with a filter? Things to settle:
    - how a member with several active memberships is shown at a glance,
    - how our admin statuses map to the app (Active, Frozen, Suspended, Expired, Transferred),
    - what a card shows (name, dates, days left, balance, invoice),
    - which one counts as the "current" membership on Home.
  - How: write the layout options with a sketch of each, choose one, then build.

- [x] **16. Add an exercise to a workout: plan first**
  - Done (3 Nov 2026): Add exercise is in the three dots menu of the workout. It goes to the end of today only, and members can add their own. It does not count against the planned total on the finish screen.
  - Decided on 2 Nov 2026: new exercise goes at the end, members can add their own, and it changes today only. It was built and then taken out the same day (the revert is commit `34086db`; the original is `7b50841`). Not being done now.
  - Where: Workout, while building or running a workout.
  - Questions to settle before building:
    - Where does the member pick from: a searchable exercise library, their recent exercises, or a custom one?
    - What does an exercise carry: sets, reps, weight, or a time for timed exercises?
    - Is it added for today only, or saved into the workout for next time?
    - Where in the order does it go, and can it be reordered or removed?
    - Does it work the same in a trainer-assigned workout as in the member's own?
  - How: write the flow screen by screen, then build.

- [x] **17. How the exercise timer works: plan first**
  - Closed on 3 Nov 2026: nothing more to add. The sound and vibration settings are on a Sound page in Profile with a volume control.
  - Done in part (2 Nov 2026): the app already had a rest timer between sets, a timed-set timer and warm-up timers. Added: the buzzer and vibration at the end of every timer, a Workout timer group in Notifications to turn the buzzer and the vibration off, and a notification when a timer ends with the app in the background (only if notifications are already allowed). Not done (pause and resume was removed on request):  saving rest time on the summary, and the end of a timed set still logs itself.
  - Where: Workout, the running exercise screen.
  - Questions to settle before building:
    - Is it a rest timer between sets, an exercise timer for timed moves (such as a plank), or both?
    - Start, pause, skip, add 15 seconds: which controls?
    - Does it keep running when the screen locks or the app goes to the background?
    - When it ends: the buzzer (item 6), vibration, and does it move on to the next set or exercise by itself?
    - What gets saved: total time, rest time, or both.
  - How: write the states (ready, running, paused, finished) and the rules, then build. It shares the sound with item 6.

- [x] **18. Self assessment**
  - Done (2 Nov 2026). Decided with you: questions and measurements both, any time with a monthly nudge, seen by the member and the coach, feeds Progress and goals. An assessment is the same whether the member or the coach did it, so the app only says "Assessment". The steps and wording come from the Figma "Assessment" flow (the 18-step coach flow), keeping what a member can do alone.
  - The Assessments page (Gym tab): one Upcoming assessment (its number, when it is due) with a Start button that only shows on the date of the assessment or after it, and a card for each Completed one (number, date, "N of M improved" or "Your baseline", key numbers). Tapping a card opens its detail page (measurements in Body, Strength and fitness, Health groups with the change since the last one, and an About you card).
  - The flow: 14 steps, one per screen, none scrolling, each with its own look: height, weight, body measurements (six sizes on one page with icons), body fat (photo tiles from the Figma), sleep (a dial for bedtime and wake-up), activity level (equal cards), workout frequency, water (a bottle and slider), training level (chart-bar pictures), bench press (barbell and ruler), leg press (weight stack with a pin), flexibility, breath-hold (stopwatch), injuries, blood pressure (monitor screen), blood glucose (gauge), next assessment (ready-made days or any number of days). A small "How to Perform" pill opens the steps in a sheet. Skip is a blue text button at the top right, Back an icon button at the bottom left, and every page has Continue. The Done button floats at the bottom of the last page.
  - Today: a card appears when the next assessment is due (the member's chosen days set when; Maybe later asks again in 3 days). The weight entered updates Progress.
  - Left out on purpose: the client's gender (the profile has it), the body composition report upload and the treadmill test (they need gym machines).
  - Please check: the Figma water screen is titled as a stress question but its answers are litres, so it is treated as water; the activity labels other than "Moderately active" are my own; medical conditions is an optional note because that tab was not visible; sleep uses a dial where Figma shows times.
  - Not done: goals measured by assessment do not read the results yet, the coach's entry form belongs to the coach's app (a sample coach assessment is shown as Assessment 1), results are stored on the phone only, not sent to the admin.

- [ ] **12. Goals: history and multiple goals**
  - Decided on 2 Nov 2026: this one needs more thinking and is done last. A plan is drafted (a Goals page with a main goal, other active goals and a history; changing a goal moves the old one to history). Three choices are open: how many active goals, which goal Home and Progress show, and what goes into history.
  - Where: Goals screen.
  - How: a main goal plus other active goals, each with progress. A history list of achieved and archived goals with dates. Rules for the main goal, for changing a goal, and for what Progress shows.
  - Needs: a product decision on how many active goals are allowed and which one drives Home.

- [x] **13. Join code flow: "I have a join code from my gym"**
  - Done (3 Nov 2026, confirmed by you).
  - Changed on 2 Nov 2026: the join code is now asked right after the code from the text message (a "Do you have a join code?" step with a Join gym button and an "I don’t have a code" link), then the programme choice. The link on the phone screen is gone. Still open: what was wrong in the old flow, and the expired and already-used code cases (only a wrong code is handled, with the sample code GOLD21).
  - Where: onboarding, join-a-gym step.
  - How: walk through the current flow, list what breaks, correct it, and cover wrong, expired and already-used codes.
  - Needs: what is wrong today.

## Already in the app (no work needed, keep as it is)

- [x] **Biometric check-in and its timer on the Check-in screen.** It exists today. Do not remove or change it.
- [x] **Manual sleep log.** It exists today. Do not remove or change it.
- [x] **Streaks.** They exist today. Nothing to build.

## Dropped from the list

- Biometric check-out after 90 minutes (item 13 in the first list). Not being worked on now.

## Later (not now)

- [ ] **Subscription packages** replace the "Membership Packages" label and screen when subscriptions exist.
