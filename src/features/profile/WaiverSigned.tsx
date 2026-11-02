import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from '@/lib/icons';
import { Button, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, fixed } from '@/design-system/tokens';
import { goBack } from '@/features/shell/parts';
import { Signature } from '@/features/profile/Signature';
import { WaiverBackdrop } from '@/features/profile/WaiverBackdrop';
import { WaiverBadge } from '@/features/profile/WaiverBadge';
import { WaiverIllustration, WAIVER_ART } from '@/features/profile/WaiverIllustration';
import { WAIVER_GYM, fmtSigned } from '@/features/profile/waiver';

type Sig = { signedAt: string; path: string; w: number; h: number };

// Fades in while sliding up. Things on this page arrive one after another.
function Rise({ delay, from = 22, children }: { delay: number; from?: number; children: React.ReactNode }) {
  const still = useReducedMotion();
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * from }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

// One small spark that flies out from the badge and fades.
function Spark({ angle, dist, size, color, delay }: { angle: number; dist: number; size: number; color: string; delay: number }) {
  const still = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({
    opacity: p.value === 0 ? 0 : 1 - p.value,
    transform: [{ translateX: Math.cos(angle) * dist * p.value }, { translateY: Math.sin(angle) * dist * p.value }, { scale: 1 - p.value * 0.6 }],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, st]} />;
}

const SPARK_COLORS = ['#CFCBFF', '#8FB2FF', '#FFFFFF', '#B9A8FF'];

// The tilted sheets. The member's own signature sits on the line of the front sheet. The whole stack slides up, settles, then floats gently.
function Paper({ sig, width }: { sig: Sig; width: number }) {
  const still = useReducedMotion();
  const enter = useSharedValue(still ? 1 : 0);
  const float = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    enter.value = withDelay(700, withSpring(1, { damping: 12, stiffness: 90 }));
    float.value = withDelay(1500, withRepeat(withSequence(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })), -1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.5),
    transform: [{ translateY: (1 - enter.value) * 70 - float.value * 6 }, { rotate: `${(1 - enter.value) * 6}deg` }],
  }));
  const s = width / WAIVER_ART.w;
  const sigW = 112 * s;
  const sigH = (sigW * sig.h) / sig.w;
  return (
    <Animated.View style={[{ width, height: WAIVER_ART.h * s }, st]}>
      <WaiverIllustration width={width} />
      {/* the signature stands on the line at the bottom of the front sheet, tilted -5 degrees like the sheet */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 46 * s, top: 279 * s - sigH, width: sigW, height: sigH, transformOrigin: 'left bottom', transform: [{ rotate: '-5deg' }] } as any}>
        <Signature d={sig.path} w={sig.w} h={sig.h} color={fixed.dark} />
      </View>
    </Animated.View>
  );
}

// The screen after signing: a navy page with soft glows, a badge that pops and draws its tick, sparks, the signed paper floating up, and a button back to Today.
export function WaiverSigned({ sig }: { sig: Sig }) {
  const insets = useSafeAreaInsets();
  useEffect(() => { haptic.success(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: fixed.dark }}>
      <WaiverBackdrop />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, alignItems: 'flex-start' }}>
        <RoundBtn label="Back" onPress={() => goBack('/profile')} glass><ChevronLeft size={22} color={fixed.white} /></RoundBtn>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 104, height: 104, alignItems: 'center', justifyContent: 'center' }}>
            <WaiverBadge size={104} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 52, top: 52, width: 0, height: 0 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <Spark key={i} angle={(i / 12) * Math.PI * 2} dist={i % 2 ? 78 : 104} size={i % 3 ? 5 : 7} color={SPARK_COLORS[i % SPARK_COLORS.length]} delay={380 + (i % 4) * 40} />
              ))}
            </View>
          </View>
          <Rise delay={300}>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Txt accessibilityRole="header" style={{ fontFamily: font.bold, fontSize: 26, lineHeight: 34, color: fixed.white }}>Waiver Signed</Txt>
              <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, textAlign: 'center', color: 'rgba(255,255,255,0.65)', paddingHorizontal: 40 }}>
                {'Your waiver for '}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: fixed.white }}>{WAIVER_GYM}</Txt>{` is signed and saved on ${fmtSigned(sig.signedAt)}`}
              </Txt>
            </View>
          </Rise>
        </View>
        <Paper sig={sig} width={236} />
      </View>
      <Rise delay={1000} from={30}>
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 6 }}>
          <Button kind="white" size="tight" label="Go to Dashboard" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Rise>
    </View>
  );
}
