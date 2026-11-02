import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PersonAvatar } from '@/components/Brand';
import { Tag } from '@/components/bits';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { ListCard, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as CardList } from '@/features/shell/parts';
import { PT_STATS, PT_TOTAL } from '@/features/gym/data';
import { coachStore } from '@/features/coach/coach';
import { useGoalV2 } from '@/features/goalv2/model';
import { useGymScenarios } from '@/features/gym/state';
import { CalendarCheck, ChevronRight, ClipboardCheck, Dumbbell, MessageCircle, Salad, Target, TrendingUp } from '@/lib/icons';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { radii, fontSizes } from '@/design-system/tokens';

// What personal training gives a member: an icon, a short title and one short line each.
const BENEFITS = [
  { Icon: Dumbbell, t: 'Workout plan for you', s: 'Built around your goal' },
  { Icon: Salad, t: 'Diet plan for you', s: 'Fits your food and your day' },
  { Icon: TrendingUp, t: 'Adjusts as you log', s: 'Changes when your progress does' },
  { Icon: ClipboardCheck, t: 'Progress checks', s: 'Assessments that show how you improve' },
  { Icon: CalendarCheck, t: 'Regular sessions', s: 'Time with your coach' },
  { Icon: MessageCircle, t: 'Ask your coach', s: 'Chat about form, your plan or food' },
] as const;

export default function PersonalTraining() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useDomain();
  const { state } = useStore();
  const cs = coachStore.use();
  const isPT = state.sc.member === 'PT member';
  const g = useGoalV2();
  useGymScenarios('Gym · Personal training');

  const stats = [
    { n: PT_STATS.inPT, l: 'members in PT' },
    { n: PT_STATS.reachedGoal, l: 'reached a goal' },
    { n: PT_TOTAL, l: 'sessions in a package' },
  ];

  // The page has its own big heading, so the header bar carries no title.
  return (
    <SubPage
      title=""
      fallback="/gym"
      // A soft tint from the top of the screen that fades into the page and scrolls away with the content.
      backdrop={<LinearGradient pointerEvents="none" colors={[c.accentSoft, c.bg]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }} />}
      // The button stays at the bottom while the page scrolls.
      footer={(
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16) + 6, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
          <Button label="Talk to Coach Vikram" icon={<PersonAvatar who="coach" size={26} />} onPress={() => router.push('/gym/chat')} />
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

      {/* The coach. Tapping opens his page. */}
      <Pressy accessibilityRole="button" accessibilityLabel="Coach Vikram. View profile" onPress={() => router.push('/coach')} scaleTo={0.98}>
        <Card style={{ gap: 10 }}>
          <Row style={{ gap: 14 }}>
            <PersonAvatar who="coach" size={56} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>Coach Vikram</Txt>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Your trainer at Wulf Fitness</Txt>
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Row>
          {cs.away
            ? <Tag label="Away until Mon 10:00 am" bg={c.warnSoft} fg={c.warn} style={{ alignSelf: 'flex-start' }} />
            : <Tag label={isPT ? 'Replies within the hour' : 'Usually replies in a few hours'} bg={c.goodSoft} fg={c.good} style={{ alignSelf: 'flex-start' }} />}
        </Card>
      </Pressy>

      {isPT && <ListCard rows={[{ l: 'Sessions left', v: `${d.ptLeft} of ${PT_TOTAL}` }, { l: 'Next session', v: 'Thu 25, 6 pm' }, { l: 'Package renews', v: '30 Oct' }]} />}

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
    </SubPage>
  );
}
