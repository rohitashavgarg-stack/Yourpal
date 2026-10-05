import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Check, Flame, Share, Trophy, X } from '@/lib/icons';
import { FLAME } from '@/features/streak/StreakChip';
import { useStreak } from '@/features/streak/useStreak';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1 } from '@/lib/useNow';

const COLORS = ['#3A36C9', '#B9B6FF', '#FFFFFF', '#F2B544', '#1F6E63'];
const PARTS = Array.from({ length: 34 }, (_, i) => {
  const a = (i / 34) * Math.PI * 2 + (i % 3) * 0.21, dist = 90 + ((i * 37) % 80);
  return { dx: Math.cos(a) * dist * 1.3, dy: Math.sin(a) * dist * 0.9 + 30, w: 5 + (i % 3) * 2, col: COLORS[i % COLORS.length], delay: 380 + (i % 5) * 25 };
});

function Particle({ p, run }: { p: (typeof PARTS)[number]; run: number }) {
  const t = useSharedValue(0);
  useEffect(() => { t.value = 0; t.value = withDelay(p.delay, withTiming(1, { duration: 1300, easing: Easing.bezier(0.12, 0.75, 0.3, 1) })); }, [run]);
  const a = useAnimatedStyle(() => ({ opacity: t.value === 0 ? 0 : t.value < 0.75 ? 1 : 1 - (t.value - 0.75) * 4, transform: [{ translateX: p.dx * t.value }, { translateY: p.dy * t.value }, { scale: 0.5 + 0.5 * t.value }] }));
  return <Animated.View style={[{ position: 'absolute', left: '50%', top: '50%', width: p.w, height: p.w, marginLeft: -p.w / 2, marginTop: -p.w / 2, borderRadius: p.w, backgroundColor: p.col }, a]} />;
}

function PopCheck({ delay }: { delay: number }) {
  const { c } = useTheme();
  const s = useSharedValue(0);
  useEffect(() => { s.value = withDelay(delay, withTiming(1, { duration: 180 })); }, []);
  const a = useAnimatedStyle(() => ({ opacity: s.value }));
  return <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }, a]}><Check size={13} strokeWidth={3} color="#fff" /></Animated.View>;
}

