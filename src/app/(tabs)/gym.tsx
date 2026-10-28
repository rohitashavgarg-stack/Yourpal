import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ClipboardCheck, MessageCircle } from '@/lib/icons';
import { fadeOut } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { PersonAvatar } from '@/components/Brand';
import { PillBtn, Tag } from '@/components/bits';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { CardTitle, cardShadow, GrowBar, ListCard, PCard } from '@/features/progress/parts';
import { PT_TOTAL, VISITS } from '@/features/gym/data';
import { MembershipCard as MembershipStrip, useMembershipNotice } from '@/features/today/PaymentBanner';
import { dateLabel, gymStore, useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes, fixed, onDark } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { StatusDot } from '@/design-system/primitives/StatusDot';

function GymMembership() {
  return <MembershipStrip n={useMembershipNotice()} />;
}

function BreakCard() {
  const { c, isDark } = useTheme();
  const g = gymStore.use();
  return (
    <FadeIn exiting={fadeOut()}
      style={[{ backgroundColor: c.surface, borderRadius: radii.xl, paddingVertical: 16, paddingHorizontal: 18, gap: 2, borderWidth: 1.5, borderColor: c.accent }, cardShadow(isDark)]}>
      <Txt style={{ fontFamily: font.semibold }}>Membership paused until {dateLabel(g.breakUntil)}</Txt>
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Set by the front desk · streak frozen · reminders paused</Txt>
    </FadeIn>
  );
}

function AttendanceCard({ awaiting }: { awaiting: boolean }) {
  const { c } = useTheme();
  const cells = Array.from({ length: 30 }, (_, j) => VISITS[j + 1]);
  return (
    <PCard onPress={() => router.push('/gym/attendance')} label={`Attendance, 18 visits this month${awaiting ? ', 1 session to confirm' : ''}`} style={{ gap: 8 }}>
      <CardTitle title="Attendance" right={awaiting ? <Tag label="1 session to confirm" bg={c.accent} fg={fixed.white} /> : undefined} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <View>
          <Txt style={{ fontFamily: font.display, fontSize: 37, lineHeight: 44 }}>18</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>visits this month</Txt>
        </View>
        <View importantForAccessibility="no-hide-descendants" style={{ width: 10 * 8 + 9 * 3, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
          {cells.map((v, i) => <StatusDot key={i} size={8} color={v && v !== 'x' ? (v === 'h' ? c.surface3 : c.accent) : c.surface2} />)}
        </View>
      </Row>
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Last: Wed 24 · 6:42 pm · Location</Txt>
    </PCard>
  );
}

function AssessCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const a = d.assess, none = a === 'None yet', only = a === 'Only first', due = a === 'Due now';
  const big = none ? 'To be confirmed' : only ? 'Baseline saved' : '6 of 7 improved';
  const sub = none ? 'First assessment with Coach Vikram' : only ? 'Assessment 1 · 7 tests · 2 Sep' : 'Assessment 2 · 30 Sep vs Assessment 1';
  const next = none ? 'Coach Vikram will confirm the day and time' : due ? 'Assessment 3 · book at the front desk' : only ? 'Next: Tue 30 Sep · Coach Vikram' : 'Next: Tue 28 Oct · Coach Vikram';
  return (
    <PCard onPress={() => router.push('/gym/assessments')} label={`Assessments. ${big}. ${sub}`} style={{ gap: 8 }}>
      <CardTitle title="Assessments" right={due ? <Tag label="Due this week" bg={c.warnSoft} fg={c.warn} /> : <Txt style={{ fontSize: fontSizes.sm, fontFamily: font.semibold, color: c.accentText }}>View ›</Txt>} />
      <Row style={{ gap: 14 }}>
        <IconBadge size={52} radius={radii.md} bg={c.tNutri}><ClipboardCheck size={26} strokeWidth={1.8} color={c.cNutri} /></IconBadge>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 34 }}>{big}</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{sub}</Txt>
        </View>
      </Row>
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{next}</Txt>
    </PCard>
  );
}

// Chat with the coach is the main thing in the Gym tab: it is the first card, dark like the main cards on Today, with one clear button. The photo and name open the coach's profile; the button opens the chat.
function ChatCard() {
  const { d } = useDomain();
  const last = [...d.chat].reverse().find((m) => !m.me);
  return (
    <View style={{ backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18, gap: 14 }}>
      <Row style={{ gap: 14 }}>
        {/* Photo and name open the coach's profile. */}
        <Pressy accessibilityRole="button" accessibilityLabel="Coach Vikram. View profile" onPress={() => router.push('/coach')} scaleTo={0.97} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <PersonAvatar who="coach" size={60} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 26, letterSpacing: -0.4, color: onDark.text }}>Coach Vikram</Txt>
            <Txt v="caption" color={onDark.muted}>Your trainer. Ask about form, your plan or food.</Txt>
          </View>
        </Pressy>
      </Row>
      {d.chat.length && last ? (
        <View style={{ gap: 2 }}>
          <Txt color={onDark.soft}>“{last.t}”</Txt>
          <Txt v="caption" color={onDark.muted}>{last.meta}</Txt>
        </View>
      ) : (
        <Txt color={onDark.soft}>{d.chat.length ? 'You sent a message. Coach Vikram replies here.' : 'Send your first message. Coach Vikram replies here.'}</Txt>
      )}
      <Button kind="white" label="Message Coach Vikram" icon={<MessageCircle size={18} color={fixed.dark} />} onPress={() => router.push('/gym/chat')} />
    </View>
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
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 39 }}>{d.ptLeft} of {PT_TOTAL}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: c.muted }}> sessions left</Txt></Txt>
      <GrowBar pct={Math.round((d.ptLeft / PT_TOTAL) * 100)} color={c.accent} />
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>With Coach Vikram · renews 30 Oct</Txt>
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
      <FadeIn i={0}><ChatCard /></FadeIn>
      <FadeIn i={1}><GymMembership /></FadeIn>
      {d.onBreak && <BreakCard />}
      <FadeIn i={2}><AttendanceCard awaiting={awaiting} /></FadeIn>
      <FadeIn i={3}><AssessCard /></FadeIn>
      <FadeIn i={4}><PTCard isPT={isPT} /></FadeIn>
      <FadeIn i={5}>
        <ListCard rows={[
          { l: 'Membership & payments', onPress: () => router.push('/gym/membership') },
          { l: 'Membership pauses', onPress: () => router.push('/gym/break') },
          { l: 'Help & support', onPress: () => toast("Help opens the gym's support chat and FAQs") },
        ]} />
      </FadeIn>
    </TabScreen>
  );
}
