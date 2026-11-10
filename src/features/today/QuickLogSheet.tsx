import React from 'react';
import type { MealId } from '@/lib/data';
import { AteSomethingElse } from './AteSomethingElse';
import { QuickLogClassic } from './QuickLogClassic';

type Mode = 'sugg' | 'scan' | 'write' | 'cat';

// The log sheet. Adding something you ate (scan or write, no planned item to swap) opens the small "Ate something else" step: camera, photos, a box to type in and
// the food library, and typing carries on in a full page that works like a chat. Swapping a planned item and the food library keep the classic sheet.
export function QuickLogSheet({ mealId, mode = 'scan', replaceIdx, backTo }: { mealId: MealId; mode?: Mode; replaceIdx?: number; backTo?: () => void }) {
  // A swap opens the same sheet as "Ate something else"; its library then puts the foods related to the planned item first.
  if (replaceIdx == null ? (mode === 'scan' || mode === 'write') : mode === 'sugg') return <AteSomethingElse mealId={mealId} replaceIdx={replaceIdx} backTo={backTo} />;
  return <QuickLogClassic mealId={mealId} mode={mode} replaceIdx={replaceIdx} backTo={backTo} />;
}
