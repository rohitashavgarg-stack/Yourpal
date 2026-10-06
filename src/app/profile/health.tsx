import React, { useState } from 'react';
import { View } from 'react-native';
import { Activity, Footprints, Heart, Moon } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { HeartIcon } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { HEALTH_NAME } from '@/lib/health';
import { ListCard, Note, SubPage, Switch } from '@/features/shell/parts';

// What YourPal reads from the phone's health store, one line each.
const READS = [
  { Icon: Footprints, t: 'Steps', s: 'Your daily count and the steps trend' },
  { Icon: Heart, t: 'Heart rate', s: 'Resting and recent readings from your watch' },
  { Icon: Moon, t: 'Sleep', s: 'How long and how well you slept' },
  { Icon: Activity, t: 'Active energy', s: 'Calories burned from moving' },
];

export default function ConnectedApps() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toast, openSheet, closeSheet } = useOverlay();
  const on = d.hc;
  const [metrics, setMetrics] = useState<Record<string, boolean>>({ Steps: true, 'Heart rate': true, Sleep: true, 'Active energy': true });
  const connect = () => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · steps, heart rate and sleep sync automatically`); };
  const disconnect = () => openSheet(
    <View style={{ gap: 12 }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 29 }}>{`Disconnect ${HEALTH_NAME}?`}</Txt>
      <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>We stop reading new steps, heart rate and sleep. What is already in YourPal stays. Steps fall back to your phone's own counter. You can reconnect any time.</Txt>
      <Button kind="primary" label="Disconnect" onPress={() => closeSheet(() => { set({ hc: false }); haptic.medium(); toast(`${HEALTH_NAME} disconnected`); })} />
      <Button kind="secondary" label="Keep it connected" onPress={() => closeSheet()} />
    </View>,
    { label: `Disconnect ${HEALTH_NAME}` },
  );

  return (
    <SubPage title="Connected apps" fallback="/profile">
      <View style={{ backgroundColor: c.surface, borderRadius: 26, padding: 18, gap: 14 }}>
        <Row style={{ gap: 14 }}>
          <View accessibilityLabel={HEALTH_NAME} style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line }}>
            <HeartIcon size={28} color="#FF3B5C" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 19, lineHeight: 26 }}>{HEALTH_NAME}</Txt>
            <Row style={{ gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: on ? c.good : c.muted }} />
              <Txt v="caption" style={{ fontSize: 13, color: on ? c.good : c.muted }}>{on ? 'Connected · last synced 5 min ago' : 'Not connected'}</Txt>
            </Row>
          </View>
        </Row>
        {on ? <Button kind="secondary" label="Disconnect" onPress={disconnect} /> : <Button kind="accent" label={`Connect ${HEALTH_NAME}`} onPress={connect} />}
      </View>

      <Txt v="label" style={{ paddingHorizontal: 4 }}>WHAT YOURPAL READS</Txt>
      <ListCard>
        {READS.map(({ Icon, t, s }, i) => (
          <Row key={t} style={{ gap: 14, minHeight: 64, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, opacity: on ? 1 : 0.6 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={c.ink} /></View>
            <View style={{ flex: 1, paddingVertical: 10 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{t}</Txt>
              <Txt v="caption" style={{ fontSize: 13 }}>{s}</Txt>
            </View>
            <Switch label={`Read ${t}`} on={on && metrics[t]} locked={!on} onChange={(v) => { setMetrics((m) => ({ ...m, [t]: v })); haptic.tap(); toast(`${t} ${v ? 'will sync' : 'sync paused'}`); }} />
          </Row>
        ))}
      </ListCard>
      <Note>YourPal only reads these. It never writes to {HEALTH_NAME}. Your health data is visible to you only, unless you choose to share it in Privacy.</Note>
    </SubPage>
  );
}
