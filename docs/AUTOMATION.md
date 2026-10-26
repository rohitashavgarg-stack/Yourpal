# Automation: how publishing and learning work

Written for the designer. Two things are automated: **publishing** (web, phone, developer handoff) and **learning** (the design skill keeps itself current as cards, screens and designs change).

## 1. Publishing in one step

Just say it in the chat: "publish to web", "update the developer", "publish everything". Claude runs the `yourpal-publisher` agent, which runs `scripts/publish.js`. You can also run the commands yourself in a terminal.

| You say | Command | What happens |
|---|---|---|
| "check it" | `npm run publish:check` | Typecheck, lint, and a check that no new hard-coded colour, radius or font size slipped in. Changes nothing. |
| "update the developer" | `node scripts/publish.js handoff --yes` | Refreshes the coverage numbers, the screen map and the numbers in `docs/HANDOFF-STATUS.md`, rebuilds and deploys Storybook, rebuilds the zip, and pushes the branch `design-system-handoff`. |
| "publish to web" | `node scripts/publish.js web --yes` | Merges the work into `main` (with a real merge commit) and waits for the Vercel build of https://yourpal-psi.vercel.app. |
| "check the phone build" | `npm run publish:mobile` | Builds the iPhone, Android and web bundles. If that works, Expo Go opens the app. |
| "publish everything" | `node scripts/publish.js all --yes` | All of the above in order. It stops at the first failure and says which step failed. |

Safety rules built in:
- **Nothing goes live without `--yes`.** Without it the script only checks and builds, then prints what it would do. Claude adds `--yes` only when you ask in the chat.
- It never uses force, never skips the checks, never deletes branches. If the merge into `main` has conflicts, it stops and pushes nothing.
- If you have uncommitted changes, it asks for a commit message first.

What it cannot do:
- **Phones.** Expo Go opens the app from the dev server (`npx expo start`, scan the QR code). There is no store build or over-the-air update, because EAS is not set up. A store release is a separate project.
- **The zip on Drive.** The script rebuilds `handoff/yourpal-design-system-handoff.zip` but cannot upload it. Upload the new file to Drive yourself and keep the same link.
- **Checking that every Storybook story opens** (about 15 minutes) is not part of the script. Ask Claude for it before a big handoff.

## 2. The design skill learns by itself

The skill `yourpal-mobile-ui` (in `.claude/skills/yourpal-mobile-ui/`) is how Claude knows how you design. Its files:

| File | What it holds | Who writes it |
|---|---|---|
| `SKILL.md` | How we design and build: visual language, copy, process, the design-system library | people and the learner agent |
| `learned.md` | Rules learned from your corrections (food cards, glass, Plans, separators, how you like to work), newest first | the learner agent, or Claude straight after you correct something |
| `catalog.md` | Every library component, Button kind, token and rule, generated from the code | `scripts/skill/learn.js` (automatic) |
| `CHANGELOG.md` | Every commit that touched the UI | `scripts/skill/learn.js` (automatic) |
| `pending-review.md` | What changed since the skill was last reviewed (new components, new Button kinds, new feedback you gave) | `scripts/skill/learn.js` (automatic) |

How it keeps up with your changes:
1. **Automatically on every publish, and whenever you say "learn"** `node scripts/skill/learn.js` runs. It takes a second, needs no AI, rebuilds the catalogue from the code, adds new commits to the changelog, and lists what needs a rule in `pending-review.md`. *Optional:* it can also run after every Claude turn. That needs a hook in `.claude/settings.json`, which Claude was not allowed to add by itself, so it is not installed. To turn it on, add this next to `enabledPlugins`:

```json
"hooks": { "Stop": [ { "hooks": [ { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/scripts/skill/learn.js\" --quiet", "timeout": 30 } ] } ] }
```

2. **When you change cards, screens, designs or add features**, the code changes, so the catalogue and changelog follow automatically.
3. **The judgement part** (why we do it this way, what you like) is written by the `yourpal-design-learner` agent. Say "learn" or `/yourpal-learn` after a stretch of design work. It reads the diffs and your feedback, writes the rules into `learned.md`, empties `pending-review.md`, and tells you what it learned and what it is unsure of.
4. **Weekly (optional).** The learner can run on a schedule so you never have to ask: use the `schedule` skill with "every Friday run the yourpal-design-learner agent". It only edits files inside the skill folder and never pushes.

To make Claude use it on any new mobile work, it is already listed as a project skill: starting UI work in this repo loads `yourpal-mobile-ui`, and it points to `learned.md` and `catalog.md`.

## 3. Files

- `scripts/publish.js`: the publish script. `scripts/skill/learn.js`: the learning script.
- `.claude/agents/yourpal-publisher.md`, `.claude/agents/yourpal-design-learner.md`: the two agents.
- `.claude/skills/yourpal-publish/`, `.claude/skills/yourpal-learn/`, `.claude/skills/yourpal-mobile-ui/`: the skills.
- `.claude/settings.json`: where the optional every-turn hook goes (see above; not installed).
- The older `ship` agent and `scripts/ship.sh` need `gh` and a Linux sandbox; on this Windows machine use `yourpal-publisher`.
