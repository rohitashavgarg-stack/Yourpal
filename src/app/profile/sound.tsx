/* eslint-disable react-hooks/refs -- the slider's touch handler reads the latest value through a ref */
import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { Volume1, Volume2 } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { playTimerEnd } from '@/lib/timerSound';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';

const STEPS = 10; // the volume moves in tenths

// A slider you drag along. It moves in tenths with a light tick for each one.
function VolumeSlider({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const live = useRef({ value, w, onChange, disabled });
  live.current = { value, w, onChange, disabled };
  const pan = useMemo(() => {
    const set = (x: number) => {
      const { w: width, value: cur, onChange: ch, disabled: off } = live.current;
      if (!width || off) return;
      const v = Math.round(Math.min(1, Math.max(0, x / width)) * STEPS) / STEPS;
      if (v !== cur) { haptic.tick(); ch(v); }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    });
  }, []);
  return (
    <Row style={{ gap: 12 }}>
      <Volume1 size={20} color={c.muted} />
      <View {...pan.panHandlers} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="adjustable" accessibilityLabel="Volume" accessibilityValue={{ text: `${Math.round(value * 100)} percent` }}
        style={{ flex: 1, height: 44, justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}>
        <View pointerEvents="none" style={{ height: 8, borderRadius: radii.xs, backgroundColor: c.surface3 }}>
          <View style={{ width: `${value * 100}%`, height: 8, borderRadius: radii.xs, backgroundColor: c.accent }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: w ? value * w - 15 : 0, top: 7, width: 30, height: 30, borderRadius: radii.pill, backgroundColor: c.surface, borderWidth: 3, borderColor: c.accent }} />
      </View>
      <Volume2 size={20} color={c.muted} />
    </Row>
  );
}

// Sound: the buzzer when a workout timer ends (on or off, and how loud), and the vibration.
export default function SoundSettings() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const t = state.profile.timer ?? {};
  const soundOn = t.sound !== false;
  const vibrateOn = t.vibrate !== false;
  const volume = t.volume ?? 1;
  const save = (p: Partial<NonNullable<typeof t>>) => setProfile({ timer: { ...t, ...p } });
  return (
    <SubPage title="Sound" fallback="/profile">
      <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>Timer buzzer</Txt>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Plays when a rest or exercise timer ends</Txt>
          </View>
          <Switch label="Timer buzzer" on={soundOn} onChange={(v) => save({ sound: v })} />
        </Row>
        <VolumeSlider value={volume} onChange={(v) => save({ volume: v })} disabled={!soundOn} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.semibold, color: soundOn ? c.ink : c.muted }}>{`${Math.round(volume * 100)}%`}</Txt>
          <Button kind="secondary" small label="Play sound" disabled={!soundOn} onPress={() => { if (vibrateOn) haptic.success(); playTimerEnd(volume); }} />
        </Row>
      </View>
      <ListCard>
        <LineRow title="Vibration" sub="A buzz when a timer ends" last right={<Switch label="Vibration" on={vibrateOn} onChange={(v) => save({ vibrate: v })} />} />
      </ListCard>
      <Note style={{ fontSize: fontSizes.sm }}>The buzzer follows your phone’s silent switch. On silent you only feel the vibration.</Note>
    </SubPage>
  );
}
