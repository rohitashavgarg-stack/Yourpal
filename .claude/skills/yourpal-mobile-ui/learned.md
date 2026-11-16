# Learned rules (curated, newest first)

Rules learned from the designer's corrections and from how the app was built. Read this with SKILL.md and catalog.md. The yourpal-design-learner agent adds to this file (see "How this skill improves itself" in SKILL.md). Each rule says where it comes from so it can be questioned.

## 5 Nov 2026

**Assessments are the trainer's work, view only** (source: the designer, on the Start button)
- The trainer does the assessment at the gym and records it. The app only shows the result. **No self-assessment exists**: no Start button, no questions or measurements for the member to enter, no monthly nudge on Today, no "assessment saved" screen. If code like that comes back (for example from another session), remove it.
- The upcoming assessment is **quiet**: a neutral date tile (no amber, no blue), "In 6 days" as plain muted text, and one line saying Coach Vikram does it at the gym and the result shows here afterwards. A due or overdue assessment does not turn yellow and does not become a big button.
- A finished assessment opens a view-only page (`/gym/assessment?id=`): how many improved, the measurements in three groups with a change tag on each row, and what the trainer noted. The data is in `src/features/gym/assessmentData.ts` (sample entries; the real ones come from the gym).
- This was a bigger removal than the button: the Gym card and the assessments page had been built on the member's own entries, so they were moved to the trainer's records.

## 28 Oct to 4 Nov 2026

**Assessments** (source: the Gym and assessments changes)
- Assessments live only on the Gym tab. Progress has no assessments card or page (the card, its key and the route `/progress/assess` are deleted); links go to `/gym/assessments`. One fact, one place.
- Names are **Assessment 1, 2, 3**. Never "Starting assessment" or "Reassessment".
- The tests are **leg press and bench press** (strength) and **toe touch** (flexibility), with weight, waist, body fat and resting heart rate. Goals follow: the strength goal is "Bench press N kg", the flexibility goal is "Toe touch 15 cm" (a ruler, one mark per cm). Squat, push-ups, deep squat hold and sit-and-reach are not used for assessments.
- **Never show a time the product does not have.** The gym has not scheduled the assessment with the coach, so say "Coach Vikram will confirm the day and time". A date chip appears only when there is a date.
- **Next assessment card:** the title ("Assessment 3"), the date in a chip on the right ("Due this week" is amber), one quiet line ("In 34 days", "Book at the front desk"), then a full-width button at the bottom: "Remind me" (`primary`, which is white in dark mode) with a bell, "Reminder on" (`secondary`) with a check. No tip line and no "every 4 weeks" line.
- **Built for many assessments (agreed, not built yet):** the hero compares the latest with the previous one; a "Comparing 10 vs 9, Change" line opens a sheet to pick any two; chips "vs previous" and "vs Assessment 1"; a small trend line on every test row; History shows the last 3 and "See all". Two fixed pills (Latest and Starting) do not scale past two assessments.

**Progress data** (source: the Highest and Lowest and Diet requests)
- Never a bare "Highest" and "Lowest". Name what it is and say when: "Most steps", "9,200", "Wed 22 Oct" underneath. Each metric has its own words (Heaviest and Lightest, Longest sleep and Shortest sleep, Most workouts and Fewest workouts, Most eaten and Least eaten).
- **Diet is calories first**, not a percent that nobody can explain: "1,766 kcal avg. per day", target 1,800, bars with a dashed target line. A day within 10% of the target is green, the others are grey. **Never amber or red for eating more or less.** Stats: most eaten, least eaten, days on target, daily target.
- A card on Progress has **one headline line**: the number big, its small unit beside it on the same line ("kcal avg. per day"), and only the change underneath ("↓67 kcal vs last week"). Do not put the target or another label beside the number.

**Gym** (source: the chat request)
- **Chat with the coach is the main feature**, so it is the first card on Gym: dark card (`onDark.card`), coach photo (opens the profile), the last coach message in quotes, and a white "Message Coach Vikram" button. The card is a plain View: a pressable inside a pressable breaks on web (nested buttons).

