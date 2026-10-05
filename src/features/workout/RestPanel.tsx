import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { fade, fadeOut } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Button, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { mmss } from '@/lib/useNow';

const ACircle = Animated.createAnimatedComponent(Circle);
const R = 19;
const C = 2 * Math.PI * R;

// Slim rest bar. It only counts down: +30 s and Skip are the only controls, so it can't be mistaken for a sheet to edit.
export function RestPanel({ rest, now, onAdd30, onSkip, onDone, docked }: { rest: { endAt: number; total: number }; now: number; onAdd30: () => void; onSkip: () => void; onDone: () => void; docked?: boolean }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const left = Math.max(0, (rest.endAt - now) / 1000);
  const finished = left <= 0;
  const p = useSharedValue(1 - left / rest.total);
  const beat = useSharedValue(1);
  const doneT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Smooth ring: animate linearly to full over the time that's left.
  useEffect(() => {
    const l = Math.max(0, rest.endAt - Date.now());
    p.value = 1 - l / 1000 / rest.total;
    p.value = withTiming(1, { duration: l, easing: Easing.linear });
  }, [rest.endAt, rest.total]);
  const last5 = left <= 5 && !finished;
  useEffect(() => {
    if (last5) beat.value = withRepeat(withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })), -1, false);
    else if (!finished) { cancelAnimation(beat); beat.value = withTiming(1); }
  }, [last5]);
  useEffect(() => {
    if (!finished) return;
    haptic.success();
    beat.value = withSequence(withTiming(0.85, { duration: 1 }), withSpring(1, { damping: 6, stiffness: 260 }));
    doneT.current = setTimeout(onDone, 1500);
    return () => clearTimeout(doneT.current);
  }, [finished]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: C * p.value }));
  const ringBox = useAnimatedStyle(() => ({ transform: [{ scale: beat.value }] }));

  return (
    <Animated.View entering={fade()} exiting={fadeOut()} accessibilityLabel={finished ? 'Rest done' : `Rest timer, ${mmss(left)} left`} accessibilityLiveRegion="polite"
      style={{ ...(docked ? null : { position: 'absolute', left: 12, right: 12, bottom: Math.max(insets.bottom, 12) + 4 }), minHeight: 68, borderRadius: 26, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line,
        flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14, paddingRight: 10, paddingVertical: 10,
        shadowColor: '#000', shadowOpacity: isDark ? 0.5 : 0.16, shadowRadius: 26, shadowOffset: { width: 0, height: 10 }, elevation: 14 }}>
      <Animated.View style={[{ width: 44, height: 44 }, ringBox]}>
        <Svg width={44} height={44} viewBox="0 0 44 44">
          <Circle cx={22} cy={22} r={R} fill="none" stroke={c.surface3} strokeWidth={5} />
          <ACircle cx={22} cy={22} r={R} fill="none" stroke={c.accent} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${C}`} animatedProps={ring} transform="rotate(-90 22 22)" />
        </Svg>
      </Animated.View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 33 }}>{finished ? 'Go' : mmss(left)}</Txt>
        <Txt v="caption">{finished ? 'Rest done' : 'Rest'}</Txt>
      </View>
      <Button kind="secondary" small label="+30 s" onPress={onAdd30} style={{ paddingHorizontal: 14 }} />
      <Button kind="secondary" small label="Skip" onPress={onSkip} style={{ paddingHorizontal: 14 }} />
    </Animated.View>
  );
}
