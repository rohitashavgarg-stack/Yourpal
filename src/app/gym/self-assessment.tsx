import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from '@/lib/icons';
import { Button, Field, Pill, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { goBack } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { ProgressSegments } from '@/design-system/primitives/ProgressBar';
import { Chip } from '@/design-system/primitives/Chip';
import { QUESTIONS, SelfEntry, TESTS, compare, fmtAt } from '@/features/selfassess/data';
import { useSelfAssess } from '@/features/selfassess/useSelfAssess';

const STEPS = ['Questions', 'Measurements', 'Result'];

// The self assessment: quick questions about habits, then the measurements the member takes alone, then a result next to the last assessment.
// With an id it only shows that assessment (the member's own, or one the coach entered).
export default function SelfAssessment() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { d, set } = useDomain();
  const { entries, save, later } = useSelfAssess();
  const viewing = id ? entries.find((e) => e.id === id) : undefined;
  const [stage, setStage] = useState(viewing ? 2 : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, string>>({ weight: String(d.weight) });
  const [saved, setSaved] = useState<SelfEntry | null>(null);
  const entry = viewing ?? saved;

  const finish = () => {
    const tests: SelfEntry['tests'] = {};
    TESTS.forEach((t) => { const n = parseFloat((vals[t.k] ?? '').replace(',', '.')); if (!Number.isNaN(n) && n > 0) tests[t.k] = n; });
    const e: SelfEntry = { id: 's' + Date.now(), at: new Date().toISOString(), by: 'member', answers, tests };
    save(e);
    if (tests.weight) set({ weight: tests.weight }); // Progress reads the weight from here
    setSaved(e);
    setStage(2);
    haptic.success();
  };

  const bottom = Math.max(insets.bottom, 16) + 6;
  const footer = (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: bottom, gap: 8 }}>
      {stage === 0 && <>
        <Button kind="accent" label="Next" onPress={() => setStage(1)} />
        <Button kind="secondary" label="Maybe later" onPress={() => { later(); goBack('/gym/assessments'); }} />
      </>}
      {stage === 1 && <>
        <Button kind="accent" label="Save assessment" onPress={finish} />
        <Button kind="secondary" label="Back" onPress={() => setStage(0)} />
      </>}
      {stage === 2 && <Button kind="accent" label="Done" onPress={() => goBack('/gym/assessments')} />}
    </View>
  );

  return (
    <SubPage title="Self assessment" fallback="/gym/assessments" footer={footer}>
      {!viewing && (
        <View style={{ gap: 8 }}>
          <ProgressSegments height={6} gap={4} segments={STEPS.map((s, i) => ({ color: i <= stage ? c.accent : c.surface3, label: s }))} />
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`Step ${stage + 1} of 3, ${STEPS[stage].toLowerCase()}`}</Txt>
        </View>
      )}

      {stage === 0 && (
        <View style={{ gap: 18 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27 }}>How have the last few weeks been?</Txt>
          {QUESTIONS.map((q) => (
            <View key={q.k} style={{ gap: 8 }}>
              <Txt style={{ fontFamily: font.medium }}>{q.label}</Txt>
              <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                {q.options.map((o) => <Pill key={o} label={o} on={answers[q.k] === o} onPress={() => { setAnswers((a) => ({ ...a, [q.k]: a[q.k] === o ? '' : o })); haptic.tick(); }} />)}
              </Row>
            </View>
          ))}
        </View>
      )}

      {stage === 1 && (
        <View style={{ gap: 16 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27 }}>Your measurements</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>Fill in what you can. You can skip any of them.</Txt>
          {TESTS.map((t) => (
            <View key={t.k} style={{ gap: 6 }}>
              <Txt style={{ fontFamily: font.medium }}>{t.label}</Txt>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{t.hint}</Txt>
              <Field accessibilityLabel={t.label} value={vals[t.k] ?? ''} onChangeText={(x) => setVals((v) => ({ ...v, [t.k]: x.replace(/[^0-9.,]/g, '') }))} keyboardType="decimal-pad" placeholder={t.unit || 'Number'} prefix={t.unit || undefined} />
            </View>
          ))}
        </View>
      )}

      {stage === 2 && entry && <Result entry={entry} prev={entries.find((e) => e.id !== entry.id && Date.parse(e.at) < Date.parse(entry.at))} fresh={!viewing} />}
    </SubPage>
  );
}

function Result({ entry, prev, fresh }: { entry: SelfEntry; prev: SelfEntry | undefined; fresh: boolean }) {
  const { c } = useTheme();
  const rows = compare(entry, prev);
  const both = rows.filter((r) => r.prev != null);
  const better = both.filter((r) => r.good).length;
  const habits = Object.entries(entry.answers).filter(([, v]) => v);
  return (
    <View style={{ gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <View style={{ width: 64, height: 64, borderRadius: radii.pill, backgroundColor: c.goodSoft, alignItems: 'center', justifyContent: 'center' }}><Check size={30} color={c.good} strokeWidth={2.6} /></View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 30 }}>{fresh ? 'Saved' : entry.by === 'coach' ? 'Assessment by Coach Vikram' : 'Self assessment'}</Txt>
        <Row style={{ gap: 6 }}>
          <Chip label={fmtAt(entry.at)} />
          {entry.by === 'coach' && <Chip label="Entered by coach" />}
        </Row>
        {both.length > 0 && <Txt muted style={{ fontSize: fontSizes.md }}>{`${better} of ${both.length} improved since the last one`}</Txt>}
      </View>

      {rows.length > 0 && (
        <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, paddingHorizontal: 16 }}>
          {rows.map((r, i) => (
            <Row key={r.t.k} style={{ minHeight: 54, gap: 10, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <Txt style={{ flex: 1, fontFamily: font.medium }}>{r.t.label.replace(' (optional)', '')}</Txt>
              <Txt v="mono">{r.prev != null ? `${r.prev} → ${r.now}` : `${r.now}`}</Txt>
              {r.prev != null && <Tag label={r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`} bg={r.good ? c.goodSoft : c.surface2} fg={r.good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
            </Row>
          ))}
        </View>
      )}

      {habits.length > 0 && (
        <View style={{ gap: 8 }}>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>HABITS</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {habits.map(([k, v]) => <Chip key={k} label={`${QUESTIONS.find((q) => q.k === k)?.label.split(' ')[0] ?? k}: ${v}`} />)}
          </Row>
        </View>
      )}

      {fresh && <Button kind="outline" label="See trends in Progress" onPress={() => router.navigate('/progress')} />}
    </View>
  );
}
