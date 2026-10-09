import React from 'react';
import { YourPalLogo } from '@/components/YourPalLogo';
import { haptic } from '@/lib/haptics';
import { STEPS_CARD, StepsPreview } from '@/features/today/StepsCards';
import { WaterCard } from '@/features/today/Trackers';
import { WeekTile } from '@/features/trackers/Widgets';
import { LinearGradient } from 'expo-linear-gradient';
import { fmtDay, useGoalV2 } from '@/features/goalv2/model';
import { START } from '@/features/progress/trends';
import { useStreak } from '@/features/streak/useStreak';
import { HEALTH_NAME } from '@/lib/health';
import { useOpenEdgeCases } from '@/web/WebFrame';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight, Check, ChevronRight, LogOut } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Avatar } from '@/components/GymHeader';
import { useOverlay } from '@/components/Overlay';
import { useStore, useScenarios } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade, fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage } from '@/features/shell/parts';
import { resetShell, useShell } from '@/features/shell/state';
import { goalSummary } from '@/features/shell/goal';
import { LogoutSheet } from '@/features/shell/sheets';

const maskPhone = (p: string) => {
  const d = (p || '').replace(/\D/g, '');
  return d.length === 10 ? `+91 ${d.slice(0, 2)}xxxxxx${d.slice(8)}` : '+91 98xxxxxx21';
};