// Streak status for the finish moment: kept, or how many sessions are left this week.
function StreakLine({ done }: { done: number }) {
  const { c } = useTheme();
  const st = useStreak();
  const left = Math.max(0, st.target - done);
  const kept = left === 0;
  return (
    <Animated.View entering={fade(900)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(255,138,61,0.14)' }}>
      <Flame size={18} color={FLAME} fill={kept ? FLAME : 'transparent'} strokeWidth={2} />
      <Txt style={{ flex: 1, fontSize: 14, lineHeight: 20, color: c.ink }}>{kept ? `Week complete · streak now ${st.weeks + (st.kept ? 0 : 1)} weeks` : `${left} more ${left === 1 ? 'session' : 'sessions'} to keep your streak`}</Txt>
    </Animated.View>
  );
}

export type FinishStats = { mins: number; tonnes: number; sets: number; pr: { name: string; kg: number } | null; hc: boolean; weekDone: number };

export function FinishScreen({ s, onDone }: { s: FinishStats; onDone: (feel: number, note: string) => void }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useOverlay();
  const [feel, setFeel] = useState(4);
  const [note, setNote] = useState('');
  const [run, setRun] = useState(1);
  useEffect(() => { haptic.success(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: c.sky }}>
      <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <Circle cx={96} cy={170} r={150} fill={c.moon} />
        <Circle cx={114} cy={156} r={150} fill="none" stroke={c.moonRing} strokeWidth={1.5} opacity={0.5} />
      </Svg>
      <RoundBtn label="Close" onPress={() => onDone(feel, note)} bg={c.glass} style={{ position: 'absolute', top: insets.top + 8, right: 16 }}><X size={20} color={c.ink} /></RoundBtn>

      <Animated.View entering={fade()} style={{ position: 'absolute', left: 12, right: 12, bottom: Math.max(insets.bottom, 14), borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: c.glassLine,
        shadowColor: '#0F0E3C', shadowOpacity: 0.28, shadowRadius: 60, shadowOffset: { width: 0, height: 24 } }}>
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.glass }} />
        <View style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 18, gap: 14 }}>
          <View style={{ gap: 4 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 13, color: c.muted }}>Workout done · Leg day</Txt>
            <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 38, lineHeight: 36 }}>Nice work, Jyotsana</Txt>
          </View>
          <Row style={{ backgroundColor: c.tile, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 4 }}>
            {[[String(s.mins), ' min', 'Time'], [fmt1(s.tonnes), ' t', 'Volume'], [String(s.pr ? 1 : 0), '', 'PRs']].map(([v, u, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line }}>
                <Txt style={{ fontFamily: font.display, fontSize: 32, lineHeight: 36 }}>{v}<Txt muted style={{ fontFamily: font.display, fontSize: 17 }}>{u}</Txt></Txt>
                <Txt v="caption">{l}</Txt>
              </View>
            ))}
          </Row>
          <View>
            <Animated.View entering={fade(350)} style={{ backgroundColor: c.surface, borderRadius: 22, padding: 14, gap: 10 }}>
              <Row style={{ gap: 12 }}>
                <Pressy accessibilityRole="button" accessibilityLabel="Celebrate again" onPress={() => { haptic.success(); setRun((r) => r + 1); }}
                  style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={24} strokeWidth={1.9} color="#fff" />
                </Pressy>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: font.bold, fontSize: 12, letterSpacing: 0.5, color: c.accent }}>{s.pr ? 'New PR' : 'Logged'}</Txt>
                  <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 28 }}>{s.pr ? `${s.pr.name} ${fmt1(s.pr.kg)} kg` : `${s.sets} ${s.sets === 1 ? "set" : "sets"} done`}</Txt>
                </View>
              </Row>
              <Button kind="outline" small label="Share (optional)" icon={<Share size={16} color={c.ink} />} onPress={() => toast('Sharing opens the system share sheet')} />
            </Animated.View>
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {PARTS.map((p, i) => <Particle key={i} p={p} run={run} />)}
            </View>
          </View>
          {s.hc && (
            <Row style={{ gap: 8 }}>
              <Tag label="♥ Avg 124 · max 158 bpm" bg="rgba(255,107,122,0.16)" fg="#FF8A96" style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
              <Tag label="410 kcal · from watch" bg={c.tile} fg={c.ink} style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
            </Row>
          )}
          <Row style={{ gap: 12, paddingHorizontal: 4 }}>
            <Txt style={{ flex: 1, fontFamily: font.semibold }}>This week · {s.weekDone} of 4 workouts</Txt>
            <Row style={{ gap: 6 }}>{Array.from({ length: s.weekDone }, (_, i) => <PopCheck key={i} delay={700 + i * 120} />)}</Row>
          </Row>
          <StreakLine done={s.weekDone} />
          <View style={{ gap: 8 }}>
            <Txt style={{ fontFamily: font.semibold, paddingHorizontal: 4 }}>How did it feel?</Txt>
            <View accessibilityRole="radiogroup" accessibilityLabel="How did it feel, 1 to 5" style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressy key={n} accessibilityRole="radio" accessibilityState={{ selected: feel === n }} onPress={() => setFeel(n)}
                  style={{ flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: feel === n ? c.ink : c.line, backgroundColor: feel === n ? c.ink : c.tile, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt style={{ fontFamily: font.bold, fontSize: 18, color: feel === n ? c.bg : c.ink }}>{n}</Txt>
                </Pressy>
              ))}
            </View>
          </View>
          <Field value={note} onChangeText={setNote} placeholder="Note for Coach Vikram (optional)" accessibilityLabel="Note for Coach Vikram" returnKeyType="done" />
          <Button label={note.trim() ? 'Send to Coach and finish' : 'Done'} onPress={() => onDone(feel, note)} />
        </View>
      </Animated.View>
    </View>
  );
}
