import React, { useEffect, useState } from 'react';
import { addDays, fmtDay, goalV2Store, kindOf } from '@/features/goalv2/model';
import { FinishBy } from '@/features/goalv2/FinishBy';
import { TODAY } from '@/features/progress/trends';
import { WEEK_TARGET } from '@/features/streak/data';
import { ageFrom, defaultDob } from '@/lib/dob';
import { RoundBtn } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Switch } from '@/features/shell/parts';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { fade, fadeOut } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GymLogoMark } from '@/components/Brand';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBackdrop } from '@/components/Glass';
import { router } from 'expo-router';
import { Activity, Bell, CalendarCheck, Check, ChevronLeft, ChevronRight, ChevronsRight, Compass, Dumbbell, Flame, Lock, PersonStanding, Scale, Zap, MessageCircle, Minus, Plus, ShieldCheck, Trophy, UtensilsCrossed } from '@/lib/icons';
import { Button, Card, Chip, Field, NoteField, Pill, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { KCAL_TARGET, MACRO_TARGET } from '@/lib/data';
import { DobPicker, HeightPicker, WeightPicker } from '@/features/body/BodyLog';
import { dirOf, needsTarget, planMath } from '@/features/onboarding/plan';
import { useDomain } from '@/lib/domain';
import { HealthStep, ProjectionStep, ReadyContent } from '@/features/onboarding/Steps';
import { HEALTH_NAME } from '@/lib/health';
import { YourPalLogo } from '@/components/YourPalLogo';
import { useShell } from '@/features/shell/state';
import { ProgLogo } from '@/features/shell/parts';
import Svg, { Circle, Path } from 'react-native-svg';

const ORDER = ['welcome', 'facility', 'goal', 'exp', 'sched', 'age', 'height', 'weight', 'target', 'plan', 'basics', 'health', 'consent', 'building', 'ready'] as const;
type Step = (typeof ORDER)[number];
const COUNTED: Step[] = ['goal', 'exp', 'sched', 'age', 'height', 'weight', 'target', 'basics'];
const GOALS = ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'Flexibility', 'Agility', 'General fitness', 'Not sure yet'];
const EXPS = [
  { l: 'New to the gym', s: 'We start with the basics and good form' },
  { l: 'Returning after a break', s: 'A gentle ramp back up over two weeks' },
  { l: 'I train regularly', s: 'You can import past workouts later' },
];

