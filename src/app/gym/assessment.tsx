import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Activity, Check, ClipboardList, Droplets, Dumbbell, Heart, Medal, PersonStanding, ShieldCheck } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { radii, fontSizes, round } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { NUMS, NumKey, compare, fmtAt, habitLabel, useAssessments } from '@/features/gym/assessmentData';

// The groups the measurements are shown in, each with its own icon. The heading sits above its card, not inside it.
const GROUPS: { g: string; short: string; Icon: typeof PersonStanding; keys: NumKey[] }[] = [
  { g: 'Body', short: 'Body', Icon: PersonStanding, keys: ['height', 'weight', 'fat', 'chest', 'waist', 'hip', 'arms', 'legs', 'calves'] },
  { g: 'Strength and fitness', short: 'Strength', Icon: Dumbbell, keys: ['bench', 'legpress', 'breath'] },
  { g: 'Health', short: 'Health', Icon: Heart, keys: ['sleep', 'sys', 'dia', 'pulse', 'sugar'] },
];
const KEY_STATS: NumKey[] = ['weight', 'waist', 'pulse']; // the three numbers shown big at the top

// The trainer's notes: each one has its own icon.
const HABIT_ICON: Record<string, typeof Activity> = { activity: Activity, freq: Dumbbell, water: Droplets, level: Medal, flex: PersonStanding, injuries: ShieldCheck };

// A change since the assessment before: green when it is better, quiet grey when it is the same or not better. Never red.
function Change({ diff, good }: { diff: number; good: boolean }) {
  const { c } = useTheme();
  return <Tag label={diff === 0 ? 'Same' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)}`} bg={good ? c.goodSoft : c.surface2} fg={good ? c.good : c.muted} style={{ minWidth: 56, alignItems: 'center' }} />;
}

// One finished assessment, view only: the trainer recorded it. Who did it and when, the three key numbers with how they changed, the measurements in three
// groups (the heading above each card), then what the trainer noted. One calm dark page: green only where something got better.
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
  const compared = rows.some((r) => r.prev != null); // the change column only exists when there is an assessment before this one
  const habits = Object.entries(entry.answers).filter(([k, v]) => v && habitLabel[k]);
  const keyRows = KEY_STATS.map((k) => rows.find((r) => r.k === k)).filter((r): r is (typeof rows)[number] => !!r);
  const counts = GROUPS.map((grp) => ({ short: grp.short, n: rows.filter((r) => grp.keys.includes(r.k)).length })).filter((x) => x.n > 0);
  return (
    <SubPage title={`Assessment ${n}`} fallback="/gym/assessments">
      {/* who did it and when */}
      <Row style={{ gap: 10, justifyContent: 'center', paddingTop: 4 }}>
        <PersonAvatar who="coach" size={28} />
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{`Done by Coach Vikram on ${fmtAt(entry.at)}`}</Txt>
      </Row>

      {/* the summary: the three key numbers side by side, what changed, and one line about the whole assessment */}
      <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 20, gap: 20, marginTop: 8 }}>
        <CardEdge radius={radii.xl} />
        {keyRows.length > 0 && (
          <Row style={{ alignItems: 'flex-start' }}>
            {keyRows.map((r) => (
              <View key={r.k} accessible accessibilityLabel={`${r.n.label} ${r.now} ${r.n.unit}`} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Txt v="caption" style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{r.n.label}</Txt>
                <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.8 }}>{String(r.now)}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.md, color: c.muted }}>{` ${r.n.unit}`}</Txt></Txt>
                {r.prev != null ? <Change diff={r.diff} good={r.good} /> : <View style={{ height: 22 }} />}
              </View>
            ))}
          </Row>
        )}
        {compared && judged.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Row style={{ gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: round(20), backgroundColor: c.goodSoft, alignItems: 'center', justifyContent: 'center' }}><Check size={12} color={c.good} strokeWidth={3} /></View>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20 }}>{`${better} of ${judged.length} improved`}</Txt>
              <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>since the last one</Txt>
            </Row>
            {/* one segment for each measurement that can be judged: green when it improved */}
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', gap: 4, height: 8 }}>
              {judged.map((r) => <View key={r.k} style={{ flex: 1, borderRadius: radii.pill, backgroundColor: r.good ? c.good : c.surface3 }} />)}
            </View>
          </View>
        ) : (
          <Txt muted style={{ textAlign: 'center', fontSize: fontSizes.sm, lineHeight: 19 }}>{`${rows.length} measurements: ${counts.map((x) => `${x.short} ${x.n}`).join(', ')}`}</Txt>
        )}
      </View>

      {GROUPS.map((grp) => {
        const list = rows.filter((r) => grp.keys.includes(r.k));
        if (!list.length) return null;
        return (
          <View key={grp.g} style={{ gap: 10, marginTop: 14 }}>
            <SectionLabel variant="section" icon={<grp.Icon size={20} color={c.ink} />}>{grp.g}</SectionLabel>
            <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, paddingHorizontal: 18, paddingVertical: 6 }}>
              <CardEdge radius={radii.xl} />
              {list.map((r) => (
                <Row key={r.k} style={{ minHeight: 54, gap: 10, alignItems: 'center' }}>
                  <Txt style={{ flex: 1, fontFamily: font.medium }}>{r.n.label}</Txt>
                  {/* the number with its unit, right aligned, then (only when there is an assessment before) the change in a column of its own */}
                  <Row style={{ gap: 5, alignItems: 'baseline', justifyContent: 'flex-end' }}>
                    <Txt v="mono">{r.prev != null ? `${r.prev} → ${r.now}` : String(r.now)}</Txt>
                    <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{NUMS[r.k].unit}</Txt>
                  </Row>
                  {compared && <View style={{ width: 60, alignItems: 'flex-end' }}>{r.prev != null && <Change diff={r.diff} good={r.good} />}</View>}
                </Row>
              ))}
            </View>
          </View>
        );
      })}

      {habits.length > 0 && (
        <View style={{ gap: 10, marginTop: 14 }}>
          <SectionLabel variant="section" icon={<ClipboardList size={20} color={c.ink} />}>Noted by your trainer</SectionLabel>
          <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 16 }}>
            <CardEdge radius={radii.xl} />
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              {habits.map(([k, v]) => {
                const I = HABIT_ICON[k] ?? ClipboardList;
                return <Chip key={k} filled size="lg" label={`${habitLabel[k]}: ${v}`} icon={<I size={18} color={c.ink} />} />;
              })}
            </Row>
          </View>
        </View>
      )}
      <View style={{ height: 80 }} />
    </SubPage>
  );
}
