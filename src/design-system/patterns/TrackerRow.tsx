import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient as SvgGradient, Path, Polyline, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassWater, Plus } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { Beat, HeartIcon } from '@/components/bits';
import { fmt1 } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed, radii } from '@/design-system/tokens';

/**
 * The quick trackers row on Today: square 160 px tiles in a sideways scroll.
 * Weight, then steps (or the "Connect Health" tile when Health is not connected), then water, then heart rate, sleep and active
 * energy when a wearable is connected. Each tile is a pattern here; `TrackerRow` lays them out for the two connection states.
 */

export type TrackerRowProps = {
  /** Health (Apple Health or Health Connect) is connected: shows `steps` instead of `connect`. */
  connected: boolean;
  /** A wearable is connected too: adds the heart rate, sleep and energy tiles. Only with `connected`. */
  wearable: boolean;
  weight: React.ReactNode;
  steps: React.ReactNode;
  connect: React.ReactNode;
  water: React.ReactNode;
  health: React.ReactNode;
};

export function TrackerRow({ connected, wearable, weight, steps, connect, water, health }: TrackerRowProps) {
  return (
    <View style={{ marginHorizontal: -16, gap: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" accessibilityLabel="Quick trackers, swipe for more"
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingVertical: 2 }}>
        {/* the three default trackers first: weight, steps (or connect Health), water; then the watch ones */}
        {weight}
        {!connected ? connect : steps}
        {water}
        {connected && wearable && health}
      </ScrollView>
    </View>
  );
}

// ---------- shared ----------
const TARGET = 3;
const SQ = { width: 160, height: 160, borderRadius: radii.lg, padding: 16, overflow: 'hidden' } as const;
const GLASS = 'rgba(255,255,255,0.16)';
const NUM = { fontFamily: font.displayBold, fontSize: 28, lineHeight: 39, letterSpacing: -0.8 } as const;
const UNIT_TXT = { fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20 } as const;

// One tile for every tracker: same size, same padding, same label and number style.
export function TrackerTile({ bg, label, labelColor, onPress, a11y, right, children, shadow }: {
  bg: string; label: string; labelColor?: string; onPress?: () => void; a11y: string; right?: React.ReactNode; children: React.ReactNode; shadow?: boolean;
}) {
  const { c } = useTheme();
  const body = (
    <>
      <Row style={{ justifyContent: 'space-between', minHeight: 32 }}>
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.md, lineHeight: 20, color: labelColor ?? c.muted }}>{label}</Txt>
        {right}
      </Row>
      {children}
    </>
  );
  const style = [SQ, { backgroundColor: bg, gap: 2 }, shadow && { shadowColor: fixed.shadow, shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }];
  return onPress
    ? <Pressy accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} scaleTo={0.97} style={style}>{body}</Pressy>
    : <View accessible accessibilityLabel={a11y} style={style}>{body}</View>;
}

// ---------- water ----------
function Ripple({ size, color, width }: { size: number; color: string; width: number }) {
  const s = useSharedValue(0.2);
  const o = useSharedValue(0.9);
  useEffect(() => { s.value = withTiming(2.6, { duration: 1200, easing: Easing.out(Easing.quad) }); o.value = withTiming(0, { duration: 1200 }); }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: width, borderColor: color }, a]} />;
}
export { Ripple as BottleRipple };

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
        <SvgGradient id={`${id}Shine`} x1="10" y1="58.5" x2="5" y2="58.5" gradientUnits="userSpaceOnUse"><Stop offset="0" stopColor="#999999" /><Stop offset="1" stopColor={fixed.white} /></SvgGradient>
      </Defs>
      <Rect x={7} y={8} width={18} height={2} rx={1} fill="#9294A8" />
      <Path d={BOTTLE_CAP} fill={onLight ? '#1B2440' : fixed.white} />
      <G clipPath={`url(#${id}Cap)`}>
        {Array.from({ length: 12 }, (_, i) => <Rect key={i} x={9 + i * 1.3} y={0} width={0.3} height={8} fill="#EAE6E6" />)}
      </G>
      <Path d={BOTTLE_BODY} fill={onLight ? fixed.blue : '#D9D9D9'} fillOpacity={onLight ? 0.08 : 0.1} />
      <G clipPath={`url(#${id}Body)`}><ARect animatedProps={water} x={0} width={32} fill={`url(#${id}Water)`} /></G>
      <Path d={BOTTLE_BODY} fill="none" stroke={onLight ? '#1B2440' : fixed.white} strokeOpacity={onLight ? 0.45 : 0.6} strokeWidth={1} strokeLinejoin="round" />
      <Path d="M10 29.4878C10 28.6661 8.88071 28 7.5 28C6.11929 28 5 28.6661 5 29.4878V87.5122C5 88.3339 6.11929 89 7.5 89C8.88071 89 10 88.3339 10 87.5122V29.4878Z" fill={`url(#${id}Shine)`} fillOpacity={0.3} />
    </Svg>
  );
}

