#!/usr/bin/env node
// node scripts/audit/mark.js "<row id>" "<status>" ["note"]   then regenerates docs/coverage.md
const fs = require('fs'); const { execSync } = require('child_process');
const [id, status, note] = process.argv.slice(2); const f = 'docs/coverage-status.json';
const s = JSON.parse(fs.readFileSync(f, 'utf8')); s[id] = { status, ...(note ? { note } : {}) };
fs.writeFileSync(f, JSON.stringify(s, null, 1));
execSync('node scripts/audit/coverage.js --json && node scripts/audit/coverage-md.js', { stdio: 'inherit' });
