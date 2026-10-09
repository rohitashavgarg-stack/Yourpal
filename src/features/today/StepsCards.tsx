import React, { useState } from 'react';
import { DotText } from '@/features/trackers/DotText';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRightLeft, Flame, Footprints, Plus, X } from '@/lib/icons';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { Ring } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade } from '@/theme/motion';
import { haptic } from '@/lib/haptics';
import { HEALTH_NAME } from '@/lib/health';
import { createStore } from '@/lib/createStore';

// Steps tracker designs to compare. Pick one in the Today edge-case panel.
export type StepsDesign = 'Current' | 'Ruler' | 'Day bars' | 'Dot matrix' | 'Bars + details';
export const STEPS_DESIGNS: StepsDesign[] = ['Current', 'Ruler', 'Day bars', 'Dot matrix', 'Bars + details'];
type Entry = { id: number; n: number; label: string };
export const stepsStore = createStore(() => ({ design: 'Current' as StepsDesign, manual: [] as Entry[] }));

const SENSOR = 5230, GOAL = 8000, SQ = 164;
// Steps through the day so far (12 two-hour buckets up to now).
const DAY = [0, 120, 640, 1180, 420, 380, 900, 640, 520, 430, 0, 0];
let seq = 0;
const PER_MIN = 105; // rough walking cadence used for "walk minutes"
const fmt = (n: number) => n.toLocaleString('en-IN');

export function useSteps() {
  const { manual } = stepsStore.use();
  const added = manual.reduce((a, e) => a + e.n, 0);
  const total = SENSOR + added;
  return { sensor: SENSOR, added, total, goal: GOAL, pct: Math.min(1, total / GOAL), left: Math.max(0, GOAL - total), manual };
}

const NAME = (d: { hc: boolean }) => (d.hc ? HEALTH_NAME : 'phone sensor');

export function StepsTile() {
  const { d } = useDomain();
  const { design } = stepsStore.use();
  const { openSheet } = useOverlay();
  const s = useSteps();
  const dark = design === 'Ruler';
  const a11y = `Steps ${fmt(s.total)} of ${fmt(s.goal)}, ${Math.round(s.pct * 100)} percent. From ${NAME(d)}${s.added ? ` plus ${fmt(s.added)} added by you` : ''}. See your steps trend`;
  return (
    <View style={{ width: SQ, height: SQ }}>
      <Pressy accessibilityRole="button" accessibilityLabel={a11y} onPress={() => router.push({ pathname: '/progress/metric', params: { k: 'steps' } })} scaleTo={0.97} style={{ width: SQ, height: SQ, borderRadius: 28, overflow: 'hidden' }}>
        <Face design={design} s={s} />
      </Pressy>
      <Pressy accessibilityRole="button" accessibilityLabel="Add steps manually" onPress={() => openSheet(<StepsSheet />, { label: 'Add steps' })} hitSlop={10}
        style={{ position: 'absolute', top: 12, right: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.22)', zIndex: 3 }}>
        <Plus size={17} color="#fff" />
      </Pressy>
    </View>
  );
}

type S = ReturnType<typeof useSteps>;

function Face({ design, s }: { design: StepsDesign; s: S }) {
  if (design === 'Ruler') return <RulerFace s={s} />;
  if (design === 'Day bars') return <BarsFace s={s} />;
  if (design === 'Dot matrix') return <DotFace s={s} />;
  if (design === 'Bars + details') return <BarsPlusFace s={s} />;
  return <CurrentFace s={s} />;
}
// Distance and calories follow from the step count.
const km = (n: number) => (Math.round(n * 0.00075 * 10) / 10).toFixed(1);
const kcalOf = (n: number) => Math.round(n * 0.043);

// The real card for a given design, not tappable: used where designs are shown (Profile → Tracker designs).
export function StepsPreview({ design }: { design: StepsDesign }) {
  const s = useSteps();
  return (
    <View pointerEvents="none" style={{ width: SQ, height: SQ, borderRadius: 28, overflow: 'hidden' }}>
      <Face design={design} s={s} />
    </View>
  );
}
export const STEPS_CARD = SQ;

function CurrentFace({ s }: { s: S }) {
  return (
    <LinearGradient colors={['#5468FF', '#3346E8', '#222FB5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
      <View>
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)' }}>Steps</Txt>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.8, color: '#fff' }}>{fmt(s.total)}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingBottom: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 20, lineHeight: 26, color: '#fff' }}>{Math.round(s.pct * 100)}%</Txt>
          <Txt style={{ fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.8)' }}>{s.left ? `${fmt(s.left)} to go` : 'Goal reached'}</Txt>
        </View>
        <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
          <Ring size={72} r={30} stroke={8} pct={s.pct} color="#fff" track="rgba(255,255,255,0.25)" />
          <View style={{ position: 'absolute' }}><Footprints size={24} color="#fff" strokeWidth={2.2} /></View>
        </View>
      </View>
    </LinearGradient>
  );
}

// Black card, big number, and a tick ruler that fills up toward the goal.
const TICKS = 34;
function RulerFace({ s }: { s: S }) {
  const lit = Math.round(s.pct * TICKS);
  const labels = ['0', `${(GOAL / 3 / 1000).toFixed(1)}K`, `${((GOAL * 2) / 3 / 1000).toFixed(1)}K`, `${GOAL / 1000}K`];
  return (
    <LinearGradient colors={['#000000', '#0A0C12', '#171B26']} style={{ flex: 1, paddingTop: 14, justifyContent: 'space-between' }}>
      <View style={{ paddingHorizontal: 14 }}>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 32, lineHeight: 40, letterSpacing: -0.8, color: '#fff' }}>{fmt(s.total)}</Txt>
        <Txt style={{ fontFamily: font.medium, fontSize: 11, lineHeight: 16, letterSpacing: 3, color: 'rgba(255,255,255,0.8)' }}>STEPS</Txt>
      </View>
      <View>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 4 }}>
          {labels.map((l) => <Txt key={l} style={{ fontSize: 10, lineHeight: 14, color: 'rgba(255,255,255,0.85)' }}>{l}</Txt>)}
        </Row>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 6, height: 40, alignItems: 'flex-end' }}>
          {Array.from({ length: TICKS }, (_, i) => {
            const on = i < lit;
            return <View key={i} style={{ width: on ? 2 : 1.5, height: on ? 40 : i % 4 === 0 ? 24 : 16, borderRadius: 1, backgroundColor: on ? '#fff' : 'rgba(255,255,255,0.4)' }} />;
          })}
        </Row>
      </View>
    </LinearGradient>
  );
}

