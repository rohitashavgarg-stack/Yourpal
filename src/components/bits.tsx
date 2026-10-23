import React, { useEffect } from 'react';
import { GlassBackdrop } from '@/components/Glass';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { FoodType } from '@/lib/data';
import { Pressy } from './ui';
import { Button, IconButton, IconButtonProps } from '@/design-system/primitives/Button';
import { Option } from '@/design-system/primitives/Option';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

// FoodMark, CheckCircle, Tag, Ring, Beat and HeartIcon moved to src/design-system/primitives/. Re-exported so these import paths keep working.
export { FoodMark, foodTypeLabel } from '@/design-system/primitives/FoodMark';
export { CheckCircle } from '@/design-system/primitives/CheckCircle';
export { Tag } from '@/design-system/primitives/Tag';
export { Ring } from '@/design-system/primitives/Ring';
export { Beat } from '@/design-system/primitives/Beat';
export { HeartIcon } from '@/design-system/primitives/HeartIcon';

// ---------- Shimmer skeleton ----------
export function Skeleton({ h, style }: { h: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => { t.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false); }, []);
  const a = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(Math.sin(t.value * Math.PI), [0, 1], [c.sk, c.skHi]) }));
  return <Animated.View style={[{ height: h, borderRadius: radii.xl }, a, style]} />;
}

// ---------- Small black pill button ----------
// The Button primitive with size="compact". Kept under its old name.
const PILL_KIND = { ink: 'primary', white: 'white', soft: 'secondary' } as const;
export function PillBtn({ label, onPress, tone = 'ink', icon, style, h = 36 }: { label: string; onPress?: () => void; tone?: 'ink' | 'white' | 'soft'; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; h?: number }) {
  return <Button size="compact" height={h} kind={PILL_KIND[tone]} label={label} onPress={onPress} icon={icon} style={style} />;
}

export function Glow({ color = fixed.live, size = 10 }: { color?: string; size?: number }) {
  const o = useSharedValue(0.55);
  useEffect(() => { o.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true); }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }, a]} />;
}

// Close / back button for full-screen pages. The IconButton primitive under its old name.
export function RoundBtn(props: IconButtonProps) { return <IconButton {...props} />; }

export const popIn = (delay: number) => withSequence(withTiming(0, { duration: delay }), withSpring(1, spring.bouncy));

// Compact unit switch (kg | lb, cm | ft + in): small centred pill, not a full-width control.
export function UnitPill<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', alignSelf: 'center', padding: 4, borderRadius: radii.xl, backgroundColor: c.surface2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Option key={o.value} role="tab" selected={on} onPress={() => onChange(o.value)} scaleTo={0.96} height={44} minWidth={72} padX={16} row={false}>
            <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 17, letterSpacing: 0.8, color: on ? c.bg : c.muted }}>{o.label.toUpperCase()}</Text>
          </Option>
        );
      })}
    </View>
  );
}
