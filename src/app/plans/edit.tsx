import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Minus } from '@/lib/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Pressy, Txt } from '@/components/ui';
import { FoodMark } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { mealLog, useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { DragList, ROW_H } from '@/features/plans/DragList';
import { DiscardSheet, EditItemSheet, LibrarySheet } from '@/features/plans/Sheets';
import { InfoBox, PageHeader } from '@/features/plans/parts';
import { mealName } from '@/features/plans/openers';
import { dayPlan, DietRow, exSub, getP, PEx, pk, setP, usePlans } from '@/features/plans/store';

export default function EditPlan() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { openSheet, toast } = useOverlay();
  const [dragging, setDragging] = useState(false);
  const dr = p.draft;
  const dirty = !!dr && JSON.stringify(dr.rows) !== dr.orig;

  const keyOf = (r: PEx | DietRow) => ('id' in r ? r.id : r.key);
  const nameOf = (r: PEx | DietRow) => ('name' in r ? r.name : r.n);

  const close = () => {
    const cur = getP().draft;
    if (cur && JSON.stringify(cur.rows) !== cur.orig) openSheet(<DiscardSheet />, { label: 'Discard changes' });
    else { setP({ draft: null }); router.back(); }
  };
  const move = (from: number, to: number) => setP((s) => {
    if (!s.draft) return {};
    const rows = [...(s.draft.rows as any[])]; const [m] = rows.splice(from, 1); rows.splice(to, 0, m);
    return { draft: { ...s.draft, rows } as any };
  });
  const remove = (r: PEx | DietRow) => {
    const prev = getP().draft;
    setP((s) => (s.draft ? { draft: { ...s.draft, rows: (s.draft.rows as any[]).filter((x) => keyOf(x) !== keyOf(r)) } as any } : {}));
    toast(`Removed ${nameOf(r)}`, { undo: () => setP({ draft: prev }) });
  };

  useScenarios({
    title: 'Edit plan',
    rows: [],
    actions: [
      { label: 'Remove the first row', run: () => { const r = getP().draft?.rows[0] as any; if (r) remove(r); } },
      { label: 'Close (asks to discard when changed)', run: () => close() },
    ],
  }, [dirty, dr?.rows.length]);

  if (!dr) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <PageHeader title="Edit plan" icon="close" />
        <Txt muted style={{ padding: 24, textAlign: 'center' }}>Nothing to edit. Open Edit plan from the Plans menu.</Txt>
      </View>
    );
  }
  const isDiet = dr.kind === 'diet';
  const title = isDiet ? `Edit ${mealName(dr.meal).toLowerCase()}` : `Edit ${(dayPlan(d, p, dr.day)?.name ?? 'plan').toLowerCase()}`;
  const save = () => {
    if (!dirty) return;
    if (dr.kind === 'workout') {
      const orig: PEx[] = JSON.parse(dr.orig);
      const marked = dr.rows.map((x) => {
        const o = orig.find((y) => y.id === x.id); const n = { ...x };
        if (!o) n.by = n.by ?? 'you';
        else if (o.sets !== x.sets || o.reps !== x.reps || o.kg !== x.kg || o.t !== x.t) n.by = n.by === 'created' ? 'created' : 'you';
        return n;
      });
      const cr = p.created[dr.day];
      if (cr) setP({ created: { ...p.created, [dr.day]: { ...cr, ex: marked } } });
      else set((s) => { const b = s.plans[dr.day]; if (!b) return {}; return { plans: { ...s.plans, [dr.day]: { ...b, ex: marked.map(({ hl, ...e }) => ({ ...e, by: e.by === 'created' ? 'you' : e.by })) } } }; });
    } else {
      const mid = dr.meal;
      const x = mealLog(d, mid);
      const keep = x.extra.map((_, j) => dr.rows.some((r) => r.key === `x${j}`));
      const map: Record<string, string> = {}; let n = 0;
      x.extra.forEach((_, j) => { if (keep[j]) map[`x${j}`] = `x${n++}`; });
      const added = dr.rows.filter((r) => r.added);
      added.forEach((r) => { map[r.key] = `x${n++}`; });
      const extra = [...x.extra.filter((_, j) => keep[j]), ...added.map((r) => ({ n: r.n, k: Math.round(r.k), p: Math.round(r.p), type: r.type, est: !!r.added?.est }))];
      set((s) => ({ meals: { ...s.meals, [mid]: { ...mealLog(s, mid), extra } } }));
      const newKey = (k: string) => (k.startsWith('p') ? k : map[k]);
      setP((s) => {
        const por: Record<string, number> = {};
        Object.entries(s.por).forEach(([k, v]) => { if (!k.startsWith(`${mid}:`)) por[k] = v; });
        dr.rows.forEach((r) => { if (r.por !== 1) por[pk(mid, newKey(r.key))] = r.por; });
        return { por, order: { ...s.order, [mid]: dr.rows.map((r) => newKey(r.key)) } };
      });
    }
    setP({ draft: null });
    router.back();
    toast(d.offline ? 'Saved on this phone · syncs when online' : 'Saved · Coach Vikram notified');
  };
  const add = () => {
    if (dr.kind === 'diet') router.push({ pathname: '/plans/log', params: { meal: dr.meal, edit: '1' } });
    else openSheet(<LibrarySheet mode="edit" />, { label: 'Add exercise' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ gestureEnabled: !dirty }} />
      <PageHeader title={title} icon="close" onClose={close}
        right={
          <Pressy accessibilityRole="button" accessibilityLabel="Save" accessibilityState={{ disabled: !dirty }} disabled={!dirty} onPress={save}
            style={{ height: 44, paddingHorizontal: 12, borderRadius: 22, justifyContent: 'center', opacity: dirty ? 1 : 0.4 }}>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>Save</Txt>
          </Pressy>
        } />
      <ScrollView scrollEnabled={!dragging} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 28, gap: 12 }}>
        <Txt muted style={{ fontSize: 13, paddingHorizontal: 4 }}>Hold ≡ and drag to reorder · tap a row to change it</Txt>
        <DragList<PEx | DietRow>
          items={dr.rows as (PEx | DietRow)[]} keyOf={keyOf} labelOf={nameOf} onMove={move} onDragging={setDragging}
          renderRow={(r, handle) => {
            const diet = !('id' in r);
            const dRow = r as DietRow;
            const sub = diet ? `~${Math.round(dRow.k * dRow.por)} kcal · ${Math.round(dRow.p * dRow.por)} g${dRow.por !== 1 ? ` · ${dRow.por}×` : ''}` : exSub(r as PEx);
            const canRemove = !diet || dRow.mine;
            return (
              <View style={{ height: ROW_H, borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 }}>
                {handle}
                <Pressy accessibilityRole="button" accessibilityLabel={`${nameOf(r)}, ${sub}. Change`} onPress={() => { setP({ eiKey: keyOf(r) }); openSheet(<EditItemSheet />, { label: 'Edit item' }); }}
                  scaleTo={0.985} style={{ flex: 1, height: 60, justifyContent: 'center', minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {diet && <FoodMark type={dRow.type} size={12} />}
                    <Txt numberOfLines={1} style={{ fontFamily: font.medium, flexShrink: 1 }}>{nameOf(r)}</Txt>
                  </View>
                  <Txt v="mono" muted numberOfLines={1} style={{ fontSize: 12 }}>{sub}</Txt>
                </Pressy>
                {canRemove && (
                  <Pressy accessibilityRole="button" accessibilityLabel={`Remove ${nameOf(r)}`} onPress={() => remove(r)} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={18} color={c.muted} />
                  </Pressy>
                )}
              </View>
            );
          }} />
        {dr.rows.length === 0 && <Txt muted style={{ textAlign: 'center', padding: 12 }}>Nothing here yet. Add {isDiet ? 'an item' : 'an exercise'} to keep this {isDiet ? 'meal' : 'day'} in your plan.</Txt>}
        <Pressy accessibilityRole="button" onPress={add} style={{ height: 48, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 14 }}>+ {isDiet ? 'Add item' : 'Add exercise'}</Txt>
        </Pressy>
        <InfoBox>Coach Vikram will be notified of these changes.</InfoBox>
        <Button label="Save changes" disabled={!dirty} onPress={save} />
        {isDiet && <Button kind="secondary" label="Ask for a diet change instead" onPress={() => router.push({ pathname: '/plans/ask', params: { kind: 'diet' } })} />}
      </ScrollView>
    </View>
  );
}
