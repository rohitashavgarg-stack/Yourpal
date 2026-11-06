import React from 'react';
import { router } from 'expo-router';
import { Row, Txt } from '@/components/ui';
import { Dumbbell } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { MuscleRings } from '@/design-system/primitives/MuscleRings';
import { View } from 'react-native';
import { CardTitle, CornerGlow, PCard } from '@/features/progress/parts';
import { musclesFor, musclesOpen, musclesTrained } from '@/features/progress/muscles';

// The Muscles trained card on Progress: how many muscle groups have been trained this week, then the rings. Opens the page with every muscle.
export function MusclesCard() {
  const { c } = useTheme();
  const g = musclesFor('week');
  const open = musclesOpen(g);
  const line = open.length === 0 ? 'Every muscle group is trained this week' : `${open.join(' and ')} ${open.length === 1 ? 'is' : 'are'} still open this week`;
  return (
    <PCard onPress={() => router.push('/progress/muscles')} label={`Muscles trained. ${musclesTrained(g)} of ${g.length} muscle groups this week. ${line}. Open`} style={{ overflow: 'hidden' }}>
      <CornerGlow color={c.accent} />
      <CardTitle title="Muscles trained" icon={<Dumbbell size={16} color={c.accent} />} tint={c.accent} />
      {/* the same number style as the Weight, Consistency and Diet cards, then one quiet line under it with the card's normal gap */}
      <View style={{ gap: 2 }}>
        <Row style={{ alignItems: 'baseline', columnGap: 8 }}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.6 }}>{musclesTrained(g)} of {g.length}</Txt>
          {/* the same small grey text as "Average" beside the number on the Weight card */}
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>muscle groups</Txt>
        </Row>
        <Txt v="caption" style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{line}</Txt>
      </View>
      <View style={{ alignItems: 'center', marginTop: 6 }}><MuscleRings groups={g} /></View>
    </PCard>
  );
}
