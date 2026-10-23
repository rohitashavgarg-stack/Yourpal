import React, { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';
import { GOOEY_ON } from '@/lib/devParams';
import { IconButton } from './Button';
import { Txt } from './Txt';

// EXPERIMENT (branch experiment-gooey-menu). A fan-out menu whose buttons melt out of one button like liquid.
// Web only, and only when the address has ?gooey=1. Everywhere else it is the plain IconButton that opens the sheet, as before.
const FILTER_ID = 'yp-gooey';
const STEP = 56;
const SIZE = 44;
const PAD = 24;

export type GooeyItem = { key: string; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; onPress: () => void };
export type GooeyMenuProps = {
  /** Accessibility label of the trigger. */
  label: string;
  items: GooeyItem[];
  /** The trigger icon, for example the three dots. */
  trigger: React.ReactNode;
  /** What the trigger does when the effect is off (opens the sheet). */
  onFallback: () => void;
};

export function gooeyEnabled() {
  return Platform.OS === 'web' && GOOEY_ON;
}

function Blob({ i, n, open, reduce, bg }: { i: number; n: number; open: boolean; reduce: boolean; bg?: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    const to = open ? 1 : 0;
    v.value = reduce ? to : withDelay(open ? i * 45 : (n - 1 - i) * 30, withSpring(to, { damping: 11, stiffness: 120, mass: 0.9 }));
  }, [open, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: v.value * (i + 1) * STEP }] }));
  return <Animated.View style={[{ position: 'absolute', left: PAD, top: PAD, width: SIZE, height: SIZE, borderRadius: radii.lg, backgroundColor: bg }, a]} />;
}

function FanButton({ item, i, n, open, reduce, onPick }: { item: GooeyItem; i: number; n: number; open: boolean; reduce: boolean; onPick: () => void }) {
  const { c } = useTheme();
  const v = useSharedValue(0);
  useEffect(() => {
    const to = open ? 1 : 0;
    v.value = reduce ? to : withDelay(open ? i * 45 : (n - 1 - i) * 30, withSpring(to, { damping: 11, stiffness: 120, mass: 0.9 }));
  }, [open, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = useAnimatedStyle(() => ({ transform: [{ translateY: v.value * (i + 1) * STEP }], opacity: Math.min(1, v.value * 2) }));
  const lab = useAnimatedStyle(() => ({ opacity: Math.max(0, v.value * 2 - 1), transform: [{ translateX: (1 - v.value) * 10 }] }));
  const I = item.icon;
  return (
    <Animated.View pointerEvents={open ? 'box-none' : 'none'} style={[{ position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE }, move]}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: SIZE + 10, top: 9, height: 26, paddingHorizontal: 11, borderRadius: radii.sm, backgroundColor: c.surface2, justifyContent: 'center' }, lab]}>
        <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: c.ink }} numberOfLines={1}>{item.label}</Txt>
      </Animated.View>
      <Pressable accessibilityRole="button" accessibilityLabel={item.label} onPress={onPick} style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <I size={20} color={c.ink} />
      </Pressable>
    </Animated.View>
  );
}

export function GooeyMenu({ label, items, trigger, onFallback }: GooeyMenuProps) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const on = gooeyEnabled();

  useEffect(() => {
    if (!on || !open || typeof document === 'undefined') return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [on, open]);

  if (!on) return <IconButton label={label} onPress={onFallback} scaleTo={0.92} style={{ marginTop: 2 }}>{trigger}</IconButton>;

  const height = SIZE + items.length * STEP + PAD * 2;
  const goo = reduce ? undefined : { filter: `url(#${FILTER_ID})` };
  return (
    <View style={{ width: SIZE, height: SIZE, marginTop: 2, zIndex: 30 }}>
      {React.createElement('svg', { width: 0, height: 0, style: { position: 'absolute' }, 'aria-hidden': true },
        React.createElement('filter', { id: FILTER_ID, x: '-30%', y: '-10%', width: '160%', height: '120%', colorInterpolationFilters: 'sRGB' },
          React.createElement('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 7, result: 'b' }),
          React.createElement('feColorMatrix', { in: 'b', mode: 'matrix', values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11' })))}
      {open && <Pressable accessibilityLabel="Close menu" onPress={() => setOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any} />}
      <View pointerEvents="none" style={[{ position: 'absolute', left: -PAD, top: -PAD, width: SIZE + PAD * 2, height }, goo as any]}>
        <View style={{ position: 'absolute', left: PAD, top: PAD, width: SIZE, height: SIZE, borderRadius: radii.lg, backgroundColor: c.surface2 }} />
        {items.map((it, i) => <Blob key={it.key} i={i} n={items.length} open={open} reduce={reduce} bg={c.surface2} />)}
      </View>
      {items.map((it, i) => (
        <FanButton key={it.key} item={it} i={i} n={items.length} open={open} reduce={reduce} onPick={() => { haptic.tap(); setOpen(false); it.onPress(); }} />
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} onPress={() => { haptic.tap(); setOpen(!open); }}
        style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {trigger}
      </Pressable>
    </View>
  );
}
