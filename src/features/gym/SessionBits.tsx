import React from 'react';
import { View } from 'react-native';
import { Tag } from '@/components/bits';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fixed, fontSizes, radii } from '@/design-system/tokens';
import { Session } from '@/features/gym/sessions';

/** The one coloured thing on a session: its status. */
export function StatusTag({ s }: { s: Session }) {
  const { c } = useTheme();
  const t = {
    upcoming: { l: 'Upcoming', bg: c.surface2, fg: c.muted },
    awaiting: { l: 'To confirm', bg: c.accent, fg: fixed.white },
    confirmed: { l: 'Confirmed', bg: c.goodSoft, fg: c.good },
    flagged: { l: 'Under review', bg: c.warnSoft, fg: c.warn },
  }[s.status];
  return <Tag label={t.l} bg={t.bg} fg={t.fg} />;
}

/** The date as a small tile: the weekday above the day number. */
export function DateTile({ s, size = 48 }: { s: Session; size?: number }) {
  const { c } = useTheme();
  const [wd, n] = s.day.split(' ');
  const on = s.status === 'awaiting';
  return (
    <View style={{ width: size, height: size, borderRadius: radii.md, backgroundColor: on ? c.accentSoft : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontSize: fontSizes.sm, lineHeight: 15, color: on ? c.accentText : c.muted }}>{wd}</Txt>
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, lineHeight: 22, color: on ? c.accentText : c.ink }}>{n}</Txt>
    </View>
  );
}
