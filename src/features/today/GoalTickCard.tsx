import React from 'react';
import { GoalCard } from '@/design-system/patterns/GoalCard';
import { GoalCardState } from '@/features/today/goalCardState';

// The goal card moved to src/design-system/patterns/GoalCard.tsx (variants card, flat, strip). This file keeps the old import path and the
// old props (flat / state / weighDays) working, so the screens that import GoalTickCard do not change.
export { Glow, goalSizeStore, GOAL_SIZES } from '@/design-system/patterns/GoalCard';
export type { GoalSize } from '@/design-system/patterns/GoalCard';

export function GoalTickCard({ flat = false, state, weighDays }: { flat?: boolean; state?: GoalCardState; weighDays?: number } = {}) {
  return <GoalCard variant={flat ? 'flat' : 'card'} state={state} weighDays={weighDays} />;
}
