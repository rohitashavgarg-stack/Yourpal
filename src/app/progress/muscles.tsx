import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { MuscleRow } from '@/features/progress/MuscleRow';
import { MuscleName } from '@/design-system/primitives/MuscleBody';
import { MuscleRings } from '@/design-system/primitives/MuscleRings';
import { SubPage } from '@/features/progress/parts';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { musclesFor } from '@/features/progress/muscles';
import { progressStore } from '@/features/progress/store';
import { RangeBar } from '@/features/progress/TrendUI';

// Every muscle group with its sets against the target: the rings first, then one row of capsules for each muscle.
export default function Muscles() {
  const { c } = useTheme();
  const p = progressStore.use().range; // the same Day, Week, Month, Year switch and date row as the other Progress pages
  const g = musclesFor(p);
  const done = g.reduce((a, x) => a + x.done, 0);
  const target = g.reduce((a, x) => a + x.target, 0);
  return (
    <SubPage title="Muscles trained" fallback="/progress" backdrop={<TopGlow color={c.accent} />}>
      <Txt v="caption" style={{ textAlign: 'center', fontSize: fontSizes.sm, lineHeight: 19 }}>{`${done} of ${target} sets`}</Txt>
      <RangeBar />
      <View style={{ alignItems: 'center', paddingVertical: 8 }}><MuscleRings groups={g} size={280} /></View>
      <View style={{ gap: 18, paddingTop: 6 }}>
        {g.map((x) => <MuscleRow key={x.name} name={x.name as MuscleName} done={x.done} target={x.target} />)}
      </View>
    </SubPage>
  );
}
