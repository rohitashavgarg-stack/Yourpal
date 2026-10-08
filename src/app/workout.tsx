import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Redirect, router } from 'expo-router';
import { ChevronLeft, ChevronRight, Ellipsis, Play, Plus, X } from '@/lib/icons';
import { Button, Card, Field, NoteField, Pill, Pressy, Row, Txt } from '@/components/ui';
import { Beat, CheckCircle, HeartIcon, PillBtn, RoundBtn, Tag } from '@/components/bits';
import { useOverlay, useToastLift } from '@/components/Overlay';
import { COOLDOWN, WARMUP } from '@/lib/data';
import { nowMin, useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1, mmss, useNow } from '@/lib/useNow';
import { useSessionActions } from '@/features/workout/actions';
import { COL_LABEL, firstTodo, openSets, setLabel, stats } from '@/features/workout/session';
import { Draft, SetRow } from '@/features/workout/SetRow';
import { RestPanel } from '@/features/workout/RestPanel';
import { ExerciseArt, hasPhoto } from '@/features/workout/ExerciseArt';
import { askCoach, coachStore } from '@/features/coach/coach';
import { FinishScreen, FinishStats } from '@/features/workout/FinishScreen';
import { FinishConfirmSheet, FormTipsSheet, SetMenuSheet, SwapSheet, WkApi, WkMenuSheet } from '@/features/workout/WorkoutSheets';

function Bars({ n, pos, light }: { n: number; pos: number; light?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ position: 'absolute', top: 12, left: 14, right: 14, flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: n }, (_, i) => <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < pos ? '#3563F2' : i === pos ? (light ? c.ink : '#F4F4F6') : (light ? c.surface3 : 'rgba(255,255,255,0.22)') }} />)}
    </View>
  );
}

