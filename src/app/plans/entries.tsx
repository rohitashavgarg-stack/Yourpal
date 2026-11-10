import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Check, ChevronDown, ChevronRight } from '@/lib/icons';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { fmtT } from '@/lib/data';
import { haptic } from '@/lib/haptics';
import { useLeaveIfPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { AmountStepper } from '@/design-system/primitives/AmountStepper';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { InfoBox, PageHeader, PAGE_HEADER_BODY } from '@/features/plans/parts';
import { DAYL, dateOf, dayPlan, PEx, usePlans } from '@/features/plans/store';
import { asPlanned, kgStep, LoggedSet, minutesOf, round, summary } from '@/features/plans/LogPastWorkoutSheet';

// Edit what you logged for a day: a full page, the same layout as Edit plan. The when and how long are in a card at the top, then one card for each exercise.
// Tap an exercise to open its sets (weight, reps or seconds, and a tick for each); the round tick on the right marks the whole exercise done or not done.
export default function EditLoggedEntries() {
  useLeaveIfPaused();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { toast } = useOverlay();
  const q = useLocalSearchParams<{ day?: string; week?: string }>();
  const day = Number(q.day ?? p.day);
  const week = Number(q.week ?? p.week);
  const plan = dayPlan(d, { ...p, week }, day);
  const key = `${week}:${day}`;
  const saved = d.pastLogs[key];
  const [initial] = useState(() => JSON.stringify(Object.fromEntries((plan?.ex ?? []).map((e) => [e.id, saved?.sets?.[e.id] ?? asPlanned(e)]))) + `|${saved?.a ?? minutesOf(plan?.time)}|${saved ? saved.b - saved.a : 45}`);
  const [logged, setLogged] = useState<Record<string, LoggedSet[]>>(() => Object.fromEntries((plan?.ex ?? []).map((e) => [e.id, saved?.sets?.[e.id] ?? asPlanned(e)])));
  const [open, setOpen] = useState<string | null>(null);
  const [start, setStart] = useState(() => saved?.a ?? minutesOf(plan?.time));
  const [took, setTook] = useState(() => (saved ? saved.b - saved.a : 45));
  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <PageHeader title="Edit logged workout" icon="close" onClose={() => router.back()} />
        <Txt muted style={{ padding: 24, textAlign: 'center' }}>Nothing is logged for this day yet.</Txt>
      </View>
    );
  }
  const label = `${DAYL[day]} ${dateOf(day, week)}`;
  const doneEx = plan.ex.filter((e) => logged[e.id]?.some((s) => s.done)).length;
  const dirty = JSON.stringify(logged) + `|${start}|${took}` !== initial;
  const change = (id: string, i: number, patch: Partial<LoggedSet>) => setLogged((l) => ({ ...l, [id]: l[id].map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  const flipAll = (e: PEx) => { haptic.tick(); setLogged((l) => { const on = l[e.id].some((s) => s.done); return { ...l, [e.id]: l[e.id].map((s) => ({ ...s, done: !on })) }; }); };
  const canSave = dirty && doneEx > 0;
  const save = () => {
    if (!canSave) return;
    haptic.success();
    const prev = d.pastLogs;
    set({ pastLogs: { ...prev, [key]: { a: start, b: start + took, skip: plan.ex.filter((e) => !logged[e.id]?.some((s) => s.done)).map((e) => e.id), sets: logged } } });
    router.back();
    toast(`${plan.name} updated for ${label}`, { undo: () => set({ pastLogs: prev }) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title={`Edit ${plan.name.toLowerCase()}`} icon="close" onClose={() => router.back()}
        right={(
          <Pressy accessibilityRole="button" accessibilityLabel="Save" accessibilityState={{ disabled: !canSave }} disabled={!canSave} onPress={save}
            style={{ height: 44, paddingHorizontal: 12, borderRadius: radii.lg, justifyContent: 'center', opacity: canSave ? 1 : 0.4 }}>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>Save</Txt>
          </Pressy>
        )} />
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + PAGE_HEADER_BODY + 4, paddingBottom: insets.bottom + 32, gap: 10 }}>
        <Txt muted style={{ fontSize: fontSizes.sm, paddingHorizontal: 4 }}>{label}</Txt>

        {/* when and how long */}
        <View style={{ borderRadius: radii.xl, backgroundColor: c.cardLift, paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
          <CardEdge radius={radii.xl} />
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.medium }}>Started</Txt>
            <AmountStepper text={fmtT(start).full} unit="min" onLess={() => setStart((s) => Math.max(5 * 60, s - 15))} onMore={() => setStart((s) => Math.min(22 * 60, s + 15))} lessDisabled={start <= 5 * 60} moreDisabled={start >= 22 * 60} accessibilityLabel="Start time" />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.medium }}>It took</Txt>
            <AmountStepper text={`${took} min`} unit="min" onLess={() => setTook((t) => Math.max(10, t - 5))} onMore={() => setTook((t) => Math.min(180, t + 5))} lessDisabled={took <= 10} moreDisabled={took >= 180} accessibilityLabel="How long it took" />
          </Row>
        </View>

        <Txt muted style={{ fontSize: fontSizes.sm, paddingHorizontal: 4, marginTop: 6 }}>Tap an exercise to change its sets</Txt>
        {plan.ex.map((e) => {
          const sets = logged[e.id];
          const anyDone = sets.some((s) => s.done);
          const isOpen = open === e.id;
          const timed = e.mode === 't' || e.mode === 'tw';
          const weighted = e.mode === 'rw' || e.mode === 'tw';
          return (
            <View key={e.id} style={{ borderRadius: radii.xl, backgroundColor: c.surface, overflow: 'hidden' }}>
              <Row style={{ minHeight: 64 }}>
                <Pressy accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${e.name}, ${summary(e, sets)}. Change sets`} onPress={() => { haptic.tick(); setOpen(isOpen ? null : e.id); }} scaleTo={0.985}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingVertical: 10 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt numberOfLines={1} style={{ fontFamily: font.medium, opacity: anyDone ? 1 : 0.5, textDecorationLine: anyDone ? 'none' : 'line-through' }}>{e.name}</Txt>
                    <Txt v="mono" muted numberOfLines={1} style={{ fontSize: fontSizes.xs }}>{summary(e, sets)}</Txt>
                  </View>
                  {isOpen ? <ChevronDown size={16} color={c.muted} /> : <ChevronRight size={16} color={c.muted} />}
                </Pressy>
                <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: anyDone }} accessibilityLabel={`${e.name}. ${anyDone ? 'Done' : 'Not done'}`} onPress={() => flipAll(e)} scaleTo={0.9} hitSlop={6}
                  style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 26, height: 26, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: anyDone ? c.good : 'transparent', borderWidth: anyDone ? 0 : 1.5, borderColor: c.chipLine }}>
                    {anyDone && <Check size={15} color={c.bg} strokeWidth={3} />}
                  </View>
                </Pressy>
              </Row>
              {isOpen && (
                <View style={{ gap: 8, paddingHorizontal: 14, paddingBottom: 14 }}>
                  {sets.map((s, i) => (
                    <Row key={i} style={{ gap: 8 }}>
                      {weighted ? (
                        <Txt style={{ width: 16, fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>{i + 1}</Txt>
                      ) : (
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
                      <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilityLabel={`Set ${i + 1}. ${s.done ? 'Done' : 'Not done'}`} onPress={() => { haptic.tick(); change(e.id, i, { done: !s.done }); }} scaleTo={0.9} hitSlop={8}
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

        <InfoBox>Coach Vikram will be notified of these changes.</InfoBox>
        <Button label="Save changes" disabled={!canSave} onPress={save} />
      </ScrollView>
    </View>
  );
}
