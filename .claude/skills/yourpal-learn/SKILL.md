---
name: yourpal-learn
description: Update the YourPal design skill from what changed. Use when the user says learn, update the skill, remember how we design, or after a stretch of UI work. Runs the yourpal-design-learner agent.
---

# Learn from the design work

1. Run `node scripts/skill/learn.js` (or `npm run skill:learn`). It needs no AI and refreshes `.claude/skills/yourpal-mobile-ui/catalog.md` and `CHANGELOG.md` and writes `pending-review.md`.
2. If `pending-review.md` has items, start the `yourpal-design-learner` agent. It reads the diffs and the designer's feedback and writes the rules into `learned.md`.
3. Tell the designer what was learned, in plain language, and what needs his confirmation.

The deterministic part also runs on every publish. An every-turn Stop hook is possible (docs/AUTOMATION.md) but is not installed. Only step 2 needs a Claude run; it can be scheduled weekly (see docs/AUTOMATION.md).
