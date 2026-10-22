import React from 'react';
import { ChangePhoneSheet, DobSheet, PhotoSheet } from '@/app/profile/details';
import { WeighDateSheet } from '@/features/body/BodyLog';
import { AttachSheet } from '@/features/chat/Composer';
import { StillTrainingSheet } from '@/features/checkin/CheckInEngine';
import { DateSheet } from '@/features/goalv2/FinishBy';
import { ChatOptionsSheet, FlagSheet } from '@/features/gym/sheets';
import { UndoEatenSheet } from '@/features/plans/DietPlan';
import { HIST } from '@/features/plans/content';
import { QtySheet } from '@/features/plans/QtySheet';
import { DietMenuSheet, DiscardSheet, DietSwapSheet, EditItemSheet, HistSheet, ItemMenuSheet, LibrarySheet, NutritionSheet, PlanMenuSheet, ResetSheet } from '@/features/plans/Sheets';
import { ManualLogSheet } from '@/features/progress/LogSheets';
import { CalendarSheet } from '@/features/progress/TrendUI';
import { JoinConsentSheet, ProgrammeSwitcherSheet } from '@/features/shell/Switcher';
import { LogoutSheet } from '@/features/shell/sheets';
import { LogMealsSheet } from '@/features/today/LogMealsSheet';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import { StepsSheet } from '@/features/today/StepsCards';
import { UpdatesSheet } from '@/features/today/TopCards';
import { HealthSheet, WaterSheet } from '@/features/today/Trackers';
import { DaySheet } from '@/features/today/WeekCard';

// Development only: every bottom sheet that can be opened without a running workout, with sample props, for the screenshot scripts
// (/dev-cards?c=sheet&s=<Name>). The workout sheets need the live session API, so scripts/visual/shots-list.js opens them by tapping.
export const DEV_SHEETS: Record<string, { label: string; node: () => React.ReactNode }> = {
  AttachSheet: { label: 'Send a photo', node: () => <AttachSheet onPick={() => {}} /> },
  CalendarSheet: { label: 'Pick a date', node: () => <CalendarSheet /> },
  ChangePhoneSheet: { label: 'Change mobile number', node: () => <ChangePhoneSheet /> },
  ChatOptionsSheet: { label: 'Chat options', node: () => <ChatOptionsSheet /> },
  DateSheet: { label: 'Pick a finish date', node: () => <DateSheet start={new Date(2026, 9, 21)} onPick={() => {}} /> },
  DaySheet: { label: 'Day summary', node: () => <DaySheet i={1} /> },
  DietMenuSheet: { label: 'Diet options', node: () => <DietMenuSheet /> },
  DietSwapSheet: { label: 'Swap item', node: () => <DietSwapSheet mid="bf" itemKey="0" always={false} /> },
  DiscardSheet: { label: 'Discard changes', node: () => <DiscardSheet /> },
  DobSheet: { label: 'Date of birth', node: () => <DobSheet /> },
  EditItemSheet: { label: 'Edit item', node: () => <EditItemSheet /> },
  FlagSheet: { label: 'Flag session', node: () => <FlagSheet /> },
  HealthSheet: { label: 'Health data', node: () => <HealthSheet k="hr" /> },
  HistSheet: { label: 'Workout summary', node: () => <HistSheet h={HIST[0]} /> },
  ItemMenuSheet: { label: 'Item options', node: () => <ItemMenuSheet mid="bf" itemKey="0" /> },
  JoinConsentSheet: { label: 'Join programme', node: () => <JoinConsentSheet /> },
  LibrarySheet: { label: 'Exercise library', node: () => <LibrarySheet mode="browse" /> },
  LogMealsSheet: { label: 'Log meal', node: () => <LogMealsSheet mealId="sn" /> },
  LogoutSheet: { label: 'Log out', node: () => <LogoutSheet /> },
  ManualLogSheet: { label: 'Add manually', node: () => <ManualLogSheet title="Add steps" fields={[{ key: 'steps', label: 'Steps', ph: '8000', unit: 'steps' }]} done="Steps added" /> },
  NutritionSheet: { label: 'Nutrition', node: () => <NutritionSheet mid="bf" itemKey="0" /> },
  PhotoSheet: { label: 'Profile photo', node: () => <PhotoSheet hasCustom onPick={() => {}} onRemove={() => {}} /> },
  PlanMenuSheet: { label: 'Plan options', node: () => <PlanMenuSheet /> },
  ProgrammeSwitcherSheet: { label: 'Switch programme', node: () => <ProgrammeSwitcherSheet /> },
  QtySheet: { label: 'Change amount', node: () => <QtySheet mid="bf" itemKey="0" /> },
  QuickLogSheet: { label: 'Log a meal', node: () => <QuickLogSheet mealId="lu" mode="scan" /> },
  ResetSheet: { label: 'Reset plan', node: () => <ResetSheet kind="workout" /> },
  StepsSheet: { label: 'Add steps', node: () => <StepsSheet /> },
  StillTrainingSheet: { label: 'Still training?', node: () => <StillTrainingSheet /> },
  UndoEatenSheet: { label: 'Mark as not eaten', node: () => <UndoEatenSheet what="Paneer bhurji" onConfirm={() => {}} /> },
  UpdatesSheet: { label: 'Updates', node: () => <UpdatesSheet /> },
  WaterSheet: { label: 'Water', node: () => <WaterSheet /> },
  WeighDateSheet: { label: 'Weighed on', node: () => <WeighDateSheet value={0} onPick={() => {}} /> },
};
