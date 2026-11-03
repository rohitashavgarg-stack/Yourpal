import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, fixed, radii } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { compare } from '@/features/selfassess/data';

type Row_ = ReturnType<typeof compare>[number];

const APath = Animated.createAnimatedComponent(Path);

// Fades in while sliding up. Things on this page arrive one after another.
function Rise({ delay, from = 22, children, style }: { delay: number; from?: number; children: React.ReactNode; style?: object }) {
  const still = useReducedMotion();
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * from }] }));
  return <Animated.View style={[st, style]}>{children}</Animated.View>;
}

// A number that counts up from 0 to its value.
function CountUp({ to, delay = 0, style }: { to: number; delay?: number; style: object }) {
  const still = useReducedMotion();
  const [n, setN] = useState(still ? to : 0);
  useEffect(() => {
    if (still || to === 0) { setN(to); return; }
    let i = 0;
    const t0 = setTimeout(() => {
      const t = setInterval(() => { i += 1; setN(Math.min(to, i)); if (i >= to) clearInterval(t); }, Math.max(60, 700 / to));
    }, delay);
    return () => clearTimeout(t0);
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Txt style={style}>{String(n)}</Txt>;
}

// The green circle: it pops in and its tick draws itself.
function Tick() {
  const { c } = useTheme();
  const still = useReducedMotion();
  const pop = useSharedValue(still ? 1 : 0.3);
  const draw = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    pop.value = withSequence(withTiming(0.3, { duration: 1 }), withSpring(1, { damping: 7, stiffness: 150 }));
    draw.value = withDelay(260, withTiming(1, { duration: 480, easing: Easing.bezier(0.65, 0, 0.35, 1) }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const box = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }], opacity: Math.min(1, pop.value * 2) }));
  const ap = useAnimatedProps(() => ({ strokeDashoffset: 26 * (1 - draw.value) }));
  return (
    <Animated.View accessible accessibilityLabel="Assessment completed" style={[{ width: 72, height: 72, borderRadius: radii.pill, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }, box]}>
      <Svg width={34} height={34} viewBox="0 0 24 24"><APath d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={fixed.dark} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26" animatedProps={ap} /></Svg>
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
const PICK_ORDER = ['weight', 'waist', 'fat', 'bench', 'legpress', 'sleep', 'pulse', 'breath', 'sys', 'sugar', 'chest', 'arms', 'legs', 'hip', 'calves', 'height'];

// The screen after an assessment is saved: it shows what the assessment found, not just that it was saved. A tick pops, confetti falls once, the number
// of measurements that improved counts up, and the main numbers come in one after another with their change. View full results opens the whole page.
export function AssessmentDone({ n, date, rows, onResults, onDone }: { n: number; date: string; rows: Row_[]; onResults: () => void; onDone: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => { haptic.success(); }, []);
  const judged = rows.filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const baseline = judged.length === 0;
  const picked = [...rows].sort((a, b) => PICK_ORDER.indexOf(a.k) - PICK_ORDER.indexOf(b.k)).slice(0, 4);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <LinearGradient pointerEvents="none" colors={[c.good + '40', c.good + '12', c.good + '00']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 340 }} />
      <Confetti />
      <View style={{ flex: 1, paddingTop: insets.top + 36, paddingHorizontal: 20, gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Tick />
          <Rise delay={250}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 33, textAlign: 'center' }}>Assessment completed</Txt>
              <Row style={{ gap: 6 }}><Chip label={`Assessment ${n}`} /><Chip label={date} /></Row>
            </View>
          </Rise>
        </View>

        {/* the headline: how many measurements got better, or that this one is the starting point */}
        <Rise delay={550}>
          <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 12 }}>
            {baseline ? (
              <View style={{ gap: 2 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>Your starting point</Txt>
                <Txt muted style={{ fontSize: fontSizes.md }}>{`${rows.length} measurements saved. The next assessment is compared with these.`}</Txt>
              </View>
            ) : (
              <>
                <Row style={{ alignItems: 'flex-end', gap: 8 }}>
                  <CountUp to={better} delay={650} style={{ fontFamily: font.displayBold, fontSize: 56, lineHeight: 60, letterSpacing: -1.5, color: c.good }} />
                  <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, paddingBottom: 8, color: c.muted }}>{`of ${judged.length} improved since the last one`}</Txt>
                </Row>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {judged.map((r, i) => <View key={r.k + i} style={{ flex: 1, height: 6, borderRadius: radii.xs, backgroundColor: r.good ? c.good : c.surface3 }} />)}
                </View>
              </>
            )}
          </View>
        </Rise>

        {/* the main numbers, two by two, each with its change */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {picked.map((r, i) => (
            <Rise key={r.k} delay={800 + i * 140} from={18} style={{ width: '48.5%' }}>
              <View accessible accessibilityLabel={`${r.n.label} ${r.now} ${r.n.unit}`} style={{ backgroundColor: c.surface, borderRadius: radii.lg, padding: 14, gap: 4 }}>
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{r.n.label}</Txt>
                <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 28 }}>{`${r.now} `}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, color: c.muted }}>{r.n.unit}</Txt></Txt>
                {r.prev != null && (
                  <Txt style={{ fontSize: fontSizes.sm, fontFamily: font.semibold, color: r.good ? c.good : c.muted }}>{r.diff === 0 ? 'Same as before' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)} ${r.n.unit}`}</Txt>
                )}
              </View>
            </Rise>
          ))}
        </View>
      </View>
      <Rise delay={1300} from={30}>
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 6, gap: 4 }}>
          <Button kind="accent" label="View full results" onPress={onResults} />
          <Pressy accessibilityRole="button" onPress={onDone} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, color: c.muted }}>Done</Txt>
          </Pressy>
        </View>
      </Rise>
    </View>
  );
}
