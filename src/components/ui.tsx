import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, PressableProps, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { font, radius, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

// ---------- Text ----------
type Variant = 'display' | 'title' | 'headline' | 'body' | 'label' | 'caption' | 'mono' | 'number';
const V: Record<Variant, TextStyle> = {
  display: { fontFamily: font.regular, fontSize: 34, letterSpacing: -1.4, lineHeight: 44 },
  title: { fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1, lineHeight: 37 },
  headline: { fontFamily: font.semibold, fontSize: fontSizes.lg, letterSpacing: -0.2, lineHeight: 25 },
  body: { fontFamily: font.regular, fontSize: fontSizes.base, lineHeight: 23 },
  label: { fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 },
  caption: { fontFamily: font.regular, fontSize: fontSizes.xs, lineHeight: 18 },
  mono: { fontFamily: font.mono, fontSize: fontSizes.sm, lineHeight: 19 },
  number: { fontFamily: font.display, fontSize: fontSizes.xl4, letterSpacing: -0.6, lineHeight: 39 },
};

export function Txt({ v = 'body', muted, color, style, ...rest }: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const { c } = useTheme();
  // Geist crops at the top with tight leading: always give ~1.3x the font size.
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const fs = flat?.fontSize ?? V[v].fontSize!;
  const lh = Math.max(flat?.lineHeight ?? 0, Math.round(fs * 1.3));
  return <Text {...rest} style={[V[v], { color: color ?? (muted || v === 'label' || v === 'caption' ? c.muted : c.ink) }, style, { lineHeight: lh }]} />;
}

// Pressy, Chip, Pill and the text inputs moved to src/design-system/primitives/. Re-exported so these import paths keep working.
export { Pressy } from '@/design-system/primitives/Pressy';
export { Chip } from '@/design-system/primitives/Chip';
export { Pill } from '@/design-system/primitives/Pill';
export { Field, NoteField } from '@/design-system/primitives/Input';

// ---------- Buttons ----------
export { Button, IconButton } from '@/design-system/primitives/Button';
export type { ButtonProps, ButtonKind, ButtonSize, IconButtonProps } from '@/design-system/primitives/Button';

// ---------- Card ----------
// The Card moved to src/design-system/primitives/Card.tsx (variants: default, compact, dark). Re-exported so this import path keeps working.
export { Card } from '@/design-system/primitives/Card';

// ---------- Outline chip (reference style) ----------
// ---------- Selectable pill (filter / option) ----------
// ---------- Segmented control with sliding thumb ----------
export function Segmented<T extends string>({ options, value, onChange, icons, accessibilityLabel }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; icons?: Partial<Record<T, (color: string) => React.ReactNode>>; accessibilityLabel?: string }) {
  const { c } = useTheme();
  const [w, setW] = React.useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const seg = w > 0 ? (w - 8) / options.length : 0;
  useEffect(() => { x.value = withSpring(idx * seg, spring.snappy); }, [idx, seg]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', padding: 4, borderRadius: radii.xl, backgroundColor: c.surface2 }}>
      {seg > 0 && <Animated.View style={[{ position: 'absolute', top: 4, left: 4, width: seg, height: 44, borderRadius: radii.lg, backgroundColor: c.ink, shadowColor: fixed.shadow, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, thumb]} />}
      {options.map((o) => {
        const on = o.value === value;
        const col = on ? c.bg : c.muted;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => { haptic.tap(); onChange(o.value); }} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            {icons?.[o.value]?.(col)}
            <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 18, color: col }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Text field ----------
export function Row({ style, children, ...rest }: { style?: StyleProp<ViewStyle>; children: React.ReactNode; collapsable?: boolean }) {
  return <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export const hairline = StyleSheet.hairlineWidth;
