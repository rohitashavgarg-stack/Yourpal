#!/usr/bin/env node
/*
 * Builds Storybook and deploys it to the Vercel project "yourpal-storybook" (production, free Hobby plan): https://yourpal-storybook.vercel.app
 *
 *   npm run deploy-storybook
 *
 * Needs the Vercel CLI and a login (`vercel login`). It deploys from handoff/storybook-site, a copy of storybook-static, so the project is
 * never connected to git and a push never builds it. The first run on a machine links that folder to the project.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'handoff', 'storybook-site');
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit' });

run('npm run build-storybook');
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(site, { recursive: true });
fs.cpSync(path.join(root, 'storybook-static'), site, { recursive: true });
run('vercel link --yes --project yourpal-storybook', site);
// linking connects the repo; deploys here are by hand. Nothing to disconnect when it is already disconnected.
try { execSync('vercel git disconnect --yes', { cwd: site, stdio: 'pipe' }); } catch { /* already disconnected */ }
run('vercel deploy --prod --yes', site);
fs.rmSync(path.join(site, '.env.local'), { force: true });
console.log('\nLive at https://yourpal-storybook.vercel.app');
