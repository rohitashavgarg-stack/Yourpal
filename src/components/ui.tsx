import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, PressableProps, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { font, radius, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

// ---------- Text ----------
type Variant = 'display' | 'title' | 'headline' | 'body' | 'label' | 'caption' | 'mono' | 'number';
const V: Record<Variant, TextStyle> = {
  display: { fontFamily: font.regular, fontSize: 34, letterSpacing: -1.4, lineHeight: 44 },
  title: { fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1, lineHeight: 37 },
  headline: { fontFamily: font.semibold, fontSize: 17, letterSpacing: -0.2, lineHeight: 25 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: font.medium, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 18 },
  mono: { fontFamily: font.mono, fontSize: 13, lineHeight: 19 },
  number: { fontFamily: font.display, fontSize: 30, letterSpacing: -0.6, lineHeight: 39 },
};

export function Txt({ v = 'body', muted, color, style, ...rest }: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const { c } = useTheme();
  // Geist crops at the top with tight leading: always give ~1.3x the font size.
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const fs = flat?.fontSize ?? V[v].fontSize!;
  const lh = Math.max(flat?.lineHeight ?? 0, Math.round(fs * 1.3));
  return <Text {...rest} style={[V[v], { color: color ?? (muted || v === 'label' || v === 'caption' ? c.muted : c.ink) }, style, { lineHeight: lh }]} />;
}

// ---------- Pressable with iOS-style scale ----------
const APressable = Animated.createAnimatedComponent(Pressable);
export function Pressy({ style, children, haptics = true, scaleTo = 0.97, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptics?: boolean; scaleTo?: number; children?: React.ReactNode }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { s.value = withSpring(scaleTo, spring.snappy); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, spring.bouncy); rest.onPressOut?.(e); }}
      onPress={(e) => { if (haptics) haptic.tap(); onPress?.(e); }}
      style={[style as any, a]}
    >
      {children}
    </APressable>
  );
}

// ---------- Buttons ----------
type BtnKind = 'primary' | 'accent' | 'secondary' | 'ghost' | 'white' | 'outline';
export function Button({ kind = 'primary', label, onPress, disabled, icon, style, small, accessibilityLabel }: {
  kind?: BtnKind; label: string; onPress?: () => void; disabled?: boolean; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; small?: boolean; accessibilityLabel?: string;
}) {
  const { c } = useTheme();
  const bg = { primary: c.ink, accent: c.accent, secondary: c.surface2, ghost: 'transparent', white: '#FFFFFF', outline: 'transparent' }[kind];
  const fg = { primary: c.bg, accent: c.accentInk, secondary: c.ink, ghost: c.accentText, white: '#0B0E14', outline: c.ink }[kind];
  return (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[{
        height: small ? 44 : 56, borderRadius: small ? 22 : 28, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingHorizontal: 20, opacity: disabled ? 0.4 : 1, borderWidth: kind === 'outline' ? 1 : 0, borderColor: c.line,
      }, style]}
    >
      {icon}
      <Text style={{ fontFamily: font.semibold, fontSize: small ? 14 : 16, lineHeight: small ? 18 : 21, color: fg }}>{label}</Text>
    </Pressy>
  );
}

// ---------- Card ----------
export function Card({ style, children, dark: isDarkCard }: { style?: StyleProp<ViewStyle>; children: React.ReactNode; dark?: boolean }) {
  const { c, isDark } = useTheme();
  return (
    <View style={[{
      backgroundColor: isDarkCard ? c.dark : c.surface, borderRadius: radius.lg, padding: 20,
      ...(isDark || isDarkCard ? {} : { shadowColor: '#101828', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 2 }),
    }, style]}>
      {children}
    </View>
  );
}

// ---------- Outline chip (reference style) ----------
export function Chip({ label, icon, tone = 'default', onDark, style }: { label: string; icon?: React.ReactNode; tone?: 'default' | 'good' | 'warn' | 'live'; onDark?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const col = tone === 'good' ? c.good : tone === 'warn' ? c.warn : tone === 'live' ? c.live : onDark ? '#FFFFFF' : c.ink;
  const border = tone === 'default' ? (onDark ? 'rgba(255,255,255,0.28)' : c.chipLine) : col;
  return (
    <View style={[{ height: 28, paddingHorizontal: 11, borderRadius: 14, borderWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }, style]}>
      {icon}
      <Text style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: col }}>{label}</Text>
    </View>
  );
}

// ---------- Selectable pill (filter / option) ----------
export function Pill({ label, on, onPress, style }: { label: string; on: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: 220 }); }, [on]);
  const a = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(0,0,0,0)', c.ink]),
    borderColor: interpolateColor(p.value, [0, 1], [c.surface3, c.ink]),
  }));
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={[{ height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, a as any, style]}>
      <Text style={{ fontFamily: font.medium, fontSize: 14, lineHeight: 18, color: on ? c.bg : c.ink }}>{label}</Text>
    </Pressy>
  );
}

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
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', padding: 4, borderRadius: 26, backgroundColor: c.surface2 }}>
      {seg > 0 && <Animated.View style={[{ position: 'absolute', top: 4, left: 4, width: seg, height: 44, borderRadius: 22, backgroundColor: c.ink, shadowColor: '#101828', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, thumb]} />}
      {options.map((o) => {
        const on = o.value === value;
        const col = on ? c.bg : c.muted;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => { haptic.tap(); onChange(o.value); }} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            {icons?.[o.value]?.(col)}
            <Text style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 18, color: col }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Text field ----------
export const Field = React.forwardRef<TextInput, TextInputProps & { error?: boolean; prefix?: string }>(function Field({ error, prefix, style, ...rest }, ref) {
  const { c } = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 28, borderWidth: focus || error ? 1.5 : 1, borderColor: error ? c.warn : focus ? c.accent : c.line, backgroundColor: c.surface, paddingHorizontal: 18, gap: 10 }}>
      {prefix ? <Text style={{ fontFamily: font.medium, fontSize: 16, lineHeight: 21, color: c.muted }}>{prefix}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.muted}
        {...rest}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[{ flex: 1, fontFamily: font.medium, fontSize: 16, color: c.ink, height: '100%' as any, outlineStyle: 'none' as any }, style]}
      />
    </View>
  );
});

export function NoteField({ value, onChangeText, placeholder, accessibilityLabel, autoFocus, error, maxLength = 500, minHeight = 112 }: {
  value: string; onChangeText: (t: string) => void; placeholder?: string; accessibilityLabel?: string; autoFocus?: boolean; error?: boolean; maxLength?: number; minHeight?: number;
}) {
  const { c } = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <View>
      <View style={{ minHeight, borderRadius: 22, borderWidth: focus || error ? 1.5 : 1, borderColor: error ? c.warn : focus ? c.accent : c.line, backgroundColor: c.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          accessibilityLabel={accessibilityLabel}
          autoFocus={autoFocus}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ minHeight: minHeight - 34, maxHeight: 220, fontFamily: font.medium, fontSize: 16, lineHeight: 23, color: c.ink, padding: 0, outlineStyle: 'none' as any }}
        />
      </View>
      <Text style={{ alignSelf: 'flex-end', marginTop: 4, marginRight: 8, fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: c.muted }}>{value.length}/{maxLength}</Text>
    </View>
  );
}

export function Row({ style, children, ...rest }: { style?: StyleProp<ViewStyle>; children: React.ReactNode; collapsable?: boolean }) {
  return <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export const hairline = StyleSheet.hairlineWidth;