function HeroBg({ h }: { h: number }) {
  return (
    <>
      <LinearGradient colors={['#2F6BEA', '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Svg width="100%" height="100%" viewBox={`0 0 358 ${h}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
        <Path d="M0 170 C 90 130 180 200 260 160 S 340 150 400 170 V 900 H0z" fill="#FFFFFF" opacity={0.08} />
        <Circle cx={270} cy={40} r={h > 200 ? 170 : 130} fill="#FFFFFF" opacity={0.1} /><Circle cx={270} cy={40} r={h > 200 ? 104 : 80} fill="#FFFFFF" opacity={0.14} />
      </Svg>
    </>
  );
}

export default function Workout() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const A = useSessionActions();
  const { openSheet, closeSheet, toast } = useOverlay();
  const s = d.session;
  const now = useNow(!!s, 500);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [reveal, setReveal] = useState<number | null>(null);
  const [justDone, setJustDone] = useState<number | null>(null);
  const [backRow, setBackRow] = useState<{ i: number; n: number } | null>(null);
  const [draft, setDraftS] = useState<Draft>({ k: 0, r: 0, t: 0 });
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [fb, setFb] = useState<0 | 1 | 2 | null>(null);
  const resting = !!s?.rest;
  useEffect(() => { if (!resting) setFb(null); }, [resting]);
  const [noteDraft, setNoteDraft] = useState('');
  const [finished, setFinished] = useState<FinishStats | null>(null);
  const scroll = useRef<ScrollView>(null);
  const [dockH, setDockH] = useState(0);
  useToastLift(dockH ? dockH + 12 : 24 + insets.bottom);

  const e = s ? s.ex[s.exIdx] : null;
  // Demo card colours: the illustration is light, so in dark mode the text on it must be dark.
  const photoCard = !!e && hasPhoto(e.id);
  const cardBg = photoCard && isDark ? '#F4F6FA' : c.surface;
  const cardInk = photoCard && isDark ? '#0B0E14' : c.ink;
  const cardMuted = photoCard && isDark ? '#5B6577' : c.muted;
  const cardChip = photoCard && isDark ? 'rgba(11,14,20,0.08)' : c.surface2;
  const cur = e ? firstTodo(e) : -1;
  const activeIdx = e && activeRow != null && e.sets[activeRow]?.st === 'todo' ? activeRow : cur;

  // Prefill the steppers from whichever set is highlighted.
  useEffect(() => {
    if (!e || activeIdx < 0) return;
    const x = e.sets[activeIdx];
    setDraftS({ k: x.k, r: x.r, t: x.t });
  }, [s?.exIdx, activeIdx, e?.id]);

  // Timers: timed set auto-logs at zero; warm-up / cool-down items tick themselves off.
  useEffect(() => {
    if (!s) return;
    if (s.setTimer && now >= s.setTimer.endAt) { haptic.success(); logSet(s.setTimer.i, { r: 0, k: draft.k, t: s.setTimer.total }); }
    if (s.itemTimer && now >= s.itemTimer.endAt) { haptic.success(); A.upd((x) => ({ listDone: { ...x.listDone, [x.itemTimer!.id]: true }, itemTimer: null })); }
  }, [now]);

  const finishNow = () => {
    if (!s) return;
    A.skipOpenSets();
    closeSheet();
    const st = stats(s);
    setFinished({ ...st, hc: d.hc, weekDone: 2 });
  };

  const api = useRef<WkApi>(null as any);
  api.current = {
    openSwap: () => openSheet(<SwapSheet api={api} />, { label: 'Swap exercise' }),
    openSetMenu: (i) => openSheet(<SetMenuSheet api={api} i={i} />, { label: 'Set options' }),
    openNote: (i) => closeSheet(() => { setNoteFor(i); setNoteDraft(e?.sets[i]?.note ?? ''); }),
    skipSet: (i) => closeSheet(() => skipSet(i)),
    toggleWarm: (i) => { closeSheet(); A.toggleWarm(s!.exIdx, i); },
    copyToAll: () => { closeSheet(); A.copyToAll(s!.exIdx, draft.k, draft.r); toast(`Copied ${draft.r} × ${fmt1(draft.k)} kg to all remaining sets`); },
    askCoach: () => closeSheet(() => askCoach(e?.name)),
    formTips: () => openSheet(<FormTipsSheet />, { label: 'Form tips' }),
    skipExercise: () => { closeSheet(); A.skipExercise(s!.exIdx); toast(`Skipped ${e?.name}`); },
    finishNow,
    currentSet: () => (e ? firstTodo(e) : -1),
    swapTo: (name, plan) => { closeSheet(); A.swap(s!.exIdx, name, plan); haptic.success(); toast(plan ? `Swapped to ${name} · Coach Vikram will be notified` : `Swapped to ${name} for today`); },
  };

  useScenarios({
    title: 'Active workout',
    rows: [
      { label: 'Wearable (Health Connect)', options: ['Connected', 'Not connected'], value: d.hc ? 'Connected' : 'Not connected', onPick: (v) => set({ hc: v === 'Connected' }) },
      { label: 'Phase', options: ['Warm-up', 'Main', 'Cool-down'], value: s ? { warmup: 'Warm-up', main: 'Main', cooldown: 'Cool-down' }[s.phase] : 'Main', onPick: (v) => A.phase(v === 'Warm-up' ? 'warmup' : v === 'Main' ? 'main' : 'cooldown') },
    ],
    actions: [
      { label: 'Rest timer: jump to last 5 s', run: () => { if (!s?.rest) { toast('Log a set first to start the rest timer'); return; } A.upd((x) => ({ rest: { endAt: Date.now() + 5200, total: x.rest!.total } })); } },
      { label: 'Log all sets of this exercise', run: () => s && A.completeAll(s.exIdx) },
      { label: 'Finish screen', run: () => finishNow() },
    ],
  }, [d.hc, s?.phase, !!s?.rest]);

  if (finished) {
    return <FinishScreen s={finished} onDone={(feel, note) => {
      const mins = finished.mins, at = nowMin(d);
      const msg = note.trim();
      set((x) => ({ session: null, wkDone: { a: at, b: at + mins, k: Math.max(40, mins * 7) }, ...(msg ? { chat: [...x.chat, { me: true, t: msg, ctx: `Leg day · felt ${feel}/5`, meta: 'Just now · Delivered' }] } : {}) }));
      if (msg) { coachStore.set({ unread: false }); toast('Note sent to Coach Vikram'); }
      router.canGoBack() ? router.back() : router.replace('/(tabs)');
    }} />;
  }
  if (!s || !e) return <Redirect href="/(tabs)" />;

  function logSet(i: number, vals: { r: number; k: number; t: number } | null) {
    A.logSet(s!.exIdx, i, vals);
    setActiveRow(null); setReveal(null); setJustDone(i);
    setTimeout(() => setJustDone((j) => (j === i ? null : j)), 1150);
  }
  function skipSet(i: number) {
    const exIdx = s!.exIdx;
    A.setStatus(exIdx, i, 'skipped'); setReveal(null);
    toast(`Skipped set ${setLabel(e!, i)}`, { undo: () => { A.setStatus(exIdx, i, 'todo'); setBackRow({ i, n: Date.now() }); } });
  }

  const minimise = () => { closeSheet(); router.canGoBack() ? router.back() : router.replace('/(tabs)'); };
  const askFinish = () => {
    const left = openSets(s);
    if (left === 0 || s.phase === 'cooldown') { finishNow(); return; }
    openSheet(<FinishConfirmSheet left={left} api={api} />, { label: 'Finish workout' });
  };
  const nextEx = () => {
    setActiveRow(null); setReveal(null); setNoteFor(null);
    if (s.exIdx < s.ex.length - 1) A.goEx(s.exIdx + 1); else A.phase('cooldown');
    scroll.current?.scrollTo({ y: 0, animated: true });
  };
  const nextName = s.exIdx < s.ex.length - 1 ? s.ex[s.exIdx + 1].name : 'Cool-down';
  const prevEx = () => {
    if (s.exIdx <= 0) return;
    setActiveRow(null); setReveal(null); setNoteFor(null);
    A.goEx(s.exIdx - 1);
    scroll.current?.scrollTo({ y: 0, animated: true });
  };
  const prevName = s.exIdx > 0 ? s.ex[s.exIdx - 1].name : '';

  const elapsed = mmss((now - s.startAt) / 1000).padStart(5, '0');
  const restLeft = s.rest ? Math.max(0, (s.rest.endAt - now) / 1000) : 0;
  const hr = Math.round((s.rest ? 104 - Math.min(20, (s.rest.total - restLeft) / 3) : 122) + 6 * Math.sin(now / 3000));
  const n = s.ex.length + 2;
  const pos = s.phase === 'warmup' ? 0 : s.phase === 'cooldown' ? n - 1 : s.exIdx + 1;
  const isList = s.phase !== 'main';
  const list = s.phase === 'cooldown' ? COOLDOWN : WARMUP;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
        <RoundBtn label="Minimise workout" onPress={minimise} glass><X size={20} color={c.ink} /></RoundBtn>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Txt accessibilityLabel={`Elapsed ${elapsed}`} style={{ fontFamily: font.monoBold, fontSize: 22 }}>{elapsed}</Txt>
          <Row style={{ gap: 6 }}>
            <Txt v="caption">Leg day</Txt>
            {d.hc && <Row style={{ gap: 3 }}><Beat><HeartIcon size={11} color="#FF8A96" /></Beat><Txt style={{ fontFamily: font.semibold, fontSize: 12, color: '#FF8A96' }}>{hr} bpm</Txt></Row>}
          </Row>
        </View>
        <PillBtn label="Finish" h={40} onPress={askFinish} style={{ paddingHorizontal: 16 }} />
      </Row>

      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: isList ? 28 + insets.bottom : dockH + 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        {isList ? (
          <Animated.View key={s.phase} entering={fade()} style={{ gap: 12 }}>
            <View style={{ minHeight: 180, borderRadius: 28, overflow: 'hidden', padding: 16, justifyContent: 'flex-end', gap: 4 }}>
              <HeroBg h={180} />
              <Bars n={n} pos={pos} />
              <Txt style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 0.7, color: '#DDE6FF' }}>{s.phase === 'cooldown' ? 'AFTER YOUR WORKOUT' : 'BEFORE YOU START'}</Txt>
              <Txt style={{ fontFamily: font.display, fontSize: 34, lineHeight: 34, color: '#F4F4F6' }}>{s.phase === 'cooldown' ? 'Cool-down' : 'Warm-up'}</Txt>
              <Txt style={{ fontSize: 13, color: 'rgba(244,244,246,0.8)' }}>{s.phase === 'cooldown' ? '4 stretches · about 4 min · slow and easy' : '4 moves · about 4 min · no weights'}</Txt>
            </View>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 12 }}>
              {list.map((it, i) => {
                const on = !!s.listDone[it.id];
                const run = s.itemTimer?.id === it.id;
                const left = run ? Math.max(0, Math.ceil((s.itemTimer!.endAt - now) / 1000)) : it.t;
                return (
                  <Row key={it.id} style={{ gap: 12, minHeight: 66, paddingVertical: 8, paddingHorizontal: 2, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                    <CheckCircle on={on} label={`${on ? 'Undo' : 'Done'}: ${it.n}`} onPress={() => A.upd((x) => ({ listDone: { ...x.listDone, [it.id]: !on }, itemTimer: run ? null : x.itemTimer }))} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt style={{ fontFamily: font.medium, color: on ? c.muted : c.ink, textDecorationLine: on ? 'line-through' : 'none' }}>{it.n}</Txt>
                      <Txt v="caption">{it.sub}</Txt>
                    </View>
                    {!!it.t && !on && (
                      <Pressy accessibilityRole="button" accessibilityLabel={run ? 'Stop timer' : `Start ${it.t} second timer`} onPress={() => A.upd(() => ({ itemTimer: run ? null : { id: it.id, endAt: Date.now() + it.t! * 1000 } }))}
                        style={{ minWidth: 76, height: 40, paddingHorizontal: 12, borderRadius: 20, backgroundColor: run ? c.warn : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                        <Txt style={{ fontFamily: font.monoBold, fontSize: 13, color: run ? '#1A1204' : c.ink }}>{run ? mmss(left!) : `Start ${it.t} s`}</Txt>
                      </Pressy>
                    )}
                  </Row>
                );
              })}
            </Card>
            <Txt v="caption" style={{ textAlign: 'center' }}>Counts are a guide, not a target. Tick each move when you are done.</Txt>
            <Button label={s.phase === 'cooldown' ? 'Finish workout' : 'Start main workout'} onPress={() => (s.phase === 'cooldown' ? finishNow() : A.phase('main'))} />
            <Button kind="outline" label={s.phase === 'cooldown' ? 'Skip cool-down' : 'Skip warm-up'} onPress={() => {
              if (s.phase === 'cooldown') finishNow(); else { A.phase('main'); toast('Warm-up skipped · take the first set light'); }
            }} />
          </Animated.View>
        ) : (
          <Animated.View key={`ex${s.exIdx}${e.name}`} entering={fade()} style={{ gap: 12 }}>
            <View style={{ height: 300, borderRadius: 28, overflow: 'hidden', backgroundColor: cardBg }}>
              <Bars n={n} pos={pos} light />
              {hasPhoto(e.id) ? (
                <View pointerEvents="none" style={{ position: 'absolute', top: 44, left: 10, right: 10, bottom: 64 }}>
                  <ExerciseArt id={e.id} fill />
                </View>
              ) : (
                <View pointerEvents="none" style={{ position: 'absolute', top: 30, left: 0, right: 0, alignItems: 'center' }}>
                  <ExerciseArt id={e.id} width={236} />
                </View>
              )}
              <LinearGradient pointerEvents="none" colors={[`${cardBg}00`, `${cardBg}E6`, cardBg]} locations={[0, 0.5, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }} />
              <Pressy accessibilityRole="button" accessibilityLabel="Play form video" onPress={() => api.current.formTips()}
                style={{ position: 'absolute', top: 28, right: 12, zIndex: 10, elevation: 10, height: 38, paddingLeft: 12, paddingRight: 14, borderRadius: 19, backgroundColor: 'rgba(11,14,20,0.82)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Play size={13} color="#fff" fill="#fff" /><Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, color: '#fff' }}>Form video</Txt>
              </Pressy>
              <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14, gap: 4 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 0.7, color: cardMuted }}>EXERCISE {s.exIdx + 1} OF {s.ex.length} · {e.muscles.toUpperCase()}</Txt>
                <Row style={{ gap: 8 }}>
                  <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.display, fontSize: 30, lineHeight: 39, color: cardInk }}>{e.name}</Txt>
                  <Pressy accessibilityRole="button" accessibilityLabel="Exercise options: swap, ask coach, form tips, skip" onPress={() => openSheet(<WkMenuSheet api={api} />, { label: 'Workout options' })}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cardChip, alignItems: 'center', justifyContent: 'center' }}>
                    <Ellipsis size={20} color={cardInk} />
                  </Pressy>
                </Row>
                <Row style={{ gap: 8 }}>
                  {e.swapped ? <Tag label="Swapped for today" bg={c.accentSoft} fg={c.accentText} /> : e.last ? <Txt style={{ fontFamily: font.mono, fontSize: 12, color: cardMuted }}>{e.last}</Txt> : null}
                </Row>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Row style={{ gap: 8, paddingHorizontal: 10 }}>
                <Txt v="caption" style={{ width: 32 }}>Set</Txt><Txt v="caption" style={{ flex: 1 }}>{COL_LABEL[e.mode]}</Txt><Txt v="caption">Done</Txt>
              </Row>
              {e.sets.map((x, i) => {
                const timing = s.setTimer && s.setTimer.exIdx === s.exIdx && s.setTimer.i === i;
                return (
                  <SetRow key={`${e.id}-${i}`} e={e} i={i} active={i === activeIdx} revealed={reveal === i} justDone={justDone === i} back={backRow?.i === i ? !!backRow.n : false}
                    draft={draft} setDraft={(p) => setDraftS((v) => ({ ...v, ...p }))}
                    timerLeft={timing ? Math.max(0, Math.ceil((s.setTimer!.endAt - now) / 1000)) : null}
                    onCheck={() => { if (x.st === 'done') A.unlogSet(s.exIdx, i); else logSet(i, i === activeIdx ? draft : null); }}
                    onActivate={() => setActiveRow(i)}
                    onReveal={(on) => setReveal(on ? i : null)}
                    onSkip={() => skipSet(i)}
                    onSwap={() => api.current.openSwap()}
                    onMenu={() => api.current.openSetMenu(i)}
                    onTimer={() => {
                      if (timing) { const el = Math.max(1, Math.round((Date.now() - (s.setTimer!.endAt - s.setTimer!.total * 1000)) / 1000)); logSet(i, { r: 0, k: draft.k, t: el }); }
                      else { haptic.medium(); A.upd((xs) => ({ setTimer: { exIdx: xs.exIdx, i, endAt: Date.now() + draft.t * 1000, total: draft.t } })); }
                    }} />
                );
              })}
              {s.rest && (
                <Animated.View entering={fade()} style={{ gap: 8, padding: 12, borderRadius: 18, backgroundColor: c.surface2 }}>
                  <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20 }}>How was that set? <Txt muted style={{ fontSize: 13 }}>Optional</Txt></Txt>
                  <Row style={{ gap: 6 }}>
                    {(['Too easy', 'Too hard', 'Pain'] as const).map((l, i) => <Pill key={l} label={l} on={fb === i} onPress={() => setFb(fb === i ? null : (i as 0 | 1 | 2))} />)}
                  </Row>
                  {fb === 2 && (
                    <Animated.View entering={fade()} style={{ borderRadius: 14, padding: 12, backgroundColor: c.warnSoft, gap: 8 }}>
                      <Txt style={{ fontFamily: font.bold, color: c.warn }}>Pain reported</Txt>
                      <Txt style={{ fontSize: 14, color: c.warn }}>Stop this exercise. Ask a floor trainer before continuing.</Txt>
                      <Button kind="secondary" small label="Ask Coach Vikram" onPress={() => askCoach('Pain during workout', 'I felt pain in my ')} style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.55)' }} />
                    </Animated.View>
                  )}
                </Animated.View>
              )}
              <Pressy accessibilityRole="button" onPress={() => A.addSet(s.exIdx)} style={{ height: 48, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Plus size={17} color={c.ink} /><Txt style={{ fontFamily: font.medium, fontSize: 14 }}>Add set</Txt>
              </Pressy>
              <Txt v="caption" style={{ textAlign: 'center', paddingHorizontal: 6, paddingTop: 4 }}>Adjust the highlighted set and tick it · tap a set to edit · swipe right = done, left = swap/skip · hold for options</Txt>
            </View>

            {noteFor != null && (
              <Animated.View entering={fade()}>
                <Card style={{ padding: 14, gap: 10 }}>
                  <Txt v="label">Note for {e.sets[noteFor]?.w ? 'warm-up set' : `set ${setLabel(e, noteFor)}`}</Txt>
                  <NoteField value={noteDraft} onChangeText={setNoteDraft} placeholder="e.g. felt it in the lower back on the last two reps" autoFocus accessibilityLabel="Set note" minHeight={96} />
                  <Row style={{ gap: 8, justifyContent: 'flex-end' }}>
                    <Button kind="secondary" small label="Cancel" onPress={() => setNoteFor(null)} />
                    <Button small label="Save note" onPress={() => { A.setNote(s.exIdx, noteFor, noteDraft.trim()); setNoteFor(null); haptic.light(); }} />
                  </Row>
                </Card>
              </Animated.View>
            )}

          </Animated.View>
        )}
      </ScrollView>

      {!isList && e ? (
        <View onLayout={(ev) => setDockH(ev.nativeEvent.layout.height)}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 10, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
          {s.rest && <RestPanel docked rest={s.rest} now={now} onAdd30={A.add30} onSkip={A.skipRest} onDone={A.skipRest} />}
          {cur >= 0 && e.sets.some((x) => x.st === 'done') && (
            <Txt v="caption" style={{ textAlign: 'center' }}>{e.sets.filter((x) => x.st === 'todo').length} set{e.sets.filter((x) => x.st === 'todo').length === 1 ? '' : 's'} not done · you can come back to them</Txt>
          )}
          <Row style={{ gap: 10 }}>
            {s.exIdx > 0 && (
              <Pressy accessibilityRole="button" accessibilityLabel={`Back to ${prevName}`} onPress={prevEx} scaleTo={0.92}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={22} color={c.ink} />
              </Pressy>
            )}
            <Button kind={cur < 0 || e.sets.some((x) => x.st === 'done') ? 'accent' : 'secondary'} label={cur < 0 || e.sets.some((x) => x.st === 'done') ? `Next: ${nextName}` : `Skip to ${nextName}`} onPress={nextEx} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : null}
      {isList && s.rest && <RestPanel rest={s.rest} now={now} onAdd30={A.add30} onSkip={A.skipRest} onDone={A.skipRest} />}
    </View>
  );
}
