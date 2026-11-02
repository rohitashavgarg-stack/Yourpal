import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft } from '@/lib/icons';
import { Button, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, fixed, radii } from '@/design-system/tokens';
import { goBack } from '@/features/shell/parts';
import { Signature } from '@/features/profile/Signature';
import { WAIVER_GYM, fmtSigned } from '@/features/profile/waiver';

type Sig = { signedAt: string; path: string; w: number; h: number };

// Colours of the paper illustration. The paper is white in both themes, so these do not follow the theme.
const PAPER = { head: '#D9DEE3', bar: '#E8EBEF', text: '#555F6D', dash: '#9AA3AE' };

// A skeleton paragraph: a short heading bar and four lines of text.
function Block() {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ width: 84, height: 6, borderRadius: 3, backgroundColor: PAPER.head }} />
      <View style={{ gap: 2, opacity: 0.85 }}>
        {[208, 192, 199, 42].map((w, i) => <View key={i} style={{ width: w, height: 4, borderRadius: 2, backgroundColor: PAPER.bar }} />)}
      </View>
    </View>
  );
}

// Three sheets of paper, tilted. The front one shows the member's own signature.
function Paper({ sig }: { sig: Sig }) {
  return (
    <View style={{ width: 320, height: 350 }}>
      <View style={{ position: 'absolute', left: 104, top: 44, width: 187, height: 252, borderRadius: 11, backgroundColor: fixed.white + '1A', transform: [{ rotate: '9deg' }] }} />
      <View style={{ position: 'absolute', left: 78, top: 32, width: 186, height: 257, borderRadius: 11, backgroundColor: fixed.white + '4D', transform: [{ rotate: '1deg' }] }} />
      <View style={{ position: 'absolute', left: 30, top: 22, width: 225, height: 300, borderRadius: 11, backgroundColor: fixed.white, overflow: 'hidden', transform: [{ rotate: '-5deg' }], shadowColor: fixed.black, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        <Txt style={{ position: 'absolute', left: 14, top: 18, fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 20, letterSpacing: 0.4, color: PAPER.head }}>WAIVER AGREEMENT</Txt>
        <Svg width={225} height={4} style={{ position: 'absolute', left: 0, top: 52 }}>
          <Line x1="0" y1="2" x2="225" y2="2" stroke={PAPER.dash} strokeWidth={1.5} strokeDasharray="3 3" />
        </Svg>
        <View style={{ position: 'absolute', left: 8, top: 66, gap: 14 }}>
          <Block /><Block /><Block />
        </View>
        <View style={{ position: 'absolute', left: 16, top: 186, width: 130 }}>
          <Signature d={sig.path} w={sig.w} h={sig.h} color={fixed.dark} />
        </View>
        <View style={{ position: 'absolute', left: 16, right: 60, top: 272 }}>
          <View style={{ height: 1.5, backgroundColor: PAPER.head, marginBottom: 3 }} />
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: PAPER.text }}>Your Signature</Txt>
        </View>
      </View>
    </View>
  );
}

// The screen after signing: a dark blue page, a check badge, "Waiver Signed", the signed paper and a button back to Today.
export function WaiverSigned({ sig }: { sig: Sig }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: fixed.dark }}>
      <LinearGradient pointerEvents="none" colors={[c.accent + '8C', fixed.dark]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, alignItems: 'flex-start' }}>
        <RoundBtn label="Back" onPress={() => goBack('/profile')} glass><ChevronLeft size={22} color={fixed.white} /></RoundBtn>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <LinearGradient colors={[c.accentText, c.accent]} style={{ width: 72, height: 72, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', shadowColor: c.accent, shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: radii.pill, backgroundColor: fixed.dark, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={28} color={fixed.white} strokeWidth={2.6} />
            </View>
          </LinearGradient>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.bold, fontSize: 24, lineHeight: 34, color: fixed.white }}>Waiver Signed</Txt>
            <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              {'Your waiver for '}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: fixed.white }}>{WAIVER_GYM}</Txt>{` is signed on ${fmtSigned(sig.signedAt)}`}
            </Txt>
          </View>
        </View>
        <Paper sig={sig} />
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 6 }}>
        <Button kind="white" size="tight" label="Go to Dashboard" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}
