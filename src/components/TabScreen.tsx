import React from 'react';
import { View } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, Extrapolation } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useNavHidden } from './FloatingTabBar';
import { withTiming } from 'react-native-reanimated';
import { font } from '@/theme/tokens';
import { GlassBackdrop } from './Glass';

// A tab page with an iOS large title that collapses into a compact header,
// and a scroll that hides / shows the floating nav.
export function TabScreen({ title, header, children, compactTitle = true, bottomPad = 130, refreshControl }: { title: string; header?: React.ReactNode; children: React.ReactNode; compactTitle?: boolean; bottomPad?: number; refreshControl?: React.ReactElement<any> }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const y = useSharedValue(0);
  const last = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const v = e.contentOffset.y;
      y.value = v;
      if (hidden) {
        const dy = v - last.value;
        if (v < 30) hidden.value = withTiming(0, { duration: 260 });
        else if (dy > 6 && v > 60) hidden.value = withTiming(1, { duration: 280 });
        else if (dy < -6) hidden.value = withTiming(0, { duration: 260 });
      }
      last.value = v;
    },
  });
  const top = insets.top + 8;
  const compact = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [40, 70], [0, 1], Extrapolation.CLAMP) }));
  const large = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 50], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(y.value, [-80, 0], [1.08, 1], Extrapolation.CLAMP) }],
  }));
  const border = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [50, 80], [0, 1], Extrapolation.CLAMP) }));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* The header floats over the page. Once you scroll, a frosted glass bar fades in behind it so it stays clear at the top. */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: top, paddingHorizontal: 16, height: top + 56, justifyContent: 'center', zIndex: 2 }}>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }, border]}>
          <GlassBackdrop radius={22} />
        </Animated.View>
        {header}
        {compactTitle && <Animated.Text pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, bottom: 16, textAlign: 'center', fontFamily: font.semibold, fontSize: 17, lineHeight: 24, color: c.ink }, compact]}>{title}</Animated.Text>}
      </View>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} refreshControl={refreshControl} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: top + 56, paddingBottom: bottomPad, gap: 12 }}>
        <Animated.Text accessibilityRole="header" style={[{ fontFamily: font.regular, fontSize: 34, lineHeight: 44, letterSpacing: -1.4, color: c.ink, marginTop: 4, marginBottom: 8, marginHorizontal: 4, transformOrigin: 'left' as any }, large]}>{title}</Animated.Text>
        {children}
      </Animated.ScrollView>
    </View>
  );
}
