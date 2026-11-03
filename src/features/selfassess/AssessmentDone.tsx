import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from '@/lib/icons';
import { Button, Pressy, Txt } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, fixed, radii } from '@/design-system/tokens';
import { WaiverBackdrop } from '@/features/profile/WaiverBackdrop';
import { WaiverBadge } from '@/features/profile/WaiverBadge';

// Fades in while sliding up. Things on this page arrive one after another.
function Rise({ delay, from = 22, children }: { delay: number; from?: number; children: React.ReactNode }) {
  const still = useReducedMotion();
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) p.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * from }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

const COLORS = ['#CFCBFF', '#8FB2FF', '#FFFFFF', '#B9A8FF', '#FFD27A', '#7FE0B5'];

// One piece of confetti: it falls from above the screen, drifting sideways and turning, and is gone by the time it lands. It plays once.
function Piece({ i, width, height }: { i: number; width: number; height: number }) {
  const p = useSharedValue(0);
  const x0 = ((i * 53) % 100) / 100 * width;               // where it starts across the screen (a fixed spread, not random, so it is the same each time)
  const drift = (((i * 37) % 21) - 10) * 7;                 // how far it sways to the side
  const turn = 240 + ((i * 29) % 480);                      // how far it spins on the way down
  const wide = 6 + (i % 3) * 2;
  const long = 10 + (i % 4) * 3;
  useEffect(() => {
    p.value = withDelay(250 + (i % 9) * 110, withTiming(1, { duration: 2600 + (i % 5) * 380, easing: Easing.in(Easing.quad) }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({
    opacity: p.value === 0 ? 0 : p.value > 0.85 ? (1 - p.value) / 0.15 : 1,
    transform: [{ translateX: x0 + Math.sin(p.value * 9 + i) * 14 + drift * p.value }, { translateY: -30 + p.value * (height + 60) }, { rotate: `${p.value * turn}deg` }],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: wide, height: long, borderRadius: 2, backgroundColor: COLORS[i % COLORS.length] }, st]} />;
}

function Confetti() {
  const still = useReducedMotion();
  const { width, height } = useWindowDimensions();
  if (still) return null;
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>{Array.from({ length: 34 }, (_, i) => <Piece key={i} i={i} width={width} height={height} />)}</View>;
}

const BADGE = 84;

// The screen after an assessment is saved, like the signed waiver: a navy page with soft glows, the badge that pops and draws its tick,
// confetti falling once, and what the assessment showed. Two ways on: look at the results, or go back to the Assessments page.
export function AssessmentDone({ n, date, better, judged, onResults, onDone }: { n: number; date: string; better: number; judged: number; onResults: () => void; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  useEffect(() => { haptic.success(); }, []);
  const line = judged > 0 ? `${better} of ${judged} improved since the last one` : 'This is your baseline. We compare the next one with it';
  return (
    <View style={{ flex: 1, backgroundColor: fixed.dark }}>
      <WaiverBackdrop />
      <Confetti />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 }}>
        <WaiverBadge size={BADGE} />
        <Rise delay={300}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: fixed.white, textAlign: 'center' }}>Assessment completed</Txt>
            <Txt style={{ fontSize: fontSizes.base, lineHeight: 22, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Your assessment is saved</Txt>
          </View>
        </Rise>
        <Rise delay={650}>
          <View style={{ alignSelf: 'stretch', minWidth: 260, borderRadius: radii.xl, paddingVertical: 16, paddingHorizontal: 20, gap: 4, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, color: fixed.white }}>{`Assessment ${n}`}</Txt>
            <Txt style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.65)' }}>{date}</Txt>
            <Txt style={{ marginTop: 6, fontSize: fontSizes.md, lineHeight: 20, textAlign: 'center', color: fixed.white }}>{line}</Txt>
          </View>
        </Rise>
      </View>
      <Rise delay={1000} from={30}>
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 6, gap: 8 }}>
          <Button kind="white" label="View results" iconAfter={<ArrowRight size={20} color={fixed.dark} />} onPress={onResults}
            style={{ shadowColor: '#8E84F5', shadowOpacity: 0.55, shadowRadius: 22, shadowOffset: { width: 0, height: 6 }, elevation: 10 }} />
          <Pressy accessibilityRole="button" onPress={onDone} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, color: 'rgba(255,255,255,0.8)' }}>Done</Txt>
          </Pressy>
        </View>
      </Rise>
    </View>
  );
}
