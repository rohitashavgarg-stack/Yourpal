import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { NumKey, compare, fmtAt, habitLabel, useAssessments } from '@/features/gym/assessmentData';

// The groups the measurements are shown in, each with the colour of its dot.
const GROUPS: { g: string; tone: 'nutri' | 'act' | 'heart'; keys: NumKey[] }[] = [
  { g: 'Body', tone: 'nutri', keys: ['height', 'weight', 'fat', 'chest', 'waist', 'hip', 'arms', 'legs', 'calves'] },
  { g: 'Strength and fitness', tone: 'act', keys: ['bench', 'legpress', 'breath'] },
  { g: 'Health', tone: 'heart', keys: ['sleep', 'sys', 'dia', 'pulse', 'sugar'] },
];

// One finished assessment, view only: the trainer recorded it. How many improved since the one before, then the measurements in three groups,
// then what the trainer noted about the member.
export default function Assessment() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries } = useAssessments();
  const i = Math.max(0, entries.findIndex((e) => e.id === id));
  const entry = entries[i];
  const prev = entries[i + 1];
  const n = entries.length - i;
  const rows = compare(entry, prev);
  const judged = rows.filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const habits = Object.entries(entry.answers).filter(([k, v]) => v && habitLabel[k]);
  const dot = { nutri: c.cNutri, act: c.cAct, heart: c.cHeart };
  return (
    <SubPage title={`Assessment ${n}`} fallback="/gym/assessments">
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <Chip label={`${fmtAt(entry.at)}, with Coach Vikram`} />
        {judged.length > 0 && <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 30 }}>{`${better} of ${judged.length} improved`}</Txt>}
        <Txt muted style={{ fontSize: fontSizes.md }}>{prev ? 'Compared with the assessment before' : 'Your baseline. The next one is compared with this.'}</Txt>
      </View>

      {GROUPS.map((grp) => {
        const list = rows.filter((r) => grp.keys.includes(r.k));
        if (!list.length) return null;
        return (
          <View key={grp.g} style={{ backgroundColor: c.surface, borderRadius: radii.xl, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }}>
            <Row style={{ gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: dot[grp.tone] }} /><Txt v="label">{grp.g}</Txt></Row>
            {list.map((r, k) => (
              <Row key={r.k} style={{ minHeight: 56, gap: 8, alignItems: 'center', borderBottomWidth: k < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <Txt style={{ flex: 1, fontFamily: font.medium }} numberOfLines={1}>{r.n.label}</Txt>
                {/* the value and the change each have a column of their own, so every row lines up */}
                <View style={{ width: 112, alignItems: 'flex-end' }}><Txt v="mono" numberOfLines={1}>{r.prev != null ? `${r.prev} → ${r.now}` : `${r.now} ${r.n.unit}`}</Txt></View>
                <View style={{ width: 62, alignItems: 'flex-end' }}>
                  {r.prev != null && <Tag label={r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`} bg={r.good ? c.goodSoft : c.surface2} fg={r.good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
                </View>
              </Row>
            ))}
          </View>
        );
      })}

      {habits.length > 0 && (
        <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 16, gap: 10 }}>
          <Txt v="label">NOTED BY YOUR TRAINER</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {habits.map(([k, v]) => <Chip key={k} label={`${habitLabel[k]}: ${v}`} />)}
          </Row>
        </View>
      )}
      <View style={{ height: 80 }} />
    </SubPage>
  );
}
