import { useDomain } from '@/lib/domain';
import { useStreak } from '@/features/streak/useStreak';
import { TODAY, trend } from '@/features/progress/trends';
import { goalV2Store, GoalDesignVersion, STATUS_SCENARIOS, StatusScenario } from './model';
import { ScenarioRow } from '@/lib/store';
import { WEEK_TARGET } from '@/features/streak/data';

// "Early signs" are read from the same numbers the cards below show (this week's streak, diet and weight), never typed in.
export function useEarlySigns(): string {
  const { d } = useDomain();
  const st = useStreak();
  const diet = trend('diet', 'week', TODAY, { weight: d.weight, water: d.water });
  const down = Math.round((74.5 - d.weight) * 10) / 10;
  const parts = [
    `${st.weekDone} of ${st.target} ${st.target === 1 ? 'workout' : 'workouts'} this week`,
    diet.hasData ? `diet ${diet.big} on plan` : null,
    down > 0 ? `weight ↓${down.toFixed(1)} kg` : null,
  ].filter(Boolean);
  return `Early signs: ${parts.join(' · ')}`;
}

const GOAL_TYPE_OPTIONS = ['Weight loss', 'Strength', 'Flexibility', 'Consistency'];
const typeLabel = (t: string) => (t === 'General fitness' || t === 'Not sure yet' ? 'Consistency' : GOAL_TYPE_OPTIONS.includes(t) ? t : 'Weight loss');

// The panel rows for the design switch and, in Version 2, every goal type and state. Add these to a screen's useScenarios rows.
export function useGoalV2Rows(): ScenarioRow[] {
  const { d, set } = useDomain();
  const s = goalV2Store.use();
  const rows: ScenarioRow[] = [
    { label: 'Goal design', options: ['Version 1', 'Version 2'], value: s.version, onPick: (v) => goalV2Store.set({ version: v as GoalDesignVersion }) },
  ];
  if (s.version === 'Version 2') {
    rows.push(
      {
        label: 'Goal type (Version 2)', options: GOAL_TYPE_OPTIONS, value: typeLabel(d.goal.type),
        onPick: (v) => {
          const next = v === 'Consistency' ? { type: 'General fitness', target: WEEK_TARGET } : v === 'Weight loss' ? { type: v, target: 6 } : v === 'Strength' ? { type: v, target: 80 } : { type: v, target: 0 };
          set({ goal: { ...d.goal, ...next } });
          goalV2Store.set({ extendDays: 0, lowerBy: 0, finished: false, kept: false });
        },
      },
      {
        label: 'Goal status (Version 2)', options: STATUS_SCENARIOS, value: s.scenario,
        onPick: (v) => goalV2Store.set({ scenario: v as StatusScenario, extendDays: 0, lowerBy: 0, finished: false, kept: false }),
      },
    );
  }
  return rows;
}
export const goalV2Deps = (): any[] => {
  const s = goalV2Store.get();
  return [s.version, s.scenario];
};