export default function Onboarding() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, set, setProfile, setSc } = useStore();
  const { openSheet, closeSheet, toast } = useOverlay();
  const p = state.profile;
  const sc = state.sc;
  const isPT = sc.member === 'PT member';
  const [step, setStep] = useState<Step>((ORDER as readonly string[]).includes(state.onboardingStep) ? (state.onboardingStep as Step) : 'welcome');
  const [dir, setDir] = useState(1);
  const [tried, setTried] = useState(false);

  const { set: setDomain } = useDomain();
  // The one goal the rest of the app reads (Today, Progress) comes from what was answered here.
  const finishGoal = () => {
    const m = planMath(p);
    const type = p.goal && p.goal !== 'Not sure yet' ? p.goal : 'General fitness';
    const by = m.has ? new Date(2026, 8, 24 + m.weeks * 7).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
    if (goalV2Store.get().version === 'Version 2') {
      // Version 2: every measurable goal has a finish date (12 weeks unless chosen); consistency goals have a weekly target and none.
      const kind = kindOf(type);
      const chosen = goalV2Store.get().onboardBy;
      setDomain({ goal: kind === 'consistency' ? { type, target: WEEK_TARGET, by: '—' } : { type, target: m.has ? m.delta : type === 'Strength' ? 80 : 0, by: chosen || fmtDay(addDays(TODAY, 84)) } });
      return;
    }
    setDomain({ goal: { type, target: m.has ? m.delta : 0, by } });
  };
  const go = (s: Step, d = 1) => { setDir(d); setTried(false); setStep(s); set({ onboardingStep: s }); };
  // Height, weight, target and the projection go together; target and projection need a weight goal.
  const { d: dom } = useDomain();
  const flow = ORDER.filter((s) => !(s === 'facility' && !dom.hasGym) && !(p.skipBody && (s === 'height' || s === 'weight' || s === 'target' || s === 'plan')) && !(!needsTarget(p.goal) && (s === 'target' || s === 'plan')));
  const idx = Math.max(0, flow.indexOf(step));
  const next = () => {
    if (step === 'goal' && !p.goal) { setTried(true); haptic.error(); return; }
    if (step === 'exp' && !p.exp) { setTried(true); haptic.error(); return; }
    if (step === 'age' && !p.dob) setProfile({ dob: defaultDob(), age: String(ageFrom(defaultDob())) });
    if (step === 'target' && p.targetKg && ((+p.targetKg) - (+p.weightKg || 70)) * dirOf(p.goal) <= 0) { setTried(true); haptic.warn(); return; }
    if (step === 'height' && !p.heightCm) setProfile({ heightCm: '170', skipBody: false });
    if (step === 'weight' && !p.weightKg) setProfile({ weightKg: '70', skipBody: false });
    if (step === 'basics' && p.injury === 'Yes' && p.injuryNote.trim().length < 3) { setTried(true); haptic.error(); return; }
    if (step === 'health') { setDomain({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · steps, heart rate and sleep sync automatically`); go(flow[idx + 1]); return; }
    if (step === 'consent') { askNotifications(); return; }
    haptic.light();
    go(flow[Math.min(idx + 1, flow.length - 1)]);
  };
  // Skip all: the rest gets sensible defaults and you land on Today.
  const skipAll = () => {
    if (!p.goal) setProfile({ goal: 'Not sure yet' });
    finishGoal(); set({ onboarded: true }); haptic.success(); router.replace('/(tabs)');
    toast('Skipped · you can fill these in any time from Profile');
  };
  // One quiet skip per step, worded for that step.
  const skipBody = () => { setProfile({ skipBody: true, heightCm: '', weightKg: '' }); go('basics'); };
  const skipFor: Partial<Record<Step, { label: string; run: () => void }>> = {
    goal: { label: 'Not sure yet · decide with Coach', run: () => { setProfile({ goal: 'Not sure yet' }); go('exp'); } },
    exp: { label: "Skip · I'll tell my coach", run: () => go(flow[idx + 1]) },
    sched: { label: 'Decide the days later', run: () => go(flow[idx + 1]) },
    age: { label: 'Skip date of birth', run: () => go(flow[idx + 1]) },
    height: { label: 'Skip height and weight', run: skipBody },
    weight: { label: 'Skip weight', run: skipBody },
    target: { label: 'Skip target weight', run: skipBody },
    plan: { label: 'Maybe later', run: () => go(flow[idx + 1]) },
    basics: { label: 'Skip diet and injuries', run: () => go(flow[idx + 1]) },
    health: { label: `Connect ${HEALTH_NAME} later`, run: () => { setDomain({ hc: false }); go(flow[idx + 1]); } },
  };
  // Skip and Skip all start with the questionnaire (the goal question); the welcome and gym screens have neither.
  const questionnaire = step !== 'welcome' && step !== 'facility' && step !== 'building' && step !== 'ready';
  const skip = questionnaire ? skipFor[step] : undefined;
  const back = () => { if (idx > 0) go(flow[idx - 1], -1); else { set({ loggedIn: false }); router.replace('/login'); } };

  const askNotifications = () => openSheet(
    <View style={{ gap: 12 }}>
      <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Bell size={26} color={c.accentText} /></View>
      <Txt v="title">Get notified when Coach sends your plan</Txt>
      <Txt muted>Only plan updates and trainer replies. Reminders stay off until you turn them on.</Txt>
      <Button kind="accent" label="Allow notifications" onPress={() => { setProfile({ notifications: 'on' }); closeSheet(() => go('building')); haptic.success(); }} />
      <Button kind="secondary" label="Not now" onPress={() => { setProfile({ notifications: 'off' }); closeSheet(() => go('building')); }} />
    </View>, { label: 'Notifications' });

  useScenarios({
    title: 'Onboarding',
    rows: [
      { label: 'Jump to step', options: ['Welcome', 'Gym', 'Goal', 'Experience', 'Schedule', 'Age', 'Height', 'Weight', 'Target', 'Projection', 'Basics', 'Health', 'Privacy', 'Building', 'All set'], value: ({ welcome: 'Welcome', facility: 'Gym', goal: 'Goal', exp: 'Experience', sched: 'Schedule', age: 'Age', height: 'Height', weight: 'Weight', target: 'Target', plan: 'Projection', basics: 'Basics', health: 'Health', consent: 'Privacy', building: 'Building', ready: 'All set' } as any)[step], onPick: (v) => go(({ Welcome: 'welcome', Gym: 'facility', Goal: 'goal', Experience: 'exp', Schedule: 'sched', Age: 'age', Height: 'height', Weight: 'weight', Target: 'target', Projection: 'plan', Basics: 'basics', Health: 'health', Privacy: 'consent', Building: 'building', 'All set': 'ready' } as any)[v]) },
      { label: 'Assessment', options: ['Scheduled', 'Not scheduled'], value: sc.assess, onPick: (v) => setSc({ assess: v as any }) },
      { label: 'Connection', options: ['Online', 'Offline'], value: sc.net, onPick: (v) => setSc({ net: v as any }) },
    ],
    actions: [{ label: 'Restart onboarding', run: () => { setProfile({ goal: '', exp: '', injury: 'No', injuryNote: '' }); go('welcome', -1); } }],
  }, [step, sc.assess, sc.net]);

  const qsteps = flow.filter((x) => COUNTED.includes(x));
  // Screens that aren't questions share the progress of the question before them.
  // The step counter shows only on the questions themselves (goal to basics). Projection, health, privacy and signature are not questions, so no counter there.
  const qn = qsteps.indexOf(step) + 1 || undefined;
  const QTOTAL = qsteps.length;
  const showChrome = step !== 'welcome' && step !== 'ready' && step !== 'building';
  const primaryLabel = step === 'welcome' ? 'Get started' : step === 'consent' ? 'Agree and continue' : step === 'ready' ? "Let's start" : step === 'plan' ? 'I want to get there' : step === 'health' ? `Connect ${HEALTH_NAME}` : 'Continue';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {step === 'welcome' && <LinearGradient pointerEvents="none" colors={isDark ? ['rgba(224,128,48,0.30)', 'rgba(224,128,48,0.09)', 'rgba(224,128,48,0)'] : ['rgba(224,128,48,0.42)', 'rgba(224,128,48,0.13)', 'rgba(224,128,48,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 460 }} />}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, height: insets.top + 58, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {step !== 'ready' && (
          <RoundBtn label="Back" onPress={back} glass>
            <ChevronLeft size={22} color={c.ink} />
          </RoundBtn>
        )}
        {qn ? <Progress n={qn} total={QTOTAL} /> : <View style={{ flex: 1 }} />}
        {qn ? <Txt v="label" style={{ textAlign: 'right' }}>{qn} of {QTOTAL}</Txt> : null}
        {questionnaire && (
          <Pressy accessibilityRole="button" accessibilityLabel="Skip all questions and go to Today" onPress={skipAll} scaleTo={0.94} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 6 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.accentText }}>Skip all</Txt>
          </Pressy>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, gap: 14, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Animated.View key={step} entering={fade()} exiting={fadeOut()} style={[{ gap: 14 }, step === 'building' && { flex: 1, justifyContent: 'center' }]}>
          {step === 'welcome' && <Welcome isPT={isPT} assess={sc.assess} hasGym={dom.hasGym} />}
          {step === 'facility' && <FacilityStep />}
          {step === 'goal' && <GoalStep tried={tried} />}
          {step === 'exp' && <ExpStep tried={tried} />}
          {step === 'sched' && <SchedStep />}
          {step === 'age' && <AgeStep />}
          {step === 'height' && <HeightStep />}
          {step === 'weight' && <WeightStep />}
          {step === 'target' && <TargetStep />}
          {step === 'plan' && <ProjectionStep />}
          {step === 'health' && <HealthStep />}
          {step === 'basics' && <BasicsStep tried={tried} />}
          {step === 'consent' && <ConsentStep isPT={isPT} />}
          {step === 'building' && <BuildingStep onDone={() => go('ready')} />}
          {step === 'ready' && <ReadyStep assess={sc.assess} />}
        </Animated.View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12, paddingTop: 8, gap: 6, backgroundColor: c.bg }}>
        {sc.net === 'Offline' && showChrome && <Txt v="caption" style={{ textAlign: 'center' }}>You're offline. Answers are saved on this phone and sync later.</Txt>}
        {step === 'ready' ? (
          <SwipeToStart onDone={() => { finishGoal(); set({ onboarded: true }); haptic.success(); router.replace('/(tabs)'); toast("You're all set · your plan fills in after the assessment"); }} />
        ) : step !== 'building' && <Button label={primaryLabel} onPress={next} />}
        {skip && step !== 'ready' && step !== 'building' && <Button kind="ghost" label={skip.label} onPress={skip.run} />}
      </View>
    </KeyboardAvoidingView>
  );
}

function Progress({ n, total }: { n: number; total: number }) {
  const { c } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => { w.value = withSpring(n / total, spring.soft); }, [n, total]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` as any }));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ now: n, min: 0, max: total }} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', borderRadius: 3, backgroundColor: c.accent }, a]} />
    </View>
  );
}

