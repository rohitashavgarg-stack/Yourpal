import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Pause, Play } from '@/lib/icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressy, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Deterministic little waveform so the same voice note always looks the same.
const bars = (seed: string, n = 26) => {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; return 6 + ((h >> 8) % 16) + (i % 5 === 0 ? 2 : 0); });
};

export function AudioBubble({ uri, dur, me }: { uri: string; dur: number; me: boolean }) {
  const { c } = useTheme();
  const player = useAudioPlayer(uri);
  const st = useAudioPlayerStatus(player);
  const total = st.duration && st.duration > 0 ? st.duration : dur;
  const pct = total ? Math.min(1, (st.currentTime || 0) / total) : 0;
  const wave = useMemo(() => bars(uri), [uri]);
  const fg = me ? '#fff' : c.accent;
  const dim = me ? 'rgba(255,255,255,0.4)' : c.line;

  useEffect(() => { if (st.didJustFinish) { player.seekTo(0); } }, [st.didJustFinish]);

  const toggle = () => {
    haptic.light();
    if (st.playing) player.pause(); else player.play();
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 210 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={st.playing ? 'Pause voice message' : 'Play voice message'} onPress={toggle} scaleTo={0.9}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: me ? 'rgba(255,255,255,0.22)' : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        {st.playing ? <Pause size={18} color={fg} fill={fg} /> : <Play size={18} color={fg} fill={fg} />}
      </Pressy>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 28 }}>
        {wave.map((h, i) => <View key={i} style={{ flex: 1, height: h, borderRadius: 2, backgroundColor: i / wave.length < pct ? fg : dim }} />)}
      </View>
      <Txt style={{ fontSize: 12, lineHeight: 18, minWidth: 34, textAlign: 'right', color: me ? 'rgba(255,255,255,0.9)' : c.muted }}>{fmt(st.playing ? total - (st.currentTime || 0) : total)}</Txt>
    </View>
  );
}
