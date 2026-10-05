import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Pill, Row, Txt } from '@/components/ui';
import { FoodMark } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { basePlans, LIBRARY, MealId, SWAPS } from '@/lib/data';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hist, newEx } from './content';
import { useDietActions } from './dietActions';
import { startCreate, startDietEdit, startWorkoutEdit } from './openers';
import { BigTitle, ListRow, Stepper } from './parts';
import { allowedFor, dayPlan, dietItems, DietRow, PEx, setP, usePlans } from './store';

// ---------- Workout plan menu ----------
export function PlanMenuSheet() {
  const { d } = useDomain();
  const { p } = usePlans();
  const { closeSheet, openSheet, toast } = useOverlay();
  const plan = dayPlan(d, p, p.day);
  const go = (fn: () => void) => closeSheet(fn);
  return (
    <>
      <BigTitle>{plan ? plan.name : 'Rest day'}</BigTitle>
      <View>
        <ListRow label="Edit plan" onPress={() => go(() => { if (!startWorkoutEdit(d)) toast('Rest day · create a workout instead'); })} />
        <ListRow label="Create a workout" onPress={() => go(() => startCreate(d))} />
        <ListRow label="Ask Coach to change the plan" onPress={() => go(() => router.push({ pathname: '/plans/ask', params: { kind: 'workout' } }))} />
        <ListRow label="Reset to Coach's version" onPress={() => openSheet(<ResetSheet kind="workout" />, { label: 'Reset plan' })} />
        <ListRow label="Exercise library" onPress={() => openSheet(<LibrarySheet mode="browse" />, { label: 'Exercise library' })} />
        <ListRow label="Workout history" last onPress={() => go(() => router.push('/plans/history'))} />
      </View>
    </>
  );
}

// ---------- Diet plan menu ----------
export function DietMenuSheet() {
  const { d } = useDomain();
  const { p } = usePlans();
  const { closeSheet, openSheet } = useOverlay();
  return (
    <>
      <BigTitle>Diet plan</BigTitle>
      <View>
        <ListRow label="Edit diet plan" onPress={() => closeSheet(() => startDietEdit(d))} />
        <ListRow label="Ask for a diet change" onPress={() => closeSheet(() => router.push({ pathname: '/plans/ask', params: { kind: 'diet' } }))} />
        <ListRow label="Reset to Coach's version" last onPress={() => openSheet(<ResetSheet kind="diet" />, { label: 'Reset plan' })} />
      </View>
      <Txt v="label">Detail level</Txt>
      <Row style={{ gap: 8 }}>
        {(['Detailed', 'Simple'] as const).map((v) => <Pill key={v} label={v} on={p.detail === v} onPress={() => setP({ detail: v })} style={{ flex: 1 }} />)}
      </Row>
    </>
  );
}

// ---------- Reset / discard confirmations ----------
export function ResetSheet({ kind }: { kind: 'workout' | 'diet' }) {
  const { set } = useDomain();
  const { closeSheet, toast } = useOverlay();
  const { resetDiet } = useDietActions();
  const reset = () => {
    if (kind === 'diet') resetDiet();
    else { set({ plans: basePlans() }); setP({ created: {}, applied: false, hl: [] }); }
    closeSheet(() => toast("Back to Coach Vikram's version"));
  };
  return (
    <>
      <BigTitle>Reset to Coach's version?</BigTitle>
      <Txt muted>{kind === 'diet' ? "Your swaps, portions and order changes are removed. What you've already logged stays." : 'Your edits and workouts you created are removed. Coach Vikram\'s plan comes back as it was.'}</Txt>
      <Button label="Reset plan" onPress={reset} />
      <Button kind="secondary" label="Keep my edits" onPress={() => closeSheet()} />
    </>
  );
}

