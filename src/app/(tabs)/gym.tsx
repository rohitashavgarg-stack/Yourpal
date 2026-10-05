import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { ClipboardCheck } from '@/lib/icons';
import { fade, fadeOut } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { PersonAvatar } from '@/components/Brand';
import { PillBtn, Tag } from '@/components/bits';
import { Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { CardTitle, cardShadow, GrowBar, ListCard, PCard } from '@/features/progress/parts';
import { membershipView, PT_TOTAL, VISITS } from '@/features/gym/data';
import { dateLabel, gymStore, useGymScenarios } from '@/features/gym/state';

const Enter = ({ i, children }: { i: number; children: React.ReactNode }) => <Animated.View entering={fade(i * 40)}>{children}</Animated.View>;

function MembershipCard() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const M = membershipView(d.membership, c);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Membership: ${M.t}. ${M.sub}. Details`} onPress={() => router.push('/gym/membership')} scaleTo={0.98}
      style={[{ borderRadius: 28, padding: 18, gap: 8, backgroundColor: M.bg }, cardShadow(isDark)]}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 13, color: M.fg, opacity: 0.85 }}>Membership</Txt>
        <Txt style={{ fontSize: 13, fontFamily: font.semibold, color: M.fg, opacity: 0.85 }}>Details ›</Txt>
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: 30, lineHeight: 39, letterSpacing: -0.6, color: M.fg }}>{M.t}</Txt>
      <Txt style={{ fontSize: 14, color: M.fg, opacity: 0.85 }}>{M.sub}</Txt>
    </Pressy>
  );
}

function BreakCard() {
  const { c, isDark } = useTheme();
  const g = gymStore.use();
  return (
    <Animated.View entering={fade()} exiting={fadeOut()}
      style={[{ backgroundColor: c.surface, borderRadius: 28, paddingVertical: 16, paddingHorizontal: 18, gap: 2, borderWidth: 1.5, borderColor: c.accent }, cardShadow(isDark)]}>
      <Txt style={{ fontFamily: font.semibold }}>Membership paused until {dateLabel(g.breakUntil)}</Txt>
      <Txt v="caption" style={{ fontSize: 13 }}>Set by the front desk · streak frozen · reminders paused</Txt>
    </Animated.View>
  );
}

function AttendanceCard({ awaiting }: { awaiting: boolean }) {
  const { c } = useTheme();
  const cells = Array.from({ length: 30 }, (_, j) => VISITS[j + 1]);
  return (
    <PCard onPress={() => router.push('/gym/attendance')} label={`Attendance, 18 visits this month${awaiting ? ', 1 session to confirm' : ''}`} style={{ gap: 8 }}>
      <CardTitle title="Attendance" right={awaiting ? <Tag label="1 session to confirm" bg={c.accent} fg="#fff" /> : undefined} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <View>
          <Txt style={{ fontFamily: font.display, fontSize: 37, lineHeight: 44 }}>18</Txt>
          <Txt v="caption" style={{ fontSize: 13 }}>visits this month</Txt>
        </View>
        <View importantForAccessibility="no-hide-descendants" style={{ width: 10 * 8 + 9 * 3, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
          {cells.map((v, i) => <View key={i} style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: v && v !== 'x' ? (v === 'h' ? c.surface3 : c.accent) : c.surface2 }} />)}
        </View>
      </Row>
      <Txt v="caption" style={{ fontSize: 13 }}>Last: Wed 24 · 6:42 pm · Location</Txt>
    </PCard>
  );
}

function AssessCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const a = d.assess, none = a === 'None yet', only = a === 'Only first', due = a === 'Due now';
  const big = none ? 'Sat 10:00 am' : only ? 'Baseline saved' : '7 of 8 improved';
  const sub = none ? 'First assessment with Coach Vikram' : only ? '8 tests · 2 Sep' : 'Reassessment 1 · 30 Sep vs start';
  const next = none ? 'Your plan is built from it' : due ? 'Reassessment 2 · book at the front desk' : only ? 'Next: Tue 30 Sep · Coach Vikram' : 'Next: Tue 28 Oct · Coach Vikram';
  return (
    <PCard onPress={() => router.push('/gym/assessments')} label={`Assessments. ${big}. ${sub}`} style={{ gap: 8 }}>
      <CardTitle title="Assessments" right={due ? <Tag label="Due this week" bg={c.warnSoft} fg={c.warn} /> : <Txt style={{ fontSize: 13, fontFamily: font.semibold, color: c.accentText }}>View ›</Txt>} />
      <Row style={{ gap: 14 }}>
        <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: c.tNutri, alignItems: 'center', justifyContent: 'center' }}><ClipboardCheck size={26} strokeWidth={1.8} color={c.cNutri} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34 }}>{big}</Txt>
          <Txt v="caption" style={{ fontSize: 13 }}>{sub}</Txt>
        </View>
      </Row>
      <Txt v="caption" style={{ fontSize: 13 }}>{next}</Txt>
    </PCard>
  );
}

function ChatCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const last = [...d.chat].reverse().find((m) => !m.me);
  return (
    <PCard onPress={() => router.push('/gym/chat')} label={last ? `Coach Vikram: ${last.t}. Open chat` : 'Chat with Coach Vikram'} style={{ gap: 10 }}>
      <Row style={{ gap: 14 }}>
        <PersonAvatar who="coach" size={68} />
        <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 }}>Coach Vikram</Txt><Txt v="caption">Your trainer</Txt></View>
        <Txt style={{ fontSize: 13, fontFamily: font.semibold, color: c.accentText }}>Chat ›</Txt>
      </Row>
      {d.chat.length && last ? (
        <>
          <Txt>“{last.t}”</Txt>
          <Txt v="caption">{last.meta}</Txt>
        </>
      ) : d.chat.length ? (
        <Txt muted>You sent a message. Coach Vikram replies here.</Txt>
      ) : (
        <Txt muted>Ask about form, your plan or the gym. Coach Vikram replies here.</Txt>
      )}
    </PCard>
  );
}

function PTCard({ isPT }: { isPT: boolean }) {
  const { c } = useTheme();
  const { d } = useDomain();
  if (!isPT) {
    return (
      <PCard onPress={() => router.push('/gym/pt')} label="Personal training. Personalised workout and diet" style={{ gap: 8 }}>
        <CardTitle title="Personal training" />
        <Txt>Personalised workout & diet · adjusted from your logs</Txt>
      </PCard>
    );
  }
  return (
    <PCard onPress={() => router.push('/gym/pt')} label={`Your PT package, ${d.ptLeft} of ${PT_TOTAL} sessions left`} style={{ gap: 8 }}>
      <CardTitle title="Your PT package" />
      <Txt style={{ fontFamily: font.display, fontSize: 30, lineHeight: 39 }}>{d.ptLeft} of {PT_TOTAL}<Txt style={{ fontFamily: font.display, fontSize: 18, color: c.muted }}> sessions left</Txt></Txt>
      <GrowBar pct={Math.round((d.ptLeft / PT_TOTAL) * 100)} color={c.accent} />
      <Txt v="caption" style={{ fontSize: 13 }}>With Coach Vikram · renews 30 Oct</Txt>
    </PCard>
  );
}

export default function Gym() {
  const { d } = useDomain();
  const { state } = useStore();
  const { toast } = useOverlay();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const awaiting = isPT && g.awaiting === 'Yes' && g.sessionState === 'awaiting';
  useGymScenarios('Gym');
  return (
    <TabScreen title="Gym" header={<GymHeader />} compactTitle={false}>
      <Enter i={0}><MembershipCard /></Enter>
      {d.onBreak && <BreakCard />}
      <Enter i={1}><AttendanceCard awaiting={awaiting} /></Enter>
      <Enter i={2}><AssessCard /></Enter>
      <Enter i={3}><ChatCard /></Enter>
      <Enter i={4}><PTCard isPT={isPT} /></Enter>
      <Enter i={5}>
        <ListCard rows={[
          { l: 'Your coach · Coach Vikram', onPress: () => router.push('/coach') },
          { l: 'Membership & payments', onPress: () => router.push('/gym/membership') },
          { l: 'Membership pauses', onPress: () => router.push('/gym/break') },
          { l: 'Help & support', onPress: () => toast("Help opens the gym's support chat and FAQs") },
        ]} />
      </Enter>
    </TabScreen>
  );
}
