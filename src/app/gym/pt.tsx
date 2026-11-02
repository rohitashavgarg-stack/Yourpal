import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { PersonAvatar } from '@/components/Brand';
import { Button, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { ListCard, SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as CardList } from '@/features/shell/parts';
import { PT_TOTAL } from '@/features/gym/data';
import { useGymScenarios } from '@/features/gym/state';
import { CalendarCheck, Dumbbell, MessageCircle, Salad, TrendingUp } from '@/lib/icons';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { radii, fontSizes, onDark } from '@/design-system/tokens';

// What personal training gives a member: an icon, a short title and one short line each.
const BENEFITS = [
  { Icon: Dumbbell, t: 'Workout plan for you', s: 'Built around your goal' },
  { Icon: Salad, t: 'Diet plan for you', s: 'Fits your food and your day' },
  { Icon: TrendingUp, t: 'Adjusts as you log', s: 'Changes when your progress does' },
  { Icon: CalendarCheck, t: 'Regular sessions', s: 'Time with your coach' },
  { Icon: MessageCircle, t: 'Ask your coach', s: 'Chat about form, your plan or food' },
] as const;

export default function PersonalTraining() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const isPT = state.sc.member === 'PT member';
  useGymScenarios('Gym · Personal training');
  return (
    <SubPage title="Personal training" fallback="/gym">
      {/* Same dark card as the Personal training card on the Gym tab. */}
      <View style={{ backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18 }}>
        <Row style={{ gap: 14 }}>
          <IconBadge size={56} radius={radii.md} bg={c.accentSoft}><Dumbbell size={28} strokeWidth={1.9} color={c.accentText} /></IconBadge>
          <View style={{ flex: 1 }}>
            <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 29, color: onDark.text }}>Personal training</Txt>
            <Txt v="caption" color={onDark.muted}>A coach who builds around you</Txt>
          </View>
        </Row>
      </View>

      {isPT && <ListCard rows={[{ l: 'Sessions left', v: `${d.ptLeft} of ${PT_TOTAL}` }, { l: 'Next session', v: 'Thu 25, 6 pm' }, { l: 'Package renews', v: '30 Oct' }]} />}

      <Txt v="label" style={{ paddingHorizontal: 4 }}>WHAT YOU GET</Txt>
      <CardList>
        {BENEFITS.map(({ Icon, t, s }, i) => (
          <LineRow key={t} title={t} sub={s} minH={64} last={i === BENEFITS.length - 1}
            icon={<Icon size={18} strokeWidth={1.9} color={c.ink} />} />
        ))}
      </CardList>

      <Button label="Talk to Coach Vikram" icon={<PersonAvatar who="coach" size={26} />} onPress={() => router.push('/gym/chat')} />
    </SubPage>
  );
}
