import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ChevronDown, Phone } from '@/lib/icons';
import { Button, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade, fadeOut } from '@/theme/motion';
import { ListCard, SubPage } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

const FAQ = [
  { q: 'How do I switch programmes?', a: 'Tap the programme name at the top. It works like switching accounts.' },
  { q: 'Who can see my progress photos?', a: 'Only you. Trainers and providers never see them unless you share.' },
  { q: 'I forgot to finish a workout', a: 'It auto-finishes after a few hours and asks you to confirm.' },
  { q: "My check-in didn't show up", a: "Check-ins can take a minute to sync. If it's missing, ask the front desk." },
];

function Item({ q, a, open, onPress, last }: { q: string; a: string; open: boolean; onPress: () => void; last: boolean }) {
  const { c } = useTheme();
  const r = useSharedValue(open ? 180 : 0);
  useEffect(() => { r.value = withTiming(open ? 180 : 0, { duration: 220 }); }, [open]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Pressy accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={q} onPress={onPress} scaleTo={0.985}
      style={{ minHeight: 60, paddingVertical: 14, gap: 6, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Txt style={{ flex: 1, fontFamily: font.medium }}>{q}</Txt>
        <Animated.View style={chev}><ChevronDown size={18} color={c.muted} /></Animated.View>
      </View>
      {open && <Animated.View entering={fade()} exiting={fadeOut()}><Txt muted style={{ fontSize: 14 }}>{a}</Txt></Animated.View>}
    </Pressy>
  );
}

export default function Help() {
  const { c } = useTheme();
  const { current } = useShell();
  const { toast } = useOverlay();
  const [open, setOpen] = useState<number | null>(null);

  useScenarios({
    title: 'Help & support',
    rows: [{ label: 'FAQ', options: ['All closed', 'First open'], value: open === 0 ? 'First open' : 'All closed', onPick: (v) => setOpen(v === 'First open' ? 0 : null) }],
  }, [open]);

  const call = () => {
    toast('Calling the front desk…');
  };

  return (
    <SubPage title="Help & support" fallback="/profile">
      <ListCard>
        {FAQ.map((f, i) => <Item key={f.q} q={f.q} a={f.a} open={open === i} last={i === FAQ.length - 1} onPress={() => setOpen(open === i ? null : i)} />)}
      </ListCard>
      <Button kind="secondary" label={`Contact ${current.short} front desk`} icon={<Phone size={17} color={c.ink} />} onPress={call} />
    </SubPage>
  );
}
