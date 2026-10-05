import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, { Easing, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from './ui';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';

const PX = 10;      // pixels per step
const HALF = 60;    // ticks rendered each side of the anchor
const REANCHOR = 30;

type Props = {
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; decimals?: number;
  majorEvery: number;               // labelled tick, in steps
  markEvery?: number;               // heavier haptic, in steps (default = majorEvery / 2)
  label: (v: number) => string;
  accessibilityLabel: string;
  vertical?: boolean;               // vertical: bigger values at the top, labels on the left
};

const clampN = (v: number, a: number, b: number) => { 'worklet'; return Math.min(b, Math.max(a, v)); };

// Ruler: drag to change the value. One light tick per step, a heavier tick on every 5th / 10th
// mark (throttled inside haptic), a warning when you push past either end.
export function Ruler({ value, onChange, min, max, step, decimals = 0, majorEvery, markEvery, label, accessibilityLabel, vertical }: Props) {
  const { c } = useTheme();
  const [len, setLen] = useState(vertical ? 360 : 358);
  const minS = Math.round(min / step), maxS = Math.round(max / step);
  const mark = markEvery ?? Math.max(1, Math.round(majorEvery / 2));
  const start = clampN(Math.round(value / step), minS, maxS);
  const pos = useSharedValue(start);
  const anchorSV = useSharedValue(start);
  const [anchor, setAnchor] = useState(start);
  const base = useSharedValue(start);
  const lastIdx = useSharedValue(start);
  const warned = useSharedValue(0);
  const v = !!vertical;

  const emit = useCallback((idx: number) => {
    if (idx % mark === 0) haptic.mark(); else haptic.tick();
    onChange(Math.round(idx * step * 10 ** decimals) / 10 ** decimals);
  }, [onChange, step, decimals, mark]);
  const warn = useCallback(() => haptic.warn(), []);
  const reanchor = useCallback((a: number) => { setAnchor(a); }, []);

  useAnimatedReaction(() => Math.round(pos.value), (idx, prev) => {
    if (prev === null || idx === prev || idx === lastIdx.value) return;
    lastIdx.value = idx;
    scheduleOnRN(emit, idx);
    if (Math.abs(idx - anchorSV.value) > REANCHOR) { anchorSV.value = idx; scheduleOnRN(reanchor, idx); }
  });

  // Value changed from outside (unit switch, typed number): glide there.
  useEffect(() => {
    const idx = clampN(Math.round(value / step), minS, maxS);
    if (idx !== Math.round(pos.value)) { lastIdx.value = idx; pos.value = withTiming(idx, { duration: 240, easing: Easing.out(Easing.quad) }); }
  }, [value, step, minS, maxS]);

  // Horizontal: dragging right brings smaller values to the centre. Vertical (big values on top):
  // dragging down brings bigger values to the centre.
  const pan = Gesture.Pan().activeOffsetX(v ? [-1000, 1000] : [-3, 3]).activeOffsetY(v ? [-3, 3] : [-1000, 1000])
    .onBegin(() => { base.value = pos.value; warned.value = 0; })
    .onUpdate((e) => {
      const raw = v ? base.value + e.translationY / PX : base.value - e.translationX / PX;
      const val = clampN(raw, minS, maxS);
      if (val !== raw && !warned.value) { warned.value = 1; scheduleOnRN(warn); }
      if (val === raw) warned.value = 0;
      pos.value = val;
    })
    .onEnd((e) => {
      const glide = clampN(Math.round(pos.value + (v ? e.velocityY : -e.velocityX) / PX * 0.22), minS, maxS);
      pos.value = withTiming(glide, { duration: 360, easing: Easing.out(Easing.cubic) });
    });

  const track = useAnimatedStyle(() => (v
    ? { transform: [{ translateY: (pos.value - anchorSV.value) * PX }] }
    : { transform: [{ translateX: (anchorSV.value - pos.value) * PX }] }));
  const ticks: number[] = [];
  for (let i = Math.max(minS, anchor - HALF); i <= Math.min(maxS, anchor + HALF); i++) ticks.push(i);
  const fade = c.bg;

  return (
    <View accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(clampN(value + (e.nativeEvent.actionName === 'increment' ? step : -step), min, max))}
      onLayout={(e: LayoutChangeEvent) => setLen(v ? e.nativeEvent.layout.height : e.nativeEvent.layout.width)}
      style={v ? { width: 120, alignSelf: 'stretch', overflow: 'hidden' } : { height: 96, overflow: 'hidden' }}>
      <GestureDetector gesture={pan}>
        <View collapsable={false} style={{ flex: 1, cursor: v ? 'ns-resize' : 'ew-resize' } as any}>
          <Animated.View style={[v
            ? { position: 'absolute', left: 0, right: 0, top: len / 2 + anchor * PX, height: 1 }
            : { position: 'absolute', top: 0, bottom: 0, left: len / 2 - anchor * PX, width: 1 }, track]}>
            {ticks.map((i) => {
              const major = i % majorEvery === 0;
              const half = !major && i % mark === 0;
              const size = major ? 34 : half ? 24 : 16;
              if (v) {
                return (
                  <View key={i} style={{ position: 'absolute', top: -i * PX - 1, right: 0, height: 2, flexDirection: 'row', alignItems: 'center' }}>
                    {major && <Txt style={{ position: 'absolute', right: size + 10, width: 46, textAlign: 'right', fontSize: 13, color: c.muted }}>{label(i * step)}</Txt>}
                    <View style={{ width: size, height: 2, borderRadius: 1, backgroundColor: major ? c.ink : c.surface3 }} />
                  </View>
                );
              }
              return (
                <View key={i} style={{ position: 'absolute', left: i * PX - 1, top: 6, width: 2, alignItems: 'center' }}>
                  <View style={{ width: 2, height: size, borderRadius: 1, backgroundColor: major ? c.ink : c.surface3 }} />
                  {major && <Txt style={{ position: 'absolute', top: 38, width: 60, left: -29, textAlign: 'center', fontSize: 12, color: c.muted }}>{label(i * step)}</Txt>}
                </View>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
      {v
        ? <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: len / 2 - 1.5, width: 38, height: 3, borderRadius: 2, backgroundColor: c.accent }} />
        : <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: len / 2 - 1.5, width: 3, height: 46, borderRadius: 2, backgroundColor: c.accent }} />}
      {v ? (
        <>
          <LinearGradient pointerEvents="none" colors={[fade, fade + '00']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 64 }} />
          <LinearGradient pointerEvents="none" colors={[fade + '00', fade]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 }} />
        </>
      ) : (
        <>
          <LinearGradient pointerEvents="none" colors={[fade, fade + '00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 56 }} />
          <LinearGradient pointerEvents="none" colors={[fade + '00', fade]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 56 }} />
        </>
      )}
    </View>
  );
}