function Title({ t, s }: { t: string; s?: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 4 }}>
      <Txt v="title">{t}</Txt>
      {s ? <Txt muted>{s}</Txt> : null}
    </View>
  );
}

function Welcome({ isPT, assess, hasGym }: { isPT: boolean; assess: string; hasGym: boolean }) {
  const { c } = useTheme();
  return (
    <>
      <View style={{ gap: 12, paddingTop: 8, paddingBottom: 6 }}>
        {hasGym ? <GymLogoMark size={64} /> : <YourPalLogo height={34} color={c.ink} />}
        <Txt style={{ fontFamily: font.regular, fontSize: 32, lineHeight: 42, letterSpacing: -1.2 }}>{hasGym ? 'Hi Jyotsana, welcome to Wulf Fitness' : 'Hi Jyotsana, welcome to YourPal'}</Txt>
        <Txt muted>{!hasGym ? 'Answer a few quick questions and your plan is ready.' : isPT ? 'Your PT package is active. Coach Vikram will build your plan.' : 'Your membership is active. Here is how your first week works.'}</Txt>
      </View>
      <Card style={{ gap: 0, padding: 6 }}>
        {hasGym && <InfoRow icon={<PersonAvatar who="coach" size={30} />} t="Coach Vikram" s="You can message him any time" />}
        {hasGym && <InfoRow icon={<CalendarCheck size={19} color={c.muted} />} t={assess === 'Scheduled' ? 'Sat 10:00 am with Coach Vikram' : 'Assessment not booked yet'} s={assess === 'Scheduled' ? 'Your first assessment · about 30 min' : 'The front desk will book it. You can still set up now.'} warn={assess !== 'Scheduled'} />}
        <InfoRow icon={<Dumbbell size={19} color={c.muted} />} t="3 quick questions to set up your plan" s="About a minute. You can change answers later." last />
      </Card>
    </>
  );
}

