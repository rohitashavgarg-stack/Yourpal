import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Dumbbell, Droplet, Flame, Heart, Moon, Ruler, Scale } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, fixed, radii } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { compare, NumKey } from '@/features/selfassess/data';

type CmpRow = ReturnType<typeof compare>[number];

const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);

const RING = 176;
const STROKE = 13;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

// Fades in while sliding up. Things on this page arrive one after another.
function Rise({ delay, from = 22, children }: { delay: number; from?: number; children: React.ReactNode }) {
  const still = useReducedMotion();
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * from }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

// A tile pops up from slightly smaller, with a small spring.
function Pop({ delay, children }: { delay: number; children: React.ReactNode }) {
  const still = useReducedMotion();
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 130 })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.6), transform: [{ scale: 0.86 + p.value * 0.14 }, { translateY: (1 - p.value) * 14 }] }));
  return <Animated.View style={[{ flex: 1 }, st]}>{children}</Animated.View>;
}

// A number that counts up from 0 to its value.
function CountUp({ to, delay = 0, style }: { to: number; delay?: number; style: object }) {
  const still = useReducedMotion();
  const [n, setN] = useState(still || to === 0 ? to : 0);
  useEffect(() => {
    if (still || to === 0) return;
    let i = 0;
    let t: ReturnType<typeof setInterval> | undefined;
    const t0 = setTimeout(() => {
      t = setInterval(() => { i += 1; setN(Math.min(to, i)); if (i >= to && t) clearInterval(t); }, Math.max(80, 900 / to));
    }, delay);
    return () => { clearTimeout(t0); if (t) clearInterval(t); };
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Txt style={style}>{String(n)}</Txt>;
}

// The big ring: it fills to the share of measurements that improved, with the number counting up inside. With nothing to compare yet (the first
// assessment) it fills all the way and shows a tick, because the point is that the baseline is saved.
function ProgressRing({ better, judged }: { better: number; judged: number }) {
  const { c } = useTheme();
  const still = useReducedMotion();
  const baseline = judged === 0;
  const share = baseline ? 1 : better / judged;
  const fill = useSharedValue(still ? share : 0);
  const pop = useSharedValue(still ? 1 : 0.7);
  const draw = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    pop.value = withSequence(withTiming(0.7, { duration: 1 }), withSpring(1, { damping: 9, stiffness: 120 }));
    fill.value = withDelay(350, withTiming(share, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    draw.value = withDelay(900, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const arc = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - fill.value) }));
  const box = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.4), transform: [{ scale: pop.value }] }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: 40 * (1 - draw.value) }));
  const tone = baseline ? c.accent : c.good;
  return (
    <Animated.View accessible accessibilityLabel={baseline ? 'Assessment completed. Your starting point is saved' : `${better} of ${judged} measurements improved`} style={[{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }, box]}>
      <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} style={{ position: 'absolute' }}>
        <Circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke={c.surface3} strokeWidth={STROKE} />
        <ACircle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke={tone} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={`${CIRC}`} animatedProps={arc} transform={`rotate(-90 ${RING / 2} ${RING / 2})`} />
      </Svg>
      {baseline ? (
        <Svg width={64} height={64} viewBox="0 0 24 24"><APath d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={tone} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" animatedProps={tick} /></Svg>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Row style={{ alignItems: 'baseline', gap: 4 }}>
            <CountUp to={better} delay={500} style={{ fontFamily: font.displayBold, fontSize: 56, lineHeight: 62, letterSpacing: -1.5, color: c.ink }} />
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl, lineHeight: 26, color: c.muted }}>{`/${judged}`}</Txt>
          </Row>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 17, color: c.muted }}>improved</Txt>
        </View>
      )}
    </Animated.View>
  );
}

