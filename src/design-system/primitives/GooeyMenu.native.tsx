import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { Blur, Canvas, Circle, ColorMatrix, Group, Paint } from '@shopify/react-native-skia';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';
import { IconButton } from './Button';
import { Txt } from './Txt';
import type { GooeyItem, GooeyMenuProps } from './GooeyMenu';

// EXPERIMENT (branch experiment-gooey-menu), phone version. Press the trigger and keep your finger down: the buttons fan out and a blob
// stretches from the trigger toward your finger, melting into it like liquid. Lift over a button to choose it; lift anywhere else to close.
// A quick tap opens the menu and stays open so you can tap a button. The melting is drawn with Skia (blur, then a hard alpha threshold).
// Shown only in development builds (Expo Go), everywhere else the plain button opens the sheet as before.
export type { GooeyItem, GooeyMenuProps } from './GooeyMenu';

const STEP = 56;
const SIZE = 44;
const PAD = 40;
const MAX = 6;
const THRESH = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 24, -11];

export function gooeyEnabled() {
  return __DEV__;
}

// how far item i has travelled (0 to 1, a little past 1 while it springs): items leave one after another
const travel = (p: number, i: number, n: number) => {
  'worklet';
  return Math.min(1.2, Math.max(0, p * (1 + 0.14 * n) - i * 0.14));
};

function ItemBlob({ i, n, p, hov, blob }: { i: number; n: number; p: SharedValue<number>; hov: SharedValue<number>; blob: string }) {
  const cy = useDerivedValue(() => PAD + SIZE / 2 + (i + 1) * STEP * travel(p.value, i, n));
  const r = useDerivedValue(() => (SIZE / 2) * (hov.value === i ? 1.12 : 1));
  return <Circle cx={PAD + SIZE / 2} cy={cy} r={r} color={blob} />;
}

function FanButton({ item, i, n, p, hov, onPick }: { item: GooeyItem; i: number; n: number; p: SharedValue<number>; hov: SharedValue<number>; onPick: () => void }) {
  const { c } = useTheme();
  const move = useAnimatedStyle(() => ({ transform: [{ translateY: (i + 1) * STEP * travel(p.value, i, n) }, { scale: hov.value === i ? 1.12 : 1 }], opacity: Math.min(1, p.value * 2) }));
  const lab = useAnimatedStyle(() => ({ opacity: Math.max(0, p.value * 2 - 1), transform: [{ translateX: (1 - Math.min(1, p.value)) * 10 }] }));
  const I = item.icon;
  return (
    <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE }, move]}>
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
  const n = Math.min(items.length, MAX);

  const p = useSharedValue(0);      // how open the menu is
  const hov = useSharedValue(-1);   // the button under the finger
  const fx = useSharedValue(0);     // the finger, from the trigger centre
  const fy = useSharedValue(0);
  const fr = useSharedValue(0);     // size of the blob under the finger
  const wasOpen = useSharedValue(0);

  useEffect(() => {
    const to = open ? 1 : 0;
    p.value = reduce ? to : withSpring(to, { damping: 12, stiffness: 120, mass: 0.9 });
  }, [open, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (it: GooeyItem) => { haptic.tap(); setOpen(false); it.onPress(); };

  const pan = Gesture.Pan().runOnJS(true).minDistance(0)
    .onBegin((e) => {
      wasOpen.value = open ? 1 : 0;
      fx.value = e.x - SIZE / 2; fy.value = e.y - SIZE / 2;
      if (!open) { haptic.tap(); setOpen(true); }
      if (!reduce) fr.value = withSpring(SIZE * 0.42, { damping: 14, stiffness: 160 });
    })
    .onUpdate((e) => {
      fx.value = e.x - SIZE / 2; fy.value = e.y - SIZE / 2;
      let h = -1;
      for (let i = 0; i < n; i++) if (Math.hypot(fx.value, fy.value - (i + 1) * STEP) < SIZE * 0.7) h = i;
      hov.value = h;
    })
    .onEnd((e) => {
      const moved = Math.hypot(e.translationX, e.translationY) > 10;
      const h = hov.value;
      hov.value = -1;
      fr.value = withSpring(0, { damping: 16, stiffness: 140 });
      fx.value = withSpring(0, { damping: 14, stiffness: 120 });
      fy.value = withSpring(0, { damping: 14, stiffness: 120 });
      if (h >= 0 && moved) { pick(items[h]); return; }
      if (moved) { setOpen(false); return; }
      if (wasOpen.value === 1) setOpen(false); // a tap on the trigger of an open menu closes it
    });

  if (!on) return <IconButton label={label} onPress={onFallback} scaleTo={0.92} style={{ marginTop: 2 }}>{trigger}</IconButton>;

  const height = SIZE + n * STEP + PAD * 2;
  return (
    <View style={{ width: SIZE, height: SIZE, marginTop: 2, zIndex: 30 }}>
      <View pointerEvents="none" style={{ position: 'absolute', left: -PAD, top: -PAD, width: SIZE + PAD * 2, height }}>
        <Canvas style={{ width: SIZE + PAD * 2, height }}>
          <Group layer={<Paint><Blur blur={9} /><ColorMatrix matrix={THRESH} /></Paint>}>
            <Circle cx={PAD + SIZE / 2} cy={PAD + SIZE / 2} r={SIZE / 2} color={c.surface2} />
            {items.slice(0, n).map((it, i) => <ItemBlob key={it.key} i={i} n={n} p={p} hov={hov} blob={c.surface2} />)}
            <FingerBlob fx={fx} fy={fy} fr={fr} blob={c.surface2} />
          </Group>
        </Canvas>
      </View>
      {items.slice(0, n).map((it, i) => <FanButton key={it.key} item={it} i={i} n={n} p={p} hov={hov} onPick={() => pick(it)} />)}
      <GestureDetector gesture={pan}>
        <View accessible accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} accessibilityActions={[{ name: 'activate' }]} onAccessibilityAction={() => setOpen(!open)}
          style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {trigger}
        </View>
      </GestureDetector>
    </View>
  );
}

function FingerBlob({ fx, fy, fr, blob }: { fx: SharedValue<number>; fy: SharedValue<number>; fr: SharedValue<number>; blob: string }) {
  const cx = useDerivedValue(() => PAD + SIZE / 2 + fx.value);
  const cy = useDerivedValue(() => PAD + SIZE / 2 + fy.value);
  return <Circle cx={cx} cy={cy} r={fr} color={blob} />;
}
