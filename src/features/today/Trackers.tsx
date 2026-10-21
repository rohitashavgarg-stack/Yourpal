import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient as SvgGradient, Path, Polyline, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendsButton } from '@/components/TrendsButton';
import { Footprints, GlassWater, Plus } from '@/lib/icons';
import { router } from 'expo-router';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Beat, HeartIcon, Ring, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { reminderStore } from '@/features/reminders/reminders';
import { fmt1 } from '@/lib/useNow';
import { HEALTH_NAME } from '@/lib/health';
import { useLogGate, useLogsPaused } from '@/lib/logGate';
import { StepsDesign, StepsPreview, StepsTile } from './StepsCards';
import { TrackerKey } from '@/features/trackers/designs';
import { AddButton, EnergyDot, EnergyStack, HrDot, SleepDot, SleepStages, WaterDot, WaterGlasses, WeightDot, WeightRuler } from '@/features/trackers/Widgets';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { BottleFigma, BottleRipple as Ripple, ConnectTile, HealthTile, TrackerRow, WaterTile, WeightTile } from '@/design-system/patterns/TrackerRow';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const APath = Animated.createAnimatedComponent(Path);
const ALine = Animated.createAnimatedComponent(Line);
const ACirc = Animated.createAnimatedComponent(Circle);
const BOTTLE = 'M16 3h12v8c0 2 8 5 8 13v40a7 7 0 0 1-7 7H15a7 7 0 0 1-7-7V24c0-8 8-11 8-13z';
const TARGET = 3;
const BODY = 'M19 19h18v10c0 3 12 7 12 20v84a14 14 0 0 1-14 14H21a14 14 0 0 1-14-14V49c0-13 12-17 12-20z';
export const SPARK = [72.9, 72.8, 72.7, 72.6, 72.6, 72.5];

// Bottle with a moving wave; the fill level springs to the new amount.
export function Bottle({ litres, w, h, id, glass, wave, stroke, strokeW }: { litres: number; w: number; h: number; id: string; glass: string; wave: string; stroke: string; strokeW: number }) {
  const pct = Math.min(1, litres / TARGET);
  const lvl = useSharedValue(24 + (1 - pct) * 47 - 4);
  const off = useSharedValue(0);
  useEffect(() => { lvl.value = withSpring(24 + (1 - pct) * 47 - 4, { damping: 9, stiffness: 90 }); }, [pct]);
  useEffect(() => { off.value = withRepeat(withTiming(24, { duration: 2600, easing: Easing.linear }), -1, false); }, []);
  const props = useAnimatedProps(() => {
    const o = off.value, L = lvl.value;
    let d = `M${-48 + o} ${L + 4} Q${-42 + o} ${L + 1} ${-36 + o} ${L + 4}`;
    for (let x = -24; x <= 72; x += 12) d += ` T${x + o} ${L + 4}`;
    d += ` V90 H${-48 + o} Z`;
    return { d };
  });
  return (
    <Svg width={w} height={h} viewBox="0 0 44 74">
      <Defs><ClipPath id={id}><Path d={BOTTLE} /></ClipPath></Defs>
      <G clipPath={`url(#${id})`}>
        <Rect width={44} height={74} fill={glass} />
        <APath animatedProps={props} fill={wave} />
      </G>
      <Path d={BOTTLE} fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
    </Svg>
  );
}

function useWater() {
  const { d, set } = useDomain();
  const { paused, blocked } = useLogGate();
  const [hit, setHit] = useState(0);
  const change = (delta: number) => {
    if (blocked()) return d.water;
    const w = Math.max(0, Math.min(3.5, Math.round((d.water + delta) * 100) / 100));
    if (d.water < TARGET && w >= TARGET) { setHit((h) => h + 1); haptic.success(); } else haptic.light();
    set({ water: w });
    if (delta > 0) reminderStore.set({ waterAt: d.min }); // the last glass, for the 4-hour water reminder
    return w;
  };
  return { water: d.water, change, hit, paused };
}

// The tiles (water, weight, the Health tiles, Connect Health) and the row are patterns: src/design-system/patterns/TrackerRow.tsx.
// What follows feeds them the member's data.

