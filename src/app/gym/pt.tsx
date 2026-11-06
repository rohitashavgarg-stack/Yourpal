import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PersonAvatar } from '@/components/Brand';
import { Button, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { ListCard, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as CardList } from '@/features/shell/parts';
import { PT_STATS, PT_TOTAL } from '@/features/gym/data';
import { useGoalV2 } from '@/features/goalv2/model';
import { gymStore, useGymScenarios } from '@/features/gym/state';
import { CalendarCheck, CalendarClock, Dumbbell, Eye, HandHeart, Target, TrendingUp, UserCheck } from '@/lib/icons';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

// What only personal training gives a member: an icon, a short title and one short line each. Nothing a regular member already has (the plans, the progress checks,
// the chat with the coach) is listed here.
const BENEFITS = [
  { Icon: UserCheck, t: 'One-on-one sessions', s: 'Your coach works only with you' },
  { Icon: Eye, t: 'Form checked in person', s: 'Fix a lift while you do it' },
  { Icon: CalendarClock, t: 'Sessions at fixed times', s: 'Slots that fit your week' },
  { Icon: HandHeart, t: 'A coach who knows you', s: 'Your goal, habits and past sessions' },
  { Icon: TrendingUp, t: 'A plan that adjusts as you log', s: 'Coach Vikram changes it as your progress does' },
] as const;

export default function PersonalTraining() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useDomain();
  const { state } = useStore();
  const isPT = state.sc.member === 'PT member';
  const gs = gymStore.use();
  const awaiting = isPT && gs.awaiting === 'Yes' && gs.sessionState === 'awaiting';
  const g = useGoalV2();
  useGymScenarios('Gym · Personal training');

  const stats = [
    { n: PT_STATS.inPT, l: 'members in PT' },
    { n: PT_STATS.reachedGoal, l: 'reached a goal' },
    { n: PT_TOTAL, l: 'sessions' },
  ];

  // The page has its own big heading, so the header bar carries no title.
  return (
    <SubPage
      title=""
      fallback="/gym"
      // A soft tint from the top of the screen that fades into the page and scrolls away with the content.
      backdrop={<LinearGradient pointerEvents="none" colors={[c.accentSoft, c.bg]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }} />}
      // The one button floats over the page near the bottom and stays there while the page scrolls.
      footer={(
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 6 }}>
          <Button label="Talk to Coach Vikram" icon={<PersonAvatar who="coach" size={26} />} onPress={() => router.push('/gym/chat')}
            style={{ shadowColor: fixed.black, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }} />
        </View>
      )}>
      {/* The icon first, then the big heading. No sub heading. */}
      <View style={{ gap: 12, paddingTop: 4 }}>
        <IconBadge size={64} radius={radii.lg} bg={c.surface} borderWidth={1} borderColor={c.line}><Dumbbell size={32} strokeWidth={1.9} color={c.accentText} /></IconBadge>
        <Txt accessibilityRole="header" v="display">Personal training</Txt>
      </View>

      {/* How many people are in personal training here, how many reached a goal, and how long a package is. */}
      <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18 }}>
        <Row style={{ gap: 0, alignItems: 'flex-start' }}>
          {stats.map((x, i) => (
            <View key={x.l} accessible accessibilityLabel={`${x.n} ${x.l}`} style={{ flex: 1, gap: 2, paddingLeft: i ? 14 : 0, marginLeft: i ? 14 : 0, borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line }}>
              <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 34 }}>{x.n}</Txt>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{x.l}</Txt>
            </View>
          ))}
        </Row>
      </View>

      {isPT && <ListCard rows={[{ l: 'Sessions left', v: `${d.ptLeft} of ${PT_TOTAL}` }, { l: 'Next session', v: 'Thu 25, 6 pm' }, { l: 'Package renews', v: '30 Oct' }]} />}

      {isPT && (
        <CardList>
          <LineRow title="Your sessions" sub={awaiting ? '1 session to confirm' : 'Upcoming and past'} minH={64} last onPress={() => router.push('/gym/sessions')}
            icon={<CalendarCheck size={18} strokeWidth={1.9} color={c.ink} />} />
        </CardList>
      )}

      <Txt v="label" style={{ paddingHorizontal: 4 }}>FOR YOU</Txt>
      <CardList>
        <LineRow title="Your goal" sub={g.name} minH={64} last icon={<Target size={18} strokeWidth={1.9} color={c.ink} />} />
      </CardList>

      <Txt v="label" style={{ paddingHorizontal: 4 }}>WHAT YOU GET</Txt>
      <CardList>
        {BENEFITS.map(({ Icon, t, s }, i) => (
          <LineRow key={t} title={t} sub={s} minH={64} last={i === BENEFITS.length - 1}
            icon={<Icon size={18} strokeWidth={1.9} color={c.ink} />} />
        ))}
      </CardList>
      <View style={{ height: 64 }} />
    </SubPage>
  );
}