export function DiscardSheet() {
  const { closeSheet } = useOverlay();
  return (
    <>
      <BigTitle>Discard your changes?</BigTitle>
      <Txt muted>You changed this plan but haven't saved it.</Txt>
      <Button label="Discard" onPress={() => closeSheet(() => { setP({ draft: null }); router.back(); })} />
      <Button kind="secondary" label="Keep editing" onPress={() => closeSheet()} />
    </>
  );
}

// ---------- Exercise library ----------
export function LibrarySheet({ mode }: { mode: 'edit' | 'create' | 'browse' }) {
  const { c } = useTheme();
  const { closeSheet, toast } = useOverlay();
  const [q, setQ] = useState('');
  const qq = q.trim().toLowerCase();
  const res = LIBRARY.filter((x) => !qq || x.n.toLowerCase().includes(qq) || x.g.toLowerCase().includes(qq));
  const pick = (n: string) => {
    if (mode === 'browse') { closeSheet(() => router.push({ pathname: '/plans/exercise', params: { name: n } })); return; }
    const ex = newEx(n, mode === 'create' ? 'created' : 'you') as PEx;
    if (mode === 'edit') setP((s) => (s.draft?.kind === 'workout' ? { draft: { ...s.draft, rows: [...s.draft.rows, ex] } } : {}));
    else setP((s) => ({ cEx: [...s.cEx, ex], cErr: '' }));
    closeSheet(() => { if (mode === 'edit') toast(`Added ${n}`); });
  };
  return (
    <>
      <BigTitle>{mode === 'browse' ? 'Exercise library' : 'Add exercise'}</BigTitle>
      <Field accessibilityLabel="Search exercises" value={q} onChangeText={setQ} placeholder="Search exercises" returnKeyType="search" />
      <View>
        {res.map((x, i) => (
          <ListRow key={x.n} label={x.n} sub={x.g} last={i === res.length - 1} chevron={false} a11y={`${mode === 'browse' ? 'View' : 'Add'} ${x.n}, ${x.g}`}
            right={<Txt style={{ fontFamily: font.semibold, color: c.accentText }}>{mode === 'browse' ? 'View' : 'Add'}</Txt>} onPress={() => pick(x.n)} />
        ))}
        {res.length === 0 && <Txt muted style={{ paddingVertical: 18 }}>No exercises match "{q}".</Txt>}
      </View>
    </>
  );
}

// ---------- Change one row of the edit list ----------
export function EditItemSheet() {
  const { p } = usePlans();
  const { closeSheet } = useOverlay();
  const dr = p.draft;
  const row = dr ? (dr.rows as (PEx | DietRow)[]).find((r) => ('id' in r ? r.id : r.key) === p.eiKey) : undefined;
  if (!dr || !row) return <Txt muted>This item was removed.</Txt>;
  const upd = (fn: (r: any) => any) => setP((s) => {
    if (!s.draft) return {};
    const rows = (s.draft.rows as any[]).map((r) => (('id' in r ? r.id : r.key) === s.eiKey ? fn({ ...r }) : r));
    return { draft: { ...s.draft, rows } as any };
  });
  const step = (key: 'sets' | 'reps' | 't' | 'kg', delta: number, min: number) => upd((r) => { r[key] = Math.max(min, Math.round(((r[key] ?? 0) + delta) * 10) / 10); return r; });
  if (dr.kind === 'diet') {
    const r = row as DietRow;
    return (
      <>
        <BigTitle>{r.n}</BigTitle>
        <Stepper label="Portion" value={`${r.por}×`} minusLabel="Smaller portion" plusLabel="Bigger portion"
          onMinus={() => upd((x) => { x.por = Math.max(0.5, x.por - 0.5); return x; })} onPlus={() => upd((x) => { x.por = Math.min(3, x.por + 0.5); return x; })} />
        <Txt v="caption">~{Math.round(r.k * r.por)} kcal · {Math.round(r.p * r.por)} g protein</Txt>
        <Button label="Done" onPress={() => closeSheet()} />
      </>
    );
  }
  const e = row as PEx;
  const timed = e.mode === 't' || e.mode === 'tw';
  return (
    <>
      <BigTitle>{e.name}</BigTitle>
      <Stepper label="Sets" value={String(e.sets)} minusLabel="One set less" plusLabel="One set more" onMinus={() => step('sets', -1, 1)} onPlus={() => step('sets', 1, 1)} />
      {timed
        ? <Stepper label="Time" value={`${e.t ?? 0} s`} minusLabel="5 seconds less" plusLabel="5 seconds more" onMinus={() => step('t', -5, 5)} onPlus={() => step('t', 5, 5)} />
        : <Stepper label="Reps" value={String(e.reps)} minusLabel="One rep less" plusLabel="One rep more" onMinus={() => step('reps', -1, 1)} onPlus={() => step('reps', 1, 1)} />}
      <Stepper label="Weight" value={e.kg ? `${Math.round(e.kg * 10) / 10} kg` : 'BW'} minusLabel="2.5 kg less" plusLabel="2.5 kg more"
        onMinus={() => step('kg', -2.5, 0)} onPlus={() => upd((x) => { x.kg = Math.round((x.kg + 2.5) * 10) / 10; if (x.mode === 'r') x.mode = 'rw'; if (x.mode === 't') x.mode = 'tw'; return x; })} />
      <Txt v="caption">{timed ? 'Timed sets: the workout shows a timer for each set.' : e.kg ? 'Reps with weight.' : 'Bodyweight reps. Add weight to track kilos.'}</Txt>
      <Button label="Done" onPress={() => closeSheet()} />
    </>
  );
}