function InfoRow({ icon, t, s, last, warn }: { icon: React.ReactNode; t: string; s: string; last?: boolean; warn?: boolean }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 14, minHeight: 66, paddingHorizontal: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      {icon}
      <View style={{ flex: 1, paddingVertical: 10 }}>
        <Txt style={{ fontFamily: font.semibold, color: warn ? c.warn : c.ink }}>{t}</Txt>
        <Txt v="caption">{s}</Txt>
      </View>
    </Row>
  );
}

function Stepper({ value, onChange, step, unit, label }: { value: number; onChange: (v: number) => void; step: number; unit: string; label: string }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 10 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={'Less ' + label} onPress={() => onChange(Math.max(step, +(value - step).toFixed(1)))} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Minus size={20} color={c.ink} /></Pressy>
      <View accessibilityLabel={`${label} ${value} ${unit}`} style={{ flex: 1, height: 64, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
        <Txt style={{ fontFamily: font.display, fontSize: 32, color: c.ink }}>{value}</Txt>
        <Txt muted>{unit}</Txt>
      </View>
      <Pressy accessibilityRole="button" accessibilityLabel={'More ' + label} onPress={() => onChange(+(value + step).toFixed(1))} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color={c.ink} /></Pressy>
    </Row>
  );
}

function GoalStep({ tried }: { tried: boolean }) {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const p = state.profile;
  return (
    <>
      <Title t="What's your main goal?" s="Pick one. Coach Vikram fine-tunes it with you at the assessment." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {GOALS.map((g) => <GoalTile key={g} goal={g} on={p.goal === g} onPress={() => setProfile({ goal: g, goalTarget: 0, targetKg: '', goal2: p.goal2 === g ? 'None' : p.goal2 })} />)}
      </View>
      {tried && !p.goal && <Txt v="caption" color={c.warn}>Pick a goal, or "Not sure yet".</Txt>}
      {!!p.goal && (
        <Animated.View entering={fade()} style={{ padding: 14, borderRadius: 18, backgroundColor: c.surface2 }}>
          <Txt style={{ fontSize: 14 }} muted>{p.goal === 'Not sure yet' ? "We'll start with general fitness. Decide the real goal with Coach Vikram at your assessment." : needsTarget(p.goal) ? "You'll set your target weight after a few quick questions." : 'Coach Vikram sets the numbers with you at your assessment.'}</Txt>
        </Animated.View>
      )}
      {!!p.goal && p.goal !== 'Not sure yet' && (
        <Animated.View entering={fade(80)} style={{ gap: 8 }}>
          <Txt v="label">Second goal (optional)</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Flexibility', 'General fitness', 'Strength', 'None'].filter((g) => g !== p.goal).map((g) => <Pill key={g} label={g} on={p.goal2 === g} onPress={() => setProfile({ goal2: g })} />)}
          </View>
        </Animated.View>
      )}
    </>
  );
}

// Each goal has its own small illustration: a tinted card with a large icon and soft shapes behind it.
const GOAL_ART: Record<string, { Icon: any; tint: string; col: string }> = {
  'Weight loss': { Icon: Scale, tint: 'tNutri', col: 'cNutri' },
  'Muscle gain': { Icon: Dumbbell, tint: 'tAct', col: 'cAct' },
  'Lean body': { Icon: Flame, tint: 'tHeart', col: 'cHeart' },
  Strength: { Icon: Trophy, tint: 'accentSoft', col: 'accentText' },
  Flexibility: { Icon: PersonStanding, tint: 'tSleep', col: 'cSleep' },
  Agility: { Icon: Zap, tint: 'tAct', col: 'cAct' },
  'General fitness': { Icon: Activity, tint: 'tNutri', col: 'cNutri' },
  'Not sure yet': { Icon: Compass, tint: 'surface2', col: 'muted' },
};
function GoalTile({ goal, on, onPress }: { goal: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const a = GOAL_ART[goal];
  // Quiet card: the surface colour, a thin line, one small icon. The selected card gets a darker line.
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={goal} onPress={onPress} scaleTo={0.97}
      style={{ width: '48%', flexGrow: 1, height: 108, borderRadius: 22, backgroundColor: c.surface, borderWidth: on ? 2 : 1, borderColor: on ? c.ink : c.line, padding: 14, justifyContent: 'space-between' }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <a.Icon size={20} strokeWidth={1.8} color={c.ink} />
      </View>
      <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.ink }}>{goal}</Txt>
      {on && <View style={{ position: 'absolute', right: 12, top: 12, width: 22, height: 22, borderRadius: 11, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Check size={13} strokeWidth={3} color={c.bg} /></View>}
    </Pressy>
  );
}

function FacilityStep() {
  const { c } = useTheme();
  const { s, set: setShell } = useShell();
  const gyms = s.progs.filter((x) => x.kind === 'Gym');
  return (
    <>
      <Title t="Which gym are you joining?" s="Your coach, plan and check-in come from the gym you pick." />
      {gyms.map((g) => {
        const on = s.cur === g.id;
        return (
          <Pressy key={g.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setShell({ cur: g.id })}
            style={{ minHeight: 72, borderRadius: 22, borderWidth: on ? 2 : 1, borderColor: on ? c.ink : c.line, backgroundColor: c.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ProgLogo p={g} size={44} />
            <View style={{ flex: 1, paddingVertical: 12 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{g.name}</Txt>
              <Txt v="caption">Gym</Txt>
            </View>
            <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: on ? 0 : 1.5, borderColor: c.surface3, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {on && <Check size={15} strokeWidth={3} color={c.bg} />}
            </View>
          </Pressy>
        );
      })}
    </>
  );
}

function ExpStep({ tried }: { tried: boolean }) {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  return (
    <>
      <Title t="How much have you trained before?" s="Pick the one closest to you." />
      {EXPS.map((e) => {
        const on = state.profile.exp === e.l;
        return (
          <Pressy key={e.l} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setProfile({ exp: e.l })}
            style={{ minHeight: 72, borderRadius: 22, borderWidth: on ? 2 : 1, borderColor: on ? c.ink : c.line, backgroundColor: c.surface, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, paddingVertical: 12 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 16 }}>{e.l}</Txt>
              <Txt v="caption">{e.s}</Txt>
            </View>
            <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: on ? 0 : 1.5, borderColor: c.surface3, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {on && <Check size={15} strokeWidth={3} color={c.bg} />}
            </View>
          </Pressy>
        );
      })}
      {tried && !state.profile.exp && <Txt v="caption" color={c.warn}>Pick one to continue.</Txt>}
    </>
  );
}

function SchedStep() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const p = state.profile;
  return (
    <>
      <Title t="Days you can realistically train" s="Your plan is built around this. You can change it later." />
      <Row style={{ gap: 8 }}>
        {[2, 3, 4, 5, 6].map((d) => {
          const on = p.days === d;
          return (
            <Pressy key={d} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${d} days a week`} onPress={() => setProfile({ days: d })}
              style={{ flex: 1, height: 72, borderRadius: 22, backgroundColor: on ? c.ink : c.surface, borderWidth: on ? 0 : 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.display, fontSize: 26, color: on ? c.bg : c.ink }}>{d}</Txt>
              <Txt v="caption" color={on ? c.bg : c.muted}>days</Txt>
            </Pressy>
          );
        })}
      </Row>
      {p.days >= 6 && <Txt v="caption">6 days is a lot to start with. We'll keep two of them light.</Txt>}
      <Txt v="label" style={{ marginTop: 8 }}>Usual time</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['Early morning', 'Morning', 'Afternoon', 'Evening', 'Changes a lot'].map((t) => <Pill key={t} label={t} on={p.time === t} onPress={() => setProfile({ time: t })} />)}
      </View>
    </>
  );
}

function AgeStep() {
  const { state, setProfile } = useStore();
  return (
    <>
      <Title t="When were you born?" s="Used to estimate your daily calories and how hard to start. Only your age is shared with your coach." />
      <DobPicker dob={state.profile.dob || defaultDob()} onChange={(v) => setProfile({ dob: v, age: String(ageFrom(v)) })} />
    </>
  );
}

function TargetStep() {
  const { state, setProfile } = useStore();
  const gv = goalV2Store.use();
  const p = state.profile;
  const cur = +p.weightKg || 70;
  const d = dirOf(p.goal);
  const target = +p.targetKg || Math.round((cur + d * (p.goal === 'Muscle gain' ? 3 : 5)) * 10) / 10;
  useEffect(() => { if (!p.targetKg) setProfile({ targetKg: String(target), goalTarget: Math.abs(Math.round((target - cur) * 10) / 10) }); }, []);
  const delta = Math.round((target - cur) * 10) / 10;
  const wrong = delta * d <= 0;
  const chip = wrong
    ? <Chip tone="warn" label={d < 0 ? 'Pick a weight below your current one' : 'Pick a weight above your current one'} />
    : <Chip tone="good" label={`${d < 0 ? '↘' : '↗'} ${delta > 0 ? '+' : '−'}${Math.abs(delta)} kg`} />;
  return (
    <>
      <Title t="What's your target weight?" s="Coach Vikram checks that it is a healthy pace at your assessment." />
      {gv.version === 'Version 2' && <View style={{ paddingBottom: 4 }}><FinishBy by={gv.onboardBy || fmtDay(addDays(TODAY, 84))} onChange={(by) => goalV2Store.set({ onboardBy: by })} /></View>}
      <WeightPicker title="Target weight" kg={target} onChange={(v) => { const t = Math.round(v * 10) / 10; setProfile({ targetKg: String(t), goalTarget: Math.abs(Math.round((t - cur) * 10) / 10) }); }} chip={chip} />
    </>
  );
}

const BUILD_MSGS = ['Saving your answers', 'Sharing them with Coach Vikram', 'Setting up your Today screen', 'Almost there'];
function BuildingStep({ onDone }: { onDone: () => void }) {
  const { c } = useTheme();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / 2800);
      setPct(Math.round(k * 100));
      if (k >= 1) { clearInterval(id); onDone(); }
    }, 60);
    return () => clearInterval(id);
  }, []);
  const msg = BUILD_MSGS[Math.min(BUILD_MSGS.length - 1, Math.floor(pct / 26))];
  return (
    <View accessibilityLiveRegion="polite" style={{ alignItems: 'center', justifyContent: 'center', gap: 22, paddingBottom: 40 }}>
      <View style={{ width: 168, height: 168, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={168} height={168} viewBox="0 0 168 168">
          <Circle cx={84} cy={84} r={76} fill="none" stroke={c.surface2} strokeWidth={9} />
          <Circle cx={84} cy={84} r={76} fill="none" stroke={c.accent} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 76}`} strokeDashoffset={(2 * Math.PI * 76) * (1 - pct / 100)} transform="rotate(-90 84 84)" />
        </Svg>
        <Txt style={{ position: 'absolute', fontFamily: font.displayBold, fontSize: 40, lineHeight: 52 }}>{pct}%</Txt>
      </View>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 17 }}>{msg}</Txt>
        <Txt v="caption">This takes a moment</Txt>
      </View>
    </View>
  );
}

function HeightStep() {
  const { state, setProfile } = useStore();
  const cm = +state.profile.heightCm || 170;
  return (
    <>
      <Title t="How tall are you?" s="Used for calories and your plan. Only you and your coach see this." />
      <HeightPicker cm={cm} onChange={(v) => setProfile({ heightCm: String(Math.round(v)), skipBody: false })} />
    </>
  );
}

function WeightStep() {
  const { state, setProfile } = useStore();
  const kg = +state.profile.weightKg || 70;
  return (
    <>
      <Title t="What do you weigh?" s="Your starting point. You can log it again any time from Today." />
      <WeightPicker kg={kg} onChange={(v) => setProfile({ weightKg: String(Math.round(v * 10) / 10), skipBody: false })} />
    </>
  );
}

function BasicsStep({ tried }: { tried: boolean }) {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const p = state.profile;
  return (
    <>
      <Title t="A few basics" s="Diet, where you eat and any injuries. Only you and your coach see this." />
      <Txt v="label" style={{ marginTop: 6 }}>Diet</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['Veg', 'Eggetarian', 'Non-veg', 'Jain', 'Vegan'].map((d) => <Pill key={d} label={d} on={p.diet === d} onPress={() => setProfile({ diet: d })} />)}
      </View>
      <Txt v="label" style={{ marginTop: 6 }}>Where do you eat?</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['Home food', 'PG / hostel', 'Office canteen', 'Mostly outside'].map((d) => <Pill key={d} label={d} on={p.eat === d} onPress={() => setProfile({ eat: d })} />)}
      </View>
      <Txt v="label" style={{ marginTop: 6 }}>Any injuries or pain?</Txt>
      <Row style={{ gap: 8 }}>
        {(['No', 'Yes'] as const).map((d) => <Pill key={d} label={d} on={p.injury === d} onPress={() => setProfile({ injury: d })} style={{ flex: 1 }} />)}
      </Row>
      {p.injury === 'Yes' && (
        <Animated.View entering={fade()} style={{ gap: 6 }}>
          <NoteField value={p.injuryNote} onChangeText={(t) => setProfile({ injuryNote: t })} placeholder="e.g. lower back pain when bending forward, started two months ago" accessibilityLabel="Describe the injury" error={tried && p.injuryNote.trim().length < 3} />
          <Txt v="caption" color={tried && p.injuryNote.trim().length < 3 ? c.warn : c.muted}>{tried && p.injuryNote.trim().length < 3 ? 'Add a short note about the injury so your first workout is safe.' : 'Coach Vikram sees this before your first workout.'}</Txt>
        </Animated.View>
      )}
    </>
  );
}

function ConsentStep({ isPT }: { isPT: boolean }) {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const rows = [
    { l: 'Attendance and check-ins', s: 'So the gym can count your visits', shared: true },
    { l: isPT ? 'Workouts, diet and progress' : 'Workout and diet summary', s: isPT ? 'Coach Vikram adjusts your plan from this' : 'A weekly summary, not every meal', shared: true },
  ];
  return (
    <>
      <Title t="Your privacy" s="What Wulf Fitness can see. You can change this any time in Settings." />
      <Card style={{ padding: 6 }}>
        {rows.map((r) => (
          <Row key={r.l} style={{ gap: 14, minHeight: 68, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <ShieldCheck size={20} color={c.good} />
            <View style={{ flex: 1, paddingVertical: 10 }}><Txt style={{ fontFamily: font.semibold }}>{r.l}</Txt><Txt v="caption">{r.s}</Txt></View>
            <Chip label="Shared" tone="good" style={{ alignSelf: 'center' }} />
          </Row>
        ))}
        <Row style={{ gap: 14, minHeight: 68, paddingHorizontal: 14 }}>
          <Lock size={20} color={c.muted} />
          <View style={{ flex: 1, paddingVertical: 10 }}><Txt style={{ fontFamily: font.semibold }}>Progress photos</Txt><Txt v="caption">{state.profile.photosPrivate ? 'Private · only you see them' : 'Shared with Coach Vikram'}</Txt></View>
          <View style={{ alignSelf: 'center' }}><Switch label="Share progress photos with coach" on={!state.profile.photosPrivate} onChange={(v) => { setProfile({ photosPrivate: !v }); }} /></View>
        </Row>
      </Card>
      <Txt v="caption">Health data from your watch (heart rate, sleep) is never shared unless you turn it on later.</Txt>
    </>
  );
}

function ReadyStep({ assess }: { assess: string }) {
  return <ReadyContent assess={assess} />;
}

// Big swipe-to-start button for the last screen: drag the thumb across. Plain timing, no spring.
function SwipeToStart({ onDone }: { onDone: () => void }) {
  const { c, isDark } = useTheme();
  const [w, setW] = useState(0);
  const TH = 64, PAD = 5;
  const max = Math.max(0, w - TH - PAD * 2);
  const x = useSharedValue(0);
  const done = useSharedValue(false);
  const pan = Gesture.Pan()
    .onUpdate((e) => { if (!done.value) x.value = Math.max(0, Math.min(max, e.translationX)); })
    .onEnd(() => {
      if (done.value) return;
      if (x.value > max * 0.78) { done.value = true; x.value = withTiming(max, { duration: 140 }, (f) => { if (f) runOnJS(onDone)(); }); }
      else x.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
    });
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const label = useAnimatedStyle(() => ({ opacity: max ? 1 - Math.min(1, x.value / (max * 0.55)) : 1 }));
  // Glass track with a soft blue glow along every inner edge; the thumb is a lighter glass circle.
  const glow = isDark ? 'rgba(80,140,255,0.62)' : 'rgba(47,107,234,0.55)';
  const clear = 'rgba(47,107,234,0)';
  const R = (TH + PAD * 2) / 2;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="button" accessibilityLabel="Swipe to start your journey" accessibilityHint="Double tap to start" accessible
      onAccessibilityTap={onDone}
      style={{ height: TH + PAD * 2, borderRadius: R, justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(110,160,255,0.5)', backgroundColor: isDark ? 'rgba(14,24,48,0.55)' : 'rgba(255,255,255,0.45)' }}>
      <GlassBackdrop radius={R} />
      <LinearGradient pointerEvents="none" colors={[glow, clear]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 30 }} />
      <LinearGradient pointerEvents="none" colors={[clear, glow]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 30 }} />
      <LinearGradient pointerEvents="none" colors={[glow, clear]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 44 }} />
      <LinearGradient pointerEvents="none" colors={[clear, glow]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44 }} />
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: TH + PAD * 2, right: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }, label]}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24, color: c.ink }}>Swipe to start</Txt>
        <ChevronsRight size={20} color={c.ink} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ marginLeft: PAD, width: TH, height: TH, borderRadius: TH / 2, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' }, thumb]}>
          <ChevronRight size={26} color={c.ink} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