export type WaterTileProps = {
  /** Litres drunk today. The bottle fills to 3 L. */
  litres: number;
  /** Counts up each time the 3 L target is reached: a ripple plays on the bottle. */
  hit?: number;
  onPress: () => void;
  /** The glass-and-plus pill at the top right: adds 250 ml. */
  onAdd: () => void;
};

export function WaterTile({ litres, hit = 0, onPress, onAdd }: WaterTileProps) {
  const ml = Math.round(litres * 1000);
  return (
    <View style={{ width: 160 }}>
    <View style={{ width: 160, height: 160 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`Water ${ml} of 3,000 millilitres. Open details`} onPress={onPress} scaleTo={0.97} style={SQ}>
        <LinearGradient colors={['#070B2B', '#1C2BC0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.md, lineHeight: 20, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Water</Txt>
        <View style={{ position: 'absolute', left: 16, bottom: 16, width: 32, height: 95 }}>
          <BottleFigma litres={litres} id="bottleCard" />
          {hit > 0 && <Ripple key={hit} size={40} color="#7FB4FF" width={2} />}
        </View>
        <View style={{ position: 'absolute', right: 16, bottom: 16, alignItems: 'flex-end' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 28, lineHeight: 39, letterSpacing: -0.8, color: 'rgba(255,255,255,0.9)' }}>{ml.toLocaleString('en-IN')}</Txt>
          <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xl, lineHeight: 26, color: fixed.white }}>ml</Txt>
        </View>
      </Pressy>
      {/* Sits above the card press target so tapping it only adds a glass: a 32 px pill (glass + plus) with a 44 px touch area. */}
      <Pressy accessibilityRole="button" accessibilityLabel="Add a glass, 250 millilitres" onPress={onAdd} scaleTo={0.92} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{ position: 'absolute', top: 16, right: 16, height: 32, paddingHorizontal: 8, borderRadius: radii.card, backgroundColor: GLASS, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 3 }}>
        <GlassWater size={20} color={fixed.white} />
        <Plus size={16} color={fixed.white} />
      </Pressy>
    </View>
    </View>
  );
}

// ---------- weight ----------
const AArea = Animated.createAnimatedComponent(Path);
export type WeightTileProps = {
  /** Today's weight in kg. */
  kg: number;
  /** Change over the week in kg: zero or less is green and "down", more is amber and "up". */
  delta: number;
  /** The last readings, oldest first, ending with today's: drawn as a small line under the number. */
  series: number[];
  onPress: () => void;
};

