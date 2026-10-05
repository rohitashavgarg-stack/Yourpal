import { MealId, MEALS } from '@/lib/data';
import { Domain, Extra, MealLog, mealLog, NOWS, useDomain } from '@/lib/domain';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { DItem, getP, pk, PlansState, setP } from './store';

// Every diet mutation in Plans. The meal log (eaten / swaps / "yours" items) is the shared
// domain log, so Today shows the same thing; portions, per-item skips and order are Plans-local.
type Snap = { meals: Domain['meals']; local: Pick<PlansState, 'por' | 'skip' | 'order' | 'always'> };

export function useDietActions() {
  const { d, set } = useDomain();
  const { toast } = useOverlay();

  // Snapshot of the latest render (user actions always happen after it).
  const snapNow = (): Snap => { const p = getP(); return { meals: d.meals, local: { por: p.por, skip: p.skip, order: p.order, always: p.always } }; };
  const restore = (sn: Snap) => { set({ meals: sn.meals }); setP(sn.local); };
  const withUndo = (msg: string, fn: () => void) => { const sn = snapNow(); fn(); toast(msg, { undo: () => restore(sn) }); };

  const patchMeal = (mid: MealId, fn: (x: MealLog, s: Domain) => Partial<MealLog>) =>
    set((s) => { const cur = mealLog(s, mid); return { meals: { ...s.meals, [mid]: { ...cur, ...fn(cur, s) } } }; });

  const clearSkip = (mid: MealId, key: string) => setP((p) => { const n = { ...p.skip }; delete n[pk(mid, key)]; return { skip: n }; });

  const eat = (mid: MealId, it: DItem, on: boolean) => {
    if (it.kind === 'extra') {
      if (!on) withUndo(`Removed ${it.n}`, () => patchMeal(mid, (x) => ({ extra: x.extra.filter((_, j) => j !== it.idx) })));
      return;
    }
    if (on) haptic.success();
    clearSkip(mid, it.key);
    patchMeal(mid, (x, s) => ({ eaten: on ? Array.from(new Set([...x.eaten, it.idx])) : x.eaten.filter((k) => k !== it.idx), skip: false, at: x.at ?? NOWS[s.time] }));
  };

  const skipItem = (mid: MealId, it: DItem) => {
    withUndo(`Skipped ${it.n} for today`, () => {
      setP((p) => ({ skip: { ...p.skip, [pk(mid, it.key)]: true } }));
      patchMeal(mid, (x) => ({ eaten: x.eaten.filter((k) => k !== it.idx) }));
    });
  };

  const mealAll = (mid: MealId, items: DItem[], name: string) => {
    const planned = items.filter((i) => i.kind === 'plan');
    const all = planned.every((i) => i.st === 'eaten');
    if (all) { patchMeal(mid, () => ({ eaten: [] })); return; }
    haptic.success();
    withUndo(`${name} marked as eaten`, () => {
      setP((p) => { const n = { ...p.skip }; Object.keys(n).forEach((k) => { if (k.startsWith(`${mid}:`)) delete n[k]; }); return { skip: n }; });
      patchMeal(mid, (x, s) => ({ eaten: planned.map((i) => i.idx), skip: false, at: x.at ?? NOWS[s.time] }));
    });
  };

  const setPor = (mid: MealId, key: string, por: number) => setP((p) => ({ por: { ...p.por, [pk(mid, key)]: por } }));

  const applySwap = (mid: MealId, it: DItem, o: Extra, always: boolean) => {
    if (it.kind === 'extra') patchMeal(mid, (x) => ({ extra: x.extra.map((e, j) => (j === it.idx ? { ...o } : e)) }));
    else patchMeal(mid, (x) => ({ repl: { ...x.repl, [it.idx]: { ...o } } }));
    setP((p) => { const a = { ...p.always }; if (always) a[pk(mid, it.key)] = true; else delete a[pk(mid, it.key)]; return { always: a }; });
    haptic.success();
    toast(always ? `Always swapping to ${o.n} · Coach Vikram notified` : `Swapped to ${o.n} for today`);
  };

  const deleteExtra = (mid: MealId, it: DItem) => {
    withUndo(`Deleted ${it.n}`, () => {
      patchMeal(mid, (x) => ({ extra: x.extra.filter((_, j) => j !== it.idx) }));
      // Later "yours" items shift down by one: keep their portion / order keys in step.
      setP((p) => {
        const shift = (k: string) => { const m = /^x(\d+)$/.exec(k); if (!m) return k; const j = Number(m[1]); return j > it.idx ? `x${j - 1}` : k; };
        const por: Record<string, number> = {};
        Object.entries(p.por).forEach(([k, v]) => { const [m, key] = k.split(':'); if (m !== mid) { por[k] = v; return; } if (key === it.key) return; por[`${m}:${shift(key)}`] = v; });
        const ord = p.order[mid]?.filter((k) => k !== it.key).map(shift);
        return { por, order: ord ? { ...p.order, [mid]: ord } : p.order };
      });
    });
  };

  const addExtra = (mid: MealId, e: Extra) => patchMeal(mid, (x, s) => ({ extra: [...x.extra, e], skip: false, at: x.at ?? NOWS[s.time] }));

  const resetDiet = () => {
    set((s) => { const meals = { ...s.meals }; MEALS.forEach((m) => { const x = s.meals[m.id]; if (x) meals[m.id] = { ...x, repl: {} }; }); return { meals }; });
    setP({ por: {}, skip: {}, order: {}, always: {} });
  };

  return { eat, skipItem, mealAll, setPor, applySwap, deleteExtra, addExtra, resetDiet, withUndo, patchMeal };
}
