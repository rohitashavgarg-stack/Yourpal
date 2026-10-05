import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Minus, Plus } from '@/lib/icons';
import { Button, Card, Pill, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fade, fadeOut } from '@/theme/motion';
import { goBack, Note, SubPage } from '@/features/shell/parts';
import { goalV2Store, kindOf, addDays, fmtDay, parseBy } from '@/features/goalv2/model';
import { FinishBy } from '@/features/goalv2/FinishBy';
import { TODAY } from '@/features/progress/trends';
import { BYS, GDEF, GOAL2, GOALS, goalNote, goalStep, GVERB, isNumeric } from '@/features/shell/goal';

type Draft = { type: string; target: number; by: string; g2: string };

export default function Goal() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const v2 = goalV2Store.use().version === 'Version 2';
  const defBy = fmtDay(addDays(TODAY, 84)); // 12 weeks
  const needsDate = (t: string) => v2 && kindOf(t) !== 'consistency';
  const [g, setG] = useState<Draft>(() => { const x = { ...d.goal, g2: state.profile.goal2 || 'None' }; return needsDate(x.type) && !parseBy(x.by) ? { ...x, by: defBy } : x; });
  const patch = (p: Partial<Draft>) => setG((x) => ({ ...x, ...p }));
  const pickType = (t: string) => patch({ type: t, target: GDEF[t] ?? 0, g2: g.g2 === t ? 'None' : g.g2, ...(needsDate(t) && !parseBy(g.by) ? { by: defBy } : {}) });
  const num = isNumeric(g.type);
  const step = goalStep(g.type);
  const note = goalNote(g.type, g.target);
  const bys = BYS.includes(g.by) || !g.by ? BYS : [BYS[0], g.by, ...BYS.slice(1)];

  useScenarios({
    title: 'Change goal',
    rows: [
      { label: 'Main goal', options: ['Weight loss', 'Strength', 'Flexibility', 'Not sure yet'], value: g.type, onPick: pickType },
      { label: 'Target size', options: ['Normal', 'Big (18 kg)'], value: g.type === 'Weight loss' && g.target > 15 ? 'Big (18 kg)' : 'Normal', onPick: (v) => patch(v === 'Normal' ? { type: 'Weight loss', target: 6 } : { type: 'Weight loss', target: 18 }) },
    ],
    actions: [{ label: 'Save goal', run: () => save() }],
  }, [g]);

  const commit = () => {
    const by = !v2 ? g.by : needsDate(g.type) ? (parseBy(g.by) ? g.by : defBy) : '—';
    set({ goal: { type: g.type, target: num ? g.target : 0, by } });
    goalV2Store.set({ extendDays: 0, lowerBy: 0, finished: false, kept: false });
    setProfile({ goal: g.type, goalTarget: g.target, goal2: g.g2 });
  };
  const save = () => { commit(); haptic.success(); goBack('/profile'); toast('Goal saved · Coach Vikram notified'); };
  const askPlan = () => {
    commit(); haptic.success();
    set({ planReq: 'requested' });
    router.navigate('/plans');
    toast('Goal saved · new plan requested from Coach Vikram');
  };

  return (
    <SubPage title="Change goal" fallback="/profile" gap={18} footer={<Button kind="accent" label="Save goal" onPress={save} />}>
      <Card style={{ padding: 20, gap: 14, borderRadius: 26 }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>What do you want to achieve?</Txt>
          <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>Pick your main goal.</Txt>
        </View>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {GOALS.map((t) => <Pill key={t} label={t} on={g.type === t} onPress={() => pickType(t)} />)}
        </Row>
      </Card>

      {num ? (
        <Card style={{ padding: 20, gap: 16, borderRadius: 26 }}>
          <View style={{ gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>How much?</Txt>
            <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{GVERB[g.type]}</Txt>
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            <RoundBtn label="Lower target" onPress={() => patch({ target: Math.max(step, Math.round((g.target - step) * 10) / 10) })}><Minus size={22} color={c.ink} /></RoundBtn>
            <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 52, lineHeight: 64, letterSpacing: -1.5 }}>{String(g.target)}</Txt>
            <RoundBtn label="Raise target" onPress={() => patch({ target: Math.round((g.target + step) * 10) / 10 })}><Plus size={22} color={c.ink} /></RoundBtn>
          </Row>
          {note && (
            <Animated.View key={note.text} entering={fade()} exiting={fadeOut()}>
              {note.warn ? <Note tone="warn">{note.text}</Note> : <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>{note.text}</Txt>}
            </Animated.View>
          )}
          {!v2 && (
            <>
              <View style={{ height: 1, backgroundColor: c.line }} />
              <View style={{ gap: 10 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>By when? <Txt muted style={{ fontSize: 13 }}>Optional</Txt></Txt>
                <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                  {bys.map((b) => <Pill key={b} label={b} on={g.by === b} onPress={() => patch({ by: b })} />)}
                </Row>
              </View>
            </>
          )}
        </Card>
      ) : note ? (
        <Card style={{ padding: 20, borderRadius: 26 }}>
          <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>{note.text}</Txt>
        </Card>
      ) : null}

      {needsDate(g.type) && <Card style={{ padding: 20, borderRadius: 26 }}><FinishBy by={g.by} onChange={(by) => patch({ by })} /></Card>}

      <Card style={{ padding: 20, gap: 14, borderRadius: 26 }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>Anything else? <Txt muted style={{ fontSize: 13 }}>Optional</Txt></Txt>
          <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>A second goal to work on alongside.</Txt>
        </View>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {GOAL2.filter((t) => t !== g.type).map((t) => <Pill key={t} label={t} on={g.g2 === t} onPress={() => patch({ g2: t })} />)}
        </Row>
      </Card>

      <View style={{ gap: 14, paddingTop: 4 }}>
        <Button kind="secondary" label="Also ask Coach for a new plan" onPress={askPlan} />
        {v2 ? <Note center style={{ fontSize: 13 }}>{`Your history stays. Progress for this goal starts from today (${d.weight} kg). ${state.sc.member === 'PT member' ? 'Coach Vikram' : 'Your trainer'} will be notified.`}</Note>
          : <Note center style={{ fontSize: 13 }}>Goals are per programme; quick trackers are shared.</Note>}
      </View>
    </SubPage>
  );
}
