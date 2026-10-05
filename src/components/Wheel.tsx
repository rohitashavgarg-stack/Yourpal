import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { interpolate, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, Extrapolation } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Txt } from './ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

const ITEM = 72;
const VISIBLE = 5;

function Item({ n, i, y, fmt, size }: { n: number; i: number; y: { value: number }; fmt?: (n: number) => string; size: number }) {
  const { c } = useTheme();
  const a = useAnimatedStyle(() => {
    const d = Math.abs(y.value / ITEM - i);
    return { opacity: interpolate(d, [0, 1, 2.5], [1, 0.4, 0.08], Extrapolation.CLAMP), transform: [{ scale: interpolate(d, [0, 2.5], [1, 0.7], Extrapolation.CLAMP) }] };
  });
  return (
    <Animated.View style={[{ height: ITEM, alignItems: 'center', justifyContent: 'center' }, a]}>
      <Txt style={{ fontFamily: font.displayBold, fontSize: size, lineHeight: 72, letterSpacing: -1.5, color: c.ink }}>{fmt ? fmt(n) : n}</Txt>
    </Animated.View>
  );
}

// Vertical wheel: snaps to a value, one tick per step, a heavier tick every 5th value.
export function Wheel({ value, onChange, min, max, unit, accessibilityLabel, fmt, size = 56 }: { fmt?: (n: number) => string; size?: number; value: number; onChange: (v: number) => void; min: number; max: number; unit?: string; accessibilityLabel: string }) {
  const { c } = useTheme();
  const items = Array.from({ length: max - min + 1 }, (_, k) => min + k);
  const y = useSharedValue((value - min) * ITEM);
  const last = useSharedValue(value);
  const ref = useRef<Animated.ScrollView>(null);
  const emit = useCallback((v: number) => { if (v % 5 === 0) haptic.mark(); else haptic.tick(); onChange(v); }, [onChange]);
  const onScroll = useAnimatedScrollHandler({ onScroll: (e) => { y.value = e.contentOffset.y; } });
  useAnimatedReaction(() => Math.round(y.value / ITEM), (idx, prev) => {
    const v = Math.min(max, Math.max(min, min + idx));
    if (prev === null || v === last.value) return;
    last.value = v;
    scheduleOnRN(emit, v);
  });
  useEffect(() => { const t = setTimeout(() => ref.current?.scrollTo({ y: (value - min) * ITEM, animated: false }), 30); return () => clearTimeout(t); }, []);
  const H = ITEM * VISIBLE;
  return (
    <View accessibilityRole="adjustable" accessibilityLabel={`${accessibilityLabel}, ${value}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.min(max, Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
      style={{ height: H, alignSelf: 'stretch', flex: fmt ? 1 : undefined }}>
      <Animated.ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} snapToInterval={ITEM} decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: (H - ITEM) / 2 }}>
        {items.map((n, i) => <Item key={n} n={n} i={i} y={y} fmt={fmt} size={size} />)}
      </Animated.ScrollView>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: (H - ITEM) / 2, height: ITEM, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }} />
      {!!unit && <Txt pointerEvents="none" style={{ position: 'absolute', right: 24, top: H / 2 - 8, fontFamily: font.semibold, fontSize: 13, letterSpacing: 1.4, color: c.muted }}>{unit}</Txt>}
    </View>
  );
}
