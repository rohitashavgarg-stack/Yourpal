import React, { useState } from 'react';
import { Plus } from '@/lib/icons';
import { Button, Field, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { Ex, LIBRARY, Mode, SetT } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { BigTitle, ListRow, Stepper } from '@/features/plans/parts';
import { useSessionActions } from '@/features/workout/actions';

const GROUPS = Array.from(new Set(LIBRARY.map((x) => x.g)));
const MODES: { value: Mode; label: string }[] = [{ value: 'rw', label: 'Weight and reps' }, { value: 'r', label: 'Reps' }, { value: 't', label: 'Time' }];

// What the exercise is probably tracked by, from its name. The member can change it in the next step.
const guessMode = (name: string): Mode => (/plank|hold|carry|wall sit/i.test(name) ? 't' : /push-up|pull-up|dip|dead bug|lunge|crunch|sit-up/i.test(name) ? 'r' : 'rw');

const makeSets = (mode: Mode, n: number, reps: number, kg: number, secs: number): SetT[] =>
  Array.from({ length: n }, () => ({ r: mode === 't' ? 0 : reps, k: mode === 'rw' ? kg : 0, t: mode === 't' ? secs : 0, w: false, st: 'todo' as const }));

type Pick = { name: string; group: string };

// "Add exercise" while a workout is running: pick from the library or add your own, set it up, and it goes to the end of today's workout.
// It is only for today: it is tagged "Added by you" and the coach's plan stays as it was.
export function AddExerciseSheet() {
  const { c } = useTheme();
  const { closeSheet, toast } = useOverlay();
  const A = useSessionActions();
  const [step, setStep] = useState<'pick' | 'custom' | 'set'>('pick');
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [pick, setPick] = useState<Pick | null>(null);
  const [custom, setCustom] = useState('');
  const [customGroup, setCustomGroup] = useState('Other');
  const [mode, setMode] = useState<Mode>('rw');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [kg, setKg] = useState(0);
  const [secs, setSecs] = useState(45);

  const choose = (p: Pick) => { const m = guessMode(p.name); setPick(p); setMode(m); setStep('set'); haptic.tick(); };
  const add = () => {
    if (!pick) return;
    const ex: Ex = {
      id: `a${Date.now()}`, name: pick.name, mode, step: mode === 'rw' ? 2.5 : 1, last: 'Added by you today',
      alts: [], cue: 'Move with control and stop if it hurts.', muscles: pick.group, added: true, sets: makeSets(mode, sets, reps, kg, secs),
    };
    A.addExercise(ex);
    haptic.success();
    closeSheet(() => toast(`Added ${pick.name} at the end`));
  };

  if (step === 'set' && pick) {
    return (
      <>
        <BigTitle>{pick.name}</BigTitle>
        <Txt v="caption">{pick.group}</Txt>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {MODES.map((m) => <Pill key={m.value} label={m.label} on={mode === m.value} onPress={() => setMode(m.value)} />)}
        </Row>
        <Stepper label="Sets" value={String(sets)} minusLabel="One set less" plusLabel="One set more" onMinus={() => setSets((n) => Math.max(1, n - 1))} onPlus={() => setSets((n) => Math.min(10, n + 1))} />
        {mode !== 't' && <Stepper label="Reps" value={String(reps)} minusLabel="One rep less" plusLabel="One rep more" onMinus={() => setReps((n) => Math.max(1, n - 1))} onPlus={() => setReps((n) => Math.min(50, n + 1))} />}
        {mode === 'rw' && <Stepper label="Weight" value={`${kg} kg`} minusLabel="Lighter" plusLabel="Heavier" onMinus={() => setKg((n) => Math.max(0, Math.round((n - 2.5) * 10) / 10))} onPlus={() => setKg((n) => Math.round((n + 2.5) * 10) / 10)} />}
        {mode === 't' && <Stepper label="Time" value={`${secs} s`} minusLabel="Shorter" plusLabel="Longer" onMinus={() => setSecs((n) => Math.max(5, n - 5))} onPlus={() => setSecs((n) => Math.min(600, n + 5))} />}
        <Button kind="accent" label="Add to workout" onPress={add} />
        <Button kind="secondary" label="Back" onPress={() => setStep(custom.trim() && pick.name === custom.trim() ? 'custom' : 'pick')} />
      </>
    );
  }

  if (step === 'custom') {
    const name = custom.trim();
    return (
      <>
        <BigTitle>Your own exercise</BigTitle>
        <Field accessibilityLabel="Exercise name" value={custom} onChangeText={setCustom} placeholder="Exercise name" autoCapitalize="sentences" returnKeyType="done" />
        <Txt v="label">Muscle group</Txt>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {[...GROUPS, 'Other'].map((g) => <Pill key={g} label={g} on={customGroup === g} onPress={() => setCustomGroup(g)} />)}
        </Row>
        <Button kind="accent" label="Next" disabled={name.length < 2} onPress={() => choose({ name, group: customGroup })} />
        <Button kind="secondary" label="Back" onPress={() => setStep('pick')} />
      </>
    );
  }

  const qq = q.trim().toLowerCase();
  const res = LIBRARY.filter((x) => (group === 'All' || x.g === group) && (!qq || x.n.toLowerCase().includes(qq)));
  return (
    <>
      <BigTitle>Add exercise</BigTitle>
      <Field accessibilityLabel="Search exercises" value={q} onChangeText={setQ} placeholder="Search exercises" returnKeyType="search" />
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>
        {['All', ...GROUPS].map((g) => <Pill key={g} label={g} on={group === g} onPress={() => setGroup(g)} />)}
      </Row>
      <ListRow label="Can't find it? Add your own" chevron={false} right={<Plus size={18} color={c.accentText} />} onPress={() => { setCustom(q.trim()); setStep('custom'); }} />
      {res.map((x, i) => (
        <ListRow key={x.n} label={x.n} sub={x.g} last={i === res.length - 1} chevron={false} a11y={`Add ${x.n}, ${x.g}`}
          right={<Txt style={{ fontFamily: font.semibold, color: c.accentText }}>Add</Txt>} onPress={() => choose({ name: x.n, group: x.g })} />
      ))}
      {res.length === 0 && <Txt muted style={{ paddingVertical: 12 }}>No exercises match.</Txt>}
    </>
  );
}
