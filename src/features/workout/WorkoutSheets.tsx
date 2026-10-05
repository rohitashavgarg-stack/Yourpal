import React, { useState } from 'react';
import { View } from 'react-native';
import { ArrowRightLeft, ChevronRight, MessageCircle, Play, Search, SkipForward, SlidersHorizontal } from '@/lib/icons';
import { router } from 'expo-router';
import { Button, Pill, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { legDay } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { setLabel } from './session';

// Screen-level handlers the sheets call (kept in a ref so they are always current).
export type WkApi = {
  openSwap: () => void; openSetMenu: (i: number) => void; openNote: (i: number) => void; skipSet: (i: number) => void;
  copyToAll: () => void; askCoach: () => void; formTips: () => void; skipExercise: () => void; finishNow: () => void; toggleWarm: (i: number) => void;
  currentSet: () => number; swapTo: (name: string, plan: boolean) => void;
};
type ApiRef = React.MutableRefObject<WkApi>;

function MenuRow({ icon: I, t, s, onPress, last }: { icon: any; t: string; s?: string; onPress: () => void; last?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" onPress={onPress} scaleTo={0.985} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      {I && <I size={19} color={c.muted} />}
      <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold }}>{t}</Txt>{s ? <Txt v="caption">{s}</Txt> : null}</View>
    </Pressy>
  );
}

export function WkMenuSheet({ api }: { api: ApiRef }) {
  const { d } = useDomain();
  const s = d.session;
  if (!s) return null;
  const e = s.ex[s.exIdx];
  return (
    <>
      <View style={{ gap: 2 }}><Txt v="label">Exercise {s.exIdx + 1} of {s.ex.length}</Txt><Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>{e.name}</Txt></View>
      <View>
        <MenuRow icon={ArrowRightLeft} t="Swap exercise" s="Pick an alternative for today or for your plan" onPress={() => api.current.openSwap()} />
        <MenuRow icon={MessageCircle} t="Ask Coach Vikram" s="Opens chat with this exercise attached" onPress={() => api.current.askCoach()} />
        <MenuRow icon={Play} t="Form tips & video" s={`Cues for ${e.name}`} onPress={() => api.current.formTips()} />
        <MenuRow icon={SlidersHorizontal} t="Options for the current set" s="Warm-up, note, copy to all sets" onPress={() => { const i = api.current.currentSet(); if (i >= 0) api.current.openSetMenu(i); }} />
        <MenuRow icon={SkipForward} t="Skip this exercise" s="Remaining sets are marked skipped" onPress={() => api.current.skipExercise()} last />
      </View>
    </>
  );
}

export function FormTipsSheet() {
  const { c } = useTheme();
  const { d } = useDomain();
  const s = d.session;
  if (!s) return null;
  const e = s.ex[s.exIdx];
  return (
    <>
      <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>{e.name}</Txt>
      <Txt v="label">{e.muscles}</Txt>
      <View style={{ padding: 16, borderRadius: 20, backgroundColor: c.surface2 }}><Txt>{e.cue}</Txt></View>
      <Txt v="caption">Form videos from Coach Vikram arrive with the full plan.</Txt>
    </>
  );
}

export function SwapSheet({ api }: { api: ApiRef }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { closeSheet } = useOverlay();
  const [plan, setPlan] = useState(false);
  const s = d.session;
  if (!s) return null;
  const e = s.ex[s.exIdx];
  const orig = legDay().find((x) => x.id === e.id)?.name ?? e.name;
  const alts = [...(orig !== e.name ? [{ n: orig, s: 'Back to planned' }] : []), ...e.alts.filter((a) => a.n !== e.name)];
  return (
    <View style={{ gap: 16, paddingBottom: 6 }}>
      <View style={{ gap: 2 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 24, lineHeight: 31, letterSpacing: -0.6 }}>Swap {orig.toLowerCase()}</Txt>
        <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>Machine busy or not feeling it? Pick another exercise.</Txt>
      </View>

      <Pressy accessibilityRole="search" accessibilityLabel="Search all exercises" onPress={() => closeSheet(() => router.push('/exercise-search'))} scaleTo={0.98}
        style={{ height: 56, borderRadius: 28, backgroundColor: c.surface2, borderWidth: 1.5, borderColor: c.accent, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 }}>
        <Search size={20} color={c.accentText} strokeWidth={2.2} />
        <Txt style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: c.muted }}>Search all exercises</Txt>
        <ChevronRight size={18} color={c.muted} />
      </Pressy>

      <View style={{ gap: 8 }}>
        <Txt v="label">Suggested swaps</Txt>
        {alts.map((a) => (
          <Pressy key={a.n} accessibilityRole="button" accessibilityLabel={`${a.n}. ${a.s}`} onPress={() => api.current.swapTo(a.n, plan)} scaleTo={0.985}
            style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 18, backgroundColor: c.surface2 }}>
            <Txt style={{ flex: 1, fontFamily: font.semibold }}>{a.n}</Txt>
            <Tag label={a.s} bg={c.goodSoft} fg={c.good} style={{ alignSelf: 'center' }} />
          </Pressy>
        ))}
        {!alts.length && <Txt muted style={{ paddingVertical: 6 }}>No coach-approved swaps for this one yet. Use search.</Txt>}
      </View>

      <View style={{ gap: 8 }}>
        <Txt v="label">Apply to</Txt>
        <Row style={{ gap: 8 }}>
          <Pill label="Today only" on={!plan} onPress={() => setPlan(false)} style={{ flex: 1 }} />
          <Pill label="Also update my plan" on={plan} onPress={() => setPlan(true)} style={{ flex: 1 }} />
        </Row>
        <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>Updating the plan notifies Coach Vikram.</Txt>
      </View>
    </View>
  );
}

export function SetMenuSheet({ api, i }: { api: ApiRef; i: number }) {
  const { d } = useDomain();
  const s = d.session;
  if (!s) return null;
  const e = s.ex[s.exIdx];
  const x = e.sets[i];
  if (!x) return null;
  const lbl = setLabel(e, i);
  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: 26, letterSpacing: -0.6 }}>{x.w ? 'Warm-up set' : `Set ${lbl}`}</Txt>
      <View>
        <MenuRow icon={null} t="Add a note" onPress={() => api.current.openNote(i)} />
        <MenuRow icon={null} t="Copy to all sets" s="Uses the numbers in the highlighted set" onPress={() => api.current.copyToAll()} />
        <MenuRow icon={null} t="Skip this set" onPress={() => api.current.skipSet(i)} last />
      </View>
      <Txt muted style={{ fontSize: 13 }}>Coming in v1.5: drop set, to failure, RPE</Txt>
    </>
  );
}

export function FinishConfirmSheet({ left, api }: { left: number; api: ApiRef }) {
  const { closeSheet } = useOverlay();
  return (
    <>
      <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>Finish workout?</Txt>
      <Txt muted style={{ fontSize: 14 }}>{left} {left === 1 ? 'set is' : 'sets are'} still open. They will be saved as skipped, and your streak still counts.</Txt>
      <Button kind="accent" label="Finish now" onPress={() => api.current.finishNow()} />
      <Button kind="secondary" label="Keep going" onPress={() => closeSheet()} />
    </>
  );
}
