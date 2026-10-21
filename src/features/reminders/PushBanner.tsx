import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Pressy, Txt } from '@/components/ui';
import { fade, fadeOut } from '@/theme/motion';
import { font } from '@/theme/tokens';
import { pushStore } from './push';
import { fixed } from '@/design-system/tokens';

// What the phone shows when a reminder arrives (a preview, since this prototype cannot receive a real push from a server).
export function PushBanner() {
  const { shown } = pushStore.use();
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => pushStore.set({ shown: null }), 6000);
    return () => clearTimeout(t);
  }, [shown?.at]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!shown) return null;
  const open = () => { pushStore.set({ shown: null }); if (shown.key === 'weight') router.push('/log-weight'); };
  return (
    <Animated.View entering={fade()} exiting={fadeOut()} style={{ position: 'absolute', top: 48, left: 12, right: 12, zIndex: 50 }}>
      <Pressy accessibilityRole="alert" accessibilityLabel={`${shown.title}. ${shown.body}`} onPress={open} scaleTo={0.98}
        style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 22, backgroundColor: 'rgba(38,40,46,0.96)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: fixed.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.bold, fontSize: 13, lineHeight: 18, color: fixed.white }}>YP</Txt>
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 19, color: fixed.white }}>{shown.title}</Txt>
            <Txt style={{ fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.6)' }}>now</Txt>
          </View>
          <Txt style={{ fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.9)' }}>{shown.body}</Txt>
        </View>
      </Pressy>
    </Animated.View>
  );
}
