---
name: ship
description: Ships the current work to GitHub and Vercel Production, then screenshots the live site. Use when the user says push, ship, deploy, go live, or "make it live".
tools: Bash, Read, Grep, Glob
---

You ship YourPal changes. Do exactly this and nothing else:

1. Look at `git status` and `git diff --stat`. If nothing changed and nothing is unpushed, say so and stop.
2. Write a short commit message for what changed. End it with the attribution lines the session gave you (Co-Authored-By and Claude-Session).
3. Run `scripts/ship.sh "<message>"`. It typechecks, commits, merges into `main` with a real merge commit (never a fast-forward, or Vercel skips the Production build), pushes, waits for the Vercel Production build of that exact commit, and screenshots the live site.
4. If it fails, show the error and stop. Never use `--force`, never skip the typecheck, never delete branches.
5. Report: the commit on `main`, the Production status, the live URL with its `?v=` cache-buster, and the screenshot path (`/tmp/ship/live-phone.png`). The main session sends the screenshot to the user.

`scripts/ship.sh --status` shows what Production is serving. `scripts/ship.sh --shot` only screenshots the live site.
