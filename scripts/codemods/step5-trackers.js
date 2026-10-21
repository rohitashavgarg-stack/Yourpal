#!/usr/bin/env node
/* Phase 3 part 2c, trackers: the tiles and the row moved to src/design-system/patterns/TrackerRow.tsx. This rewrites the parts of
 * features/today/Trackers.tsx that read the member's data so they feed the pattern. */
const fs = require('fs');
const p = 'src/features/today/Trackers.tsx';
let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const cutBetween = (a, b, repl) => { const i = s.indexOf(a); const j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 40) + ' / ' + b.slice(0, 40)); s = s.slice(0, i) + repl + s.slice(j); };

cutBetween('function Ripple(', 'function useWater()', '');
cutBetween('// ---------- cards ----------', '// Tall capped bottle with a wavy fill', '// The tiles (water, weight, the Health tiles, Connect Health) and the row are patterns: src/design-system/patterns/TrackerRow.tsx.\n// What follows feeds them the member\'s data.\n\n');
cutBetween('export function WaterCard()', 'function Sneaker', [
  'export function WaterCard() {',
  '  const { openSheet } = useOverlay();',
  '  const { water, change, hit } = useWater();',
  "  return <WaterTile litres={water} hit={hit} onPress={() => openSheet(<WaterSheet />, { label: 'Water' })} onAdd={() => change(0.25)} />;",
  '}',
  '',
  'export function WeightCard() {',
  '  const paused = useLogsPaused();',
  '  const { d } = useDomain();',
  '  const diff = Math.round((d.weight - SPARK[0]) * 10) / 10;',
  "  return <WeightTile kg={d.weight} delta={diff} series={[...SPARK, d.weight]} onPress={() => (paused ? router.push({ pathname: '/progress/metric', params: { k: 'weight' } }) : router.push('/log-weight'))} />;",
  '}',
  '',
  ''].join('\n'));
cutBetween('type HK =', '// One tracker in one design.', [
  "type HK = 'hr' | 'sleep' | 'kcal';",
  'export function HealthCards({ only }: { only?: HK } = {}) {',
  '  const { openSheet } = useOverlay();',
  "  const open = (k: HK) => openSheet(<HealthSheet k={k} />, { label: 'Health data' });",
  '  return (',
  '    <>',
  "      {(!only || only === 'hr') && <HealthTile kind=\"hr\" onPress={() => open('hr')} />}",
  "      {(!only || only === 'sleep') && <HealthTile kind=\"sleep\" onPress={() => open('sleep')} />}",
  "      {(!only || only === 'kcal') && <HealthTile kind=\"kcal\" onPress={() => open('kcal')} />}",
  '    </>',
  '  );',
  '}',
  '',
  'export function ConnectCard() {',
  '  const { set } = useDomain();',
  '  const { toast } = useOverlay();',
  '  return <ConnectTile name={HEALTH_NAME} onPress={() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected. Steps, heart rate and sleep sync automatically`); }} />;',
  '}',
  '',
  ''].join('\n'));
cutBetween('export function Trackers()', '// ---------- sheets ----------', [
  'export function Trackers() {',
  '  const { d } = useDomain();',
  '  return <TrackerRow connected={d.hc} wearable={d.wearable} weight={<WeightCard />} steps={<StepsTile />} connect={<ConnectCard />} water={<WaterCard />} health={<HealthCards />} />;',
  '}',
  '',
  ''].join('\n'));
s = s.replace("import { radii, fontSizes, fixed } from '@/design-system/tokens';", "import { radii, fontSizes, fixed } from '@/design-system/tokens';\nimport { BottleFigma, BottleRipple as Ripple, ConnectTile, HealthTile, TrackerRow, WaterTile, WeightTile } from '@/design-system/patterns/TrackerRow';");
fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('ok');
