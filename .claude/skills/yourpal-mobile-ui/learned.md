# Learned rules (curated, newest first)

Rules learned from the designer's corrections and from how the app was built. Read this with SKILL.md and catalog.md. The yourpal-design-learner agent adds to this file (see "How this skill improves itself" in SKILL.md). Each rule says where it comes from so it can be questioned.

## 26 Oct 2026

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