export default function Profile() {
  const { c } = useTheme();
  const { state, setSc } = useStore();
  const { d } = useDomain();
  const { s, set } = useShell();
  const { openSheet, toast } = useOverlay();
  const p = state.profile;

  useScenarios({
    title: 'Profile',
    rows: [
      { label: 'Member type (privacy wording)', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v) => setSc({ member: v as any }) },
      { label: 'Programmes joined', options: ['Three', 'Only one'], value: s.sc.progs, onPick: (v) => set((x) => ({ sc: { ...x.sc, progs: v as any }, cur: 'gold' })) },
      { label: 'Account deletion', options: ['Not scheduled', 'Scheduled'], value: s.deleting ? 'Scheduled' : 'Not scheduled', onPick: (v) => set({ deleting: v === 'Scheduled' }) },
    ],
    actions: [
      { label: 'Log out (confirm sheet)', run: () => openSheet(<LogoutSheet />, { label: 'Log out' }) },
      { label: 'Open an invite link (WhatsApp)', run: () => router.push({ pathname: '/profile/join', params: { code: 'YOGA-2024', link: '1' } }) },
      { label: 'Reset profile settings', run: () => resetShell() },
    ],
  }, [state.sc.member, state.sc.theme, s.sc.progs, s.deleting]);

  const trackers = (['water', 'weight', 'steps'] as const).filter((k) => s.trk[k]).map((k) => k[0].toUpperCase() + k.slice(1)).join(', ') || 'None';
  const go = (path: string) => () => router.push(path as any);
  const openEdgeCases = useOpenEdgeCases();
  const st = useStreak();
  const g2 = useGoalV2();
  const group = (title: string, rows: { l: string; s?: string; go: () => void; color?: string }[]) => (
    <View style={{ gap: 8 }}>
      <Txt v="label" style={{ paddingHorizontal: 4 }}>{title}</Txt>
      <ListCard>
        {rows.map((r, i) => <LineRow key={r.l} title={r.l} sub={r.s} color={r.color} onPress={r.go} last={i === rows.length - 1} />)}
      </ListCard>
    </View>
  );

  return (
    <SubPage title="Profile" fallback="/(tabs)">
      {/* Header: who you are, how long you have been here */}
      <View style={{ gap: 14, paddingTop: 4 }}>
        <Row style={{ gap: 14, alignItems: 'flex-start' }}>
          <Avatar size={84} />
          <View style={{ flex: 1, gap: 4, paddingTop: 4 }}>
            <Txt style={{ fontFamily: font.light, fontSize: 28, lineHeight: 36, letterSpacing: -0.8 }} numberOfLines={2}>{p.name || 'Jyotsana Rankawat'}</Txt>
            <Txt v="mono" muted>{maskPhone(state.phone)}</Txt>
            {state.sc.member === 'PT member' && <View style={{ alignSelf: 'flex-start', marginTop: 2, height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F5B301', justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: '#3A2A00' }}>Premium · PT</Txt></View>}
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Edit name and number" onPress={go('/profile/details')} scaleTo={0.94} style={{ height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.surface, justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20 }}>Edit</Txt>
          </Pressy>
        </Row>
        <Row style={{ gap: 0, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 14 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="caption" style={{ fontSize: 12 }}>Member since</Txt>
            <Txt style={{ fontFamily: font.semibold, fontSize: 18, lineHeight: 25 }}>{fmtDay(START)} {START.getFullYear()}</Txt>
          </View>
          <View style={{ width: 1, backgroundColor: c.line, marginRight: 16 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="caption" style={{ fontSize: 12 }}>Current streak</Txt>
            <Txt style={{ fontFamily: font.semibold, fontSize: 18, lineHeight: 25 }}>{st.weeks} {st.weeks === 1 ? 'week' : 'weeks'}</Txt>
          </View>
        </Row>
      </View>

      {s.deleting && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={{ paddingVertical: 14, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.warnSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt style={{ flex: 1, fontSize: 14, color: c.warn }}>Account scheduled for deletion on 28 Oct. Your programmes keep their own records.</Txt>
          <Button kind="secondary" small label="Cancel" accessibilityLabel="Cancel account deletion" onPress={() => { set({ deleting: false }); toast('Deletion cancelled'); }} />
        </Animated.View>
      )}

      <View style={{ height: 1, backgroundColor: c.line, marginVertical: 6 }} />

      {/* My goals */}
      <View style={{ gap: 8 }}>
        <Txt v="label" style={{ paddingHorizontal: 4 }}>MY GOALS</Txt>
        <Row style={{ gap: 10 }}>
          <GoalTile title="Daily steps" value="8,000" onPress={go('/profile/trackers')} />
          <GoalTile title="Water" value="3 L" onPress={go('/profile/trackers')} />
        </Row>
        <Pressy accessibilityRole="button" accessibilityLabel={`Goal: ${g2.name}. Change goal`} onPress={go('/goal')} scaleTo={0.985}
          style={{ minHeight: 64, borderRadius: 22, backgroundColor: c.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt v="caption" style={{ fontSize: 12 }}>Main goal</Txt>
            <Txt style={{ fontFamily: font.semibold, fontSize: 17, lineHeight: 24 }}>{g2.name}</Txt>
          </View>
          <ChevronRight size={18} color={c.muted} />
        </Pressy>
      </View>

      {/* Appearance: see both themes */}
      <View style={{ gap: 8 }}>
        <Txt v="label" style={{ paddingHorizontal: 4 }}>APPEARANCE</Txt>
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          {(['Light', 'Dark', 'System'] as const).map((m) => <ThemeTile key={m} mode={m} on={state.sc.theme === m} onPress={() => { haptic.tap(); setSc({ theme: m }); }} />)}
        </Row>
      </View>

      {group('TRACKERS', [
        { l: 'Quick trackers to show', s: trackers, go: go('/profile/trackers') },
        { l: 'Connected apps', s: d.hc ? `${HEALTH_NAME} · connected` : `${HEALTH_NAME} · not connected`, go: go('/profile/health') },
      ])}
      <TrackerPromo onPress={go('/profile/tracker-designs')} />
      {group('ACCOUNT', [
        { l: 'My details', s: 'Date of birth, height, weight, diet, injuries', go: go('/profile/details') },
        ...(d.hasGym ? [{ l: 'Membership pauses', s: d.onBreak ? 'Paused by the front desk' : 'History and pauses left', go: go('/gym/break') }] : []),
        { l: 'Units & diet detail level', s: `${s.unitsW} · ${s.unitsL} · ${s.detail}`, go: go('/profile/units') },
      ])}
      {group('PRIVACY AND ALERTS', [
        { l: 'Privacy & what each provider sees', go: go('/profile/privacy') },
        { l: 'Notifications', s: s.notif.remind || s.notif.water ? 'Reminders on' : 'Reminders off by default', go: go('/profile/notifications') },
        { l: 'Export my data', go: go('/profile/export') },
        { l: 'Delete account', go: go('/profile/delete'), color: c.warn },
      ])}
      {group('SUPPORT', [
        { l: 'Help & support', go: go('/profile/help') },
        { l: 'Demo controls', s: 'Goal type, Today states, time of day, light or dark', go: openEdgeCases },
      ])}

      <Button kind="secondary" label="Log out" icon={<LogOut size={18} color={c.ink} />} onPress={() => openSheet(<LogoutSheet />, { label: 'Log out' })} />
      <BigFooter />
    </SubPage>
  );
}

function GoalTile({ title, value, onPress }: { title: string; value: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${title} goal ${value}. Edit`} onPress={onPress} scaleTo={0.97}
      style={{ flex: 1, minHeight: 84, borderRadius: 22, backgroundColor: c.surface, padding: 14, justifyContent: 'space-between' }}>
      <Txt style={{ fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 }}>{value}</Txt>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="caption" style={{ fontSize: 13 }}>{title}</Txt>
        <ChevronRight size={16} color={c.muted} />
      </Row>
    </Pressy>
  );
}

// A small phone drawn in each theme's own colours, so the choice is something you can see.
const MOCK = {
  Light: { bg: '#F4F6F9', card: '#FFFFFF', ink: '#14171C', mute: '#C9CFD8' },
  Dark: { bg: '#0F1218', card: '#1A1F29', ink: '#F1F3F6', mute: '#3A4250' },
} as const;
function ThemeTile({ mode, on, onPress }: { mode: 'Light' | 'Dark' | 'System'; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const Phone = ({ t, style }: { t: 'Light' | 'Dark'; style?: any }) => {
    const m = MOCK[t];
    return (
      <View style={[{ flex: 1, backgroundColor: m.bg, padding: 8, gap: 5 }, style]}>
        <View style={{ width: 22, height: 5, borderRadius: 3, backgroundColor: m.ink, opacity: 0.8 }} />
        <View style={{ height: 22, borderRadius: 7, backgroundColor: c.accent }} />
        <View style={{ height: 14, borderRadius: 6, backgroundColor: m.card }} />
        <View style={{ height: 14, borderRadius: 6, backgroundColor: m.card }} />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: m.mute }} />
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: m.mute }} />
        </View>
      </View>
    );
  };
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${mode} theme`} onPress={onPress} scaleTo={0.97} style={{ flex: 1, gap: 8, alignItems: 'center' }}>
      <View style={{ width: '100%', height: 116, borderRadius: 18, overflow: 'hidden', borderWidth: on ? 2.5 : 1, borderColor: on ? c.accent : c.line, flexDirection: 'row' }}>
        {mode === 'System' ? (<><Phone t="Light" /><Phone t="Dark" /></>) : <Phone t={mode} />}
      </View>
      <Row style={{ gap: 6 }}>
        <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: on ? 0 : 1.5, borderColor: c.surface3, backgroundColor: on ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {on && <Check size={10} strokeWidth={3.5} color="#fff" />}
        </View>
        <Txt style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 14, lineHeight: 20 }}>{mode}</Txt>
      </Row>
    </Pressy>
  );
}

// Opens the tracker designs page: the real tracker cards peeking up from the bottom of a blue card.
function TrackerPromo({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  const W = 134, k = W / STEPS_CARD;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Tracker designs. Choose how your trackers look" onPress={onPress} scaleTo={0.985}
      style={{ height: 196, borderRadius: 28, overflow: 'hidden', backgroundColor: c.heroFrom }}>
      <LinearGradient colors={[c.heroFrom, c.heroMid, c.heroTo]} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      <Row style={{ paddingTop: 18, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.5, color: '#fff' }}>Tracker designs</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)' }}>Pick how your trackers look</Txt>
        </View>
        <View style={{ width: 52, height: 36, borderRadius: 18, backgroundColor: '#0B0E14', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={18} color="#fff" /></View>
      </Row>
      {/* three kinds of trackers peek up from the bottom: water, workout week, steps (in front) */}
      <Peek x={-4} rot={-9} dy={-48} k={k}><WaterCard /></Peek>
      <Peek x={216} rot={9} dy={-54} k={k}><WeekTile /></Peek>
      <Peek x={108} rot={0} dy={-34} k={k}><StepsPreview design="Dot matrix" /></Peek>
    </Pressy>
  );
}

// One scaled, non-tappable tracker card for the promo.
function Peek({ x, rot, dy, k, children }: { x: number; rot: number; dy: number; k: number; children: React.ReactNode }) {
  const W = STEPS_CARD * k;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x, bottom: dy, width: W, height: W, transform: [{ rotate: `${rot}deg` }] }}>
      <View style={{ transform: [{ scale: k }], transformOrigin: 'top left' } as any}>{children}</View>
    </View>
  );
}

// Big translucent line at the bottom of the page, with the logo and version above and the small print below.
function BigFooter() {
  const { c, isDark } = useTheme();
  return (
    <View style={{ marginTop: 14, paddingTop: 18, borderTopWidth: 1, borderTopColor: c.line, borderStyle: 'dashed', gap: 14 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <YourPalLogo height={22} color={c.muted} />
        <View style={{ height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.mono, fontSize: 11, lineHeight: 16, color: c.muted }}>v1.0</Txt>
        </View>
      </Row>
      <Txt style={{ fontFamily: font.semibold, fontSize: 50, lineHeight: 56, letterSpacing: -2.2, color: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(10,20,40,0.10)' }}>{'your health,\nevery day.'}</Txt>
      <Row style={{ gap: 8, paddingBottom: 18 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
        <Txt style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>Built for you · Made in India</Txt>
      </Row>
    </View>
  );
}