// One piece of confetti: it falls from above the screen, drifting sideways and turning, and is gone by the time it lands. It plays once.
function Piece({ i, width, height, color }: { i: number; width: number; height: number; color: string }) {
  const p = useSharedValue(0);
  const x0 = ((i * 53) % 100) / 100 * width;
  const drift = (((i * 37) % 21) - 10) * 7;
  const turn = 240 + ((i * 29) % 480);
  const wide = 6 + (i % 3) * 2;
  const long = 10 + (i % 4) * 3;
  useEffect(() => {
    p.value = withDelay(150 + (i % 9) * 110, withTiming(1, { duration: 2600 + (i % 5) * 380, easing: Easing.in(Easing.quad) }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({
    opacity: p.value === 0 ? 0 : p.value > 0.85 ? (1 - p.value) / 0.15 : 1,
    transform: [{ translateX: x0 + Math.sin(p.value * 9 + i) * 14 + drift * p.value }, { translateY: -30 + p.value * (height + 60) }, { rotate: `${p.value * turn}deg` }],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: wide, height: long, borderRadius: 2, backgroundColor: color }, st]} />;
}

function Confetti() {
  const { c } = useTheme();
  const still = useReducedMotion();
  const { width, height } = useWindowDimensions();
  if (still) return null;
  const colors = [c.accent, c.good, c.warn, c.water, c.cHeart, c.cAct];
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>{Array.from({ length: 34 }, (_, i) => <Piece key={i} i={i} width={width} height={height} color={colors[i % colors.length]} />)}</View>;
}

// What an assessment is judged on first; sizes (chest, hip and so on) have no better or worse, so they come last.
const PICK_ORDER: NumKey[] = ['weight', 'waist', 'fat', 'bench', 'legpress', 'sleep', 'pulse', 'breath', 'sys', 'sugar', 'chest', 'arms', 'legs', 'hip', 'calves', 'height'];
const ICON: Record<NumKey, typeof Scale> = { weight: Scale, height: Ruler, chest: Ruler, waist: Ruler, hip: Ruler, arms: Ruler, legs: Ruler, calves: Ruler, fat: Flame, sleep: Moon, bench: Dumbbell, legpress: Dumbbell, breath: Activity, sys: Heart, dia: Heart, pulse: Heart, sugar: Droplet };
const GROUP: Record<NumKey, 'nutri' | 'act' | 'heart'> = { weight: 'nutri', height: 'nutri', chest: 'nutri', waist: 'nutri', hip: 'nutri', arms: 'nutri', legs: 'nutri', calves: 'nutri', fat: 'nutri', bench: 'act', legpress: 'act', breath: 'act', sleep: 'heart', sys: 'heart', dia: 'heart', pulse: 'heart', sugar: 'heart' };

// A measurement: its icon and name, the number, and how it changed since the last assessment.
function Stat({ r }: { r: CmpRow }) {
  const { c } = useTheme();
  const Ic = ICON[r.k];
  const g = GROUP[r.k];
  const fg = { nutri: c.cNutri, act: c.cAct, heart: c.cHeart }[g];
  const bg = { nutri: c.tNutri, act: c.tAct, heart: c.tHeart }[g];
  const change = r.prev == null ? { l: 'First entry', good: false } : r.diff === 0 ? { l: 'Same', good: false } : { l: `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)} ${r.n.unit}`, good: r.good };
  return (
    <View accessible accessibilityLabel={`${r.n.label} ${r.now} ${r.n.unit}, ${change.l}`}
      style={{ flex: 1, minHeight: 132, backgroundColor: c.surface, borderRadius: radii.xl, padding: 14, justifyContent: 'space-between' }}>
      <Row style={{ gap: 8 }}>
        <IconBadge size={32} radius={radii.sm} bg={bg}><Ic size={16} strokeWidth={2} color={fg} /></IconBadge>
        <Txt numberOfLines={1} style={{ flex: 1, fontSize: fontSizes.sm, color: c.muted }}>{r.n.label}</Txt>
      </Row>
      <View style={{ gap: 6 }}>
        <Row style={{ alignItems: 'baseline', gap: 4 }}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 32 }}>{String(r.now)}</Txt>
          <Txt style={{ fontSize: fontSizes.sm, color: c.muted }}>{r.n.unit}</Txt>
        </Row>
        <View style={{ alignSelf: 'flex-start' }}><Tag label={change.l} bg={change.good ? c.goodSoft : c.surface2} fg={change.good ? c.good : c.muted} /></View>
      </View>
    </View>
  );
}

// The screen after an assessment is saved: it shows what the assessment found, not only that it was saved. A big ring fills to the share of measurements that
// improved, confetti falls once, and the main numbers pop in one after another with their change. View full results opens the whole page.
export function AssessmentDone({ n, date, rows, onResults, onDone }: { n: number; date: string; rows: CmpRow[]; onResults: () => void; onDone: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => { haptic.success(); }, []);
  const judged = rows.filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const picked = [...rows].sort((a, b) => PICK_ORDER.indexOf(a.k) - PICK_ORDER.indexOf(b.k)).slice(0, 4);
  const pairs = [picked.slice(0, 2), picked.slice(2, 4)].filter((p) => p.length > 0);
  const sub = judged.length === 0 ? 'Your starting point is saved. The next assessment is compared with it.' : `${better} of ${judged.length} measurements improved since the last one`;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <LinearGradient pointerEvents="none" colors={[c.accent + '33', c.good + '1A', c.bg + '00']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }} />
      <Confetti />
      <View style={{ flex: 1, paddingTop: insets.top + 28, paddingHorizontal: 18, gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 18 }}>
          <ProgressRing better={better} judged={judged.length} />
          <Rise delay={700}>
            <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
              <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 33, textAlign: 'center' }}>Assessment completed</Txt>
              <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, textAlign: 'center', color: c.muted }}>{sub}</Txt>
              <Row style={{ gap: 6, marginTop: 2 }}><Chip label={`Assessment ${n}`} /><Chip label={date} /></Row>
            </View>
          </Rise>
        </View>

        <View style={{ gap: 10 }}>
          {pairs.map((p, ri) => (
            <Row key={ri} style={{ gap: 10, alignItems: 'stretch' }}>
              {p.map((r, ci) => <Pop key={r.k} delay={950 + (ri * 2 + ci) * 130}><Stat r={r} /></Pop>)}
              {p.length === 1 && <View style={{ flex: 1 }} />}
            </Row>
          ))}
        </View>
      </View>
      <Rise delay={1500} from={30}>
        <View style={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 16) + 6, gap: 4 }}>
          <Button kind="accent" label="View full results" onPress={onResults} />
          <Pressy accessibilityRole="button" onPress={onDone} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, color: c.muted }}>Done</Txt>
          </Pressy>
        </View>
      </Rise>
    </View>
  );
}
