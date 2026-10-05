import { useDomain } from '@/lib/domain';
import { ScenarioAction, ScenarioRow, useScenarios, useStore } from '@/lib/store';
import { GOAL_DEFAULT } from './data';
import { progressStore } from './store';
import { goalV2Store } from '@/features/goalv2/model';
import { useGoalV2Rows } from '@/features/goalv2/signs';

let loadTimer: ReturnType<typeof setTimeout> | undefined;
export function showProgressLoading(ms = 1400) {
  progressStore.set({ loading: true });
  clearTimeout(loadTimer);
  loadTimer = setTimeout(() => progressStore.set({ loading: false, refreshing: false }), ms);
}

// Mirrors the "Scenarios · Progress" panel of the reference. Every Progress page registers it.
export function useProgressScenarios(title: string, extraRows: ScenarioRow[] = [], extraActions: ScenarioAction[] = [], deps: any[] = []) {
  const ps = progressStore.use();
  const { d, set } = useDomain();
  const { state, setSc } = useStore();
  const v2 = goalV2Store.use();
  const goalRows = useGoalV2Rows();
  const order = ['Weight loss', 'Strength', 'Muscle gain'].includes(d.goal.type) ? d.goal.type : 'Weight loss';
  useScenarios({
    title,
    rows: [
      ...extraRows,
      ...goalRows,
      ...(v2.version === 'Version 1' ? [{ label: 'Goal type (sets card order)', options: ['Weight loss', 'Strength', 'Muscle gain'], value: order, onPick: (v: string) => set({ goal: { ...d.goal, type: v, target: GOAL_DEFAULT[v] } }) }] : []),
      { label: 'Data', options: ['Normal', 'New member'], value: ps.data, onPick: (v) => progressStore.set({ data: v as any }) },
      { label: 'Health Connect (steps, heart rate, sleep)', options: ['Connected', 'Not connected'], value: d.hc ? 'Connected' : 'Not connected', onPick: (v) => set({ hc: v === 'Connected' }) },
      { label: 'Trackers hidden in settings', options: ['None', 'Water & steps'], value: ps.hidden, onPick: (v) => progressStore.set({ hidden: v as any }) },
      { label: 'Assessments', options: ['Two done', 'Only first', 'Due now', 'None yet'], value: d.assess, onPick: (v) => set({ assess: v as any }) },
    ],
    actions: [
      ...extraActions,
      { label: 'Show loading state', run: () => showProgressLoading() },
      { label: 'Reset Progress', run: () => { progressStore.reset(); set({ weight: 72.4, goal: { type: 'Weight loss', target: 6, by: '30 Nov' }, hc: true, assess: 'Two done' }); showProgressLoading(800); } },
    ],
  }, [ps.data, ps.hidden, d.goal, d.hc, d.assess, state.sc.member, v2.version, v2.scenario, ...deps]);
}
