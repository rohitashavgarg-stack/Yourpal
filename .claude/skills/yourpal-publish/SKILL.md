---
name: yourpal-publish
description: Publish YourPal work in one step: the developer handoff (docs, screen map, Storybook, zip, design-system-handoff branch), the live website (main on Vercel) and the Expo Go bundle check. Use when the user says publish, upload, ship, go live, update the web, update the developer, update the handoff, or refresh the handoff.
---

# Publish YourPal

Everything is one script: `node scripts/publish.js <mode> [--yes] [--message "..."]` (also `npm run publish:check`, `publish:handoff`, `publish:web`, `publish:mobile`). Use the `yourpal-publisher` agent to run it, or run it yourself.

| Mode | What it does | Changes anything others see? |
|---|---|---|
| `check` | typecheck, lint (0 errors), no new hard-coded values | no |
| `handoff` | check, coverage audit, screen map, separator list, skill catalogue, Storybook build, numbers block in docs/HANDOFF-STATUS.md. With `--yes`: commits the refreshed docs, deploys Storybook, rebuilds the zip, pushes `design-system-handoff` | only with `--yes` |
| `web` | check, then merges the current work into `main` with a real merge commit and waits for the Vercel Production build | only with `--yes` (it is the live site) |
| `mobile` | builds the iPhone, Android and web bundles: proof that Expo Go will open it | no |
| `all` | check, handoff, web, mobile | only with `--yes` |

Rules:
- **`--yes` only when the designer asked for it in this conversation** ("publish to web", "update the developer"). Without it the script checks and builds and prints what it would do.
- Say plainly what was published and where, and what was skipped. After `handoff --yes` remind him that the zip on Drive must be uploaded again, and that the developer pulls `design-system-handoff`.
- If the tree has uncommitted changes the script asks for `--message`. Never use `--force`, never skip a failing check.
- Phones: Expo Go loads the dev server (`npx expo start`, scan the QR code). There is no EAS update; a store build is a separate project.
- The check that every Storybook story opens (about 15 minutes) is not part of the script; run it before a big handoff (see docs/AUTOMATION.md).
