import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Row, Txt, Pressy } from '@/components/ui';
import { Check, ChevronDown, ChevronRight, Dumbbell } from '@/lib/icons';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { fmtT } from '@/lib/data';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';
import { SheetFooter } from '@/design-system/primitives/Sheet';
import { DAYL, dateOf, dayPlan, PEx, usePlans } from './store';

// Log a workout for a day that has gone by: for every exercise, which sets you did and the weight and reps of each, then when you started and how long it took.
// Sample data: it is kept in the app's state. Every set starts as planned and ticked, so only what was different needs a change.
export type LoggedSet = { kg: number; reps: number; sec: number; done: boolean };

const minutesOf = (t?: string) => {
  const m = (t ?? '6:30 pm').match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return 18 * 60 + 30;
  return (Number(m[1]) % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(m[2]);
};
const asPlanned = (e: PEx): LoggedSet[] => Array.from({ length: e.sets }, () => ({ kg: e.kg, reps: e.reps, sec: e.t ?? 0, done: true }));
const kgStep = (kg: number) => (kg >= 40 ? 2.5 : kg >= 10 ? 1 : 0.5);
const round = (n: number) => Math.round(n * 10) / 10;

// the amount shown on the row: what was done, for example "3 sets, 8 reps, 50 kg"
function summary(e: PEx, sets: LoggedSet[]) {
  const done = sets.filter((s) => s.done);
  if (!done.length) return 'Not done';
  const top = done.reduce((a, b) => (b.kg > a.kg || (b.kg === a.kg && b.reps > a.reps) ? b : a));
  const timed = e.mode === 't' || e.mode === 'tw';
  const parts = [`${done.length} ${done.length === 1 ? 'set' : 'sets'}`, timed ? `${top.sec} s` : `${top.reps} reps`];
  if (e.mode === 'rw' || e.mode === 'tw') parts.push(`${round(top.kg)} kg`);
  return parts.join(', ');
}

export function LogPastWorkoutSheet({ day, week }: { day: number; week: number }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { closeSheet, toast } = useOverlay();
  const plan = dayPlan(d, { ...p, week }, day);
  const [logged, setLogged] = useState<Record<string, LoggedSet[]>>(() => Object.fromEntries((plan?.ex ?? []).map((e) => [e.id, asPlanned(e)])));
  const [open, setOpen] = useState<string | null>(null);
  const [start, setStart] = useState(() => minutesOf(plan?.time));
  const [took, setTook] = useState(45);
  if (!plan) return null;
  const key = `${week}:${day}`;
  const label = `${DAYL[day]} ${dateOf(day, week)}`;
  const doneEx = plan.ex.filter((e) => logged[e.id]?.some((s) => s.done)).length;
  const change = (id: string, i: number, patch: Partial<LoggedSet>) => setLogged((l) => ({ ...l, [id]: l[id].map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  const flipAll = (e: PEx) => { haptic.tick(); setLogged((l) => { const on = l[e.id].some((s) => s.done); return { ...l, [e.id]: l[e.id].map((s) => ({ ...s, done: !on })) }; }); };
  const save = () => {
    if (doneEx === 0) return;
    haptic.success();
    const prev = d.pastLogs;
    set({ pastLogs: { ...prev, [key]: { a: start, b: start + took, skip: plan.ex.filter((e) => !logged[e.id]?.some((s) => s.done)).map((e) => e.id), sets: logged } } });
    closeSheet(() => toast(`${plan.name} logged for ${label}`, { undo: () => set({ pastLogs: prev }) }));
  };

  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <View style={{ gap: 2 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.4 }}>{`Log ${plan.name}`}</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{label}</Txt>
      </View>

      <View style={{ gap: 8 }}>
        <Txt v="label">What you did</Txt>
        <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: 6 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {plan.ex.map((e) => {
            const sets = logged[e.id];
            const anyDone = sets.some((s) => s.done);
            const isOpen = open === e.id;
            const timed = e.mode === 't' || e.mode === 'tw';
            const weighted = e.mode === 'rw' || e.mode === 'tw';
            return (
              <View key={e.id} style={{ borderRadius: radii.md, backgroundColor: c.surface2, overflow: 'hidden' }}>
                <Row style={{ minHeight: 60 }}>
                  <Pressy accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${e.name}, ${summary(e, sets)}. Edit sets`} onPress={() => { haptic.tick(); setOpen(isOpen ? null : e.id); }} scaleTo={0.99}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingVertical: 10 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt numberOfLines={1} style={{ fontFamily: font.medium, opacity: anyDone ? 1 : 0.5, textDecorationLine: anyDone ? 'none' : 'line-through' }}>{e.name}</Txt>
                      <Txt v="caption">{summary(e, sets)}</Txt>
                    </View>
                    {isOpen ? <ChevronDown size={16} color={c.muted} /> : <ChevronRight size={16} color={c.muted} />}
                  </Pressy>
                  <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: anyDone }} accessibilityLabel={`${e.name}. ${anyDone ? 'Done' : 'Not done'}`} onPress={() => flipAll(e)} scaleTo={0.9} hitSlop={6}
                    style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: anyDone ? c.good : 'transparent', borderWidth: anyDone ? 0 : 1.5, borderColor: c.chipLine }}>
                      {anyDone && <Check size={14} color={c.bg} strokeWidth={3} />}
                    </View>
                  </Pressy>
                </Row>
                {isOpen && (
                  <View style={{ gap: 8, paddingHorizontal: 12, paddingBottom: 12 }}>
                    {sets.map((s, i) => (
                      <Row key={i} style={{ gap: 8 }}>
                        {weighted ? (
                          <Txt style={{ width: 16, fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>{i + 1}</Txt>
                        ) : (
                          /* only reps or seconds: the row has room, so it says which set and what was planned */
                          <View style={{ flex: 1, minWidth: 0, opacity: s.done ? 1 : 0.4 }}>
                            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 }}>{`Set ${i + 1}`}</Txt>
                            <Txt v="caption">{`Planned ${timed ? `${e.t ?? 0} s` : `${e.reps} reps`}`}</Txt>
                          </View>
                        )}
                        <View style={{ ...(weighted ? { flex: 1 } : null), flexDirection: 'row', justifyContent: 'flex-end', gap: 8, opacity: s.done ? 1 : 0.4 }} pointerEvents={s.done ? 'auto' : 'none'}>
                          {weighted && (
                            <AmountStepper text={`${round(s.kg)} kg`} unit="kg" accessibilityLabel={`Set ${i + 1} weight`} lessDisabled={s.kg <= 0} onLess={() => change(e.id, i, { kg: Math.max(0, round(s.kg - kgStep(s.kg))) })} onMore={() => change(e.id, i, { kg: round(s.kg + kgStep(s.kg)) })} />
                          )}
                          {timed ? (
                            <AmountStepper text={`${s.sec} s`} unit="s" accessibilityLabel={`Set ${i + 1} time`} lessDisabled={s.sec <= 5} onLess={() => change(e.id, i, { sec: Math.max(5, s.sec - 5) })} onMore={() => change(e.id, i, { sec: s.sec + 5 })} />
                          ) : (
                            <AmountStepper text={`${s.reps} reps`} unit="rep" accessibilityLabel={`Set ${i + 1} reps`} lessDisabled={s.reps <= 1} onLess={() => change(e.id, i, { reps: Math.max(1, s.reps - 1) })} onMore={() => change(e.id, i, { reps: s.reps + 1 })} />
                          )}
                        </View>
                        <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilityLabel={`Set ${i + 1}. ${s.done ? 'Done' : 'Not done'}`} onPress={() => { haptic.tick(); change(e.id, i, { done: !s.done }); }} hitSlop={6} scaleTo={0.9}
                          style={{ width: 28, height: 28, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: s.done ? c.good : 'transparent', borderWidth: s.done ? 0 : 1.5, borderColor: c.chipLine }}>
                          {s.done && <Check size={14} color={c.bg} strokeWidth={3} />}
                        </Pressy>
                      </Row>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="label">Started</Txt>
          <AmountStepper text={fmtT(start).full} unit="min" onLess={() => setStart((s) => Math.max(5 * 60, s - 15))} onMore={() => setStart((s) => Math.min(22 * 60, s + 15))} lessDisabled={start <= 5 * 60} moreDisabled={start >= 22 * 60} accessibilityLabel="Start time" />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="label">It took</Txt>
          <AmountStepper text={`${took} min`} unit="min" onLess={() => setTook((t) => Math.max(10, t - 5))} onMore={() => setTook((t) => Math.min(180, t + 5))} lessDisabled={took <= 10} moreDisabled={took >= 180} accessibilityLabel="Duration" />
        </Row>
      </View>

      <SheetFooter><Button kind="accent" label="Save workout" icon={<Dumbbell size={18} color={c.accentInk} />} disabled={doneEx === 0} onPress={save} /></SheetFooter>
    </View>
  );
}
