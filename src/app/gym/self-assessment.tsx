import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from '@/lib/icons';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { goBack } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { QUESTIONS, SelfEntry, TESTS, compare, fmtAt } from '@/features/selfassess/data';
import { useSelfAssess } from '@/features/selfassess/useSelfAssess';

// One screen for each step: first the habit questions (tap an answer and it moves on), then the measurements (one at a time), then the result.
type Step = { kind: 'q'; q: (typeof QUESTIONS)[number] } | { kind: 't'; t: (typeof TESTS)[number] };
const STEPS: Step[] = [...QUESTIONS.map((q) => ({ kind: 'q' as const, q })), ...TESTS.map((t) => ({ kind: 't' as const, t }))];

// With an id it only shows that assessment (the member's own, or one the coach entered).
export default function SelfAssessment() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { d, set } = useDomain();
  const { entries, save, later } = useSelfAssess();
  const viewing = id ? entries.find((e) => e.id === id) : undefined;
  const [idx, setIdx] = useState(viewing ? STEPS.length : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, string>>({ weight: String(d.weight) });
  const [saved, setSaved] = useState<SelfEntry | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry = viewing ?? saved;
  const total = STEPS.length;
  const step = idx < total ? STEPS[idx] : null;

  const next = () => setIdx((i) => Math.min(total, i + 1));
  const back = () => { if (advance.current) clearTimeout(advance.current); setIdx((i) => Math.max(0, i - 1)); };
  const pick = (k: string, o: string) => {
    setAnswers((a) => ({ ...a, [k]: o }));
    haptic.tick();
    if (advance.current) clearTimeout(advance.current);
    advance.current = setTimeout(next, 220); // a moment to see the choice, then on to the next question
  };
  const finish = () => {
    const tests: SelfEntry['tests'] = {};
    TESTS.forEach((t) => { const n = parseFloat((vals[t.k] ?? '').replace(',', '.')); if (!Number.isNaN(n) && n > 0) tests[t.k] = n; });
    const e: SelfEntry = { id: 's' + Date.now(), at: new Date().toISOString(), by: 'member', answers, tests };
    save(e);
    if (tests.weight) set({ weight: tests.weight }); // Progress reads the weight from here
    setSaved(e);
    setIdx(total);
    haptic.success();
  };

  const bottom = Math.max(insets.bottom, 16) + 6;
  const last = idx === total - 1;
  const footer = (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: bottom, gap: 8 }}>
      {step?.kind === 'q' && (
        <Row style={{ gap: 8 }}>
          {idx === 0
            ? <Button kind="secondary" label="Maybe later" onPress={() => { later(); goBack('/gym/assessments'); }} style={{ flex: 1 }} />
            : <Button kind="secondary" label="Back" onPress={back} style={{ flex: 1 }} />}
          <Button kind="secondary" label="Skip" onPress={next} style={{ flex: 1 }} />
        </Row>
      )}
      {step?.kind === 't' && <>
        <Button kind="accent" label={last ? (vals[step.t.k] ? 'Save assessment' : 'Skip and save') : (vals[step.t.k] ? 'Next' : 'Skip')} onPress={last ? finish : next} />
        <Button kind="secondary" label="Back" onPress={back} />
      </>}
      {!step && <Button kind="accent" label="Done" onPress={() => goBack('/gym/assessments')} />}
    </View>
  );

  return (
    <SubPage title="Self assessment" fallback="/gym/assessments" footer={footer}>
      {!viewing && step && (
        <View style={{ gap: 8 }}>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: idx }} style={{ height: 6, borderRadius: 3, backgroundColor: c.surface3, overflow: 'hidden' }}>
            <View style={{ width: `${((idx + 1) / (total + 1)) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
          </View>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`${idx + 1} of ${total}, ${step.kind === 'q' ? 'a few questions' : 'your measurements'}`}</Txt>
        </View>
      )}

      {step?.kind === 'q' && (
        <View style={{ gap: 18 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 30 }}>{step.q.ask}</Txt>
          <View style={{ gap: 10 }}>
            {step.q.options.map((o) => {
              const on = answers[step.q.k] === o;
              return (
                <Pressy key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => pick(step.q.k, o)} scaleTo={0.98}
                  style={{ minHeight: 56, borderRadius: radii.lg, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: on ? c.accentSoft : c.surface, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}>
                  <Txt style={{ fontFamily: on ? font.semibold : font.medium, color: on ? c.accentText : c.ink }}>{o}</Txt>
                  {on && <Check size={20} color={c.accentText} strokeWidth={2.6} />}
                </Pressy>
              );
            })}
          </View>
        </View>
      )}

      {step?.kind === 't' && (
        <View style={{ gap: 14 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 30 }}>{step.t.label.replace(' (optional)', '')}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>{step.t.hint}</Txt>
          <Field key={step.t.k} autoFocus accessibilityLabel={step.t.label} value={vals[step.t.k] ?? ''} onChangeText={(x) => setVals((v) => ({ ...v, [step.t.k]: x.replace(/[^0-9.,]/g, '') }))}
            keyboardType="decimal-pad" placeholder={step.t.unit || 'Number'} prefix={step.t.unit || undefined} returnKeyType="next" onSubmitEditing={last ? finish : next} />
          {step.t.k === 'fat' && <Txt v="caption" style={{ fontSize: fontSizes.sm }}>You can leave this empty.</Txt>}
        </View>
      )}

      {!step && entry && <Result entry={entry} prev={entries.find((e) => e.id !== entry.id && Date.parse(e.at) < Date.parse(entry.at))} fresh={!viewing} />}
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
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 30 }}>{fresh ? 'Self assessment saved' : entry.by === 'coach' ? 'Assessment by Coach Vikram' : 'Self assessment'}</Txt>
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
