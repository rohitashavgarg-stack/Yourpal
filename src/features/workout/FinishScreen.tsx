import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Check, Flame, Trophy, X } from '@/lib/icons';
import { FLAME } from '@/features/streak/StreakChip';
import { useStreak } from '@/features/streak/useStreak';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

const ACircle = Animated.createAnimatedComponent(Circle);
const R = 44, CIRC = 2 * Math.PI * R;

// A thin ring draws itself, then the tick appears. Plain timing, no bounce.
function DoneRing() {
  const { c } = useTheme();
  const p = useSharedValue(0);
  const tick = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    tick.value = withDelay(500, withTiming(1, { duration: 200 }));
  }, []);
  const ring = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - p.value) }));
  const tickStyle = useAnimatedStyle(() => ({ opacity: tick.value }));
  return (
    <View style={{ width: 104, height: 104, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={104} height={104} viewBox="0 0 104 104">
        <Circle cx={52} cy={52} r={R} fill="none" stroke={c.surface2} strokeWidth={5} />
        <ACircle cx={52} cy={52} r={R} fill="none" stroke={c.accent} strokeWidth={5} strokeLinecap="round" strokeDasharray={CIRC} animatedProps={ring} transform="rotate(-90 52 52)" />
      </Svg>
      <Animated.View style={[{ position: 'absolute' }, tickStyle]}><Check size={38} strokeWidth={2.2} color={c.accent} /></Animated.View>
    </View>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 14, gap: 2 }}>
      <Txt style={{ fontFamily: font.display, fontSize: 30, lineHeight: 38, letterSpacing: -0.6 }}>{value}{unit ? <Txt muted style={{ fontFamily: font.display, fontSize: 16, lineHeight: 22 }}>{unit}</Txt> : null}</Txt>
      <Txt v="caption" style={{ fontSize: 13 }}>{label}</Txt>
    </View>
  );
}

// Streak status for the finish moment: kept, or how many sessions are left this week.
function StreakLine({ done }: { done: number }) {
  const { c } = useTheme();
  const st = useStreak();
  const left = Math.max(0, st.target - done);
  const kept = left === 0;
  return (
    <Row style={{ gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: 'rgba(255,138,61,0.12)' }}>
      <Flame size={18} color={FLAME} fill={kept ? FLAME : 'transparent'} strokeWidth={2} />
      <Txt style={{ flex: 1, fontSize: 14, lineHeight: 20, color: c.ink }}>{kept ? `Week complete · streak now ${st.weeks + (st.kept ? 0 : 1)} weeks` : `${left} more ${left === 1 ? 'session' : 'sessions'} to keep your streak this week`}</Txt>
    </Row>
  );
}

export type FinishStats = { mins: number; sets: number; exercises: number; totalEx: number; kcal: number; pr: { name: string; kg: number } | null; hc: boolean; weekDone: number };

export function FinishScreen({ s, onDone }: { s: FinishStats; onDone: (note: string) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useDomain();
  const [note, setNote] = useState('');
  const [noting, setNoting] = useState(false);
  useEffect(() => { haptic.success(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 64, paddingHorizontal: 20, paddingBottom: 130, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 14, paddingBottom: 10 }}>
          <DoneRing />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.light, fontSize: 34, lineHeight: 44, letterSpacing: -1 }}>Workout complete</Txt>
            <Txt muted style={{ fontSize: 15, lineHeight: 22 }}>Leg day · nice work, Jyotsana</Txt>
          </View>
        </View>

        <Row style={{ gap: 10 }}>
          <Stat value={String(s.mins)} unit=" min" label="Time" />
          <Stat value={String(s.sets)} label={s.sets === 1 ? 'Set done' : 'Sets done'} />
          <Stat value={`${s.exercises}/${s.totalEx}`} label="Exercises" />
        </Row>
        {s.hc && (
          <Row style={{ gap: 10 }}>
            <Stat value={String(s.kcal)} unit=" kcal" label="Calories" />
            <Stat value="124" unit=" bpm" label="Average heart rate" />
          </Row>
        )}

        {!!s.pr && (
          <Animated.View entering={fade(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, borderRadius: 22, padding: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Trophy size={20} strokeWidth={1.9} color={c.accentText} /></View>
            <View style={{ flex: 1 }}>
              <Txt v="caption" style={{ fontSize: 13 }}>New personal best</Txt>
              <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>{s.pr.name} · {s.pr.kg} kg</Txt>
            </View>
          </Animated.View>
        )}

        <View style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Txt style={{ fontFamily: font.semibold }}>This week</Txt>
            <Txt muted style={{ fontSize: 14 }}>{s.weekDone} of 4 workouts</Txt>
          </Row>
          <StreakLine done={s.weekDone} />
        </View>

        {d.hasGym && (noting ? (
          <Field value={note} onChangeText={setNote} placeholder="Note for Coach Vikram" accessibilityLabel="Note for Coach Vikram" returnKeyType="done" autoFocus />
        ) : (
          <Pressy accessibilityRole="button" onPress={() => setNoting(true)} scaleTo={0.97} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}>
            <Txt style={{ fontSize: 15, lineHeight: 21, color: c.accentText, fontFamily: font.medium }}>Add a note for Coach Vikram</Txt>
          </Pressy>
        ))}
      </ScrollView>

      <RoundBtn label="Close" onPress={() => onDone(note)} glass style={{ position: 'absolute', top: insets.top + 8, right: 16 }}><X size={20} color={c.ink} /></RoundBtn>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 14) + 4, backgroundColor: c.bg }}>
        <Button label={note.trim() ? 'Send note and finish' : 'Done'} onPress={() => onDone(note)} />
      </View>
    </View>
  );
}
