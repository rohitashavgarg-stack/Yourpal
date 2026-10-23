import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CalendarCheck, ChevronRight, ClipboardList, MessageCircle } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { useDomain } from '@/lib/domain';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { askCoach, coachStore, NOTES, TOPICS, WEEKLY } from '@/features/coach/coach';
import { radii, fontSizes } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';


// Coach Vikram in one place: who he is, what he said this week, your plan, and what to ask.
export default function CoachHub() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const cs = coachStore.use();
  const isPT = state.sc.member === 'PT member';
  const booked = d.assess !== 'None yet';

  useScenarios({
    title: 'Coach',
    rows: [
      { label: 'Coach availability', options: ['Available', 'Away'], value: cs.away ? 'Away' : 'Available', onPick: (v) => coachStore.set({ away: v === 'Away' }) },
      { label: 'Unread reply', options: ['Yes', 'No'], value: cs.unread ? 'Yes' : 'No', onPick: (v) => coachStore.set({ unread: v === 'Yes' }) },
    ],
  }, [cs.away, cs.unread, state.sc.member]);

  return (
    <SubPage title="Your coach" fallback="/(tabs)">
      <View style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
        <View>
          <PersonAvatar who="coach" size={96} />
        </View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.7 }}>Coach Vikram</Txt>
        <Txt muted style={{ fontSize: fontSizes.md }}>Your trainer · Wulf Fitness</Txt>
        {cs.away
          ? <Tag label="Away until Mon 10:00 am · replies will be slower" bg={c.warnSoft} fg={c.warn} style={{ marginTop: 4, alignSelf: 'center' }} />
          : <Tag label={isPT ? 'Replies within the hour · PT' : 'Usually replies in a few hours'} bg={c.goodSoft} fg={c.good} style={{ marginTop: 4, alignSelf: 'center' }} />}
      </View>

      <Row style={{ gap: 8 }}>
        <Button label="Message" icon={<MessageCircle size={18} color={c.bg} />} onPress={() => askCoach()} style={{ flex: 1 }} />
        <Button kind="secondary" label={booked ? 'Assessment' : 'Book assessment'} icon={<CalendarCheck size={18} color={c.ink} />} onPress={() => router.push('/gym/assessments')} style={{ flex: 1 }} />
      </Row>
      {cs.away && <Txt v="caption" style={{ textAlign: 'center' }}>Something urgent? Ask the front desk.</Txt>}

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}><SectionLabel variant="overline">THIS WEEK FROM COACH</SectionLabel><Txt v="caption">{WEEKLY.when}</Txt></Row>
        <Txt style={{ fontSize: fontSizes.base, lineHeight: 23 }}>{WEEKLY.note}</Txt>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {WEEKLY.focus.map((f) => <Tag key={f} label={f} bg={c.accentSoft} fg={c.accentText} />)}
        </Row>
      </Card>

      <Pressy accessibilityRole="button" accessibilityLabel="Your plan. Leg day updated Wednesday. Open plans" onPress={() => router.navigate('/plans')} scaleTo={0.98}>
        <Card style={{ gap: 4 }}>
          <Row style={{ gap: 12 }}>
            <IconBadge size={40} radius={radii.sm} bg={c.accentSoft}><ClipboardList size={19} color={c.accentText} /></IconBadge>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>Your plan</Txt>
              <Txt v="caption">Leg day updated Wed 24 · Romanian deadlift added</Txt>
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Row>
        </Card>
      </Pressy>

      <View style={{ gap: 8 }}>
        <SectionLabel variant="overline">ASK ABOUT</SectionLabel>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {TOPICS.map((t) => (
            <Button key={t.l} kind="line" size="chip" label={t.l} onPress={() => askCoach(t.ctx, t.draft)} scaleTo={0.95} />
          ))}
        </Row>
      </View>

      <Card style={{ gap: 2 }}>
        <SectionLabel variant="overline">RECENT FROM COACH</SectionLabel>
        {NOTES.map((n, i) => (
          <View key={n.t} style={{ paddingVertical: 12, gap: 3, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, marginTop: i ? 0 : 8 }}>
            <Row style={{ justifyContent: 'space-between' }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm }}>{n.ctx}</Txt><Txt v="caption">{n.when}</Txt></Row>
            <Txt muted style={{ fontSize: fontSizes.md }}>{n.t}</Txt>
          </View>
        ))}
      </Card>
    </SubPage>
  );
}