export function WeightTile({ kg, delta, series, onPress }: WeightTileProps) {
  const { c, isDark } = useTheme();
  const lo = Math.min(...series) - 0.15, hi = Math.max(...series) + 0.15;
  const W = 160, H = 45; // as wide as the tile (edge to edge), so nothing is stretched and the end dot has room
  const pts = series.map((v, i) => [(i / (series.length - 1)) * (W - 14), 8 + ((hi - v) / (hi - lo)) * (H - 18)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`;
  const last = pts[pts.length - 1];
  const sign = delta <= 0 ? '-' : '+';
  return (
    <View style={{ width: 160 }}>
    <TrackerTile bg={isDark ? 'rgba(255,255,255,0.05)' : c.surface} shadow={!isDark} label="Weight" a11y={`Weight ${fmt1(kg)} kg, ${delta <= 0 ? 'down' : 'up'} ${Math.abs(delta)} kg this week. Log weight`} onPress={onPress}
      right={<View style={{ height: 32, minWidth: 32, paddingHorizontal: 8, borderRadius: radii.card, backgroundColor: isDark ? GLASS : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Plus size={16} color={isDark ? fixed.white : c.accentText} /></View>}>
      <Txt style={{ ...NUM, color: c.ink }}>{fmt1(kg)}<Txt style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: c.muted }}> kg</Txt></Txt>
      <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.xs, lineHeight: 17, color: delta <= 0 ? c.good : c.warn }}>{sign} {Math.abs(delta)} kg this week</Txt>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs><SvgGradient id="wArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={c.accent} stopOpacity={0.28} /><Stop offset="1" stopColor={c.accent} stopOpacity={0} /></SvgGradient></Defs>
          <AArea d={area} fill="url(#wArea)" />
          <Path d={line} fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <Circle cx={last[0]} cy={last[1]} r={5} fill={fixed.white} stroke={c.accent} strokeWidth={2} />
        </Svg>
      </View>
    </TrackerTile>
    </View>
  );
}

// ---------- Health: heart rate, sleep, active energy ----------
export type HealthKind = 'hr' | 'sleep' | 'kcal';
export type HealthTileProps = { kind: HealthKind; onPress: () => void };

/** The three watch tiles. The numbers are sample readings until a real wearable feed is wired in. */
export function HealthTile({ kind, onPress }: HealthTileProps) {
  const { c } = useTheme();
  if (kind === 'hr') {
    return (
      <TrackerTile bg={c.tHeart} label="Heart rate" labelColor={c.cHeart} a11y="Heart rate 72 bpm, open details" onPress={onPress} right={<Beat><HeartIcon color={c.cHeart} /></Beat>}>
        <Txt style={{ ...NUM, color: c.ink }}>72<Txt muted style={UNIT_TXT}> bpm</Txt></Txt>
        <Txt v="caption">Resting 64</Txt>
        <View style={{ marginTop: 'auto' }}>
          <Svg width={136} height={34} viewBox="0 0 108 30" preserveAspectRatio="none"><Polyline points="0,18 12,16 20,20 28,8 34,24 42,15 56,17 66,12 76,19 86,14 98,16 108,13" fill="none" stroke={c.cHeart} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></Svg>
        </View>
      </TrackerTile>
    );
  }
  if (kind === 'sleep') {
    return (
      <TrackerTile bg={c.tSleep} label="Sleep" labelColor={c.cSleep} a11y="Sleep 7 hours 10 minutes, open details" onPress={onPress}>
        <Txt style={{ ...NUM, color: c.ink }}>7h 10<Txt muted style={UNIT_TXT}>m</Txt></Txt>
        <Txt v="caption">11:40 pm – 6:50 am</Txt>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 'auto' }}>
          <View style={{ width: '22%', backgroundColor: c.cSleep, opacity: 0.7 }} /><View style={{ width: '48%', backgroundColor: c.cSleep }} /><View style={{ width: '18%', backgroundColor: c.cSleep, opacity: 0.45 }} /><View style={{ width: '12%', backgroundColor: c.surface3 }} />
        </View>
      </TrackerTile>
    );
  }
  return (
    <TrackerTile bg={c.tAct} label="Active energy" labelColor={c.cAct} a11y="Active energy 320 of 450 kilocalories, open details" onPress={onPress}>
      <Txt style={{ ...NUM, color: c.ink }}>320<Txt muted style={UNIT_TXT}> kcal</Txt></Txt>
      <Txt v="caption">Goal 450 kcal</Txt>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(196,97,14,0.15)', overflow: 'hidden', marginTop: 'auto' }}>
        <View style={{ width: `${Math.round((320 / 450) * 100)}%`, height: '100%', borderRadius: 5, backgroundColor: c.cAct }} />
      </View>
    </TrackerTile>
  );
}

// ---------- Connect Health ----------
export type ConnectTileProps = { /** "Apple Health" or "Health Connect". */ name: string; onPress: () => void };

export function ConnectTile({ name, onPress }: ConnectTileProps) {
  const { c, isDark } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Connect ${name} for steps, heart rate, sleep and energy`} onPress={onPress}
      style={[SQ, { padding: 12, justifyContent: 'space-between', borderWidth: 1, borderStyle: 'dashed', borderColor: isDark ? 'rgba(255,255,255,0.1)' : c.surface3, backgroundColor: isDark ? fixed.dark : c.surface }]}>
      <View style={{ width: 32, height: 32, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : c.surface2, alignItems: 'center', justifyContent: 'center' }}><HeartIcon size={20} color="#FF6B7A" /></View>
      <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl, lineHeight: 28, color: c.ink }}>{`Connect ${name}`}</Txt>
      <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: c.muted }}>Steps, heart rate, sleep and energy</Txt>
    </Pressy>
  );
}
