import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient as SvgGradient, Path, Polyline, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { CirclePlus, Footprints, GlassWater, Plus } from '@/lib/icons';
import { router } from 'expo-router';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Beat, HeartIcon, Ring, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1 } from '@/lib/useNow';
import { HEALTH_NAME } from '@/lib/health';
import { StepsTile } from './StepsCards';

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

function Ripple({ size, color, width }: { size: number; color: string; width: number }) {
  const s = useSharedValue(0.2);
  const o = useSharedValue(0.9);
  useEffect(() => { s.value = withTiming(2.6, { duration: 1200, easing: Easing.out(Easing.quad) }); o.value = withTiming(0, { duration: 1200 }); }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: width, borderColor: color }, a]} />;
}

function useWater() {
  const { d, set } = useDomain();
  const [hit, setHit] = useState(0);
  const change = (delta: number) => {
    const w = Math.max(0, Math.min(3.5, Math.round((d.water + delta) * 100) / 100));
    if (d.water < TARGET && w >= TARGET) { setHit((h) => h + 1); haptic.success(); } else haptic.light();
    set({ water: w });
    return w;
  };
  return { water: d.water, change, hit };
}

// ---------- cards ----------

// ---------- Water and Steps: square feature tiles ----------
const SQ = { width: 164, height: 164, borderRadius: 28, padding: 14, overflow: 'hidden' } as const;

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

function WaterCard() {
  const { openSheet } = useOverlay();
  const { water, change, hit } = useWater();
  const ml = Math.round(water * 1000);
  return (
    <View style={{ width: 164, height: 164 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`Water ${ml} of 3,000 millilitres. Open details`} onPress={() => openSheet(<WaterSheet />, { label: 'Water', glow: '#2F6BEA' })} scaleTo={0.97} style={SQ}>
        <LinearGradient colors={['#070B2E', '#1C2BC0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', left: 14, top: 8, bottom: 8, justifyContent: 'center' }}>
          <BottleArt litres={water} w={56} h={148} id="bottleCard" />
          {hit > 0 && <Ripple key={hit} size={40} color="#7FB4FF" width={2} />}
        </View>
        <View style={{ position: 'absolute', right: 14, bottom: 12, alignItems: 'flex-end' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.8, color: '#fff' }}>{ml.toLocaleString('en-IN')}</Txt>
          <Txt style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 20, color: 'rgba(255,255,255,0.7)' }}>ml</Txt>
        </View>
      </Pressy>
      {/* Sits above the card press target so tapping it only adds a glass. */}
      <Pressy accessibilityRole="button" accessibilityLabel="Add a glass, 250 millilitres" onPress={() => change(0.25)} scaleTo={0.92}
        style={{ position: 'absolute', top: 10, right: 10, height: 44, minWidth: 74, paddingHorizontal: 12, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <GlassWater size={18} color="#fff" />
        <CirclePlus size={18} color="#fff" />
      </Pressy>
    </View>
  );
}

function sparkY(v: number, h: number, pad: number) { return pad + ((73.2 - v) / (73.2 - 72.0)) * (h - pad * 2); }

const NUM = { fontFamily: font.displayBold, fontSize: 32, lineHeight: 40, letterSpacing: -0.8 } as const;
const UNIT_TXT = { fontFamily: font.medium, fontSize: 14, lineHeight: 20 } as const;

// One tile for every tracker: same size, same padding, same label and number style.
function Tile({ bg, label, labelColor, onPress, a11y, right, children, shadow }: {
  bg: string; label: string; labelColor?: string; onPress?: () => void; a11y: string; right?: React.ReactNode; children: React.ReactNode; shadow?: boolean;
}) {
  const { c } = useTheme();
  const body = (
    <>
      <Row style={{ justifyContent: 'space-between', minHeight: 24 }}>
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: labelColor ?? c.muted }}>{label}</Txt>
        {right}
      </Row>
      {children}
    </>
  );
  const style = [SQ, { backgroundColor: bg, gap: 2 }, shadow && { shadowColor: '#101828', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }];
  return onPress
    ? <Pressy accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} scaleTo={0.97} style={style}>{body}</Pressy>
    : <View accessible accessibilityLabel={a11y} style={style}>{body}</View>;
}

