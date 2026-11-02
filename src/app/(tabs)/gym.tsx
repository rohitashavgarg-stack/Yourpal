import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { ChevronRight, ClipboardCheck, CreditCard, Dumbbell, MessageCircle } from '@/lib/icons';
import { fadeOut } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { PersonAvatar } from '@/components/Brand';
import { PillBtn, Tag } from '@/components/bits';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { CardTitle, cardShadow, GrowBar, PCard } from '@/features/progress/parts';
import { PT_TOTAL, VISITS } from '@/features/gym/data';
import { useMemberships } from '@/features/gym/memberships';
import { useSelfAssess } from '@/features/selfassess/useSelfAssess';
import { NumKey, compare, fmtAt, headlineOf } from '@/features/selfassess/data';
import { TimeBar } from '@/app/gym/membership';
import { dateLabel, gymStore, useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes, fixed, onDark } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { Chip } from '@/design-system/primitives/Chip';
import { StatusDot } from '@/design-system/primitives/StatusDot';

// One card for all memberships. The header has a sub line (when the next one ends) and chips (how many are active, ending soon, paused).
// Under it each active membership is a small card: its name, the time left in big numbers and a thin bar. It opens the Memberships page.
function GymMembership() {
  const { c } = useTheme();
  const { d } = useDomain();
  const ms = useMemberships();
  const active = ms.filter((m) => m.status === 'Active').sort((x, y) => y.pct - x.pct); // the one ending first on top
  const soon = active.some((m) => m.warn);
  const shown = active.slice(0, 2);
  const more = active.length - shown.length;
  // One line under the title says it all: how many are active and what needs a look. It turns amber when something does.
  const attention = d.onBreak || soon || active.length === 0;
  const line = d.onBreak ? 'Paused for now' : active.length === 0 ? 'Nothing active right now' : soon ? `${active.length} active, one ends soon` : `${active.length} active, next ends on ${active[0].end}`;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Memberships. ${active.length} active${soon ? ', one ending soon' : ''}. See all`} onPress={() => router.push('/gym/membership')} scaleTo={0.985}
      style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><CreditCard size={22} color={c.accentText} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>Memberships</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: attention ? c.warn : c.muted }}>{line}</Txt>
        </View>
        <ChevronRight size={18} color={c.muted} />
      </Row>
      {shown.length > 0 ? (
        <Row style={{ gap: 10, alignItems: 'stretch' }}>
          {shown.map((m) => (
            <View key={m.id} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface2, padding: 12, gap: 8 }}>
              {/* a green dot before the name: this membership is active */}
              <Row style={{ gap: 8 }}>
                <StatusDot size={8} color={c.good} />
                <Txt style={{ fontFamily: font.medium, flexShrink: 1 }} numberOfLines={1}>{m.name}</Txt>
              </Row>
              <Row style={{ alignItems: 'baseline', gap: 5 }}>
                <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 33, letterSpacing: -0.6, color: m.warn ? c.warn : c.ink }}>{m.left.n}</Txt>
                <Txt muted style={{ fontSize: fontSizes.sm }}>{m.left.unit}</Txt>
              </Row>
              <TimeBar pct={m.pct} warn={m.warn} />
            </View>
          ))}
          {more > 0 && (
            <View style={{ width: 56, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold }}>{`+${more}`}</Txt>
            </View>
          )}
        </Row>
      ) : (
        <Txt muted style={{ fontSize: fontSizes.md }}>No active membership. Renew at the front desk to log again.</Txt>
      )}
    </Pressy>
  );
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

function AttendanceCard() {
  const { c } = useTheme();
  const cells = Array.from({ length: 30 }, (_, j) => VISITS[j + 1]);
  return (
    <PCard onPress={() => router.push('/gym/attendance')} label="Attendance, 18 visits this month" style={{ gap: 12 }}>
      <CardTitle title="Attendance" />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <Row style={{ alignItems: 'baseline', gap: 8 }}>
          <Txt style={{ fontFamily: font.display, fontSize: 37, lineHeight: 44 }}>18</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>visits this month</Txt>
        </Row>
        <View importantForAccessibility="no-hide-descendants" style={{ width: 10 * 8 + 9 * 3, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
          {cells.map((v, i) => <StatusDot key={i} size={8} color={v && v !== 'x' ? c.accent : c.surface2} />)}
        </View>
      </Row>
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Last visit Wed 24, 6:42 pm</Txt>
    </PCard>
  );
}

// The Assessments card, in three levels of weight. First and biggest: how many assessments are completed, with a numbered circle for each.
// Then, quieter: the last assessment and its date. Quietest: the next assessment (or a Start button when it is due).
function AssessCard() {
  const { c } = useTheme();
  const { entries, nextAt, daysLeft, due } = useSelfAssess();
  const total = entries.length;
  const last = entries[0];
  const shown = Math.min(total, 5); // the trail shows the latest five
  const rows = compare(last, entries[1]);
  const stats = (['weight', 'waist', 'pulse', 'bench', 'sleep'] as NumKey[]).map((k) => rows.find((r) => r.k === k)).filter((r) => !!r).slice(0, 3) as ReturnType<typeof compare>;
  return (
    <PCard onPress={() => router.push('/gym/assessments')} label={`Assessments. ${total} completed. Last: Assessment ${total}, ${fmtAt(last.at)}`} style={{ gap: 14 }}>
      <CardTitle title="Assessments" right={due ? <Tag label="Due now" bg={c.warnSoft} fg={c.warn} /> : <Txt style={{ fontSize: fontSizes.sm, fontFamily: font.semibold, color: c.accentText }}>View ›</Txt>} />
      <Row style={{ alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <View>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 56, lineHeight: 62, letterSpacing: -1.5 }}>{String(total)}</Txt>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md }}>completed</Txt>
        </View>
        <View importantForAccessibility="no-hide-descendants" style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
          {Array.from({ length: shown }, (_, i) => {
            const n = total - shown + i + 1;
            // every completed assessment looks the same: filled blue
            return (
              <View key={n} style={{ width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: c.accentInk }}>{String(n)}</Txt>
              </View>
            );
          })}
        </View>
      </Row>
      {/* the last assessment as a small card of its own: its name and date, and a few of its numbers with the change since the one before */}
      <View style={{ gap: 12, padding: 12, borderRadius: radii.lg, backgroundColor: c.surface2 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge size={40} radius={radii.md} bg={c.tNutri}><ClipboardCheck size={20} strokeWidth={1.9} color={c.cNutri} /></IconBadge>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Last assessment</Txt>
            <Txt style={{ fontFamily: font.semibold }}>{`Assessment ${total}`}</Txt>
          </View>
          <Chip label={fmtAt(last.at)} />
        </Row>
        {stats.length > 0 && (
          <Row style={{ gap: 8 }}>
            {stats.map((r) => (
              <View key={r.k} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface, paddingVertical: 8, paddingHorizontal: 10, gap: 1 }}>
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{r.n.label}</Txt>
                <Txt style={{ fontFamily: font.semibold }}>{`${r.now} ${r.n.unit}`}</Txt>
                {r.prev != null && <Txt style={{ fontSize: fontSizes.sm, color: r.good ? c.good : c.muted }}>{r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`}</Txt>}
              </View>
            ))}
          </Row>
        )}
      </View>
      {/* the upcoming assessment in a container like the last one: its date as a little calendar tile (amber when it is due), and when it is */}
      <Row style={{ gap: 12, padding: 12, borderRadius: radii.lg, backgroundColor: c.surface2 }}>
        <View style={{ width: 48, height: 52, borderRadius: radii.md, backgroundColor: due ? c.warnSoft : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl, lineHeight: 24, color: due ? c.warn : c.accentText }}>{String(new Date(nextAt).getDate())}</Txt>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 16, color: due ? c.warn : c.accentText }}>{new Date(nextAt).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Txt>
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Upcoming assessment</Txt>
          <Txt style={{ fontFamily: font.semibold }}>{`Assessment ${total + 1}`}</Txt>
        </View>
        <Tag label={daysLeft <= 0 ? 'Due now' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`} bg={due ? c.warnSoft : c.surface} fg={due ? c.warn : c.muted} />
      </Row>
      {due && <Button kind="accent" label="Start assessment" onPress={() => router.push('/gym/self-assessment')} />}
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
            <Txt v="caption" color={onDark.muted}>Your trainer</Txt>
          </View>
        </Pressy>
      </Row>
      {/* The last message sits in a soft container on the dark card, with its time under it. */}
      {d.chat.length && last ? (
        <View accessible accessibilityLabel={`Last message: ${last.t}. ${last.meta}`} style={{ gap: 6, padding: 14, borderRadius: radii.lg, backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <Txt numberOfLines={3} color={onDark.text}>{last.t}</Txt>
          <Txt v="caption" color={onDark.muted}>{last.meta}</Txt>
        </View>
      ) : (
        <Txt color={onDark.soft}>{d.chat.length ? 'You sent a message. Coach Vikram replies here.' : 'Send your first message. Coach Vikram replies here.'}</Txt>
      )}
      <Button kind="white" label="Message Coach Vikram" icon={<MessageCircle size={18} color={fixed.dark} />} onPress={() => router.push('/gym/chat')} />
    </View>
  );
}

// Personal training: one bold dark card, like the coach chat card above it, for PT members and regular members.
// Little text: an icon, a title, one short line, and one button. The detail lives on the Personal training page.
function PTCard({ isPT }: { isPT: boolean }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const head = (title: string, sub: string, right?: React.ReactNode) => (
    <Row style={{ gap: 14 }}>
      <IconBadge size={48} radius={radii.md} bg={c.accentSoft}><Dumbbell size={24} strokeWidth={1.9} color={c.accentText} /></IconBadge>
      <View style={{ flex: 1 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, color: onDark.text }}>{title}</Txt>
        <Txt v="caption" color={onDark.muted}>{sub}</Txt>
      </View>
      {right}
    </Row>
  );
  if (!isPT) {
    return (
      <View style={{ backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18, gap: 16 }}>
        {head('Personal training', 'Workout and diet from a coach')}
        <Button kind="white" label="See how it works" onPress={() => router.push('/gym/pt')} />
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18, gap: 16 }}>
      {head('Your PT package', 'With Coach Vikram', <Chip label="Renews 30 Oct" onDark />)}
      <View style={{ gap: 10 }}>
        <Txt accessibilityLabel={`${d.ptLeft} of ${PT_TOTAL} sessions left`} style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 39, color: onDark.text }}>{d.ptLeft}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: onDark.muted }}> of {PT_TOTAL} sessions left</Txt></Txt>
        <GrowBar pct={Math.round((d.ptLeft / PT_TOTAL) * 100)} color={c.accent} track="rgba(255,255,255,0.14)" />
      </View>
      <Button kind="white" label="View sessions" onPress={() => router.push('/gym/sessions')} />
    </View>
  );
}

export default function Gym() {
  const { d } = useDomain();
  const { state } = useStore();
  const isPT = state.sc.member === 'PT member';
  useGymScenarios('Gym');
  return (
    <TabScreen title="Gym" header={<GymHeader />} compactTitle={false}>
      <FadeIn i={0}><ChatCard /></FadeIn>
      <FadeIn i={1}><PTCard isPT={isPT} /></FadeIn>
      <FadeIn i={2}><GymMembership /></FadeIn>
      {d.onBreak && <BreakCard />}
      <FadeIn i={3}><AttendanceCard /></FadeIn>
      <FadeIn i={4}><AssessCard /></FadeIn>
    </TabScreen>
  );
}
