import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ClipboardCheck } from '@/lib/icons';
import { Button, Card, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { ListCard, SubPage } from '@/features/progress/parts';
import { useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { Chip } from '@/design-system/primitives/Chip';
import { useSelfAssess } from '@/features/selfassess/useSelfAssess';
import { fmtAt } from '@/features/selfassess/data';

// Assessments: the next one coming up (just one) with a Start button, and the completed ones below.
// An assessment is the same thing whether the member did it or the coach did.
export default function GymAssessments() {
  const { c } = useTheme();
  useGymScenarios('Gym · Assessments');
  const { entries, nextAt, daysLeft } = useSelfAssess();
  const total = entries.length;
  return (
    <SubPage title="Assessments" fallback="/gym">
      <Txt v="label" style={{ paddingHorizontal: 6 }}>UPCOMING</Txt>
      <Card style={{ padding: 16, gap: 14 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge size={48} radius={radii.md} bg={c.accentSoft}><ClipboardCheck size={24} strokeWidth={1.9} color={c.accentText} /></IconBadge>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{`Assessment ${total + 1}`}</Txt>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{daysLeft <= 0 ? 'Due now' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}</Txt>
          </View>
          <Chip label={fmtAt(new Date(nextAt).toISOString())} tone={daysLeft <= 0 ? 'warn' : 'default'} />
        </Row>
        {/* Start shows up on the day of the assessment (and after it, until it is done) */}
        {daysLeft <= 0
          ? <Button kind="accent" label="Start" onPress={() => router.push('/gym/self-assessment')} />
          : <Txt muted style={{ fontSize: fontSizes.md }}>{`You can start it on ${fmtAt(new Date(nextAt).toISOString())}.`}</Txt>}
      </Card>

      <Txt v="label" style={{ paddingHorizontal: 6 }}>COMPLETED</Txt>
      <ListCard rows={entries.map((e, i) => ({ l: `Assessment ${total - i}`, sub: fmtAt(e.at), onPress: () => router.push({ pathname: '/gym/self-assessment', params: { id: e.id } }) }))} />
    </SubPage>
  );
}