// ---------- Diet item: long-press menu, nutrition, swap ----------
function useItem(mid: MealId, itemKey: string) {
  const { d } = useDomain();
  const { p } = usePlans();
  return { it: dietItems(d, p, mid).find((i) => i.key === itemKey), p };
}

export function ItemMenuSheet({ mid, itemKey }: { mid: MealId; itemKey: string }) {
  const { c } = useTheme();
  const { it } = useItem(mid, itemKey);
  const { openSheet, closeSheet, toast } = useOverlay();
  const A = useDietActions();
  if (!it) return <Txt muted>This item was removed.</Txt>;
  const por = (v: number) => { A.setPor(mid, it.key, v); closeSheet(() => toast(v < 1 ? 'Half portion logged' : '1½ portions logged')); };
  return (
    <>
      <Row style={{ gap: 10 }}><FoodMark type={it.type} size={16} /><BigTitle style={{ flex: 1 }}>{it.n}</BigTitle></Row>
      <View>
        <ListRow label="Swap" chevron={false} onPress={() => openSheet(it.kind === 'plan' ? <QuickLogSheet mealId={mid} mode="sugg" replaceIdx={it.idx} /> : <SwapSheet mid={mid} itemKey={it.key} always={false} />, { label: 'Swap item' })} />
        <ListRow label="Less" chevron={false} right={<Txt v="caption">½ portion</Txt>} onPress={() => por(0.5)} />
        <ListRow label="More" chevron={false} right={<Txt v="caption">1½ portions</Txt>} onPress={() => por(1.5)} />
        {!it.mine && <ListRow label="Skip for today" chevron={false} onPress={() => closeSheet(() => A.skipItem(mid, it))} />}
        <ListRow label="Nutrition" chevron={false} onPress={() => openSheet(<NutritionSheet mid={mid} itemKey={it.key} />, { label: 'Nutrition' })} />
        <ListRow label="Food details and recipe" chevron={false} onPress={() => closeSheet(() => router.push({ pathname: '/food', params: { mid, k: String(it.idx), extra: it.mine ? '1' : '0' } }))} />
        <ListRow label="Always use a swap for this" chevron={false} last={!it.mine} onPress={() => openSheet(<SwapSheet mid={mid} itemKey={it.key} always />, { label: 'Swap item' })} />
        {it.mine && <ListRow label="Delete item" tone={c.warn} chevron={false} last onPress={() => closeSheet(() => A.deleteExtra(mid, it))} />}
      </View>
      {!it.mine && <Txt v="caption" style={{ fontSize: 13 }}>Items from Coach's plan can be skipped but not deleted.</Txt>}
    </>
  );
}

export function NutritionSheet({ mid, itemKey }: { mid: MealId; itemKey: string }) {
  const { c } = useTheme();
  const { it } = useItem(mid, itemKey);
  if (!it) return <Txt muted>This item was removed.</Txt>;
  const tiles = [['Calories', `${Math.round(it.k * it.por)} kcal`], ['Protein', `${Math.round(it.p * it.por)} g`], ['Carbs', `${Math.round(it.c * it.por)} g`], ['Fat', `${Math.round(it.f * it.por)} g`]];
  return (
    <>
      <BigTitle>{it.n}</BigTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tiles.map(([l, v]) => (
          <View key={l} accessible accessibilityLabel={`${l} ${v}`} style={{ width: '48%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: c.surface2 }}>
            <Txt v="label">{l}</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: 25 }}>{v}</Txt>
          </View>
        ))}
      </View>
      <Txt v="caption">{it.est || it.swapped || it.mine ? 'Estimated values' : 'Example values'} · real values come from the Indian food database</Txt>
    </>
  );
}

