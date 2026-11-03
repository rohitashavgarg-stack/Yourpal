import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, ClipboardCheck } from '@/lib/icons';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { Chip } from '@/design-system/primitives/Chip';
import { useSelfAssess } from '@/features/selfassess/useSelfAssess';
import { NUMS, NumKey, SelfEntry, compare, fmtAt } from '@/features/selfassess/data';

// A finished assessment: its number and date, how it went compared with the one before, and the numbers that matter most.
function DoneCard({ n, e, prev }: { n: number; e: SelfEntry; prev: SelfEntry | undefined }) {
  const { c } = useTheme();
  const judged = compare(e, prev).filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const headline = !prev ? 'Your baseline' : judged.length ? `${better} of ${judged.length} improved` : 'Saved';
  const stats = (['weight', 'waist', 'pulse', 'bench'] as NumKey[]).filter((k) => e.tests[k] != null).slice(0, 3);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Assessment ${n}, ${fmtAt(e.at)}. ${headline}`} onPress={() => router.push({ pathname: '/gym/self-assessment', params: { id: e.id } })} scaleTo={0.985}
      style={{ borderRadius: radii.xl, backgroundColor: c.surface, padding: 16, gap: 14 }}>
      <Row style={{ gap: 12 }}>
        <IconBadge size={44} radius={radii.md} bg={c.tNutri}><ClipboardCheck size={22} strokeWidth={1.9} color={c.cNutri} /></IconBadge>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{`Assessment ${n}`}</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{fmtAt(e.at)}</Txt>
        </View>
        <ChevronRight size={18} color={c.muted} />
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 33, color: prev && judged.length && better > 0 ? c.good : c.ink }}>{headline}</Txt>
      {stats.length > 0 && (
        <Row style={{ gap: 8 }}>
          {stats.map((k) => (
            <View key={k} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface2, paddingVertical: 10, paddingHorizontal: 12, gap: 1 }}>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{NUMS[k].label}</Txt>
              <Txt style={{ fontFamily: font.semibold }}>{`${e.tests[k]} ${NUMS[k].unit}`}</Txt>
            </View>
          ))}
        </Row>
      )}
    </Pressy>
  );
}

// Assessments: the next one coming up (just one) with a Start button, and the completed ones below.
// An assessment is the same thing whether the member did it or the coach did.
export default function GymAssessments() {
  const { c } = useTheme();
  useGymScenarios('Gym · Assessments');
  const { entries, nextAt, daysLeft } = useSelfAssess();
  const total = entries.length;
  const over = daysLeft <= 0; // due today or past its date: the card turns yellow and the button is the big one
  return (
    <SubPage title="Assessments" fallback="/gym">
      <Txt v="label" style={{ paddingHorizontal: 6 }}>UPCOMING</Txt>
      <Card style={{ padding: 16, gap: 14, ...(over ? { backgroundColor: c.warnSoft } : null) }}>
        <Row style={{ gap: 12 }}>
          <IconBadge size={48} radius={radii.md} bg={over ? c.warn + '33' : c.accentSoft}><ClipboardCheck size={24} strokeWidth={1.9} color={over ? c.warn : c.accentText} /></IconBadge>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{`Assessment ${total + 1}`}</Txt>
            <Txt v="caption" style={{ fontSize: fontSizes.sm, ...(over ? { color: c.warn, fontFamily: font.semibold } : null) }}>{daysLeft < 0 ? `Overdue by ${-daysLeft} ${daysLeft === -1 ? 'day' : 'days'}` : daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}</Txt>
          </View>
          <Chip label={fmtAt(new Date(nextAt).toISOString())} tone={daysLeft <= 0 ? 'warn' : 'default'} />
        </Row>
        {/* Start shows up on the day of the assessment (and after it, until it is done) */}
        {daysLeft <= 0
          ? <Button kind="warn" label="Start assessment" onPress={() => router.push('/gym/self-assessment')} />
          : <Txt muted style={{ fontSize: fontSizes.md }}>{`You can start it on ${fmtAt(new Date(nextAt).toISOString())}.`}</Txt>}
      </Card>

      <Txt v="label" style={{ paddingHorizontal: 6 }}>COMPLETED</Txt>
      {entries.map((e, i) => <DoneCard key={e.id} n={total - i} e={e} prev={entries[i + 1]} />)}
    </SubPage>
  );
}
