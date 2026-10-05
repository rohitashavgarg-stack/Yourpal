import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Button, Txt } from '@/components/ui';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fade, fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

type Phase = 'idle' | 'running' | 'done' | 'failed';

export default function ExportData() {
  const { c } = useTheme();
  const { s, set } = useShell();
  const [phase, setPhase] = useState<Phase>('idle');
  const [pct, setPct] = useState(0);
  const [fail, setFail] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(pct, { duration: 260 }); }, [pct]);
  const bar = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  useScenarios({
    title: 'Export my data',
    rows: [{ label: 'Export result', options: ['Succeeds', 'Fails (offline)'], value: fail ? 'Fails (offline)' : 'Succeeds', onPick: (v) => setFail(v !== 'Succeeds') }],
    actions: [{ label: 'Start export', run: () => start() }],
  }, [fail, phase]);

  const start = () => {
    if (timer.current) clearInterval(timer.current);
    setPhase('running'); setPct(0);
    let p = 0;
    timer.current = setInterval(() => {
      p += 12;
      if (fail && p >= 48) { clearInterval(timer.current!); setPhase('failed'); haptic.error(); return; }
      if (p >= 100) { clearInterval(timer.current!); setPct(100); setPhase('done'); haptic.success(); return; }
      setPct(p);
    }, 220);
  };

  return (
    <SubPage title="Export my data" fallback="/profile">
      <ListCard style={{ paddingVertical: 18, gap: 8 }}>
        <Txt style={{ fontFamily: font.semibold }}>Your data, in one file</Txt>
        <Txt muted style={{ fontSize: 14 }}>Workouts, meals, weight, measurements and assessments from every programme. Progress photos are included only if you choose.</Txt>
        <LineRow title="Include progress photos" minH={52} last right={<Switch label="Include progress photos" on={s.expPhotos} onChange={(v) => set({ expPhotos: v })} />} />
        {phase === 'running' && (
          <Animated.View entering={fade()} exiting={fadeOut()} style={{ gap: 6 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surface2, overflow: 'hidden' }}>
              <Animated.View style={[{ height: '100%', backgroundColor: c.accent, borderRadius: 4 }, bar]} />
            </View>
            <Txt v="mono" muted accessibilityLiveRegion="polite">Preparing… {pct}%</Txt>
          </Animated.View>
        )}
        {phase === 'done' && <Animated.View entering={fade()}><Note tone="good">Ready · saved to Downloads as yourpal-export.zip</Note></Animated.View>}
        {phase === 'failed' && <Animated.View entering={fade()}><Note tone="warn">Couldn't finish the export. You're offline — try again when you're connected.</Note></Animated.View>}
      </ListCard>
      <Button label={phase === 'done' ? 'Export again' : phase === 'failed' ? 'Try again' : 'Prepare export'} disabled={phase === 'running'} onPress={start} />
    </SubPage>
  );
}
