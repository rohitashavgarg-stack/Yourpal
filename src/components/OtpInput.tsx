import React, { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';

// Six boxes over a single hidden input: works with paste, SMS autofill and keyboards.
export function OtpInput({ value, onChange, state, shakeKey, autoFocus }: { value: string; onChange: (v: string) => void; state: 'idle' | 'error' | 'ok' | 'locked'; shakeKey: number; autoFocus?: boolean }) {
  const { c } = useTheme();
  const ref = useRef<TextInput>(null);
  const x = useSharedValue(0);
  useEffect(() => {
    if (!shakeKey) return;
    x.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 60 }), withTiming(-7, { duration: 60 }), withTiming(7, { duration: 60 }), withTiming(0, { duration: 50 }));
  }, [shakeKey]);
  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressable accessibilityLabel="Verification code" onPress={() => ref.current?.focus()}>
      <Animated.View style={[{ flexDirection: 'row', gap: 8 }, shake]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} d={value[i] ?? ''} cur={i === value.length && state !== 'ok' && state !== 'locked'} state={state} delay={i * 40} />
        ))}
      </Animated.View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        editable={state !== 'locked' && state !== 'ok'}
        maxLength={6}
        accessibilityLabel="Enter the 6-digit code"
        style={{ position: 'absolute', opacity: 0.01, width: '100%', height: '100%', color: 'transparent' } as any}
        caretHidden
      />
    </Pressable>
  );

}

function Box({ d, cur, state: st }: { d: string; cur: boolean; state: string; delay?: number }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => { if (d) { s.value = withSequence(withTiming(1.08, { duration: 80 }), withSpring(1, spring.bouncy)); } }, [d]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const border = st === 'error' ? c.warn : st === 'ok' ? c.good : cur ? c.accent : d ? c.ink : c.line;
  const bg = st === 'ok' ? c.goodSoft : c.surface;
  return (
    <Animated.View style={[{ flex: 1, height: 58, borderRadius: 18, borderWidth: cur || st !== 'idle' ? 2 : 1, borderColor: border, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, a]}>
      <Text style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, color: st === 'ok' ? c.good : c.ink }}>{d}</Text>
    </Animated.View>
  );
  }
