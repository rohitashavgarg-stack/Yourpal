import React from 'react';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { Button, Card, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { ASSESS_ROWS } from '@/features/progress/data';
import { Hint, ListCard, SubPage } from '@/features/progress/parts';
import { progressStore } from '@/features/progress/store';
import { useProgressScenarios } from '@/features/progress/scenarios';

const FIRST_ROWS = [{ l: 'Weight', v: '74.5 kg' }, { l: 'Waist', v: '92 cm' }, { l: 'Body fat', v: '27%' }, { l: 'Squat', v: '40 kg' }, { l: 'Deep squat hold', v: '30 s' }];

export default function ProgressAssessments() {
  const { d } = useDomain();
  const { state } = useStore();
  const ps = progressStore.use();
  useProgressScenarios('Progress · Assessments');
  const isNew = ps.data === 'New member' || d.assess === 'None yet';
  const onlyFirst = d.assess === 'Only first';
  const isPT = state.sc.member === 'PT member';
  return (
    <SubPage title="Assessments" fallback="/progress">
      {isNew ? (
        <Animated.View entering={fade()}>
          <Card style={{ padding: 24, gap: 8, alignItems: 'center' }}>
            <Txt style={{ fontFamily: font.display, fontSize: 20, lineHeight: 26 }}>First assessment</Txt>
            <Txt muted style={{ textAlign: 'center' }}>Sat 10:00 am with Coach Vikram. Your starting point is saved there.</Txt>
          </Card>
        </Animated.View>
      ) : (
        <Animated.View entering={fade()} style={{ gap: 12 }}>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>{onlyFirst ? 'Starting point: 2 Sep' : 'Starting point: 2 Sep · Latest: 30 Sep'}</Txt>
          <ListCard mono rows={onlyFirst ? FIRST_ROWS : ASSESS_ROWS} />
        </Animated.View>
      )}
      <Card style={{ padding: 18, gap: 4 }}>
        <Txt style={{ fontFamily: font.semibold }}>{d.assess === 'Due now' ? 'Reassessment due this week' : isNew ? 'First assessment · Sat 10:00 am' : 'Next reassessment'}</Txt>
        <Txt muted style={{ fontSize: 14 }}>{onlyFirst ? 'Tue 30 Sep with Coach Vikram · book with front desk' : 'This week with Coach Vikram · book with front desk'}</Txt>
      </Card>
      {!isPT && <Button kind="outline" label="Talk to Coach about PT" onPress={() => router.push('/gym/pt')} style={{ borderStyle: 'dashed' }} />}
      <Button kind="secondary" label="See full assessment in Gym" onPress={() => router.push('/gym/assessments')} />
      <Hint>Only you and your trainer see this.</Hint>
    </SubPage>
  );
}
