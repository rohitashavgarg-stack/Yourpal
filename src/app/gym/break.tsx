import React from 'react';
import { View } from 'react-native';
import { PauseCircle } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, GrowBar, SubPage } from '@/features/progress/parts';
import { PAUSE_HISTORY, PAUSE_TOTAL } from '@/features/gym/data';
import { dateLabel, gymStore, useGymScenarios } from '@/features/gym/state';

// View-only: pauses are set by the front desk. The member sees status, history and how many are left.
export default function MembershipPauses() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const g = gymStore.use();
  const used = Math.min(g.pausesUsed, PAUSE_TOTAL);
  const left = PAUSE_TOTAL - used;
  const history = PAUSE_HISTORY.slice(0, used);
  useGymScenarios('Gym · Membership pauses', [
    { label: 'Pauses used', options: ['0', '1', '2'], value: String(used), onPick: (v) => gymStore.set({ pausesUsed: Number(v) }) },
  ], [], [used]);

  return (
    <SubPage title="Membership pauses" fallback="/gym">
      <Txt style={{ fontFamily: font.semibold, fontSize: 24, lineHeight: 31, letterSpacing: -0.7, paddingHorizontal: 4 }}>Pauses are set by the front desk.</Txt>

      {d.onBreak && (
        <View style={[{ padding: 16, borderRadius: 24, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.accent, gap: 4 }, cardShadow(isDark)]}>
          <Row style={{ gap: 8 }}><PauseCircle size={18} color={c.accentText} /><Txt style={{ fontFamily: font.semibold }}>Paused until {dateLabel(g.breakUntil)}</Txt></Row>
          <Txt muted style={{ fontSize: 14 }}>Your streak is frozen and reminders are off. Your end date moves out by the paused days.</Txt>
        </View>
      )}

      <View style={[{ padding: 18, borderRadius: 28, backgroundColor: c.surface, gap: 10 }, cardShadow(isDark)]}>
        <Txt v="label">PAUSES LEFT</Txt>
        <Row style={{ alignItems: 'baseline', gap: 6 }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 52, letterSpacing: -1.2 }}>{left}</Txt>
          <Txt muted>of {PAUSE_TOTAL} this membership</Txt>
        </Row>
        <GrowBar pct={Math.round((left / PAUSE_TOTAL) * 100)} color={c.accent} />
        <Txt muted style={{ fontSize: 14 }}>{left ? 'Need one? Ask at the front desk and they will set it up for you.' : 'You have used all your pauses. Talk to the front desk if something has come up.'}</Txt>
      </View>

      <Txt v="label" style={{ paddingHorizontal: 6 }}>PAUSE HISTORY</Txt>
      {history.length === 0 ? (
        <View style={{ padding: 18, borderRadius: 24, backgroundColor: c.surface }}><Txt muted>No pauses yet.</Txt></View>
      ) : history.map((h) => (
        <View key={h.from} style={[{ padding: 16, borderRadius: 24, backgroundColor: c.surface, gap: 6 }, cardShadow(isDark)]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.semibold }}>{h.from} – {h.to}</Txt>
            <Tag label={`${h.days} days`} bg={c.accentSoft} fg={c.accentText} />
          </Row>
          <Txt v="caption">{h.reason} · set by front desk</Txt>
        </View>
      ))}
    </SubPage>
  );
}
