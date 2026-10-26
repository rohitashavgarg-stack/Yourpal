import React, { useEffect } from 'react';
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';
import { Pressy } from './Pressy';

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
          <APath d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={fixed.white} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" animatedProps={tick} />
        </Svg>
      </Animated.View>
    </Pressy>
  );
}
