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

## Live

**https://yourpal-storybook.vercel.app**: Vercel project `yourpal-storybook` in the account `rohitashavgarg-7341` (team "rohitashavgarg-7341's projects", free Hobby plan), next to the app project `yourpal`. The link is public: no login to view. All 159 stories and the Coverage page were opened on the live site and none errors.

It is deployed by hand, not from git: the project is deliberately **not connected** to the GitHub repo, so a push never builds it. (Linking a folder to a Vercel project connects the repo by default; `vercel git disconnect` undoes that, and the deploy script does it.)

### Update it after a change

```bash
vercel login            # once per machine: opens a page where you approve; no password is typed into any tool
npm run deploy-storybook
```

`npm run deploy-storybook` builds Storybook, copies it to `handoff/storybook-site` (not committed), links that folder to `yourpal-storybook`, disconnects git and deploys to production. It prints the link.

### Make it private

What was seen after deploying: the main link (https://yourpal-storybook.vercel.app) opens for anyone, while the long per-deployment links Vercel prints ask for a Vercel sign-in. To restrict the main link, open the Vercel dashboard, project `yourpal-storybook`, **Settings > Deployment Protection** and see which options your plan offers; some of them need a paid plan. On the free plan, if the stories must stay private, delete the project (**Settings > General > Delete Project**) and share the zip instead.

### Set it up again from nothing (another account or team)

1. Sign in to Vercel (https://vercel.com/login), then `vercel login` on the machine.
2. `vercel link --yes --project yourpal-storybook` creates the project in the signed-in account (run it inside a copy of `storybook-static`, as the script does).
3. `vercel git disconnect --yes`, then `vercel deploy --prod --yes`.

The dashboard route also works: **Add New... > Project**, import the repo, framework preset **Other**, build command `npm run build-storybook`, output directory `storybook-static`. It then rebuilds on every push; turn that off with an Ignored Build Step if you do not want it.

## Checks done on this branch

- `npm run build-storybook` completes.
- All 159 stories and the Coverage page were opened one by one on the live site: none shows an error or renders empty.
- Light and dark were looked at on a sample of stories (BudgetCard, Button).