// Tall capped bottle with a wavy fill; the level springs to the new amount. Same art on the Today card and in the sheet.
// live: keep the wave moving. Off on the Today card (a path redrawn every frame is costly and runs on every tab); on inside the water sheet.
export function BottleArt({ litres, w, h, id = 'bottleBody', onLight, live = false }: { litres: number; w: number; h: number; id?: string; onLight?: boolean; live?: boolean }) {
  const pct = Math.min(1, litres / TARGET);
  const lvl = useSharedValue(144 - pct * 114);
  const off = useSharedValue(0);
  useEffect(() => { lvl.value = withSpring(144 - pct * 114, { damping: 11, stiffness: 90 }); }, [pct]);
  useEffect(() => {
    if (live) off.value = withRepeat(withTiming(24, { duration: 2600, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(off);
  }, [live]);
  const props = useAnimatedProps(() => {
    const o = off.value, L = lvl.value;
    let d = `M${-48 + o} ${L + 3} Q${-42 + o} ${L} ${-36 + o} ${L + 3}`;
    for (let x = -24; x <= 84; x += 12) d += ` T${x + o} ${L + 3}`;
    d += ` V160 H${-48 + o} Z`;
    return { d };
  });
  return (
    <Svg width={w} height={h} viewBox="0 0 56 152">
      <Defs>
        <ClipPath id={id}><Path d={BODY} /></ClipPath>
        <SvgGradient id={`${id}Fill`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#8CBBFF" stopOpacity={0.95} /><Stop offset="1" stopColor="#3D6BFF" stopOpacity={0.95} /></SvgGradient>
      </Defs>
      <Rect x={17} y={2} width={22} height={13} rx={4.5} fill={onLight ? '#1B2440' : '#F4F7FF'} />
      <Rect x={15} y={13} width={26} height={7} rx={2.5} fill={onLight ? 'rgba(27,36,64,0.35)' : 'rgba(255,255,255,0.55)'} />
      <Path d={BODY} fill={onLight ? 'rgba(47,107,234,0.08)' : 'rgba(255,255,255,0.10)'} />
      <G clipPath={`url(#${id})`}><APath animatedProps={props} fill={`url(#${id}Fill)`} /></G>
      <Rect x={12} y={44} width={4} height={82} rx={2} fill="rgba(255,255,255,0.30)" />
      <Path d={BODY} fill="none" stroke={onLight ? 'rgba(27,36,64,0.5)' : 'rgba(255,255,255,0.6)'} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}

export function WaterCard() {
  const { openSheet } = useOverlay();
  const { water, change, hit } = useWater();
  return <WaterTile litres={water} hit={hit} onPress={() => openSheet(<WaterSheet />, { label: 'Water' })} onAdd={() => change(0.25)} />;
}

export function WeightCard() {
  const paused = useLogsPaused();
  const { d } = useDomain();
  const diff = Math.round((d.weight - SPARK[0]) * 10) / 10;
  return <WeightTile kg={d.weight} delta={diff} series={[...SPARK, d.weight]} onPress={() => (paused ? router.push({ pathname: '/progress/metric', params: { k: 'weight' } }) : router.push('/log-weight'))} />;
}

function Sneaker({ w }: { w: number }) {
  return (
    <Svg width={w} height={w * 0.63} viewBox="0 0 120 76">
      <Defs>
        <SvgGradient id="shoeUp" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#7C93FF" /><Stop offset="1" stopColor="#3145F0" /></SvgGradient>
        <SvgGradient id="shoeSole" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#5D74FF" /><Stop offset="1" stopColor="#8AA0FF" /></SvgGradient>
      </Defs>
      <Path d="M12 56 C12 40 16 30 24 26 L36 22 C42 20 46 12 52 10 C58 8 64 12 68 18 C72 24 80 30 92 34 C104 38 112 44 114 54 L114 58 L12 58 Z" fill="url(#shoeUp)" />
      <Path d="M6 62 C6 58 10 56 14 56 L104 56 C112 56 117 60 115 65 C114 68 110 70 106 70 L14 70 C9 70 6 67 6 62 Z" fill="url(#shoeSole)" />
      <Path d="M40 24 L50 34 M50 18 L60 30 M60 16 L70 27" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

type HK = 'hr' | 'sleep' | 'kcal';
export function HealthCards({ only }: { only?: HK } = {}) {
  const { openSheet } = useOverlay();
  const open = (k: HK) => openSheet(<HealthSheet k={k} />, { label: 'Health data' });
  return (
    <>
      {(!only || only === 'hr') && <HealthTile kind="hr" onPress={() => open('hr')} />}
      {(!only || only === 'sleep') && <HealthTile kind="sleep" onPress={() => open('sleep')} />}
      {(!only || only === 'kcal') && <HealthTile kind="kcal" onPress={() => open('kcal')} />}
    </>
  );
}

export function ConnectCard() {
  const { set } = useDomain();
  const { toast } = useOverlay();
  return <ConnectTile name={HEALTH_NAME} onPress={() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected. Steps, heart rate and sleep sync automatically`); }} />;
}

// One tracker in one design. interactive: false is for the designs page and the Profile card (looks only, no taps).
export function TileFor({ tracker, design, interactive = true }: { tracker: TrackerKey; design: string; interactive?: boolean }) {
  const { d } = useDomain();
  const { water, change } = useWater();
  const { openSheet } = useOverlay();
  const press = (fn: () => void) => (interactive ? fn : undefined);
  const health = (k: HK) => press(() => openSheet(<HealthSheet k={k} />, { label: 'Health data' }));
  const diff = Math.round((d.weight - SPARK[0]) * 10) / 10;
  switch (tracker) {
    case 'steps': return interactive ? <StepsTile /> : <StepsPreview design={design as StepsDesign} />;
    case 'water':
      if (design === 'Dot matrix') return <WaterDot litres={water} onAdd={press(() => change(0.25))} onPress={press(() => openSheet(<WaterSheet />, { label: 'Water' }))} />;
      if (design === 'Glasses') return <WaterGlasses litres={water} onAdd={press(() => change(0.25))} onPress={press(() => openSheet(<WaterSheet />, { label: 'Water' }))} />;
      return <WaterCard />;
    case 'weight':
      if (design === 'Dot matrix') return <WeightDot kg={d.weight} delta={diff} onAdd={press(() => router.push('/log-weight'))} onPress={press(() => router.push('/log-weight'))} />;
      if (design === 'Ruler') return <WeightRuler kg={d.weight} onAdd={press(() => router.push('/log-weight'))} onPress={press(() => router.push('/log-weight'))} />;
      return <WeightCard />;
    case 'hr': return design === 'Dot matrix' ? <HrDot onPress={health('hr')} /> : <HealthCards only="hr" />;
    case 'sleep':
      if (design === 'Stages') return <SleepStages onPress={health('sleep')} />;
      if (design === 'Dot matrix') return <SleepDot onPress={health('sleep')} />;
      return <HealthCards only="sleep" />;
    case 'energy':
      if (design === 'Dot matrix') return <EnergyDot onPress={health('kcal')} />;
      if (design === 'Stack') return <EnergyStack onPress={health('kcal')} />;
      return <HealthCards only="kcal" />;
  }
}

export function Trackers() {
  const { d } = useDomain();
  return <TrackerRow connected={d.hc} wearable={d.wearable} weight={<WeightCard />} steps={<StepsTile />} connect={<ConnectCard />} water={<WaterCard />} health={<HealthCards />} />;
}

// ---------- sheets ----------
export function WaterSheet() {
  const { c, isDark } = useTheme();
  const { water, change, hit } = useWater();
  const { closeSheet } = useOverlay();
  const [log, setLog] = useState<number[]>([]);
  const add = (v: number) => { const before = water; const w = change(v); if (w > before) setLog((l) => [Date.now(), ...l].slice(0, 5)); else if (w < before) setLog((l) => l.slice(1)); };
  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.6 }}>Water</Txt>
        <TrendsButton label="See water trend" onPress={() => closeSheet(() => router.push({ pathname: '/progress/metric', params: { k: 'water' } }))} />
      </Row>
      <Row style={{ gap: 20 }}>
        <View style={{ width: 84, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <BottleFigma litres={water} w={64} id="bottleSheet" onLight={!isDark} />
          {hit > 0 && <Ripple key={hit} size={70} color="#5B8DFF" width={3} />}
        </View>
        <View style={{ gap: 6 }}>
          <Txt style={{ fontFamily: font.display, fontSize: 50, lineHeight: 50 }}>{Math.round(water * 100) / 100}<Txt muted style={{ fontFamily: font.display, fontSize: 24 }}> L</Txt></Txt>
          <Txt muted>Daily target 3 L</Txt>
          {water >= TARGET && <FadeIn><Tag label="Target reached" bg={c.goodSoft} fg={c.good} /></FadeIn>}
        </View>
      </Row>
      <Row style={{ gap: 8 }}>
        <Button kind="secondary" label="− 250 ml" accessibilityLabel="Remove 250 ml" onPress={() => add(-0.25)} style={{ flex: 1 }} />
        <Button kind="accent" label="+ 250 ml" accessibilityLabel="Add 250 ml" onPress={() => add(0.25)} style={{ flex: 1, backgroundColor: c.water }} />
      </Row>
      {log.length > 0 && (
        <View>
          <Txt v="label" style={{ paddingBottom: 4 }}>Logged just now</Txt>
          {log.map((k) => (
            <FadeIn key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <Txt>Glass</Txt><Txt v="mono" muted>+250 ml</Txt>
            </FadeIn>
          ))}
        </View>
      )}
    </>
  );
}

const HEALTH: Record<HK, { t: string; big: string; unit: string; sub: string; bars: number[]; rows: [string, string][] }> = {
  hr: { t: 'Heart rate', big: '72', unit: ' bpm', sub: 'Right now · resting 64 bpm this week (↓2 vs last month)', bars: [40, 38, 35, 45, 60, 55, 72, 95, 88, 50, 45, 42], rows: [['Resting', '64 bpm'], ['Today max', '118 bpm'], ['HRV', '48 ms']] },
  sleep: { t: 'Sleep', big: '7h 10m', unit: '', sub: 'Last night · 11:40 pm – 6:50 am', bars: [30, 55, 80, 60, 90, 70, 40, 85, 65, 50, 75, 35], rows: [['Deep', '1h 35m'], ['REM', '1h 20m'], ['Awake', '12m']] },
  kcal: { t: 'Active energy', big: '320', unit: ' kcal', sub: 'Today so far · goal 450 kcal', bars: [10, 5, 5, 20, 45, 30, 15, 60, 90, 40, 25, 20], rows: [['Workout', '—'], ['Walking', '180 kcal'], ['Other', '140 kcal']] },
};
export function HealthSheet({ k }: { k: HK }) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const h = HEALTH[k];
  const col = k === 'sleep' ? c.cSleep : k === 'hr' ? c.cHeart : c.cAct; // same colour as its Today tile and Progress card
  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2 }}>{h.t}</Txt>
      <Txt style={{ fontFamily: font.display, fontSize: 44, lineHeight: 44 }}>{h.big}<Txt muted style={{ fontFamily: font.display, fontSize: fontSizes.xl }}>{h.unit}</Txt></Txt>
      <Txt muted style={{ fontSize: fontSizes.md }}>{h.sub}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 90, paddingVertical: 6 }}>
        {h.bars.map((v, i) => <FadeIn key={i} delay={i * 30} style={{ flex: 1, height: `${v}%`, borderRadius: radii.xs, backgroundColor: col, opacity: k === 'sleep' ? [1, 0.7, 0.45][i % 3] : 1 }} />)}
      </View>
      <View>
        {h.rows.map(([l, v]) => (
          <Row key={l} style={{ justifyContent: 'space-between', minHeight: 44, borderBottomWidth: 1, borderBottomColor: c.line }}><Txt muted>{l}</Txt><Txt v="mono">{v}</Txt></Row>
        ))}
      </View>
      {k !== 'kcal' && <Button kind="outline" small label={k === 'hr' ? 'See heart rate trend' : 'See sleep trend'} onPress={() => closeSheet(() => router.push({ pathname: '/progress/metric', params: { k } }))} />}
      <Txt v="caption">Synced 5 min ago from {HEALTH_NAME} · only you see this unless you share it in Privacy</Txt>
    </>
  );
}