// Dark green glass card: dot-matrix steps, with distance and calories.
function DotFace({ s }: { s: S }) {
  return (
    <LinearGradient colors={['#1F7A52', '#0E3B2C', '#07130F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 14 }}>
      <Row style={{ gap: 8 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}><Footprints size={14} color="#fff" strokeWidth={2} /></View>
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.9)' }}>Steps</Txt>
      </Row>
      <View style={{ marginTop: 12 }}><DotText text={String(s.total)} maxW={132} /></View>
      <Row style={{ marginTop: 'auto', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.7)' }}>of {fmt(s.goal)}</Txt>
        <View style={{ gap: 3, alignItems: 'flex-end' }}>
          <Row style={{ gap: 6 }}><ArrowRightLeft size={13} color="#fff" /><Txt style={{ fontSize: 13, lineHeight: 18, color: '#fff' }}><Txt style={{ fontFamily: font.semibold }}>{km(s.total)}</Txt> km</Txt></Row>
          <Row style={{ gap: 6 }}><Flame size={13} color="#fff" /><Txt style={{ fontSize: 13, lineHeight: 18, color: '#fff' }}><Txt style={{ fontFamily: font.semibold }}>{kcalOf(s.total)}</Txt> kcal</Txt></Row>
        </View>
      </Row>
    </LinearGradient>
  );
}

// Indigo card: the day's bars plus distance and calories.
function BarsPlusFace({ s }: { s: S }) {
  const max = Math.max(...DAY, 1);
  return (
    <LinearGradient colors={['#4B5CF5', '#2F3FD6', '#1E2A9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
      <View>
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)' }}>Steps</Txt>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8, color: '#fff' }}>{fmt(s.total)}</Txt>
        <Txt style={{ fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.85)' }}>{km(s.total)} km · {kcalOf(s.total)} kcal</Txt>
      </View>
      <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 40 }}>
        {DAY.map((v, i) => <View key={i} style={{ width: 8, height: Math.max(4, (v / max) * 40), borderRadius: 3, backgroundColor: v ? '#fff' : 'rgba(255,255,255,0.22)' }} />)}
      </Row>
    </LinearGradient>
  );
}

// Mint-free indigo card with the day's steps as bars.
function BarsFace({ s }: { s: S }) {
  const max = Math.max(...DAY, 1);
  return (
    <LinearGradient colors={['#4B5CF5', '#2F3FD6', '#1E2A9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
      <View>
        <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)' }}>Steps</Txt>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.8, color: '#fff' }}>{fmt(s.total)}</Txt>
      </View>
      <View>
        <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 44 }}>
          {DAY.map((v, i) => <View key={i} style={{ width: 8, height: Math.max(4, (v / max) * 44), borderRadius: 3, backgroundColor: v ? '#fff' : 'rgba(255,255,255,0.22)' }} />)}
        </Row>
        <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: 'rgba(255,255,255,0.75)' }}>12 am</Txt>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: 'rgba(255,255,255,0.75)' }}>{s.left ? `${fmt(s.left)} to go` : 'Goal reached'}</Txt>
        </Row>
      </View>
    </LinearGradient>
  );
}