**Plans, second round** (source: the 27 and 28 Oct Plans changes)
- Day header: the name, "by Coach Vikram" small with the coach photo, then a facts row with icons (dumbbell, calendar-clock) for the planned time and the exercises. A dashed separator above Warm-up. No clock icon beside the name.
- Week strip: compact, full width, grey. The **month heading sits above it and is a button** that opens a month calendar in a bottom sheet (only the weeks the page keeps can be picked). A small chip with a direction icon brings you back to today.
- Section headings use `SectionLabel variant="section"` with an icon and **no coloured container**. Lists are titled `ListCard` with numbered rows and the check on the **right**. Warm-up has its own stretch icon. Planned and exercises are separate categories.
- **Start workout** sits inline; when it scrolls out of view a blue glass Start floats (one main action over scrolling content). On a past day the same pattern is "Log this workout": a secondary button in the page, floating too. It is never primary and never glass in the page.
- Logging a past workout: every set can be ticked, with weight and reps (or seconds). If only reps exist the row says "Set 1, Planned 8 reps" so it does not feel empty.
- A logged day looks done: a green "Logged" tag, grey stat tiles with an icon and no zero values, no progress bar. Green only on checks and stat numbers, **never as a card fill**.
- The **flame icon is only for the streak**. Calories and other things use other icons.

**Login and first screens** (source: login and onboarding changes)
- The country code is a tappable prefix (`Field` with `onPrefixPress`, a small arrow after the code) that opens a list sheet. India first and selected. The OTP text uses the chosen code.
- **The first screen of a flow has no back arrow** (the Get started screen after the code). A back arrow only where something is behind it. The code step keeps its back arrow to fix a number.
- Recommended and not built: first launch ever shows "Let's begin"; a logged-out member who reopens lands on login; a logged-in member lands on Today.
- Do not show details the product does not have yet (an assessment time, a payment screen for a view-only membership).

**Type and chrome** (source: the title, greeting and icon button changes)
- Page titles and the Today greeting share one style: **28 px, line height 37, letter spacing -1.1**. A greeting that wraps onto three lines is too big.
- Icon buttons on web and Android get a thin border and a soft grey glass gradient; iOS uses real glass. Use `IconButton`, never a hand-built round button.
- The Today page ends with `PageEnd` (an illustration, a quiet two-line phrase, the YourPal mark); no quote above it.

**Destructive actions** (source: code from other sessions, seen 4 Nov; not discussed with the designer in this session)
- `Button kind="warn"` is a soft red tint (danger colour at 12%, danger text) for actions that end something: "Log out" on Profile. Frozen, paused and comeback states stay amber or neutral, never red; red is only for an action the member must confirm.

