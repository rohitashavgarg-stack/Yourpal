import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { WaiverBackdrop } from '@/features/profile/WaiverBackdrop';
import { ProgressiveBlur } from '@/components/Glass';
import { EffortSlider } from '@/design-system/primitives/EffortSlider';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useReduce } from '@/lib/motionSafe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Flame, Share, Trophy } from '@/lib/icons';
import { FLAME } from '@/features/streak/StreakChip';
import { useStreak } from '@/features/streak/useStreak';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { IconButton } from '@/design-system/primitives/Button';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { useDomain } from '@/lib/domain';
import { fmt1 } from '@/lib/useNow';
import { radii, fontSizes, fixed, onDark } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const COLORS = ['#3A36C9', '#B9B6FF', fixed.white, '#F2B544', '#1F6E63'];
const PARTS = Array.from({ length: 34 }, (_, i) => {
  const a = (i / 34) * Math.PI * 2 + (i % 3) * 0.21, dist = 90 + ((i * 37) % 80);
  return { dx: Math.cos(a) * dist * 1.3, dy: Math.sin(a) * dist * 0.9 + 30, w: 5 + (i % 3) * 2, col: COLORS[i % COLORS.length], delay: 380 + (i % 5) * 25 };
});

function Particle({ p, run }: { p: (typeof PARTS)[number]; run: number }) {
  const t = useSharedValue(0);
  const reduce = useReduce(); // Reduce Motion: no confetti
  useEffect(() => { t.value = 0; if (reduce) return; t.value = withDelay(p.delay, withTiming(1, { duration: 1300, easing: Easing.bezier(0.12, 0.75, 0.3, 1) })); }, [run]);
  const a = useAnimatedStyle(() => ({ opacity: t.value === 0 ? 0 : t.value < 0.75 ? 1 : 1 - (t.value - 0.75) * 4, transform: [{ translateX: p.dx * t.value }, { translateY: p.dy * t.value }, { scale: 0.5 + 0.5 * t.value }] }));
  return <Animated.View style={[{ position: 'absolute', left: '50%', top: '50%', width: p.w, height: p.w, marginLeft: -p.w / 2, marginTop: -p.w / 2, borderRadius: p.w, backgroundColor: p.col }, a]} />;
}

function PopCheck({ delay }: { delay: number }) {
  const { c } = useTheme();
  const s = useSharedValue(0);
  useEffect(() => { s.value = withDelay(delay, withTiming(1, { duration: 180 })); }, []);
  const a = useAnimatedStyle(() => ({ opacity: s.value }));
  return <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }, a]}><Check size={13} strokeWidth={3} color={fixed.white} /></Animated.View>;
}

// Streak status for the finish moment: kept, or how many sessions are left this week.
function StreakLine({ done }: { done: number }) {
  const { c } = useTheme();
  const st = useStreak();
  const left = Math.max(0, st.target - done);
  const kept = left === 0;
  return (
    <FadeIn delay={900} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: 'rgba(255,138,61,0.14)' }}>
      <Flame size={18} color={FLAME} fill={kept ? FLAME : 'transparent'} strokeWidth={2} />
      <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>{kept ? `Week complete · streak now ${st.weeks + (st.kept ? 0 : 1)} weeks` : `${left} more ${left === 1 ? 'session' : 'sessions'} to keep your streak`}</Txt>
    </FadeIn>
  );
}

// How hard it was, from the slider: the same five words the logged workout shows.
export type Feel = 'Easy' | 'Moderate' | 'Hard' | 'Very hard' | 'Max';
const effortWord = (v: number): Feel => (v < 0.2 ? 'Easy' : v < 0.45 ? 'Moderate' : v < 0.7 ? 'Hard' : v < 0.9 ? 'Very hard' : 'Max');

// A number that counts up to its value when the screen opens (it just shows the value with Reduce Motion on).
function CountUp({ to, delay = 250, ms = 900 }: { to: number; delay?: number; ms?: number }) {
  const reduce = useReduce();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return undefined;
    let raf: ReturnType<typeof setInterval> | undefined;
    const t0 = Date.now() + delay;
    const start = setTimeout(() => {
      raf = setInterval(() => {
        const k = Math.min(1, (Date.now() - t0) / ms);
        setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); // slows down as it arrives
        if (k >= 1 && raf) clearInterval(raf);
      }, 30);
    }, delay);
    return () => { clearTimeout(start); if (raf) clearInterval(raf); };
  }, [to, delay, ms, reduce]);
  return <>{n}</>;
}
export type FinishStats = { mins: number; sets: number; exercises: number; totalEx: number; kcal: number; pr: { name: string; kg: number } | null; hc: boolean; weekDone: number };

