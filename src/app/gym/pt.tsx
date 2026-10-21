import React from 'react';
import { PersonAvatar } from '@/components/Brand';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button, Card, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { Hint, ListCard, SubPage } from '@/features/progress/parts';
import { PT_TOTAL } from '@/features/gym/data';
import { useGymScenarios } from '@/features/gym/state';
import { fontSizes, fixed } from '@/design-system/tokens';

export default function PersonalTraining() {
  const { d } = useDomain();
  const { state } = useStore();
  const isPT = state.sc.member === 'PT member';
  useGymScenarios('Gym · Personal training');
  return (
    <SubPage title="Personal training" fallback="/gym">
      <LinearGradient colors={[fixed.blue, '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 200, borderRadius: 26, overflow: 'hidden', justifyContent: 'flex-end', padding: 18 }}>
        <Svg width="100%" height="100%" viewBox="0 0 358 200" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', left: 0, top: 0 }}>
          <Path d="M0 170 C 90 130 180 200 260 160 S 340 150 400 170 V 900 H0z" fill={fixed.white} opacity={0.08} />
          <Circle cx={270} cy={40} r={150} fill={fixed.white} opacity={0.1} />
          <Circle cx={270} cy={40} r={90} fill={fixed.white} opacity={0.14} />
        </Svg>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 36, color: '#F4F4F6' }}>Personal{'\n'}training</Txt>
      </LinearGradient>
      <Card style={{ padding: 18, gap: 6 }}>
        <Txt style={{ fontFamily: font.semibold }}>What PT includes</Txt>
        <Txt muted style={{ fontSize: fontSizes.md }}>Personalised workout and diet · plan adjusted from your logs · regular sessions</Txt>
      </Card>
      {isPT && <ListCard rows={[{ l: 'Sessions left', v: `${d.ptLeft} of ${PT_TOTAL}` }, { l: 'Next session', v: 'Thu 25 · 6 pm' }, { l: 'Package renews', v: '30 Oct' }]} />}
      <Button label="Talk to Coach Vikram" icon={<PersonAvatar who="coach" size={26} />} onPress={() => router.push('/gym/chat')} />
      {!isPT && <Hint style={{ fontSize: fontSizes.xs }}>Shown here and at a few moments (after an assessment, a plateau, a recap), once each and dismissible. Never during a workout.</Hint>}
    </SubPage>
  );
}
