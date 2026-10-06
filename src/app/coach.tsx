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

const Label = ({ children }: { children: string }) => {
  const { c } = useTheme();
  return <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted }}>{children}</Txt>;
};

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
          {cs.unread && <View accessibilityLabel="Unread reply" style={{ position: 'absolute', right: 2, top: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: c.accent, borderWidth: 3, borderColor: c.bg }} />}
        </View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.7 }}>Coach Vikram</Txt>
        <Txt muted style={{ fontSize: 14 }}>Your trainer · Wulf Fitness</Txt>
        {cs.away
          ? <Tag label="Away until Mon 10:00 am · replies will be slower" bg={c.warnSoft} fg={c.warn} style={{ marginTop: 4 }} />
          : <Tag label={isPT ? 'Replies within the hour · PT' : 'Usually replies in a few hours'} bg={c.goodSoft} fg={c.good} style={{ marginTop: 4 }} />}
      </View>

      <Row style={{ gap: 8 }}>
        <Button label="Message" icon={<MessageCircle size={18} color={c.bg} />} onPress={() => askCoach()} style={{ flex: 1 }} />
        <Button kind="secondary" label={booked ? 'Assessment' : 'Book assessment'} icon={<CalendarCheck size={18} color={c.ink} />} onPress={() => router.push('/gym/assessments')} style={{ flex: 1 }} />
      </Row>
      {cs.away && <Txt v="caption" style={{ textAlign: 'center' }}>Something urgent? Ask the front desk.</Txt>}

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}><Label>THIS WEEK FROM COACH</Label><Txt v="caption">{WEEKLY.when}</Txt></Row>
        <Txt style={{ fontSize: 15, lineHeight: 23 }}>{WEEKLY.note}</Txt>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {WEEKLY.focus.map((f) => <Tag key={f} label={f} bg={c.accentSoft} fg={c.accentText} />)}
        </Row>
      </Card>

      <Pressy accessibilityRole="button" accessibilityLabel="Your plan. Leg day updated Wednesday. Open plans" onPress={() => router.navigate('/plans')} scaleTo={0.98}>
        <Card style={{ gap: 4 }}>
          <Row style={{ gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={19} color={c.accentText} /></View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>Your plan</Txt>
              <Txt v="caption">Leg day updated Wed 24 · Romanian deadlift added</Txt>
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Row>
        </Card>
      </Pressy>

      <View style={{ gap: 8 }}>
        <Label>ASK ABOUT</Label>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {TOPICS.map((t) => (
            <Pressy key={t.l} accessibilityRole="button" onPress={() => askCoach(t.ctx, t.draft)} scaleTo={0.95}
              style={{ height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: c.chipLine, justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: 14 }}>{t.l}</Txt>
            </Pressy>
          ))}
        </Row>
      </View>

      <Card style={{ gap: 2 }}>
        <Label>RECENT FROM COACH</Label>
        {NOTES.map((n, i) => (
          <View key={n.t} style={{ paddingVertical: 12, gap: 3, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, marginTop: i ? 0 : 8 }}>
            <Row style={{ justifyContent: 'space-between' }}><Txt style={{ fontFamily: font.semibold, fontSize: 13 }}>{n.ctx}</Txt><Txt v="caption">{n.when}</Txt></Row>
            <Txt muted style={{ fontSize: 14 }}>{n.t}</Txt>
          </View>
        ))}
      </Card>
    </SubPage>
  );
}
