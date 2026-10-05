import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { router } from 'expo-router';
import { Button, Pill, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { newSession } from './session';

function Opt({ on, title, sub, onPress, children }: { on: boolean; title: string; sub?: string; onPress: () => void; children?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ borderRadius: 18, borderWidth: on ? 1.5 : 1, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accentSoft : 'transparent' }}>
      <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} scaleTo={0.985} style={{ minHeight: 60, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.bold }}>{title}</Txt>
        {sub ? <Txt muted style={{ fontSize: 13 }}>{sub}</Txt> : null}
      </Pressy>
      {children}
    </View>
  );
}

// The Full / Quick / Low energy choice lives only here, never on the Today card.
export function StartWorkoutSheet({ onStarted }: { onStarted?: () => void }) {
  const { d, set } = useDomain();
  const { closeSheet } = useOverlay();
  const start = () => {
    haptic.medium();
    const s = newSession(d.mode, d.quick);
    closeSheet(() => { set({ session: s }); router.push('/workout'); onStarted?.(); });
  };
  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: 26, letterSpacing: -0.6 }}>Leg day</Txt>
      <Opt on={d.mode === 0} title="Full · ~50 min" sub="6 exercises · warm-up and cool-down" onPress={() => set({ mode: 0 })} />
      <Opt on={d.mode === 1} title="Quick version · 20 · 30 · 45 min" sub="Keeps Coach's key exercises" onPress={() => set({ mode: 1 })}>
        {d.mode === 1 && (
          <Animated.View entering={fade()} style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 14 }}>
            {([20, 30, 45] as const).map((q) => <Pill key={q} label={`${q} min`} on={d.quick === q} onPress={() => set({ quick: q, mode: 1 })} />)}
          </Animated.View>
        )}
      </Opt>
      <Opt on={d.mode === 2} title="Low energy" sub="Same exercises, lighter" onPress={() => set({ mode: 2 })} />
      <Txt muted style={{ fontSize: 13 }}>Quick and low-energy sessions still count toward your streak.</Txt>
      <Button kind="accent" label="Start" onPress={start} />
    </>
  );
}
