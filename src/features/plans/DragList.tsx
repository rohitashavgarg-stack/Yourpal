import React, { useLayoutEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { Menu } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';

// Hold ≡ and drag to reorder. Rows have a fixed height so the target slot is a simple division.
export const ROW_H = 68;
const GAP = 8;
const H = ROW_H + GAP;

type Props<T> = {
  items: T[];
  keyOf: (t: T) => string;
  labelOf: (t: T) => string;
  onMove: (from: number, to: number) => void;
  onDragging?: (on: boolean) => void;
  renderRow: (t: T, handle: React.ReactNode) => React.ReactNode;
};

export function DragList<T>({ items, keyOf, labelOf, onMove, onDragging, renderRow }: Props<T>) {
  const active = useSharedValue(-1);
  const dy = useSharedValue(0);
  const order = items.map(keyOf).join('|');
  // After a drop the list re-renders in its new order: snap every offset back in the same frame.
  useLayoutEffect(() => { active.value = -1; dy.value = 0; }, [order]);
  const finish = (from: number, to: number) => {
    onDragging?.(false);
    if (from !== to) { haptic.tap(); onMove(from, to); }
    else { active.value = -1; dy.value = 0; }
  };
  return (
    <View style={{ gap: GAP }}>
      {items.map((it, i) => (
        <DragRow key={keyOf(it)} i={i} n={items.length} active={active} dy={dy} label={labelOf(it)}
          onStart={() => { haptic.light(); onDragging?.(true); }} onFinish={finish}
          onKey={(dir) => { const j = i + dir; if (j >= 0 && j < items.length) onMove(i, j); }}
          render={(handle) => renderRow(it, handle)} />
      ))}
    </View>
  );
}

function DragRow({ i, n, active, dy, label, onStart, onFinish, onKey, render }: {
  i: number; n: number; active: SharedValue<number>; dy: SharedValue<number>; label: string;
  onStart: () => void; onFinish: (from: number, to: number) => void; onKey: (dir: 1 | -1) => void; render: (handle: React.ReactNode) => React.ReactNode;
}) {
  const { c } = useTheme();
  const base = Gesture.Pan()
    .onStart(() => { active.value = i; dy.value = 0; scheduleOnRN(onStart); })
    .onUpdate((e) => { dy.value = e.translationY; })
    .onEnd(() => { const to = Math.max(0, Math.min(n - 1, i + Math.round(dy.value / H))); scheduleOnRN(onFinish, i, to); })
    .onFinalize((_e, ok) => { if (!ok && active.value === i) { active.value = -1; dy.value = 0; } });
  const pan = Platform.OS === 'web' ? base.minDistance(2) : base.activateAfterLongPress(160);

  const st = useAnimatedStyle(() => {
    const a = active.value;
    if (a < 0) return { transform: [{ translateY: 0 }, { scale: 1 }], zIndex: 0, shadowOpacity: 0 };
    if (a === i) return { transform: [{ translateY: dy.value }, { scale: 1.03 }], zIndex: 3, shadowOpacity: 0.28 };
    const to = Math.max(0, Math.min(n - 1, a + Math.round(dy.value / H)));
    let sh = 0;
    if (a < to && i > a && i <= to) sh = -H;
    if (a > to && i >= to && i < a) sh = H;
    return { transform: [{ translateY: withTiming(sh, { duration: 220 }) }, { scale: 1 }], zIndex: 0, shadowOpacity: 0 };
  }, [i, n]);

  const handle = (
    <GestureDetector gesture={pan}>
      <View collapsable={false} accessible accessibilityRole="adjustable" accessibilityLabel={`Reorder ${label}`} accessibilityHint="Hold and drag, or swipe up or down to move"
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onKey(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        style={{ width: 44, height: 60, alignItems: 'center', justifyContent: 'center', cursor: 'grab' as any }}>
        <Menu size={18} color={c.muted} />
      </View>
    </GestureDetector>
  );
  return (
    <Animated.View style={[{ shadowColor: '#000', shadowRadius: 20, shadowOffset: { width: 0, height: 18 } }, st]}>
      {render(handle)}
    </Animated.View>
  );
}
