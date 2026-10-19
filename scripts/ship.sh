#!/usr/bin/env bash
# Ship the current work: typecheck, commit, merge to main with a real merge commit, push, wait for the Vercel Production build, screenshot the live site.
#   scripts/ship.sh "commit message"   commit everything, merge into main, push, wait for Vercel, screenshot
#   scripts/ship.sh --status           what Vercel is serving in Production right now
#   scripts/ship.sh --shot             only screenshot the live site
# Why a merge commit: Vercel never builds the same commit twice. A branch push is built as a Preview, so a fast-forward of that same commit into main
# gets no Production build. A merge commit is a new commit, so main always deploys.
set -euo pipefail
REPO="${SHIP_REPO:-rohitashavgarg-stack/yourpal}"
SITE="${SHIP_SITE:-https://yourpal-psi.vercel.app}"
OUT="${SHIP_OUT:-/tmp/ship}"
PW="${SHIP_PLAYWRIGHT:-/opt/node22/lib/node_modules/playwright/index.mjs}"
mkdir -p "$OUT"

prod() { gh api "repos/$REPO/deployments?environment=Production&per_page=1" --jq '.[0]|"\(.id) \(.sha)"'; }
state() { gh api "repos/$REPO/deployments/$1/statuses" --jq '.[0].state // "pending"'; }

# Screenshot one URL (phone area and full page) into $OUT.
snap() {
  cat > "$OUT/shot.mjs" <<JS
import { chromium } from '$PW';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1500, height: 950 } });
await p.goto('$1', { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(3500);
await p.screenshot({ path: '$OUT/live.png' });
await p.screenshot({ path: '$OUT/live-phone.png', clip: { x: 0, y: 0, width: 450, height: 900 } });
await b.close();
JS
  node "$OUT/shot.mjs"
}

# Screenshot the live site. Some sandboxes block *.vercel.app; then it falls back to a local build of this same commit and says so.
shot() {
  local sha="${1:-live}"
  if snap "$SITE/?signedin=1&v=$sha" 2>/dev/null; then echo "screenshot of the LIVE site: $OUT/live-phone.png (full page $OUT/live.png)"; return 0; fi
  echo "note: this machine cannot open $SITE (network policy). Screenshotting a local build of commit $sha instead."
  if ! curl -s -o /dev/null localhost:8082; then (setsid npx expo start --web --port 8082 > "$OUT/expo.log" 2>&1 &); for i in $(seq 1 60); do curl -s -o /dev/null localhost:8082 && break; sleep 3; done; fi
  snap "http://localhost:8082/?signedin=1" && echo "screenshot of a LOCAL build (not the live site): $OUT/live-phone.png (full page $OUT/live.png)"
}

case "${1:-}" in
  --status) read -r id sha <<<"$(prod)"; echo "Production: ${sha:0:7} ($(state "$id")), site $SITE"; exit 0 ;;
  --shot)   shot "$(git rev-parse --short HEAD)"; exit 0 ;;
  ""|-h|--help) sed -n 2,8p "$0"; exit 1 ;;
esac

MSG="$1"
START="$(git rev-parse --abbrev-ref HEAD)"
echo "== typecheck"; npx tsc --noEmit
if [ -n "$(git status --porcelain)" ]; then git add -A && git commit -q -m "$MSG"; fi

if [ "$START" != "main" ]; then
  echo "== push $START"; git push -u origin "$START"
  git checkout -q main && git pull -q --ff-only origin main
  git merge --no-ff -q "$START" -m "Merge $START: $MSG"
fi
echo "== push main"; git push origin main
HEAD_SHA="$(git rev-parse HEAD)"

echo "== waiting for the Vercel Production build of ${HEAD_SHA:0:7}"
for i in $(seq 1 60); do
  read -r id sha <<<"$(prod)"
  if [ "$sha" = "$HEAD_SHA" ]; then
    s="$(state "$id")"
    case "$s" in success) echo "Production is live: $SITE/?v=${HEAD_SHA:0:7}"; shot "${HEAD_SHA:0:7}"; exit 0 ;; failure|error) echo "Vercel build failed: $s"; exit 2 ;; esac
  fi
  sleep 10
done
echo "Timed out waiting for Vercel (the build may still finish: scripts/ship.sh --status)"; exit 3
