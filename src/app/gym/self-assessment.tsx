import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Armchair, BicepsFlexed, Check, ChevronLeft, Dumbbell, Footprints, PersonStanding, Ruler as RulerIcon, Shirt } from '@/lib/icons';
import { IconButton } from '@/design-system/primitives/Button';
import { Button, Field, NoteField, Pill, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { goBack } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { BODY_SIZES, INJURY_AREAS, NUMS, NumKey, STEPS, SelfEntry, compare, fmtAt, habitLabel } from '@/features/selfassess/data';
import { NUDGE_DAYS, useSelfAssess } from '@/features/selfassess/useSelfAssess';
import { RulerStep } from '@/features/selfassess/RulerStep';
import { SleepDial, sleepMinutes } from '@/features/selfassess/SleepDial';
import { BreathTimer } from '@/features/selfassess/BreathTimer';
import { fmtClock } from '@/features/plans/TimeSheet';
import { HeightPicker, WeightPicker } from '@/features/body/BodyLog';

// One screen for each step, in the order of the app's assessment flow (see data.ts). A choice moves on by itself; a measurement is dragged on a ruler
// and waits for Continue (or Skip, to leave it out).
// With an id it only shows that assessment (the member's own, or one the coach entered).
export default function SelfAssessment() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { d, set } = useDomain();
  const { state, setProfile } = useStore();
  const { entries, save, later } = useSelfAssess();
  const viewing = id ? entries.find((e) => e.id === id) : undefined;
  const total = STEPS.length;
  const [idx, setIdx] = useState(viewing ? total : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, string>>({ weight: String(d.weight), ...(state.profile.heightCm ? { height: state.profile.heightCm } : {}) });
  const [areas, setAreas] = useState<string[]>([]);
  const [conditions, setConditions] = useState('');
  const [days, setDays] = useState(NUDGE_DAYS);
  const [sleepT, setSleepT] = useState({ bed: 22 * 60 + 50, wake: 7 * 60 + 50 }); // 10:50 pm to 7:50 am, as in the design
  const [saved, setSaved] = useState<SelfEntry | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry = viewing ?? saved;
  const step = idx < total ? STEPS[idx] : null;

  const numOf = (k: NumKey, d0: number) => { const n = parseFloat(vals[k] ?? ''); return Number.isNaN(n) ? d0 : n; };
  const setNum = (k: NumKey, v: number) => setVals((x) => ({ ...x, [k]: String(v) }));
  // the number a ruler step opens on, and the key it is kept under
  const startOf = (st: (typeof STEPS)[number]): { k: NumKey; v: number } | null =>
    st.kind === 'height' ? { k: 'height', v: 165 } : st.kind === 'weight' ? { k: 'weight', v: d.weight } : st.kind === 'ruler' ? { k: st.k, v: st.start } : null;
  const next = () => setIdx((i) => Math.min(total, i + 1));
  const cont = () => {
    if (step) {
      const s0 = startOf(step);
      if (s0 && vals[s0.k] == null) setNum(s0.k, s0.v); // Continue on the opening number keeps it
      if (step.kind === 'sleep') setNum('sleep', Math.round((sleepMinutes(sleepT.bed, sleepT.wake) / 60) * 10) / 10);
    }
    next();
  };
  const skip = () => {
    if (step) {
      const s0 = startOf(step);
      if (s0) setVals((x) => { const n = { ...x }; delete n[s0.k]; return n; });
      if (step.kind === 'sleep') setVals((x) => { const n = { ...x }; delete n.sleep; return n; });
      if (step.kind === 'timer') setVals((x) => { const n = { ...x }; delete n[step.k]; return n; });
      if (step.kind === 'body') setVals((x) => { const n = { ...x }; BODY_SIZES.forEach((k) => delete n[k]); return n; });
    }
    next();
  };
  const back = () => { if (advance.current) clearTimeout(advance.current); setIdx((i) => Math.max(0, i - 1)); };
  const pick = (k: string, o: string) => {
    setAnswers((a) => ({ ...a, [k]: o }));
    haptic.tick();
    if (advance.current) clearTimeout(advance.current);
    advance.current = setTimeout(next, 220); // a moment to see the choice, then on
  };
  const finish = () => {
    const tests: SelfEntry['tests'] = {};
    (Object.keys(NUMS) as NumKey[]).forEach((k) => { const n = parseFloat((vals[k] ?? '').replace(',', '.')); if (!Number.isNaN(n) && n > 0) tests[k] = n; });
    const a: Record<string, string> = { ...answers, injuries: areas.length ? areas.join(', ') : 'None', nextDays: String(days) };
    if (conditions.trim()) a.conditions = conditions.trim();
    if (tests.sleep) { a.bedtime = fmtClock(sleepT.bed); a.wake = fmtClock(sleepT.wake); }
    const e: SelfEntry = { id: 's' + Date.now(), at: new Date().toISOString(), by: 'member', answers: a, tests };
    save(e);
    if (tests.weight) set({ weight: tests.weight }); // Progress reads the weight from here
    if (tests.height) setProfile({ heightCm: String(tests.height) });
    setSaved(e);
    setIdx(total);
    haptic.success();
  };

  const rulerLike = step?.kind === 'height' || step?.kind === 'weight' || step?.kind === 'ruler' || step?.kind === 'sleep' || step?.kind === 'timer' || step?.kind === 'body';
  const bottom = Math.max(insets.bottom, 16) + 6;
  // The bottom bar: Back on the left as an icon button; Skip and Continue together on the right. The first step has Maybe later where Back would be.
  const hasContinue = rulerLike || step?.kind === 'injuries' || step?.kind === 'next';
  const footer = (
    <Row style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: bottom, gap: 10 }}>
      {idx === 0
        ? <Button kind="secondary" label="Maybe later" onPress={() => { later(); goBack('/gym/assessments'); }} />
        : step && <IconButton label="Back" onPress={back} size={56} radius={radii.lg} bg={c.surface2}><ChevronLeft size={24} color={c.ink} /></IconButton>}
      {hasContinue && <Button kind="accent" label={step?.kind === 'next' ? 'Save assessment' : 'Continue'} onPress={step?.kind === 'next' ? finish : step?.kind === 'injuries' ? next : cont} style={{ flex: 1 }} />}
      {!hasContinue && <View style={{ flex: 1 }} />}
      {!step && <Button kind="accent" label="Done" onPress={() => goBack('/gym/assessments')} style={{ flex: 1 }} />}
    </Row>
  );
  // Skip: a blue text button at the top right of the page
  const skipBtn = step && (rulerLike || step.kind === 'choice') ? (
    <Pressy accessibilityRole="button" accessibilityLabel="Skip this step" onPress={skip} scaleTo={0.96} style={{ minHeight: 44, minWidth: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, color: c.accentText }}>Skip</Txt>
    </Pressy>
  ) : undefined;

  return (
    <SubPage title="Self assessment" fallback="/gym/assessments" footer={footer} right={skipBtn}>
      {!viewing && step && (
        <View style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm }}>{`STEP ${idx + 1}`}<Txt muted style={{ fontSize: fontSizes.sm }}>{` /${total}`}</Txt></Txt>
          </Row>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: idx + 1 }} style={{ height: 6, borderRadius: 3, backgroundColor: c.surface3, overflow: 'hidden' }}>
            <View style={{ width: `${((idx + 1) / total) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
          </View>
        </View>
      )}

      {step && (
        <View style={{ gap: 6 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 30 }}>{step.title}</Txt>
          {!!step.sub && <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>{step.sub}</Txt>}
        </View>
      )}

      {step?.kind === 'choice' && step.cards && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {step.options.map((o) => {
            const on = answers[step.key] === o.v;
            const Icon = { armchair: Armchair, footprints: Footprints, person: PersonStanding, activity: Activity, dumbbell: Dumbbell }[o.icon as 'armchair'] ?? Activity;
            return (
              <Pressy key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => pick(step.key, o.v)} scaleTo={0.97}
                style={{ width: '47%', flexGrow: 1, minHeight: 132, borderRadius: radii.lg, padding: 16, justifyContent: 'space-between', backgroundColor: on ? c.accentSoft : c.surface, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}>
                <View style={{ width: 48, height: 48, borderRadius: radii.md, backgroundColor: on ? c.accent : c.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={on ? c.accentInk : c.accentText} /></View>
                <Txt style={{ fontFamily: on ? font.semibold : font.medium, fontSize: fontSizes.base, color: on ? c.accentText : c.ink }}>{o.v}</Txt>
              </Pressy>
            );
          })}
        </View>
      )}
      {step?.kind === 'choice' && !step.cards && (
        <View style={{ gap: 10 }}>
          {step.how && <How lines={step.how} />}
          {step.options.map((o) => {
            const on = answers[step.key] === o.v;
            return (
              <Pressy key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => pick(step.key, o.v)} scaleTo={0.98}
                style={{ minHeight: 56, borderRadius: radii.lg, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: on ? c.accentSoft : c.surface, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: on ? font.semibold : font.medium, color: on ? c.accentText : c.ink }}>{o.v}</Txt>
                  {!!o.sub && <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{o.sub}</Txt>}
                </View>
                {on && <Check size={20} color={c.accentText} strokeWidth={2.6} />}
              </Pressy>
            );
          })}
        </View>
      )}

      {step?.kind === 'body' && (
        <View style={{ gap: 12 }}>
          {BODY_SIZES.map((k) => {
            const Icon = { chest: Shirt, waist: RulerIcon, hip: PersonStanding, arms: BicepsFlexed, legs: Footprints, calves: Activity }[k as 'chest'];
            return (
              <Row key={k} style={{ gap: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: radii.md, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={c.accentText} /></View>
                <Txt style={{ width: 64, fontFamily: font.semibold }}>{NUMS[k].label}</Txt>
                <View style={{ flex: 1 }}>
                  <Field accessibilityLabel={`${NUMS[k].label} size in cm`} value={vals[k] ?? ''} onChangeText={(x) => setVals((v) => ({ ...v, [k]: x.replace(/[^0-9.,]/g, '') }))} keyboardType="decimal-pad" placeholder={`Enter ${NUMS[k].label.toLowerCase()} size`} prefix="cm" />
                </View>
              </Row>
            );
          })}
        </View>
      )}
      {step?.kind === 'height' && <HeightPicker cm={numOf('height', 165)} onChange={(v) => setNum('height', Math.round(v))} />}
      {step?.kind === 'weight' && <WeightPicker kg={numOf('weight', d.weight)} onChange={(v) => setNum('weight', Math.round(v * 10) / 10)} />}
      {step?.kind === 'ruler' && (
        <View style={{ gap: 14 }}>
          {step.how && <How lines={step.how} />}
          <RulerStep key={step.id} a11y={step.title} value={numOf(step.k, step.start)} onChange={(v) => setNum(step.k, v)} unit={NUMS[step.k].unit} min={step.min} max={step.max} step={step.step} decimals={step.dp} major={step.major} />
        </View>
      )}
      {step?.kind === 'timer' && (
        <View style={{ gap: 14 }}>
          {step.how && <How lines={step.how} />}
          <BreathTimer key={step.id} seconds={vals[step.k] != null ? Number(vals[step.k]) : undefined} onChange={(sec) => setVals((x) => { const n = { ...x }; if (sec == null) delete n[step.k]; else n[step.k] = String(sec); return n; })} />
        </View>
      )}
      {step?.kind === 'sleep' && <SleepDial bed={sleepT.bed} wake={sleepT.wake} onChange={(bed, wake) => { setSleepT({ bed, wake }); setNum('sleep', Math.round((sleepMinutes(bed, wake) / 60) * 10) / 10); }} />}
      {step?.kind === 'injuries' && (
        <View style={{ gap: 14 }}>
          <Txt v="label">MOST COMMON</Txt>
          <Row style={{ gap: 8, flexWrap: 'wrap' }}>
            {INJURY_AREAS.map((a) => <Pill key={a} label={a} on={areas.includes(a)} onPress={() => { setAreas((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a])); haptic.tick(); }} />)}
          </Row>
          <Pressy accessibilityRole="button" onPress={() => { setAreas([]); setConditions(''); haptic.tick(); next(); }} scaleTo={0.98}
            style={{ minHeight: 52, borderRadius: radii.pill, borderWidth: 1, borderColor: c.chipLine, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>Don’t have any</Txt>
          </Pressy>
          <Txt v="label">MEDICAL CONDITIONS</Txt>
          <NoteField value={conditions} onChangeText={setConditions} placeholder="Any medical conditions (optional)" accessibilityLabel="Medical conditions" minHeight={84} />
        </View>
      )}

      {step?.kind === 'next' && <RulerStep a11y="Days until the next assessment" value={days} onChange={setDays} unit="Days" min={15} max={90} step={5} major={2} />}

      {!step && entry && <Result entry={entry} prev={entries.find((e) => e.id !== entry.id && Date.parse(e.at) < Date.parse(entry.at))} fresh={!viewing} />}
    </SubPage>
  );
}

// The steps for the test, as the Figma shows them under "How to perform".
function How({ lines }: { lines: string[] }) {
  const { c } = useTheme();
  const numbered = !lines[0].includes(':');
  return (
    <View style={{ gap: 6, padding: 14, borderRadius: radii.lg, backgroundColor: c.surface }}>
      <Txt v="label">HOW TO PERFORM</Txt>
      {lines.map((l, i) => <Txt key={i} style={{ fontSize: fontSizes.md, lineHeight: 21 }}>{numbered ? `${i + 1}. ${l}` : l}</Txt>)}
    </View>
  );
}

function Result({ entry, prev, fresh }: { entry: SelfEntry; prev: SelfEntry | undefined; fresh: boolean }) {
  const { c } = useTheme();
  const rows = compare(entry, prev);
  const judged = rows.filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const habits = Object.entries(entry.answers).filter(([k, v]) => v && habitLabel[k]);
  return (
    <View style={{ gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <View style={{ width: 64, height: 64, borderRadius: radii.pill, backgroundColor: c.goodSoft, alignItems: 'center', justifyContent: 'center' }}><Check size={30} color={c.good} strokeWidth={2.6} /></View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 30 }}>{fresh ? 'Self assessment saved' : entry.by === 'coach' ? 'Assessment by Coach Vikram' : 'Self assessment'}</Txt>
        <Row style={{ gap: 6 }}>
          <Chip label={fmtAt(entry.at)} />
          {entry.by === 'coach' && <Chip label="Entered by coach" />}
        </Row>
        {judged.length > 0 && <Txt muted style={{ fontSize: fontSizes.md }}>{`${better} of ${judged.length} improved since the last one`}</Txt>}
      </View>

      {rows.length > 0 && (
        <View style={{ borderRadius: radii.lg, backgroundColor: c.surface, paddingHorizontal: 16 }}>
          {rows.map((r, i) => (
            <Row key={r.k} style={{ minHeight: 54, gap: 10, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <Txt style={{ flex: 1, fontFamily: font.medium }}>{r.n.label}</Txt>
              <Txt v="mono">{r.prev != null ? `${r.prev} → ${r.now}` : `${r.now}`}</Txt>
              {r.prev != null && <Tag label={r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`} bg={r.good ? c.goodSoft : c.surface2} fg={r.good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
            </Row>
          ))}
        </View>
      )}

      {habits.length > 0 && (
        <View style={{ gap: 8 }}>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>ABOUT YOU</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {habits.map(([k, v]) => <Chip key={k} label={`${habitLabel[k]}: ${v}`} />)}
          </Row>
        </View>
      )}

      {fresh && <Button kind="outline" label="See trends in Progress" onPress={() => router.navigate('/progress')} />}
    </View>
  );
}
