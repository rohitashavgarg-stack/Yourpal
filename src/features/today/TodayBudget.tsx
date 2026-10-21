import React from 'react';
import { useDomain, totals, burned, wkDoneInfo, workoutState } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { createStore } from '@/lib/createStore';
import { BudgetCard } from '@/design-system/patterns/BudgetCard';

// Which card sits at the top of Today: the whole goal (the live goal card) or today's calories. Demo panel only for now.
export const topCardStore = createStore(() => ({ mode: 'Today card' as 'Goal card' | 'Today card' }));

const PLANNED_BURN = 350;

// Today's calories (the Daily budget card), fed from the member's day. The drawing lives in src/design-system/patterns/BudgetCard.tsx.
export function TodayBudgetCard() {
  const { d } = useDomain();
  const live = d.hc && d.wearable; // a real burned number needs a watch; without one the card shows the plan, not a measurement
  const done = workoutState(d) === 'done';
  const burn = live ? burned(d) : done ? wkDoneInfo(d).k : 0;
  return <BudgetCard eaten={totals(d).k} eatTarget={KCAL_TARGET} burned={burn} burnTarget={PLANNED_BURN} burnSource={live ? 'watch' : done ? 'done' : 'plan'} />;
}