export function SwapSheet({ mid, itemKey, always: always0 }: { mid: MealId; itemKey: string; always: boolean }) {
  const { c } = useTheme();
  const { it, p } = useItem(mid, itemKey);
  const { closeSheet } = useOverlay();
  const A = useDietActions();
  const [always, setAlways] = useState(always0);
  if (!it) return <Txt muted>This item was removed.</Txt>;
  const opts = (SWAPS[it.baseN] ?? SWAPS.any).filter((o) => allowedFor(p.diet, o.type) && `${o.n}, ${o.q}` !== it.n);
  const pick = (o: (typeof opts)[number]) => closeSheet(() => A.applySwap(mid, it, { n: `${o.n}, ${o.q}`, k: o.k, p: o.p, type: o.type }, always));
  return (
    <>
      <BigTitle>Swap {it.n.toLowerCase()}</BigTitle>
      <Txt v="mono" muted style={{ marginTop: -6 }}>~{it.k} kcal · {it.p} g protein</Txt>
      <View>
        {opts.map((o) => (
          <ListRow key={o.n} label={`${o.n}, ${o.q}`} sub={o.coach ? 'Coach-approved' : undefined} chevron={false} a11y={`${o.n}, ${o.q}, about ${o.k} kcal, ${o.p} grams protein${o.coach ? ', coach-approved' : ''}`}
            right={<Row style={{ gap: 8 }}><FoodMark type={o.type} /><Txt v="mono" muted style={{ fontSize: 12 }}>≈{o.k} · {o.p} g</Txt></Row>} onPress={() => pick(o)} />
        ))}
        <ListRow label="Search something else" last onPress={() => closeSheet(() => router.push({ pathname: '/plans/log', params: { meal: mid, replace: it.key } }))} />
      </View>
      <Row style={{ gap: 8 }}>
        <Pill label="Today only" on={!always} onPress={() => setAlways(false)} style={{ flex: 1 }} />
        <Pill label="Always use this swap" on={always} onPress={() => setAlways(true)} style={{ flex: 1 }} />
      </Row>
      <Txt v="caption" style={{ fontSize: 13, color: c.muted }}>Matched on protein first, then calories · filtered for {p.diet.toLowerCase()} · Always use notifies Coach Vikram</Txt>
    </>
  );
}

// ---------- Workout history summary ----------
export function HistSheet({ h }: { h: Hist }) {
  const { c } = useTheme();
  return (
    <>
      <BigTitle>{h.t}</BigTitle>
      <Txt muted style={{ marginTop: -6 }}>{h.s || 'Logged'} · {h.m}</Txt>
      <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: c.surface2, gap: 4 }}>
        {h.b.split('\n').map((l) => <Txt key={l} v="mono">{l}</Txt>)}
      </View>
    </>
  );
}
