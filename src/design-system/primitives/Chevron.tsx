import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { spring } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export type ChevronProps = {
  /** Open turns the chevron half a turn. */
  open: boolean;
  /** How it turns: a 300 ms timing (plans) or the snappy spring (Today meals). */
  motion?: 'timing' | 'spring';
  size?: number;
};

/** A down chevron that turns over when a row opens. Used by the meal accordions. */
export function Chevron({ open, motion = 'timing', size = 18 }: ChevronProps) {
  const { c } = useTheme();
  const r = useSharedValue(open ? 180 : 0);
  useEffect(() => { r.value = motion === 'spring' ? withSpring(open ? 180 : 0, spring.snappy) : withTiming(open ? 180 : 0, { duration: 300 }); }, [open]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={a}><ChevronDown size={size} color={c.muted} /></Animated.View>;
}
