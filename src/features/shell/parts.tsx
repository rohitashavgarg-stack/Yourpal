import React, { useEffect } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ChevronRight } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
// Not imported from GymHeader to avoid a require cycle (GymHeader -> Switcher -> parts).
import { GymLogoMark } from '@/components/Brand';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import type { Programme } from './state';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { goBack, SubPage } from '@/design-system/primitives/SubPage';
import { ListCard } from '@/design-system/primitives/ListCard';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { SectionLabel as Label } from '@/design-system/primitives/SectionLabel';

export const goHome = () => (router.canDismiss() ? router.dismissAll() : router.replace('/(tabs)'));


// Programme logo: Wulf Fitness uses the real logo, others a coloured letter.
export function ProgLogo({ p, size = 44 }: { p: Pick<Programme, 'id' | 'logo' | 'color'>; size?: number }) {
  if (p.id === 'gold') return <GymLogoMark size={size} />;
  return (
    <IconBadge size={size} bg={p.color} style={{ flexShrink: 0 }}>
      <Text style={{ color: fixed.white, fontFamily: font.bold, fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.52) }}>{p.logo}</Text>
    </IconBadge>
  );
}

// iOS-style switch (52×32 visual, 44 px min hit area).
export function Switch({ on, onChange, label, locked }: { on: boolean; onChange?: (v: boolean) => void; label: string; locked?: boolean }) {
  const { c } = useTheme();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: 220 }); }, [on]);
  const x = useSharedValue(on ? 20 : 0);
  useEffect(() => { x.value = withSpring(on ? 20 : 0, spring.snappy); }, [on]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.value, [0, 1], [c.surface3, c.good]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressy accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on, disabled: !!locked }} disabled={locked} haptics={!locked}
      onPress={() => onChange?.(!on)} scaleTo={0.94} hitSlop={6} style={{ opacity: locked ? 0.55 : 1 }}>
      <Animated.View style={[{ width: 52, height: 32, borderRadius: radii.md, padding: 3 }, track]}>
        <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: fixed.white, shadowColor: fixed.black, shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }, knob]} />
      </Animated.View>
    </Pressy>
  );
}

// A row with a title, optional subtitle and trailing control. Hairline between rows.
export function LineRow({ title, sub, right, onPress, color, last, minH = 60, a11yHint }: { title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; color?: string; last?: boolean; minH?: number; a11yHint?: string }) {
  const { c } = useTheme();
  const body = (
    <>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt style={{ fontFamily: font.medium, color: color ?? c.ink }}>{title}</Txt>
        {sub ? <Txt v="caption">{sub}</Txt> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={c.muted} /> : null)}
    </>
  );
  const st: ViewStyle = { minHeight: minH, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line };
  if (!onPress) return <View style={st}>{body}</View>;
  return <Pressy accessibilityRole="button" accessibilityLabel={sub ? `${title}, ${sub}` : title} accessibilityHint={a11yHint} onPress={onPress} scaleTo={0.985} style={st}>{body}</Pressy>;
}



export function Note({ children, tone = 'plain', center, style }: { children: React.ReactNode; tone?: 'plain' | 'soft' | 'warn' | 'good'; center?: boolean; style?: any }) {
  const { c } = useTheme();
  if (tone === 'plain') return <Txt muted style={[{ fontSize: fontSizes.xs, textAlign: center ? 'center' : 'left', paddingHorizontal: 6 }, style]}>{children}</Txt>;
  const bg = tone === 'warn' ? c.warnSoft : tone === 'good' ? c.goodSoft : c.surface2;
  const fg = tone === 'warn' ? c.warn : tone === 'good' ? c.good : c.muted;
  return (
    <View style={[{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: bg }, style]}>
      <Txt style={{ fontSize: fontSizes.md, color: fg }}>{children}</Txt>
    </View>
  );
}

// Horizontal shake for inline validation errors (feedback, not an entering animation).
export function useShake(trigger: number) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (!trigger) return;
    haptic.error();
    x.value = withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 80 }), withTiming(-4, { duration: 80 }), withTiming(0, { duration: 60 }));
  }, [trigger]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

// These three moved to src/design-system/primitives/ (SubPage, ListCard, SectionLabel). Re-exported here so every existing import keeps working.
export { goBack, SubPage, ListCard, Label };
