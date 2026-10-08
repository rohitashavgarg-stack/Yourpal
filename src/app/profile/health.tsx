import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { Activity, ChevronRight, Footprints, Heart, Lock, Moon } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { HeartIcon } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { HEALTH_NAME } from '@/lib/health';
import { ListCard, SubPage, Switch } from '@/features/shell/parts';

// What YourPal reads from the phone's health store. Colours match the trackers on Today.
const READS = [
  { Icon: Footprints, t: 'Steps', s: 'Daily count and trend', v: '6,240 steps', tone: ['tNutri', 'cNutri'] },
  { Icon: Heart, t: 'Heart rate', s: 'Resting and recent, from your watch', v: '72 bpm', tone: ['tHeart', 'cHeart'] },
  { Icon: Moon, t: 'Sleep', s: 'How long and how well', v: '7 h 05 min', tone: ['tSleep', 'cSleep'] },
  { Icon: Activity, t: 'Active energy', s: 'Calories burned from moving', v: '312 kcal', tone: ['tAct', 'cAct'] },
] as const;

export default function ConnectedApps() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toast, openSheet, closeSheet } = useOverlay();
  const on = d.hc;
  const [metrics, setMetrics] = useState<Record<string, boolean>>({ Steps: true, 'Heart rate': true, Sleep: true, 'Active energy': true });
  const count = READS.filter((r) => metrics[r.t]).length;

  const connect = () => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · ${count} things sync automatically`); };
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

      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 6 }}>
        <Txt v="label">{on ? 'SYNCING' : 'YOU WILL SEE ON TODAY'}</Txt>
        {on && <Txt v="caption" style={{ fontSize: 12 }}>Tap a switch to pause one</Txt>}
      </Row>
      <ListCard>
        {READS.map(({ Icon, t, s, v, tone }, i) => {
          const bg = (c as any)[tone[0]], fg = (c as any)[tone[1]];
          const noWatch = on && t !== 'Steps' && !d.wearable;
          const live = on && metrics[t] && !noWatch;
          return (
            <Row key={t} style={{ gap: 14, minHeight: 72, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: on && !metrics[t] ? 0.5 : 1 }}>
                <Icon size={22} strokeWidth={1.9} color={fg} />
              </View>
              <View style={{ flex: 1, paddingVertical: 10 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{t}</Txt>
                <Txt v="caption" style={{ fontSize: 13 }}>{noWatch ? 'Needs a watch or band' : live ? `Today · ${v}` : on ? 'Paused' : s}</Txt>
              </View>
              {on && !noWatch && <Switch label={`Read ${t}`} on={!!metrics[t]} onChange={(val) => { setMetrics((m) => ({ ...m, [t]: val })); haptic.tap(); toast(`${t} ${val ? 'will sync' : 'sync paused'}`); }} />}
            </Row>
          );
        })}
      </ListCard>

      <Txt v="label" style={{ paddingHorizontal: 4, marginTop: 6 }}>PRIVACY</Txt>
      <ListCard>
        <Row style={{ gap: 14, minHeight: 64 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Lock size={17} color={c.ink} /></View>
          <View style={{ flex: 1, paddingVertical: 10 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>Read only</Txt>
            <Txt v="caption" style={{ fontSize: 13 }}>{`YourPal never writes to ${HEALTH_NAME}. Only you see this data.`}</Txt>
          </View>
        </Row>
        <Pressy accessibilityRole="button" accessibilityLabel="Manage permissions in Settings" onPress={() => { Linking.openSettings().catch(() => toast('Open Settings on your phone to manage permissions')); }} scaleTo={0.98}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, borderTopWidth: 1, borderTopColor: c.line }}>
          <Txt style={{ flex: 1, fontSize: 15, lineHeight: 21, color: c.accentText, fontFamily: font.semibold }}>Manage permissions in Settings</Txt>
          <ChevronRight size={18} color={c.muted} />
        </Pressy>
      </ListCard>
    </SubPage>
  );
}
