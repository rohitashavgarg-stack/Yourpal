# Storybook: build and deploy

Storybook shows every component in `src/design-system/` (primitives and patterns) with one story per variant and state, a Light / Dark switch in the toolbar, every prop in the Controls panel, and a copyable usage snippet (the Code tab, and "Show code" on the Docs page).

It runs on the web build of React Native (`@storybook/react-native-web-vite`), separate from the app. Nothing in the app changes when Storybook is built.

## Run it locally

```bash
npm run storybook          # dev server on http://localhost:6006
npm run build-storybook    # static files in storybook-static/
```

## Files

| Path | What it is |
|---|---|
| `.storybook/main.ts` | Framework, story paths, the `@/` alias, fonts served from `node_modules/@expo-google-fonts`, and two Storybook-only shims: `require('./image.jpg')` becomes an import, and `expo-router` points at `.storybook/mocks/expo-router.tsx` (no navigation in stories). |
| `.storybook/preview.tsx` | Wraps every story in the app's providers (gesture root, safe area, store, theme, domain, overlay) and adds the Light / Dark toolbar switch. |
| `.storybook/preview-head.html` | Declares the Geist, Geist Mono and Outfit fonts under the names the tokens use. |
| `src/design-system/stories/*.stories.tsx` | One file per component. |

## Deploy as a separate Vercel project (same repo)

Not deployed. Nothing below has been run. Only you can do the steps marked **login**; the rest is already set up in the repo.

### Steps that need your login (dashboard)

1. **Login:** sign in to Vercel (https://vercel.com/login) with the account or team that owns the app project.
2. **Login:** **Add New... > Project**, then **Import Git Repository** and pick `rohitashavgarg-stack/Yourpal`. If the repo is not listed, **Adjust GitHub App Permissions** and allow Vercel to read it (this asks for your GitHub login).
3. Project name: `yourpal-storybook` (any name; it becomes `<name>.vercel.app`).
4. Framework preset: **Other**.
5. Root directory: the repo root (leave the default).
6. Build command: `npm run build-storybook` (turn the **Override** switch on to type it).
7. Output directory: `storybook-static` (Override on).
8. Install command: leave the default (`npm install`).
9. **Deploy.** The first build runs for this branch's production branch setting; if `main` does not have Storybook yet, change **Settings > Git > Production Branch** to `design-system-handoff` until it is merged, then back to `main`.
10. Optional, **Settings > Git > Ignored Build Step**: `git diff --quiet HEAD^ HEAD -- src/design-system .storybook package.json docs/coverage-data.json`, so the Storybook project only rebuilds when the design system changes.
11. Send the link (`https://<name>.vercel.app`) to whoever should see it. Add it to `docs/HANDOFF-INDEX.md`, the row "Storybook", in place of "not deployed yet".

The app project is untouched: it keeps building with `npm run build:web` into `dist/`.

### The same with the Vercel CLI (also needs a login)

```bash
npx vercel login                          # login: opens the browser, or asks for an email link
npm run build-storybook
npx vercel deploy storybook-static --prod # first run asks: team, project name (yourpal-storybook), link to existing? no
```

The CLI writes `.vercel/` in the repo folder; do not commit it.

### If you only want to share the files

`npm run handoff` writes `handoff/yourpal-design-system-handoff.zip`. It contains `storybook-static/`; unzip it and serve that folder with any static file server (for example `npx http-server storybook-static`). Opening `index.html` directly from a folder does not work: Storybook needs a server.

## Checks done on this branch

- `npm run build-storybook` completes.
- All 159 stories and the Coverage page were opened one by one in the built Storybook: none shows an error or renders empty.
- Light and dark were looked at on a sample of stories (BudgetCard, Button).