**Menus** (source: the workout menu change)
- The three dot menu on the exercise page offers swap, ask the coach, form tips and skip. There is no "options for the current set" row.
- The Plans three dot menu (edit plan, create a workout, reset to the coach's version) stays as it is unless he asks.

**How to work and ship** (source: this stretch)
- When he says "show here first", draw a flat wireframe in chat (grey boxes, small lines for charts) and wait for "go". He answers with "do the changes" or a screenshot and one line.
- **Work goes to the `staging` branch first**; `main` (the live site) changes only when he says so (`publish.js staging --yes`, then `promote --yes`). `staging` is for the member app only; the Admin Panel is a separate project and folder.
- Other Claude sessions may edit the same folder at the same time. Run `git status` first and never commit files you did not touch.
- "Do things on your own, do not ask me" means fewer questions on small steps. Still ask before downloads, deleting, and going live.
- Day-by-day reports for his reporting sheet are written in UI and UX designer language (screens designed, flows defined, design system), without commit counts.

## 27 Oct 2026

**Hierarchy on cards** (source: the designer's reference, the Streak page hero card)
- The Streak hero card is the model. Top to bottom: the key number big and in the accent colour, then its name; one plain muted sentence; a progress picture (bar or segments) with one caption under it; a hairline between groups; the week as segments with the count in the caption highlighted in colour ("This week you have completed **1** of 4 sessions").
- Every fact gets its own place: its own line, its own size or its own element. Never join unrelated facts on one line with a dot, a comma or "and". Two lines at most under a headline, never three.
- A number and what it measures sit side by side ("72.5 kg  Average"), the change goes underneath ("↓0.5 kg vs last week"). If they do not fit on one row the label drops below. Keep a value such as "30 → 45 s" together with non-breaking spaces so it does not split.
- A count of done out of target ("1 of 4") is shown as segments, one per session, the done ones in the card's colour, and the done number highlighted in the sentence. Inside a small card it sits in a nested Callout.
- A section heading belongs to the card under it: more space above the heading than between it and its card (34 px above, 12 px below).
- A small way back ("Back to today") is a quiet text button (ghost), not a filled pill.

**Page end and lists** (source: District reference, Save meal sheet)
- The end of a long page is an illustration, a big quiet line and the YourPal mark (PageEnd). The picture fades into the page colour and is drawn at about a third of its strength: "too visible" was the feedback twice. No quote above it.
- A list that is ticked and then saved (the Save meal sheet) uses the FoodCard `pick` look: solid card, tick circle on the right, no dashed line. Dashed is only for a not-eaten food on the diet page.

**Checking work** (source: this session)
- After editing, restart the web dev server with `--clear` before screenshots. The file watcher on this machine does not pick up edits, so a running server shows old code.

## 26 Oct 2026

**Workout card answers** (source: moved and skipped redesign)
- The answers "Move to tomorrow" and "Skip" show as the **same full card** as every other workout state, never a slim strip with a round icon (it looked like a dismissed notification). A neutral outlined chip says "Moved" or "Skipped" (not amber, not red: neither is a failure), the answer is one plain line, Undo is a white 44 px button, and "Start it today anyway" is a quiet link. A skipped name is faded and struck through and a "Next:" line shows what is coming.

**Food cards** (source: the diet card redesign, FoodCard pattern)
- One food is its own card with three states: **dashed** (not eaten), **solid** (eaten), **faded and struck through** (skipped). The state is read from the outline, never from colour alone.
- The check circle is on the **right**, on the not-eaten card only. The eaten card has no check; it has a darker strip with the macros and a three-dot button ("Mark as not eaten").
- **The amount can be changed only before logging** (the stepper stays on the not-eaten card). After logging it is plain text. Never take the stepper off a card that can still be edited: the designer did not ask for that and was upset.
- **Swipe left** on a not-eaten card reveals **Swap** (icon) and **Skip** (the word), both rounded squares, 44 px, on one side. A food the member added shows "Delete" instead of Skip. **Hold** opens the food page. A plain tap does nothing on the diet page.
- Foods not logged by the end of a day count as **skipped** automatically. Previous days are view-only: eaten or skipped, never a third "not logged" look.
- Keep the Veg, Egg, Non-veg marks and the legend row: the designer finds them relatable. The legend row is the separator between the calorie card and the meals.

**Glass** (source: the blue glass buttons)
- Use glass only for the **one main action that floats over scrolling content** ("Start workout" on Plans, "Save meal" in the log sheet). Never for buttons inside a solid card.
- Glass keeps the button's **original colour**: blue for the blue button, white for the white one. The designer asked for the glass effect, not a new colour. No outline. A blue glass tint must be strong (92%); 80% looked washed out.
- Real iOS glass is used on iOS 26; everywhere else it is a blurred, tinted fallback.

**Plans screen** (source: Plans changes)
- The Workout and Diet tabs are **icon-only** and sit beside the large "Plans" heading together with the three-dot menu button.
- A hint line that explains gestures is not wanted ("no need to show this"): delete such lines, do not reword them. A weekly total is shown as a big number with a short caption, no progress bar, the number highlighted.

**Separators** (source: the dot-separator saga)
- The rule stays: no "text · text" lines. But **never bulk-replace them**. A codemod that swapped all 240 for commas was reverted by the designer ("do not change the separator, I will guide you"). Change only the screens he points at and ask how he wants each line shown.

**Things that were tried and dropped**
- A gooey (liquid) fan-out menu on the workout screen and an AI orb box beside the tab bar: previews only, removed from the app. Do not bring them back unless asked. If an effect is shown again, keep it calm: light haptics, slow springs, no splashing, light glass, never a loud solid gradient.

## How to work with this designer (source: many corrections)

- **Answer first.** When he asks a question ("why", "what is left", "how will it open"), answer it. Do not start building. "Just tell me, do not change the code" is common.
- **Keep the scope exact.** Change only what he named. Keep colours, copy, layout and behaviour he did not mention. Never remove existing functionality as a side effect.
- **Show before building** when the direction is new: a quick interactive preview, then "build it".
- **Light mode is out of scope** until he says otherwise. Capture and review dark only.
- **Do not add buttons or features he did not ask for.**
- **Plain language, short lists.** He is a UX designer, not a coder; explain what is ready, what is left, and what he needs to do.
- **Main and the developer branch** are changed only when he says so. Experiments go on their own branch.

## Platform notes (source: the SDK 58 upgrade)

- The app is on **Expo SDK 58** (React Native 0.88, Expo Router 58). Install with `npm install --legacy-peer-deps`. A custom tab bar receives `emitter` and `navigateToTab`, not `navigation`. ScrollView and TextInput refs are `ScrollViewInstance` and `TextInputInstance`.
- Expo Go only opens the latest SDK. Phones: `npx expo start`, scan the QR code (same Wi-Fi).
- `thinking-orbs` draws on a DOM canvas and does not run on phones. Gooey and blur-threshold effects are web-only unless drawn with Skia.

## Rules from the 10 to 12 Nov 2026 session (design consistency, motion, Today)

- **No hard-coded headers or footers.** A page header floats over the content with the progressive blur (`ProgressiveBlur`), no colour behind it; the page leaves room for it (`PAGE_HEADER_CLEAR` on Plans pages). A bottom button floats (no bar, no line, no divider); the page keeps room under its content. `SubPage` has `floatingFooter`.
- **Strokes:** a standalone card is `c.cardLift` plus `CardEdge`, and the stroke radius equals the card's own radius (`Card` reads `style.borderRadius`). Never stroke a nested item a second time. Food cards keep their dotted outline inside a stroked meal card. A plain icon button gets the card look by default.
- **Press:** `Pressy` shrinks; icon buttons (`IconButton`, `Pressy grow`) swell to 1.14 and settle with a soft overshoot. Reduce Motion: `useReduce()` (phones follow the setting, web always animates).
- **Navigation motion:** back-button pages slide in from the right and out to the right; cross (X) pages come from the bottom and go down (`FROM_BOTTOM` in `_layout.tsx`); card pages (`CARD_PAGES`) grow from the card, have no back button and a drag handle; sheets slide down on the phone curve `bezier(0.32, 0.72, 0, 1)`. `router.back` is wrapped after the first render (`installSlideBack`); wrapping it at load is lost.
- **Backgrounds that depend on the screen size** (glows, lines) measure their own container, never the browser window, or they flood the phone frame on a wide web window.
- **Waiver:** pending pages are white and grey with an amber top glow, the signed details page has a green glow, the completion screen has a blue top glow and a black bottom. Pending status is orange, Signed is green.
- **Workout finish:** a plain page on the signed-waiver background, numbers on the page (no containers), logged sets and "How was it?" in cards, Share at the bottom of its card, floating Done with a soft white glow. The logged workout in Plans shows effort as a word and a number, never a slider.
- **Membership:** admin "Frozen" shows as Paused (pause icon, grey bar); an upcoming plan shows under "Starts next" on the Active tab; no fourth tab.
- **Today features with a switch each in the demo panel** (`personalStore`): day count in the greeting, Connect Health bottom sheet, profile step card in the updates stack (progress ring, "Add height"), quick tip card last on Today. The Meals card moves to the next meal after one is logged; the arrows in the "all logged" list open a sheet of logged foods. Removed on request: Day done card, protein note.
- **The designer's phrasing:** "put it in a card" means the standard card; "with gradient and bigger icon" means a tinted gradient fill and a large soft icon behind the words. Re-read the last version he liked before changing a design he said "was better".
- **Checking work:** the in-app browser only paints frames while the Claude window shows it, so measure animation in headless Chrome (`puppeteer-core`) on the live site, not in the pane.
