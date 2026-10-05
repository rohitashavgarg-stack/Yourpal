import React, { useEffect } from 'react';
import { GlassBackdrop } from '@/components/Glass';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { FoodType } from '@/lib/data';
import { Pressy } from './ui';

// ---------- Veg / egg / non-veg mark (Indian food label style) ----------
const MARK: Record<FoodType, { c: string; d: string; l: string }> = {
  veg: { c: '#1E9E5A', d: 'M6 3.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z', l: 'Veg' },
  egg: { c: '#E0A526', d: 'M6 3.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z', l: 'Egg' },
  nv: { c: '#A0522D', d: 'M6 3l3 5H3z', l: 'Non-veg' },
};
export const foodTypeLabel = (t: FoodType = 'veg') => MARK[t].l;
export function FoodMark({ type = 'veg', size = 14 }: { type?: FoodType; size?: number }) {
  const m = MARK[type];
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" accessibilityLabel={m.l}>
      <Rect x={0.75} y={0.75} width={10.5} height={10.5} rx={2} fill="none" stroke={m.c} strokeWidth={1.5} />
      <Path d={m.d} fill={m.c} />
    </Svg>
  );
}

// ---------- Round check with a drawn tick ----------
const APath = Animated.createAnimatedComponent(Path);
export function CheckCircle({ on, size = 40, tone = 'accent', onPress, label, hit = 44 }: { on: boolean; size?: number; tone?: 'accent' | 'good'; onPress?: () => void; label: string; hit?: number }) {
  const { c } = useTheme();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: 380, easing: Easing.bezier(0.65, 0, 0.35, 1) }); }, [on]);
  const fill = tone === 'good' ? c.good : c.accent;
  const idle = tone === 'good' ? c.chipLine : c.surface3;
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [tone === 'good' ? c.surface : 'rgba(0,0,0,0)', fill]),
    borderColor: interpolateColor(p.value, [0, 1], [idle, fill]),
    transform: [{ scale: 1 + 0.05 * p.value }],
  }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: 24 * (1 - p.value) }));
  return (
    <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} scaleTo={0.9}
      style={{ width: Math.max(hit, size), height: Math.max(hit, size), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }, box]}>
        <Svg width={size * 0.48} height={size * 0.48} viewBox="0 0 24 24">
          <APath d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" animatedProps={tick} />
        </Svg>
      </Animated.View>
    </Pressy>
  );
}

// ---------- Shimmer skeleton ----------
export function Skeleton({ h, style }: { h: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => { t.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false); }, []);
  const a = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(Math.sin(t.value * Math.PI), [0, 1], [c.sk, c.skHi]) }));
  return <Animated.View style={[{ height: h, borderRadius: 28 }, a, style]} />;
}

// ---------- Small pill tag (filled) ----------
export function Tag({ label, bg, fg, style }: { label: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: bg }, style]}>
      <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: fg }}>{label}</Text>
    </View>
  );
}

// ---------- Small black pill button ----------
export function PillBtn({ label, onPress, tone = 'ink', icon, style, h = 36 }: { label: string; onPress?: () => void; tone?: 'ink' | 'white' | 'soft'; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; h?: number }) {
  const { c } = useTheme();
  const bg = tone === 'white' ? '#FFFFFF' : tone === 'soft' ? c.surface2 : c.ink;
  const fg = tone === 'white' ? '#0B0E14' : tone === 'soft' ? c.ink : c.bg;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={{ top: (44 - h) / 2, bottom: (44 - h) / 2 }}
      style={[{ height: h, paddingHorizontal: 14, borderRadius: h / 2, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: 5 }, style]}>
      {icon}
      <Text style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 17, color: fg }}>{label}</Text>
    </Pressy>
  );
}

// ---------- Soft ring (steps etc.) ----------
const ACircle = Animated.createAnimatedComponent(Circle);
export function Ring({ size, r, stroke, pct, color, track, delay = 200 }: { size: number; r: number; stroke: number; pct: number; color: string; track: string; delay?: number }) {
  const C = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => { p.value = withSequence(withTiming(0, { duration: delay }), withTiming(pct, { duration: 1300, easing: Easing.out(Easing.cubic) })); }, [pct]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <ACircle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${C}`} animatedProps={props} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
}

// ---------- Beating heart (wearable live) ----------
export function Beat({ children }: { children: React.ReactNode }) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withRepeat(withSequence(withTiming(1.25, { duration: 150 }), withTiming(1, { duration: 150 }), withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 550 })), -1, false);
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={a}>{children}</Animated.View>;
}

export function Glow({ color = '#7CF0C8', size = 10 }: { color?: string; size?: number }) {
  const o = useSharedValue(0.55);
  useEffect(() => { o.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true); }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }, a]} />;
}

export function HeartIcon({ size = 14, color }: { size?: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.4 3.3 5 6.6 5c2 0 3.4 1 5.4 3 2-2 3.4-3 5.4-3 3.3 0 5.5 3.4 4.1 6.8C19.5 16.4 12 21 12 21z" fill={color} /></Svg>;
}

// Close / back button for full-screen pages.
export function RoundBtn({ label, onPress, children, bg, style, glass }: { label: string; onPress: () => void; children: React.ReactNode; bg?: string; style?: StyleProp<ViewStyle>; glass?: boolean }) {
  const { c, isDark } = useTheme();
  // Glass buttons get a soft shadow so they still read on a plain page.
  const rim = glass ? { shadowColor: '#101828', shadowOpacity: isDark ? 0.35 : 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 } : null;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: glass ? 'transparent' : bg ?? c.surface2, alignItems: 'center', justifyContent: 'center' }, rim, style]}>
      {glass ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22, overflow: 'hidden' }}>
          <GlassBackdrop radius={22} tint={Platform.OS === 'web' ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)') : undefined} />
        </View>
      ) : null}
      {glass ? <View style={{ zIndex: 2 }}>{children}</View> : children}
    </Pressy>
  );
}

export const popIn = (delay: number) => withSequence(withTiming(0, { duration: delay }), withSpring(1, spring.bouncy));

// Compact unit switch (kg | lb, cm | ft + in): small centred pill, not a full-width control.
export function UnitPill<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', alignSelf: 'center', padding: 4, borderRadius: 26, backgroundColor: c.surface2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressy key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} scaleTo={0.96}
            style={{ minWidth: 72, height: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 17, letterSpacing: 0.8, color: on ? c.bg : c.muted }}>{o.label.toUpperCase()}</Text>
          </Pressy>
        );
      })}
    </View>
  );
}
