#!/usr/bin/env node
/*
 * Builds the design-system handoff package: handoff/yourpal-design-system-handoff.zip
 *
 *   npm run handoff                 builds Storybook first, then zips
 *   npm run handoff -- --no-build   zips what is already in storybook-static/
 *
 * The zip holds: storybook-static/ (open index.html through any static server), src/design-system/docs and src/design-system/tokens,
 * CLAUDE.md and the pull request template, docs/ (including the review page, docs/review/index.html, with its screenshots) and HANDOFF-INDEX.md at the top.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'handoff');
const zipPath = path.join(outDir, 'yourpal-design-system-handoff.zip');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

if (!process.argv.includes('--no-build')) run('npm run build-storybook');
for (const need of ['storybook-static/index.html', 'docs/HANDOFF-INDEX.md', 'docs/review/index.html']) {
  if (!fs.existsSync(path.join(root, need))) { console.error(`Missing ${need}. See docs/HANDOFF.md.`); process.exit(1); }
}

fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(zipPath, { force: true });
const output = fs.createWriteStream(zipPath);
const zip = archiver('zip', { zlib: { level: 9 } });
zip.pipe(output);
zip.file(path.join(root, 'docs/HANDOFF-INDEX.md'), { name: 'HANDOFF-INDEX.md' });
zip.directory(path.join(root, 'storybook-static'), 'storybook-static');
zip.directory(path.join(root, 'src/design-system/docs'), 'src/design-system/docs');
zip.directory(path.join(root, 'src/design-system/tokens'), 'src/design-system/tokens');
zip.directory(path.join(root, 'docs'), 'docs');
zip.file(path.join(root, 'CLAUDE.md'), { name: 'CLAUDE.md' });
zip.file(path.join(root, '.github/pull_request_template.md'), { name: '.github/pull_request_template.md' });
zip.on('warning', (e) => console.warn(e.message));
zip.on('error', (e) => { throw e; });
output.on('close', () => {
  const mb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
  console.log(`\nWrote ${path.relative(root, zipPath)} (${mb} MB, ${zip.pointer()} bytes).`);
  // open it again and count the entries: proves the file is a readable zip
  try {
    const cmd = process.platform === 'win32'
      ? `powershell -NoProfile -Command "Add-Type -A System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead('${zipPath}'); $n=$z.Entries.Count; $first=($z.Entries | Where-Object { $_.FullName -eq 'HANDOFF-INDEX.md' }).Length; $z.Dispose(); \\"entries=$n index=$first bytes\\""`
      : `unzip -l "${zipPath}" | tail -1`;
    console.log('Opened it again: ' + execSync(cmd, { encoding: 'utf8' }).trim());
  } catch (e) { console.error('Could not open the zip again:', e.message); process.exit(1); }
});
zip.finalize();
