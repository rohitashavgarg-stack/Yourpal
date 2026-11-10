import React from 'react';
import { EffortSlider } from '@/design-system/primitives/EffortSlider';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import type { PEx } from '@/features/plans/store';
import { LinearGradient } from 'expo-linear-gradient';
import { MuscleBody, MuscleName } from '@/design-system/primitives/MuscleBody';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Chip } from '@/design-system/primitives/Chip';
import { useDomain, wkDoneInfo } from '@/lib/domain';
import { ExTile } from './parts';
import { exSub } from './store';
import { MuscleRow } from '@/features/progress/MuscleRow';
import { musclesFor } from '@/features/progress/muscles';

// Which muscle group an exercise works, from its name (first match wins).
export function muscleOfName(name: string): MuscleName | null {
  const n = name.toLowerCase();
  if (/squat|leg|lunge|calf|glute|hip thrust|step.?up|romanian|deadlift/.test(n)) return 'Legs';
  if (/plank|crunch|core|dead bug|carry|sit.?up|\bab/.test(n)) return 'Core';
  if (/bench|chest|push.?up|fly|dip/.test(n)) return 'Chest';
  if (/row|pull|lat |back/.test(n)) return 'Back';
  if (/shoulder|overhead|lateral|raise/.test(n)) return 'Shoulders';
  if (/curl|tricep|bicep|arm/.test(n)) return 'Arms';
  return null;
}

// The sets a workout did for each muscle group: skipped exercises do not count.
export function workoutMuscles(ex: PEx[]) {
  const sets: Partial<Record<MuscleName, number>> = {};
  ex.forEach((e) => { if (e.res === 'skip') return; const m = muscleOfName(e.name); if (m) sets[m] = (sets[m] ?? 0) + e.sets; });
  return sets;
}

// The front and back of the body with every muscle group this workout worked lit, large, above the muscle rows.
function LoggedFigures({ sets }: { sets: Partial<Record<MuscleName, number>> }) {
  const lit = Object.fromEntries((Object.keys(sets) as MuscleName[]).map((m) => [m, 1])) as Partial<Record<MuscleName, number>>;
  return (
    <View accessible accessibilityLabel={`Muscles worked: ${Object.keys(sets).join(', ')}`} style={{ alignItems: 'center', paddingVertical: 8 }}>
      <Row style={{ gap: 28 }}>
        <MuscleBody side="front" width={150} lit={lit} />
        <MuscleBody side="back" width={150} lit={lit} />
      </Row>
    </View>
  );
}

// The top of a logged day: the name centred, one line about the work, and the date and time as two chips.
export function LoggedHeader({ name, sets, byYou, date, span }: { name: string; sets: number; byYou: boolean; date: string; span: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
      <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.6, textAlign: 'center' }}>{name}</Txt>
      <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 23, textAlign: 'center' }}>{`${sets} hard sets. ${byYou ? 'Your plan' : "Coach Vikram's plan"}, done.`}</Txt>
      <Row style={{ gap: 8, marginTop: 8 }}><Chip filled edge size="lg" label={date} />{!!span && <Chip filled edge size="lg" label={span} />}</Row>
    </View>
  );
}

// The exercises of a logged day: a picture, the name, the sets and total weight, and what was lifted or what happened to it.
export function LoggedExercises({ ex }: { ex: PEx[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>Exercises</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Each lift against your last session</Txt>
      </View>
      {ex.map((e, i) => {
        const skipped = e.res === 'skip';
        const right = skipped ? 'Skipped' : e.res === 'swap' ? 'Bodyweight' : exSub(e).split(' · ').pop() ?? '';
        return (
          <Row key={e.id} style={{ gap: 12, minHeight: 64, alignItems: 'center' }}>
            <ExTile name={e.name} num={String(i + 1)} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt style={{ fontFamily: font.semibold }}>{e.name}</Txt>
              <Txt muted style={[{ fontSize: fontSizes.xs, lineHeight: 17 }, skipped && { color: c.warn }]}>{skipped ? 'Not logged' : e.res === 'swap' ? `${e.sets} sets of ${e.reps}, swapped from ${e.from}` : `${e.sets} sets, ${e.sets * e.reps * e.kg} kg total`}</Txt>
            </View>
            <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 17, color: skipped ? c.warn : c.accentText }}>{skipped ? right : e.res === 'swap' ? right : `${e.kg} kg`}</Txt>
          </Row>
        );
      })}
    </View>
  );
}

