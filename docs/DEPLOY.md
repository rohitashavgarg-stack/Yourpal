# Put the YourPal web preview online (Vercel)

YourPal's web version is a prototype with sample data. It opens in any browser; on a wide screen it shows a phone frame with a panel of test scenarios beside it.

## Option A: send a zip, deploy with one command (about 5 minutes)

You need: a free Vercel account (vercel.com) and Node.js 18+ installed.

1. Unzip `yourpal-web.zip` into a folder, for example `yourpal-web`.
2. Open a terminal in that folder and run:
   ```bash
   npx vercel deploy --prod
   ```
3. First time only: it asks you to log in (it opens the browser) and to confirm a project name. Press Enter to accept the defaults. When it asks "Link to existing project?" answer **No**.
4. It prints a link like `https://yourpal-web.vercel.app`. That is the live site. Share that link.

To update later: replace the folder contents with the new build and run the same command again.

## Option B: deploy from GitHub (updates itself on every push)

1. Push the project to a GitHub repository.
2. On vercel.com choose **Add New, then Project**, and import the repository.
3. Leave the settings as they are. The project already has a `vercel.json` that builds the web app (`npx expo export --platform web`) and serves the `dist` folder.
4. Press **Deploy**. Every later push to the main branch redeploys.

## Rebuilding the web files yourself

From the project root:

```bash
npm install
npm run build:web
```

This creates the `dist` folder (the whole site, about 9 MB). Deploy it with `npx vercel deploy dist --prod`, or zip it.

## Good to know

- Only open the whole folder or zip. The site is not a single HTML file: `index.html` loads the JavaScript and images next to it.
- All data is sample data kept in the visitor's own browser. Nothing is sent to a server.
- The check-in screen shows a drawn map on the web. The real map only appears in the phone app (Expo Go or an installed build).
- Camera and location prompts on the web come from the browser and can be declined without breaking anything.