export function FinishScreen({ s, onDone }: { s: FinishStats; onDone: (feel: Feel, note: string) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useOverlay();
  const [effort, setEffort] = useState(0.55); // 0 is easy, 1 is max
  const feel = effortWord(effort);
  const { d } = useDomain();
  const [note, setNote] = useState('');
  const [run, setRun] = useState(1);
  useEffect(() => { haptic.success(); }, []);
  return (
    // The same page as the signed waiver: black with a blue glow at the top. Nothing sits in a card; the numbers are on the page.
    <View style={{ flex: 1, backgroundColor: fixed.dark }}>
      <WaiverBackdrop />
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 40, paddingHorizontal: 22, paddingBottom: insets.bottom + 130, gap: 28 }}>
        <FadeIn style={{ gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: onDark.soft }}>Workout done, Leg day</Txt>
          <Txt accessibilityRole="header" style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl6, lineHeight: 50, letterSpacing: -1.2, color: onDark.text }}>Nice work, Rohitashav</Txt>
        </FadeIn>

        <FadeIn delay={120}>
          <Row style={{ alignItems: 'flex-start' }}>
            {[[String(s.mins), ' min', 'Time'], [String(s.sets), '', s.sets === 1 ? 'Set done' : 'Sets done'], [s.exercises > s.totalEx ? String(s.exercises) : `${s.exercises}/${s.totalEx}`, '', 'Exercises']].map(([v, u, l], i) => (
              <View key={l} style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl6, lineHeight: 50, letterSpacing: -1.2, color: onDark.text }}>{/^\d+$/.test(v) ? <CountUp to={Number(v)} delay={300 + i * 120} /> : v}<Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.lg, color: onDark.muted }}>{u}</Txt></Txt>
                <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: onDark.muted }}>{l}</Txt>
              </View>
            ))}
          </Row>
        </FadeIn>

        <View>
          <FadeIn delay={350} style={{ gap: 14, backgroundColor: onDark.card, borderRadius: radii.xl, padding: 16 }}>
            <CardEdge radius={radii.xl} />
            <Row style={{ gap: 14 }}>
            <IconButton label="Celebrate again" onPress={() => { haptic.success(); setRun((r) => r + 1); }} size={56} radius={radii.xl} bg={c.accent}>
              <Trophy size={26} strokeWidth={1.9} color={fixed.white} />
            </IconButton>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.bold, fontSize: fontSizes.xs, letterSpacing: 0.6, color: onDark.soft }}>{s.pr ? 'NEW PERSONAL BEST' : 'LOGGED'}</Txt>
              <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, color: onDark.text }}>{s.pr ? `${s.pr.name} ${fmt1(s.pr.kg)} kg` : `${s.sets} ${s.sets === 1 ? 'set' : 'sets'} done`}</Txt>
            </View>
            </Row>
            <Button kind="white" label="Share" icon={<Share size={16} color={fixed.dark} />} onPress={() => toast('Sharing opens the system share sheet')} />
          </FadeIn>
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {PARTS.map((p, i) => <Particle key={i} p={p} run={run} />)}
          </View>
        </View>

        {s.hc && (
          <Row style={{ gap: 18 }}>
            <Txt style={{ fontSize: fontSizes.base, lineHeight: 21, color: onDark.text }}>Avg 124, max 158 bpm</Txt>
            <Txt style={{ fontSize: fontSizes.base, lineHeight: 21, color: onDark.muted }}>{`${s.kcal} kcal from your watch`}</Txt>
          </Row>
        )}

        <FadeIn delay={900} style={{ gap: 14, backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18 }}>
          <CardEdge radius={radii.xl} />
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, color: onDark.text }}>How was it?</Txt>
              <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: onDark.muted }}>Drag to show how it felt</Txt>
            </View>
            <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.4, color: onDark.text }}>{feel}</Txt>
          </Row>
          <EffortSlider value={effort} onChange={setEffort} label="How hard was the workout" />
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 0.6, color: onDark.muted }}>EASY</Txt>
            <Txt style={{ fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 0.6, color: onDark.muted }}>MAX</Txt>
          </Row>
        </FadeIn>

        {d.hasGym && (
          <FadeIn delay={1100} style={{ gap: 10 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, color: onDark.text }}>Note for Coach Vikram</Txt>
            <TextInput value={note} onChangeText={setNote} multiline placeholder="How did it go? Anything he should know for next time" placeholderTextColor={onDark.muted} accessibilityLabel="Note for Coach Vikram"
              style={{ minHeight: 120, borderRadius: radii.lg, borderWidth: 1, borderColor: onDark.text + '33', backgroundColor: onDark.text + '14', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, fontFamily: font.regular, fontSize: fontSizes.basePlus, lineHeight: 24, color: onDark.text, textAlignVertical: 'top', outlineStyle: 'none' } as never} />
          </FadeIn>
        )}
      </ScrollView>
      <ProgressiveBlur edge="bottom" height={insets.bottom + 120} />
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 6 }}>
        <Button kind="white" label={note.trim() ? 'Send to Coach and finish' : 'Done'} onPress={() => onDone(feel, note)} />
      </View>
    </View>
  );
}
