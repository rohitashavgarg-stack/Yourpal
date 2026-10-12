import React, { useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Ellipsis, X } from '@/lib/icons';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle } from '@/components/bits';
import { Ex, ListItem } from '@/lib/data';
import { Session } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { mmss } from '@/lib/useNow';
import { ClipStage } from './ClipStage';
import { RestPanel } from './RestPanel';

const INK = '#0B0E14'; // text drawn straight on the white clip stage

// Solid pill, top right, on every workout screen: Finish is easy to find.
function FinishPill({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Finish workout" onPress={onPress} scaleTo={0.94}
      style={{ height: 44, paddingHorizontal: 20, borderRadius: 22, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: '#fff' }}>Finish</Txt>
    </Pressy>
  );
}

function RoundLight({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.92}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EC', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </Pressy>
  );
}

// ---------------------------------------------------------------------------------------------
// A main exercise: the clip fills the screen, the sets sit in a bottom sheet over it.
// ---------------------------------------------------------------------------------------------
export function NewExercise({ s, e, cur, elapsed, now, onMinimise, onFinish, onMenu, prevEx, nextEx, prevName, nextName, sets, note, onAdd30, onSkipRest }: {
  s: Session; e: Ex; cur: number; elapsed: string; now: number; onMinimise: () => void; onFinish: () => void; onMenu: () => void;
  prevEx: () => void; nextEx: () => void; prevName: string; nextName: string; sets: React.ReactNode; note: React.ReactNode; onAdd30: () => void; onSkipRest: () => void;
}) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const MIN = Math.round(H * 0.5), MAX = Math.round(H * 0.86);
  const h = useSharedValue(MIN);
  const from = useSharedValue(MIN);
  const [stageBottom, setStageBottom] = useState(MIN);
  const pan = Gesture.Pan()
    .onStart(() => { from.value = h.value; })
    .onUpdate((g) => { h.value = Math.max(MIN, Math.min(MAX, from.value - g.translationY)); })
    .onEnd((g) => {
      const to = h.value - g.velocityY * 0.12 > (MIN + MAX) / 2 ? MAX : MIN;
      h.value = withTiming(to, { duration: 220, easing: Easing.out(Easing.cubic) });
      runOnJS(setStageBottom)(to);
    });
  const sheet = useAnimatedStyle(() => ({ height: h.value }));

  const done = e.sets.filter((x) => x.st === 'done').length;
  const marked = done > 0;
  const none = cur < 0 || marked;
  const left = e.sets.filter((x) => x.st === 'todo').length;
  const n = s.ex.length + 2, pos = s.exIdx + 1;
  const setNo = cur >= 0 ? cur + 1 : e.sets.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ClipStage id={e.id} bottom={stageBottom} />

      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: n }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= pos ? INK : '#D5DBE5' }} />)}
        </View>
        <Row style={{ gap: 10 }}>
          <RoundLight label="Minimise workout" onPress={onMinimise}><X size={20} color={INK} /></RoundLight>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22, color: INK }}>{e.name}</Txt>
            <Txt numberOfLines={1} style={{ fontSize: 12, lineHeight: 17, color: '#5B6577' }}>{elapsed} · Next: {nextName}</Txt>
          </View>
          <FinishPill onPress={onFinish} />
        </Row>
      </View>

      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: c.line, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: isDark ? 0.5 : 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 18 }, sheet]}>
        <GestureDetector gesture={pan}>
          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 6 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: c.surface3 }} />
          </View>
        </GestureDetector>
        <Row style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.display, fontSize: 24, lineHeight: 31 }}>{e.name}</Txt>
            <Txt v="caption">{e.muscles} · set {setNo} of {e.sets.length}</Txt>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Exercise options: swap, ask coach, form tips, skip" onPress={onMenu} scaleTo={0.92}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Ellipsis size={20} color={c.ink} />
          </Pressy>
        </Row>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {sets}
          {note}
        </ScrollView>
        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 8, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}>
          {s.rest && <RestPanel docked rest={s.rest} now={now} onAdd30={onAdd30} onSkip={onSkipRest} onDone={onSkipRest} />}
          {cur >= 0 && marked && <Txt v="caption" style={{ textAlign: 'center' }}>{left} set{left === 1 ? '' : 's'} not done · you can come back to them</Txt>}
          <Row style={{ gap: 10 }}>
            {s.exIdx > 0 && (
              <Pressy accessibilityRole="button" accessibilityLabel={`Back to ${prevName}`} onPress={prevEx} scaleTo={0.92}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={22} color={c.ink} />
              </Pressy>
            )}
            <Button kind={none ? 'accent' : 'secondary'} label={none ? `Next: ${nextName}` : `Skip to ${nextName}`} onPress={nextEx} style={{ flex: 1 }} />
          </Row>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Warm-up and cool-down: a simple list with a big plain timer. No clip on top, no back button.
// ---------------------------------------------------------------------------------------------
const TOTAL_SEC = 240;
export function NewList({ s, list, now, cool, onToggle, onMain, onFinishNow, onMinimise, onFinish }: {
  s: Session; list: ListItem[]; now: number; cool: boolean; onToggle: (id: string, on: boolean) => void; onMain: () => void; onFinishNow: () => void; onMinimise: () => void; onFinish: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const t0 = useRef(Date.now());
  const left = Math.max(0, TOTAL_SEC - (now - t0.current) / 1000);
  const allDone = list.every((it) => !!s.listDone[it.id]);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 10, justifyContent: 'space-between' }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Minimise workout" onPress={onMinimise} scaleTo={0.92} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} color={c.ink} />
        </Pressy>
        <FinishPill onPress={onFinish} />
      </Row>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 200, gap: 16 }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, letterSpacing: 1, color: c.muted }}>{cool ? 'COOL-DOWN' : 'WARM-UP'} · {list.length} {cool ? 'stretches' : 'moves'} · {cool ? 'slow and easy' : 'no weights'}</Txt>
          <Txt accessibilityLabel={`Total time left ${mmss(left)}`} style={{ fontFamily: font.display, fontSize: 84, lineHeight: 92, letterSpacing: -3 }}>{mmss(left).padStart(5, '0')}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>total time</Txt>
        </View>
        <Card style={{ paddingVertical: 4, paddingHorizontal: 12 }}>
          {list.map((it, i) => {
            const on = !!s.listDone[it.id];
            return (
              <Row key={it.id} style={{ gap: 12, minHeight: 58, paddingVertical: 8, paddingHorizontal: 2, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <CheckCircle on={on} label={`${on ? 'Undo' : 'Done'}: ${it.n}`} onPress={() => onToggle(it.id, !on)} />
                <Txt style={{ flex: 1, fontFamily: font.medium, color: on ? c.muted : c.ink, textDecorationLine: on ? 'line-through' : 'none' }}>{it.n}</Txt>
              </Row>
            );
          })}
        </Card>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 4, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button kind={allDone || cool ? 'accent' : 'primary'} label={cool ? 'Finish workout' : 'Start main workout'} onPress={cool ? onFinishNow : onMain} />
        {!cool && (
          <Pressy accessibilityRole="button" onPress={onMain} scaleTo={0.96} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, color: c.ink, opacity: 0.7 }}>Skip warm-up</Txt>
          </Pressy>
        )}
      </View>
    </View>
  );
}