// How it felt: the effort the member logged after the workout, as a word and a bar (it is a record, so there is nothing to drag).
const LOGGED_EFFORT = 0.62; // a sample value until the effort is stored with the workout
const effortWord = (v: number) => (v < 0.2 ? 'Easy' : v < 0.45 ? 'Moderate' : v < 0.7 ? 'Hard' : v < 0.9 ? 'Very hard' : 'Max');
export function LoggedFeel() {
  const { c } = useTheme();
  const pct = Math.round(LOGGED_EFFORT * 100);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>How hard was it?</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Coach Vikram uses this to plan your next session</Txt>
      </View>
      <View accessible accessibilityLabel={`Your effort: ${effortWord(LOGGED_EFFORT)}, ${Math.round(LOGGED_EFFORT * 10)} out of 10`} style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 20, gap: 14 }}>
        <CardEdge radius={radii.xl} />
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Your effort</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.4 }}>{effortWord(LOGGED_EFFORT)}</Txt>
          </View>
          <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19, color: c.ink }}>{Math.round(LOGGED_EFFORT * 10)}</Txt> / 10</Txt>
        </Row>
        {/* the slider the member used after the workout, showing what they logged (it cannot be dragged here) */}
        <EffortSlider value={LOGGED_EFFORT} readOnly label={`Your effort: ${effortWord(LOGGED_EFFORT)}`} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt muted style={{ fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 0.6 }}>EASY</Txt>
          <Txt muted style={{ fontSize: fontSizes.xs2, lineHeight: 15, letterSpacing: 0.6 }}>MAX</Txt>
        </Row>
      </View>
    </View>
  );
}

// Volume, hard sets and kcal burned: three big numbers.
export function LoggedNumbers({ ex }: { ex: PEx[] }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const done = ex.filter((e) => e.res !== 'skip');
  const sets = done.reduce((a, e) => a + e.sets, 0);
  const kg = done.reduce((a, e) => a + e.sets * e.reps * e.kg, 0);
  const vol = kg >= 1000 ? { n: (kg / 1000).toFixed(1), u: ' t' } : { n: String(Math.round(kg)), u: ' kg' };
  const items = [{ n: vol.n, u: vol.u, l: 'Volume' }, { n: String(sets), u: '', l: 'Hard sets' }, { n: String(wkDoneInfo(d).k), u: '', l: 'kcal' }];
  return (
    <Row style={{ justifyContent: 'space-around', paddingVertical: 6 }}>
      {items.map((t) => (
        <View key={t.l} accessible accessibilityLabel={`${t.l}: ${t.n}${t.u}`} style={{ alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.6 }}>{t.n}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: c.muted }}>{t.u}</Txt></Txt>
          <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 17 }}>{t.l}</Txt>
        </View>
      ))}
    </Row>
  );
}

// The muscle groups this workout worked, with its sets against the weekly target.
export function LoggedMuscles({ ex }: { ex: PEx[] }) {
  const sets = workoutMuscles(ex);
  const target = Object.fromEntries(musclesFor('week').map((g) => [g.name, g.target])) as Record<string, number>;
  const names = (Object.keys(sets) as MuscleName[]);
  if (names.length === 0) return null;
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>Muscle groups</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Hard sets per muscle against your weekly target</Txt>
      </View>
      <LoggedFigures sets={sets} />
      <View style={{ gap: 18, paddingHorizontal: 4 }}>
        {names.map((m) => <MuscleRow key={m} name={m} done={sets[m] ?? 0} target={target[m] ?? sets[m] ?? 0} />)}
      </View>
    </View>
  );
}
