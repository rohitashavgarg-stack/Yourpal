import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureType } from 'react-native-gesture-handler';
import { Check, Play, Square } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { CheckCircle } from '@/components/bits';
import { Ex } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1 } from '@/lib/useNow';
import { setLabel, setText } from './session';

export type Draft = { k: number; r: number; t: number };

// − value + stepper; drag the number sideways to scrub.
function Stepper({ value, unit, onChange, step, min, label, block }: { value: number; unit: string; onChange: (v: number) => void; step: number; min: number; label: string; block?: GestureType }) {
  const { c } = useTheme();
  const base = useRef(value);
  const last = useRef(value);
  let pan = Gesture.Pan().runOnJS(true).activeOffsetX([-4, 4])
    .onBegin(() => { base.current = value; last.current = value; })
    .onUpdate((e) => {
      const v = Math.max(min, Math.round((base.current + Math.round(e.translationX / 14) * step) * 10) / 10);
      if (v !== last.current) { last.current = v; haptic.tap(); onChange(v); }
    });
  if (block) pan = pan.blocksExternalGesture(block);
  const shown = unit === 'kg' ? fmt1(value) : String(value);
  return (
    <View accessibilityRole="adjustable" accessibilityLabel={`${label}, ${shown} ${unit}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
      style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 22, backgroundColor: c.surface2 }}>
      <Pressable accessibilityLabel={`Minus ${step} ${unit}`} onPress={() => { haptic.tap(); onChange(Math.max(min, Math.round((value - step) * 10) / 10)); }} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, lineHeight: 23, color: c.ink }}>−</Text>
      </Pressable>
      <GestureDetector gesture={pan}>
        <View collapsable={false} style={{ flex: 1, minWidth: 0, height: 44, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 2, paddingTop: 9, cursor: 'ew-resize' } as any}>
          <Text style={{ fontFamily: font.display, fontSize: 22, lineHeight: 29, color: c.ink }}>{shown}</Text>
          <Text style={{ fontSize: 10, lineHeight: 13, color: c.muted }}>{unit}</Text>
        </View>
      </GestureDetector>
      <Pressable accessibilityLabel={`Plus ${step} ${unit}`} onPress={() => { haptic.tap(); onChange(Math.round((value + step) * 10) / 10); }} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, lineHeight: 23, color: c.ink }}>+</Text>
      </Pressable>
    </View>
  );
}

type Props = {
  e: Ex; i: number; active: boolean; revealed: boolean; justDone: boolean; back: boolean;
  draft: Draft; setDraft: (d: Partial<Draft>) => void;
  timerLeft: number | null; // seconds left when this set's timer runs
  onCheck: () => void; onActivate: () => void; onReveal: (on: boolean) => void; onSkip: () => void; onSwap: () => void; onMenu: () => void; onTimer: () => void;
};

export function SetRow(p: Props) {
  const { c } = useTheme();
  const x = p.e.sets[p.i];
  const M = p.e.mode;
  const tx = useSharedValue(0);
  const wash = useSharedValue(0);
  const base = useRef(0);
  const swiped = useRef(false); // swallow the tap that ends a swipe (web)
  const lbl = setLabel(p.e, p.i);
  const done = x.st === 'done', skipped = x.st === 'skipped';

  useEffect(() => { tx.value = withSpring(p.revealed ? -150 : 0, spring.snappy); }, [p.revealed]);
  useEffect(() => { if (p.justDone) wash.value = withSequence(withTiming(1, { duration: 1 }), withTiming(0, { duration: 1100 })); }, [p.justDone]);
  useEffect(() => { if (p.back) { tx.value = -40; tx.value = withTiming(0, { duration: 180 }); } }, [p.back]);

  const skipOut = () => { haptic.medium(); tx.value = withTiming(-420, { duration: 320 }); setTimeout(p.onSkip, 330); };

  const pan = Gesture.Pan().runOnJS(true).activeOffsetX([-10, 10]).failOffsetY([-12, 12])
    .onBegin(() => { base.current = p.revealed ? -150 : 0; })
    .onStart(() => { swiped.current = true; })
    .onFinalize(() => { setTimeout(() => (swiped.current = false), 60); })
    .onUpdate((ev) => {
      const raw = base.current + ev.translationX;
      let disp = raw;
      if (raw < -150) disp = -150 + (raw + 150) * 0.4;
      if (raw > 0) disp = Math.min(raw, 120 + (raw - 120) * 0.3);
      if (done && raw > 0) disp = raw * 0.25;
      tx.value = disp;
    })
    .onEnd((ev) => {
      const raw = base.current + ev.translationX;
      if (raw > 90 && !done) { tx.value = withSpring(0, spring.bouncy); p.onReveal(false); p.onCheck(); }
      else if (raw < -250 && !skipped) skipOut();
      else if (raw < -60) { tx.value = withSpring(-150, spring.snappy); p.onReveal(true); haptic.light(); }
      else { tx.value = withSpring(0, spring.bouncy); p.onReveal(false); }
    });

  const fg = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }], backgroundColor: interpolateColor(wash.value, [0, 1], [c.surface, c.accentSoft]) }));
  const under = useAnimatedStyle(() => ({ backgroundColor: tx.value > 0 ? c.accent : c.bg }));
  const doneL = useAnimatedStyle(() => ({ opacity: tx.value > 0 ? Math.min(1, tx.value / 90) : 0 }));
  const reveal = useAnimatedStyle(() => ({ opacity: tx.value < 0 ? Math.min(1, -tx.value / 110) : 0 }));

  const val = done ? setText(p.e, x, true) : skipped ? 'Skipped' : setText(p.e, x);
  const timing = p.timerLeft != null;

  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', opacity: skipped ? 0.5 : 1 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, justifyContent: 'center' }, under]}>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 18 }, doneL]}>
          <Check size={20} strokeWidth={2.6} color="#fff" /><Txt style={{ fontFamily: font.semibold, color: '#fff' }}>Done</Txt>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 6, padding: 8 }, reveal]}>
        <Pressy accessibilityLabel={`Swap exercise`} onPress={() => { p.onReveal(false); p.onSwap(); }} style={{ width: 66, borderRadius: 16, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13 }}>Swap</Txt>
        </Pressy>
        <Pressy accessibilityLabel={`Skip set ${lbl}`} onPress={skipOut} style={{ width: 66, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13, color: c.bg }}>Skip</Txt>
        </Pressy>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View collapsable={false} style={[{ borderRadius: 20, borderWidth: 1.5, borderColor: p.active ? c.accent : 'transparent' }, fg]}>
          <Pressable accessibilityHint="Swipe right to log, left to swap or skip, hold for options" delayLongPress={480}
            onLongPress={() => { if (swiped.current) return; haptic.medium(); p.onMenu(); }}
            onPress={() => { if (swiped.current) return; if (p.revealed) p.onReveal(false); else if (x.st === 'todo' && !p.active) { haptic.tap(); p.onActivate(); } }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60, paddingLeft: 10, paddingRight: 8 }}>
            {x.w ? (
              <View accessibilityLabel="Warm-up set: a lighter set before your working sets. It doesn't count toward your PRs." style={{ height: 24, paddingHorizontal: 7, borderRadius: 12, backgroundColor: c.tAct, justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.bold, fontSize: 10, lineHeight: 13, color: c.cAct }}>Warm-up</Text>
              </View>
            ) : (
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 13 }}>{lbl}</Txt>
              </View>
            )}
            {p.active ? (
              <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 6 }}>
                {(M === 'rw' || M === 'tw') && <Stepper label="Weight" unit="kg" value={p.draft.k} step={p.e.step} min={0} onChange={(k) => p.setDraft({ k })} block={pan} />}
                {(M === 'rw' || M === 'r') && <Stepper label="Reps" unit="reps" value={p.draft.r} step={1} min={1} onChange={(r) => p.setDraft({ r })} block={pan} />}
                {(M === 't' || M === 'tw') && (
                  <>
                    <Stepper label="Duration" unit="s" value={timing ? p.timerLeft! : p.draft.t} step={5} min={5} onChange={(t) => !timing && p.setDraft({ t })} block={pan} />
                    <Pressy accessibilityRole="button" accessibilityLabel={timing ? 'Stop timer and log' : `Start ${p.draft.t} second timer`} onPress={p.onTimer}
                      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: timing ? c.warn : c.accent, alignItems: 'center', justifyContent: 'center' }}>
                      {timing ? <Square size={13} color="#fff" fill="#fff" /> : <Play size={15} color="#fff" fill="#fff" />}
                    </Pressy>
                  </>
                )}
              </View>
            ) : (
              <Txt style={{ flex: 1, fontFamily: done ? font.monoBold : font.mono, fontSize: 14, color: done ? c.ink : c.muted }}>{val}</Txt>
            )}
            <CheckCircle on={done} label={`${done ? 'Undo' : 'Log'} set ${lbl}`} onPress={p.onCheck} />
          </Pressable>
          {!!x.note && <Txt muted style={{ paddingLeft: 54, paddingRight: 14, paddingBottom: 12, fontSize: 13 }}>Note: {x.note}</Txt>}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
