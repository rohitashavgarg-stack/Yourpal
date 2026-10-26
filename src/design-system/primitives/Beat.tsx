import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

// ---------- Beating heart (wearable live) ----------
export function Beat({ children }: { children: React.ReactNode }) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withRepeat(withSequence(withTiming(1.25, { duration: 150 }), withTiming(1, { duration: 150 }), withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 550 })), -1, false);
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={a}>{children}</Animated.View>;
}
