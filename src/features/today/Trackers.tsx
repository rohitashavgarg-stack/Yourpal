import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
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
import { fmt1 } from '@/lib/useNow';
import { HEALTH_NAME } from '@/lib/health';
import { StepsDesign, StepsPreview, StepsTile } from './StepsCards';
import { TrackerKey } from '@/features/trackers/designs';
import { AddButton, EnergyDot, EnergyStack, HrDot, SleepDot, SleepStages, WaterDot, WaterGlasses, WeightDot, WeightRuler } from '@/features/trackers/Widgets';

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
const SQ = { width: 160, height: 160, borderRadius: 24, padding: 16, overflow: 'hidden' } as const;
const GLASS = 'rgba(255,255,255,0.16)';

// The glass bottle from Figma (Bottle.svg, 32 x 95): cap, grooves, outline and highlight are the static art; the water is drawn inside the
// body and its level springs to the new amount. (Fixed 32 x 95 box, so the card and the art always line up.)
const BOTTLE_BODY = 'M9 10H23V16.5C23 18.4922 32 21.2891 32 29.9219V85.7031C32 88.1688 30.8762 90.5335 28.8758 92.277C26.8754 94.0205 24.1623 95 21.3333 95H10.6667C7.83769 95 5.12458 94.0205 3.12419 92.277C1.12381 90.5335 0 88.1688 0 85.7031V29.9219C0 21.2891 9 18.4922 9 16.5V10Z';
const BOTTLE_CAP = 'M8 2C8 0.895431 8.89543 0 10 0H22C23.1046 0 24 0.895431 24 2V7.5C24 7.77614 23.7761 8 23.5 8H8.5C8.22386 8 8 7.77614 8 7.5V2Z';
const ARect = Animated.createAnimatedComponent(Rect);
// The same bottle art on the Water tile and in the Water sheet (scale it with w; onLight draws the outline and cap for a light background).
export function BottleFigma({ litres, id, w = 32, onLight = false }: { litres: number; id: string; w?: number; onLight?: boolean }) {
  const pct = Math.min(1, litres / TARGET);
  const top = useSharedValue(95 - pct * 65);
  useEffect(() => { top.value = withSpring(95 - pct * 65, { damping: 14, stiffness: 90 }); }, [pct]);
  const water = useAnimatedProps(() => ({ y: top.value, height: 95 - top.value }));
  return (
    <Svg width={w} height={(w * 95) / 32} viewBox="0 0 32 95">
      <Defs>
        <ClipPath id={`${id}Cap`}><Path d={BOTTLE_CAP} /></ClipPath>
        <ClipPath id={`${id}Body`}><Path d={BOTTLE_BODY} /></ClipPath>
        <SvgGradient id={`${id}Water`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#8CBBFF" stopOpacity={0.95} /><Stop offset="1" stopColor="#3D6BFF" stopOpacity={0.95} /></SvgGradient>
        <SvgGradient id={`${id}Shine`} x1="10" y1="58.5" x2="5" y2="58.5" gradientUnits="userSpaceOnUse"><Stop offset="0" stopColor="#999999" /><Stop offset="1" stopColor="#FFFFFF" /></SvgGradient>
      </Defs>
      <Rect x={7} y={8} width={18} height={2} rx={1} fill="#9294A8" />
      <Path d={BOTTLE_CAP} fill={onLight ? '#1B2440' : '#fff'} />
      <G clipPath={`url(#${id}Cap)`}>
        {Array.from({ length: 12 }, (_, i) => <Rect key={i} x={9 + i * 1.3} y={0} width={0.3} height={8} fill="#EAE6E6" />)}
      </G>
      <Path d={BOTTLE_BODY} fill={onLight ? '#2F6BEA' : '#D9D9D9'} fillOpacity={onLight ? 0.08 : 0.1} />
      <G clipPath={`url(#${id}Body)`}><ARect animatedProps={water} x={0} width={32} fill={`url(#${id}Water)`} /></G>
      <Path d={BOTTLE_BODY} fill="none" stroke={onLight ? '#1B2440' : '#fff'} strokeOpacity={onLight ? 0.45 : 0.6} strokeWidth={1} strokeLinejoin="round" />
      <Path d="M10 29.4878C10 28.6661 8.88071 28 7.5 28C6.11929 28 5 28.6661 5 29.4878V87.5122C5 88.3339 6.11929 89 7.5 89C8.88071 89 10 88.3339 10 87.5122V29.4878Z" fill={`url(#${id}Shine)`} fillOpacity={0.3} />
    </Svg>
  );
}

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
  const ml = Math.round(water * 1000);
  return (
    <View style={{ width: 160, height: 160 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`Water ${ml} of 3,000 millilitres. Open details`} onPress={() => openSheet(<WaterSheet />, { label: 'Water' })} scaleTo={0.97} style={SQ}>
        <LinearGradient colors={['#070B2B', '#1C2BC0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <Txt style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Water</Txt>
        <View style={{ position: 'absolute', left: 16, bottom: 16, width: 32, height: 95 }}>
          <BottleFigma litres={water} id="bottleCard" />
          {hit > 0 && <Ripple key={hit} size={40} color="#7FB4FF" width={2} />}
        </View>
        <View style={{ position: 'absolute', right: 16, bottom: 16, alignItems: 'flex-end' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 28, lineHeight: 39, letterSpacing: -0.8, color: 'rgba(255,255,255,0.9)' }}>{ml.toLocaleString('en-IN')}</Txt>
          <Txt style={{ fontFamily: font.regular, fontSize: 20, lineHeight: 26, color: '#fff' }}>ml</Txt>
        </View>
      </Pressy>
      {/* Sits above the card press target so tapping it only adds a glass: a 32 px pill (glass + plus) with a 44 px touch area. */}
      <Pressy accessibilityRole="button" accessibilityLabel="Add a glass, 250 millilitres" onPress={() => change(0.25)} scaleTo={0.92} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{ position: 'absolute', top: 16, right: 16, height: 32, paddingHorizontal: 8, borderRadius: 24, backgroundColor: GLASS, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 3 }}>
        <GlassWater size={20} color="#fff" />
        <Plus size={16} color="#fff" />
      </Pressy>
    </View>
  );
}

function sparkY(v: number, h: number, pad: number) { return pad + ((73.2 - v) / (73.2 - 72.0)) * (h - pad * 2); }

const NUM = { fontFamily: font.displayBold, fontSize: 28, lineHeight: 39, letterSpacing: -0.8 } as const;
const UNIT_TXT = { fontFamily: font.medium, fontSize: 14, lineHeight: 20 } as const;

// One tile for every tracker: same size, same padding, same label and number style.
function Tile({ bg, label, labelColor, onPress, a11y, right, children, shadow }: {
  bg: string; label: string; labelColor?: string; onPress?: () => void; a11y: string; right?: React.ReactNode; children: React.ReactNode; shadow?: boolean;
}) {
  const { c } = useTheme();
  const body = (
    <>
      <Row style={{ justifyContent: 'space-between', minHeight: 32 }}>
        <Txt style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: labelColor ?? c.muted }}>{label}</Txt>
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
export function WeightCard() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const series = [...SPARK, d.weight];
  const lo = Math.min(...series) - 0.15, hi = Math.max(...series) + 0.15;
  const W = 160, H = 45; // as wide as the tile (edge to edge), so nothing is stretched and the end dot has room
  const pts = series.map((v, i) => [(i / (series.length - 1)) * (W - 14), 8 + ((hi - v) / (hi - lo)) * (H - 18)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`;
  const last = pts[pts.length - 1];
  const diff = Math.round((d.weight - SPARK[0]) * 10) / 10;
  const sign = diff <= 0 ? '-' : '+';
  return (
    <Tile bg={isDark ? 'rgba(255,255,255,0.05)' : c.surface} shadow={!isDark} label="Weight" a11y={`Weight ${fmt1(d.weight)} kg, ${diff <= 0 ? 'down' : 'up'} ${Math.abs(diff)} kg this week. Log weight`} onPress={() => router.push('/log-weight')}
      right={<View style={{ height: 32, minWidth: 32, paddingHorizontal: 8, borderRadius: 24, backgroundColor: isDark ? GLASS : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Plus size={16} color={isDark ? '#fff' : c.accentText} /></View>}>
      <Txt style={{ ...NUM, color: c.ink }}>{fmt1(d.weight)}<Txt style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: c.muted }}> kg</Txt></Txt>
      <Txt style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: diff <= 0 ? c.good : c.warn }}>{sign} {Math.abs(diff)} kg this week</Txt>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs><SvgGradient id="wArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={c.accent} stopOpacity={0.28} /><Stop offset="1" stopColor={c.accent} stopOpacity={0} /></SvgGradient></Defs>
          <AArea d={area} fill="url(#wArea)" />
          <Path d={line} fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <Circle cx={last[0]} cy={last[1]} r={5} fill="#fff" stroke={c.accent} strokeWidth={2} />
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
export function HealthCards({ only }: { only?: 'hr' | 'sleep' | 'kcal' } = {}) {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const open = (k: HK) => openSheet(<HealthSheet k={k} />, { label: 'Health data' });
  return (
    <>
      {(!only || only === 'hr') && (
      <Tile bg={c.tHeart} label="Heart rate" labelColor={c.cHeart} a11y="Heart rate 72 bpm, open details" onPress={() => open('hr')} right={<Beat><HeartIcon color={c.cHeart} /></Beat>}>
        <Txt style={{ ...NUM, color: c.ink }}>72<Txt muted style={UNIT_TXT}> bpm</Txt></Txt>
        <Txt v="caption">Resting 64</Txt>
        <View style={{ marginTop: 'auto' }}>
          <Svg width={136} height={34} viewBox="0 0 108 30" preserveAspectRatio="none"><Polyline points="0,18 12,16 20,20 28,8 34,24 42,15 56,17 66,12 76,19 86,14 98,16 108,13" fill="none" stroke={c.cHeart} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></Svg>
        </View>
      </Tile>
      )}
      {(!only || only === 'sleep') && (
      <Tile bg={c.tSleep} label="Sleep" labelColor={c.cSleep} a11y="Sleep 7 hours 10 minutes, open details" onPress={() => open('sleep')}>
        <Txt style={{ ...NUM, color: c.ink }}>7h 10<Txt muted style={UNIT_TXT}>m</Txt></Txt>
        <Txt v="caption">11:40 pm – 6:50 am</Txt>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 'auto' }}>
          <View style={{ width: '22%', backgroundColor: c.cSleep, opacity: 0.7 }} /><View style={{ width: '48%', backgroundColor: c.cSleep }} /><View style={{ width: '18%', backgroundColor: c.cSleep, opacity: 0.45 }} /><View style={{ width: '12%', backgroundColor: c.surface3 }} />
        </View>
      </Tile>
      )}
      {(!only || only === 'kcal') && (
      <Tile bg={c.tAct} label="Active energy" labelColor={c.cAct} a11y="Active energy 320 of 450 kilocalories, open details" onPress={() => open('kcal')}>
        <Txt style={{ ...NUM, color: c.ink }}>320<Txt muted style={UNIT_TXT}> kcal</Txt></Txt>
        <Txt v="caption">Goal 450 kcal</Txt>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(196,97,14,0.15)', overflow: 'hidden', marginTop: 'auto' }}>
          <View style={{ width: `${Math.round((320 / 450) * 100)}%`, height: '100%', borderRadius: 5, backgroundColor: c.cAct }} />
        </View>
      </Tile>
      )}
    </>
  );
}

function ConnectCard() {
  const { c, isDark } = useTheme();
  const { set } = useDomain();
  const { toast } = useOverlay();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Connect ${HEALTH_NAME} for steps, heart rate, sleep and energy`} onPress={() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · steps, heart rate and sleep sync automatically`); }}
      style={[SQ, { padding: 12, justifyContent: 'space-between', borderWidth: 1, borderStyle: 'dashed', borderColor: isDark ? 'rgba(255,255,255,0.1)' : c.surface3, backgroundColor: isDark ? '#0E1116' : c.surface }]}>
      <View style={{ width: 32, height: 32, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : c.surface2, alignItems: 'center', justifyContent: 'center' }}><HeartIcon size={20} color="#FF6B7A" /></View>
      <Txt style={{ fontFamily: font.displayBold, fontSize: 20, lineHeight: 28, color: c.ink }}>{`Connect ${HEALTH_NAME}`}</Txt>
      <Txt style={{ fontSize: 12, lineHeight: 17, color: c.muted }}>Steps, heart rate, sleep and energy</Txt>
    </Pressy>
  );
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
  return (
    <View style={{ marginHorizontal: -16, gap: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" accessibilityLabel="Quick trackers, swipe for more"
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingVertical: 2 }}>
        {/* the three default trackers first: weight, steps (or connect Health), water; then the watch ones */}
        <WeightCard />
        {!d.hc ? <ConnectCard /> : <StepsTile />}
        <WaterCard />
        {d.hc && d.wearable && <HealthCards />}
      </ScrollView>
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
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.6 }}>Water</Txt>
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
          {water >= TARGET && <Animated.View entering={fade()}><Tag label="Target reached" bg={c.goodSoft} fg={c.good} /></Animated.View>}
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