const AArea = Animated.createAnimatedComponent(Path);
function WeightCard() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const series = [...SPARK, d.weight];
  const lo = Math.min(...series) - 0.15, hi = Math.max(...series) + 0.15;
  const W = 136, H = 46;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * (W - 8) + 4, 6 + ((hi - v) / (hi - lo)) * (H - 14)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`;
  const last = pts[pts.length - 1];
  const diff = Math.round((d.weight - SPARK[0]) * 10) / 10;
  return (
    <Tile bg={c.surface} shadow={!isDark} label="Weight" a11y={`Weight ${fmt1(d.weight)} kg, ${diff <= 0 ? 'down' : 'up'} ${Math.abs(diff)} kg this week. Log weight`} onPress={() => router.push('/log-weight')}
      right={<View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: -4, marginTop: -2 }}><Plus size={17} color={c.accentText} /></View>}>
      <Txt style={{ ...NUM, color: c.ink }}>{fmt1(d.weight)}<Txt muted style={UNIT_TXT}> kg</Txt></Txt>
      <Txt style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: diff <= 0 ? c.good : c.warn }}>{diff <= 0 ? '↓' : '↑'} {Math.abs(diff)} kg this week</Txt>
      <View style={{ marginTop: 'auto', marginHorizontal: -6, marginBottom: -6 }}>
        <Svg width={W + 12} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <Defs><SvgGradient id="wArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={c.accent} stopOpacity={0.28} /><Stop offset="1" stopColor={c.accent} stopOpacity={0} /></SvgGradient></Defs>
          <AArea d={area} fill="url(#wArea)" />
          <Path d={line} fill="none" stroke={c.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <Circle cx={last[0]} cy={last[1]} r={4.5} fill={c.surface} stroke={c.accent} strokeWidth={2.4} />
        </Svg>
      </View>
    </Tile>
  );
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
function HealthCards() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const open = (k: HK) => openSheet(<HealthSheet k={k} />, { label: 'Health data' });
  return (
    <>
      <Tile bg={c.tHeart} label="Heart rate" labelColor={c.cHeart} a11y="Heart rate 72 bpm, open details" onPress={() => open('hr')} right={<Beat><HeartIcon color={c.cHeart} /></Beat>}>
        <Txt style={{ ...NUM, color: c.ink }}>72<Txt muted style={UNIT_TXT}> bpm</Txt></Txt>
        <Txt v="caption">Resting 64</Txt>
        <View style={{ marginTop: 'auto' }}>
          <Svg width={136} height={34} viewBox="0 0 108 30" preserveAspectRatio="none"><Polyline points="0,18 12,16 20,20 28,8 34,24 42,15 56,17 66,12 76,19 86,14 98,16 108,13" fill="none" stroke={c.cHeart} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></Svg>
        </View>
      </Tile>
      <Tile bg={c.tSleep} label="Sleep" labelColor={c.cSleep} a11y="Sleep 7 hours 10 minutes, open details" onPress={() => open('sleep')}>
        <Txt style={{ ...NUM, color: c.ink }}>7h 10<Txt muted style={UNIT_TXT}>m</Txt></Txt>
        <Txt v="caption">11:40 pm – 6:50 am</Txt>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 'auto' }}>
          <View style={{ width: '22%', backgroundColor: c.cSleep, opacity: 0.7 }} /><View style={{ width: '48%', backgroundColor: c.cSleep }} /><View style={{ width: '18%', backgroundColor: c.cSleep, opacity: 0.45 }} /><View style={{ width: '12%', backgroundColor: c.surface3 }} />
        </View>
      </Tile>
      <Tile bg={c.tAct} label="Active energy" labelColor={c.cAct} a11y="Active energy 320 of 450 kilocalories, open details" onPress={() => open('kcal')}>
        <Txt style={{ ...NUM, color: c.ink }}>320<Txt muted style={UNIT_TXT}> kcal</Txt></Txt>
        <Txt v="caption">Goal 450 kcal</Txt>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(196,97,14,0.15)', overflow: 'hidden', marginTop: 'auto' }}>
          <View style={{ width: `${Math.round((320 / 450) * 100)}%`, height: '100%', borderRadius: 5, backgroundColor: c.cAct }} />
        </View>
      </Tile>
    </>
  );
}

function ConnectCard() {
  const { c } = useTheme();
  const { set } = useDomain();
  const { toast } = useOverlay();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Connect ${HEALTH_NAME} for steps, heart rate, sleep and energy`} onPress={() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · steps, heart rate and sleep sync automatically`); }}
      style={[SQ, { gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.surface3, justifyContent: 'center' }]}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><HeartIcon size={20} color="#FF6B7A" /></View>
      <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{`Connect ${HEALTH_NAME}`}</Txt>
      <Txt v="caption">Steps, heart rate, sleep and energy</Txt>
    </Pressy>
  );
}

export function Trackers() {
  const { d } = useDomain();
  return (
    <View style={{ marginHorizontal: -16, gap: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" accessibilityLabel="Quick trackers, swipe for more"
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 2 }}>
        <WaterCard />
        <WeightCard />
        {!d.hc ? <ConnectCard /> : <><StepsTile />{d.wearable && <HealthCards />}</>}
      </ScrollView>
      <Txt v="caption" style={{ paddingHorizontal: 20 }}>{!d.hc ? `Swipe for more · connect ${HEALTH_NAME} for steps` : d.wearable ? `Swipe for heart rate, sleep and energy from your watch` : `Steps from ${HEALTH_NAME} · heart rate and sleep need a watch or band`}</Txt>
    </View>
  );
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
      <Txt style={{ fontFamily: font.semibold, fontSize: 26, letterSpacing: -0.6 }}>Water</Txt>
      <Row style={{ gap: 20 }}>
        <View style={{ width: 84, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <BottleArt litres={water} w={76} h={190} id="bottleSheet" onLight={!isDark} live />
          {hit > 0 && <Ripple key={hit} size={70} color="#5B8DFF" width={3} />}
        </View>
        <View style={{ gap: 6 }}>
          <Txt style={{ fontFamily: font.display, fontSize: 50, lineHeight: 50 }}>{Math.round(water * 100) / 100}<Txt muted style={{ fontFamily: font.display, fontSize: 24 }}> L</Txt></Txt>
          <Txt muted>Daily target 3 L</Txt>
          {water >= TARGET && <Animated.View entering={fade()}><Tag label="Target reached" bg={c.goodSoft} fg={c.good} /></Animated.View>}
        </View>
      </Row>
      <Row style={{ gap: 8 }}>
        <Button kind="secondary" label="−" accessibilityLabel="Remove 250 ml" onPress={() => add(-0.25)} style={{ width: 64, paddingHorizontal: 0 }} />
        <Button kind="accent" label="+ 250 ml glass" onPress={() => add(0.25)} style={{ flex: 1, backgroundColor: c.water }} />
      </Row>
      <Button kind="outline" small label="See water trend" onPress={() => closeSheet(() => router.push({ pathname: '/progress/metric', params: { k: 'water' } }))} />
      {log.length > 0 && (
        <View>
          <Txt v="label" style={{ paddingBottom: 4 }}>Logged just now</Txt>
          {log.map((k) => (
            <Animated.View key={k} entering={fade()} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <Txt>Glass</Txt><Txt v="mono" muted>+250 ml</Txt>
            </Animated.View>
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
      <Txt style={{ fontFamily: font.semibold, fontSize: 22 }}>{h.t}</Txt>
      <Txt style={{ fontFamily: font.display, fontSize: 44, lineHeight: 44 }}>{h.big}<Txt muted style={{ fontFamily: font.display, fontSize: 20 }}>{h.unit}</Txt></Txt>
      <Txt muted style={{ fontSize: 14 }}>{h.sub}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 90, paddingVertical: 6 }}>
        {h.bars.map((v, i) => <Animated.View key={i} entering={fade(i * 30)} style={{ flex: 1, height: `${v}%`, borderRadius: 4, backgroundColor: col, opacity: k === 'sleep' ? [1, 0.7, 0.45][i % 3] : 1 }} />)}
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
