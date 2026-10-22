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

Not deployed yet. These steps need a Vercel login with access to the team that owns the app project.

1. In Vercel: **Add New… > Project**, import the same GitHub repo (`rohitashavgarg-stack/Yourpal`). Vercel asks you to sign in with GitHub if this browser is not already signed in.
2. Project name: for example `yourpal-storybook`.
3. Framework preset: **Other**.
4. Root directory: leave as the repo root.
5. Build command: `npm run build-storybook`
6. Output directory: `storybook-static`
7. Install command: leave the default (`npm install`).
8. Production branch: under **Settings > Git** after the first deploy. Use `main` once this branch is merged; until then, a deploy of the `design-system-handoff` branch is a Preview deploy.
9. Optional: **Settings > Git > Ignored Build Step** with `git diff --quiet HEAD^ HEAD -- src/design-system .storybook package.json` so the Storybook project only rebuilds when the design system changes.

The app project is untouched: it keeps building with `npm run build:web` into `dist/`.

With the Vercel CLI instead of the dashboard (also needs `vercel login`):

```bash
npm run build-storybook
npx vercel deploy storybook-static --prod
```

The first CLI run asks which team and project name to link; it writes `.vercel/` locally (git-ignored by Vercel's default).

## Checks done on this branch

- `npm run build-storybook` completes.
- All 128 stories were opened one by one in the built Storybook: none shows an error or renders empty.
- Light and dark were looked at on a sample of stories (BudgetCard, Button).