// ---------- add manually ----------
const QUICK = [500, 1000, 2000, 5000];

export function StepsSheet() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { toast, closeSheet } = useOverlay();
  const s = useSteps();
  const [mode, setMode] = useState<'steps' | 'min'>('steps');
  const [txt, setTxt] = useState('');
  const num = parseInt(txt.replace(/[^0-9]/g, ''), 10) || 0;
  const steps = mode === 'steps' ? num : num * PER_MIN;
  const ok = steps > 0 && steps <= 50000;

  const add = (n: number, label: string) => {
    const e: Entry = { id: ++seq, n, label };
    stepsStore.set((st) => ({ manual: [e, ...st.manual] }));
    haptic.success();
    return e;
  };
  const addQuick = (n: number) => { const e = add(n, 'Added by you'); toast(`+${fmt(n)} steps`, { undo: () => stepsStore.set((st) => ({ manual: st.manual.filter((x) => x.id !== e.id) })) }); };
  const addCustom = () => {
    if (!ok) return;
    const e = add(steps, mode === 'min' ? `${num} min walk` : 'Added by you');
    setTxt('');
    toast(`+${fmt(steps)} steps`, { undo: () => stepsStore.set((st) => ({ manual: st.manual.filter((x) => x.id !== e.id) })) });
  };
  const remove = (e: Entry) => { haptic.light(); stepsStore.set((st) => ({ manual: st.manual.filter((x) => x.id !== e.id) })); };

  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.6 }}>Steps</Txt>
      <View>
        <Txt style={{ fontFamily: font.display, fontSize: 44, lineHeight: 54 }}>{fmt(s.total)}<Txt muted style={{ fontFamily: font.display, fontSize: 20, lineHeight: 28 }}> / {fmt(s.goal)}</Txt></Txt>
        <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{`${fmt(s.sensor)} from ${NAME(d)}${s.added ? ` · ${fmt(s.added)} added by you` : ''}`}</Txt>
      </View>
      <Txt v="label">Forgot your phone? Add steps</Txt>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {QUICK.map((n) => <Button key={n} kind="secondary" small label={`+ ${fmt(n)}`} onPress={() => addQuick(n)} />)}
      </Row>
      <Row style={{ gap: 8 }}>
        {(['steps', 'min'] as const).map((m) => (
          <Pressy key={m} accessibilityRole="button" accessibilityLabel={m === 'steps' ? 'Enter steps' : 'Enter walking minutes'} onPress={() => { setMode(m); setTxt(''); haptic.tap(); }}
            style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center', backgroundColor: mode === m ? c.ink : c.surface2 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: mode === m ? c.bg : c.ink }}>{m === 'steps' ? 'Steps' : 'Walk minutes'}</Txt>
          </Pressy>
        ))}
      </Row>
      <Field value={txt} onChangeText={setTxt} placeholder={mode === 'steps' ? 'e.g. 3500' : 'e.g. 30'} keyboardType="number-pad" accessibilityLabel={mode === 'steps' ? 'Steps to add' : 'Walking minutes to add'} returnKeyType="done" onSubmitEditing={addCustom} />
      {mode === 'min' && num > 0 && <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{`About ${fmt(steps)} steps at an easy pace`}</Txt>}
      <Button kind="accent" label={ok ? `Add ${fmt(steps)} steps` : 'Add steps'} disabled={!ok} onPress={addCustom} />
      <Txt muted style={{ fontSize: 12, lineHeight: 18 }}>Manual steps are added on top of your {d.hc ? HEALTH_NAME : 'phone'} count and marked as added by you.</Txt>
      {s.manual.length > 0 && (
        <Animated.View entering={fade()} style={{ gap: 2 }}>
          <Txt v="label" style={{ paddingBottom: 4 }}>Added by you today</Txt>
          {s.manual.map((e) => (
            <Row key={e.id} style={{ justifyContent: 'space-between', minHeight: 44 }}>
              <View>
                <Txt style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21 }}>{`+ ${fmt(e.n)} steps`}</Txt>
                <Txt muted style={{ fontSize: 12, lineHeight: 18 }}>{e.label}</Txt>
              </View>
              <Pressy accessibilityRole="button" accessibilityLabel={`Remove ${fmt(e.n)} steps`} onPress={() => remove(e)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color={c.muted} />
              </Pressy>
            </Row>
          ))}
        </Animated.View>
      )}
      <Button kind="outline" small label="See steps trend" onPress={() => closeSheet(() => router.push({ pathname: '/progress/metric', params: { k: 'steps' } }))} />
    </>
  );
}
