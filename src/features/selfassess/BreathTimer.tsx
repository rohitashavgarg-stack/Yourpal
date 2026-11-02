import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Txt } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';

const show = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`;

// The breath-hold test as a stopwatch: tap Hold breath, take a deep breath and hold it, tap Stop when you cannot hold any longer.
// The time it shows is the result. Try again starts over.
export function BreathTimer({ seconds, onChange }: { seconds: number | undefined; onChange: (s: number | undefined) => void }) {
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(seconds != null ? seconds * 1000 : 0);
  const t0 = useRef(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setMs(Date.now() - t0.current), 100);
    return () => clearInterval(id);
  }, [running]);

  const start = () => { t0.current = Date.now(); setMs(0); setRunning(true); onChange(undefined); haptic.medium(); };
  const stop = () => { const m = Date.now() - t0.current; setRunning(false); setMs(m); onChange(Math.max(1, Math.round(m / 1000))); haptic.success(); };
  const done = !running && ms > 0;
  return (
    <View style={{ alignItems: 'center', gap: 22, paddingTop: 12 }}>
      <View accessibilityLiveRegion="polite" accessibilityLabel={`Breath-hold time ${show(ms)}`} style={{ alignItems: 'center' }}>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 72, lineHeight: 84, letterSpacing: -2 }}>{show(ms)}</Txt>
        <Txt muted style={{ fontSize: fontSizes.base }}>{running ? 'Holding your breath' : done ? 'Your breath-hold time' : 'Ready when you are'}</Txt>
      </View>
      <View style={{ alignSelf: 'stretch', gap: 10 }}>
        {running
          ? <Button kind="primary" label="Stop" onPress={stop} />
          : <Button kind="accent" label={done ? 'Try again' : 'Hold breath'} onPress={start} />}
      </View>
    </View>
  );
}
