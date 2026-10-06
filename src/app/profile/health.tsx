import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, ChevronRight, Footprints, Heart, Lock, Moon, RefreshCw } from '@/lib/icons';
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
  const [syncing, setSyncing] = useState(false);
  const count = READS.filter((r) => metrics[r.t]).length;

  const connect = () => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected · ${count} things sync automatically`); };
  const sync = () => {
    if (syncing) return;
    setSyncing(true); haptic.light();
    setTimeout(() => { setSyncing(false); haptic.success(); toast('Up to date · just now'); }, 1200);
  };
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
      {/* Hero: status first, one primary action */}
      <View style={{ borderRadius: 28, overflow: 'hidden', padding: 20, gap: 16, backgroundColor: c.heroFrom }}>
        <LinearGradient colors={[c.heroFrom, c.heroMid, c.heroTo]} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <Row style={{ gap: 14 }}>
          <View accessibilityLabel={HEALTH_NAME} style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <HeartIcon size={30} color="#FF3B5C" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 20, lineHeight: 26, color: '#fff' }}>{HEALTH_NAME}</Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: on ? c.live : 'rgba(255,255,255,0.6)' }} />
              <Txt style={{ fontSize: 12, lineHeight: 18, fontFamily: font.semibold, color: '#fff' }}>{on ? 'Connected' : 'Not connected'}</Txt>
            </View>
          </View>
        </Row>
        <Txt style={{ fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.92)' }}>
          {on ? (syncing ? 'Syncing…' : `Last synced 5 min ago · ${count} of ${READS.length} on`) : 'Steps, heart rate and sleep fill in on their own. No typing, no extra steps.'}
        </Txt>
        {on ? (
          <Button kind="white" label={syncing ? 'Syncing…' : 'Sync now'} icon={<RefreshCw size={18} color="#111" />} onPress={sync} />
        ) : (
          <Button kind="white" label={`Connect ${HEALTH_NAME}`} onPress={connect} />
        )}
      </View>

      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 6 }}>
        <Txt v="label">{on ? 'SYNCING' : 'YOU WILL SEE ON TODAY'}</Txt>
        {on && <Txt v="caption" style={{ fontSize: 12 }}>Tap a switch to pause one</Txt>}
      </Row>
      <ListCard>
        {READS.map(({ Icon, t, s, v, tone }, i) => {
          const bg = (c as any)[tone[0]], fg = (c as any)[tone[1]];
          const live = on && metrics[t];
          return (
            <Row key={t} style={{ gap: 14, minHeight: 72, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: on && !metrics[t] ? 0.5 : 1 }}>
                <Icon size={22} strokeWidth={1.9} color={fg} />
              </View>
              <View style={{ flex: 1, paddingVertical: 10 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{t}</Txt>
                <Txt v="caption" style={{ fontSize: 13 }}>{live ? `Today · ${v}` : on ? 'Paused' : s}</Txt>
              </View>
              {on && <Switch label={`Read ${t}`} on={!!metrics[t]} onChange={(val) => { setMetrics((m) => ({ ...m, [t]: val })); haptic.tap(); toast(`${t} ${val ? 'will sync' : 'sync paused'}`); }} />}
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

      {on && (
        <Pressy accessibilityRole="button" accessibilityLabel={`Disconnect ${HEALTH_NAME}`} onPress={disconnect} scaleTo={0.97} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
          <Txt style={{ fontSize: 15, lineHeight: 21, color: c.muted, fontFamily: font.semibold }}>{`Disconnect ${HEALTH_NAME}`}</Txt>
        </Pressy>
      )}
    </SubPage>
  );
}
