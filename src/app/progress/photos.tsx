import React, { useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ChevronsLeftRight, Lock, Plus } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { Hint, SubPage } from '@/features/progress/parts';
import { progressStore } from '@/features/progress/store';
import { AFTER_PHOTO, BEFORE_PHOTO, photoFor } from '@/features/progress/photoAssets';
import { useProgressScenarios } from '@/features/progress/scenarios';

const SCRIM = 'rgba(0,0,0,0.55)';

function PhotoTile({ d, i, zoomed, onDouble }: { d: string; i: number; zoomed: boolean; onDouble: () => void }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  const last = useRef(0);
  useEffect(() => { s.value = withTiming(zoomed ? 1.8 : 1, { duration: 350, easing: Easing.bezier(0.22, 1, 0.36, 1) }); }, [zoomed]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const tap = () => { const now = Date.now(); if (now - last.current < 320) { last.current = 0; onDouble(); } else last.current = now; };
  return (
    <Pressy accessibilityRole="imagebutton" accessibilityLabel={`Progress photo ${d}${zoomed ? ', zoomed' : ''}. Double tap to zoom`} accessibilityHint="Double tap to zoom" onPress={tap} haptics={false}
      style={{ height: 210, borderRadius: 22, backgroundColor: c.surface, overflow: 'hidden' }}>
      <Animated.View style={[{ flex: 1 }, a]}><Image source={photoFor(i)} resizeMode="cover" accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} /></Animated.View>
      <Tag label={d} bg={SCRIM} fg="#fff" style={{ position: 'absolute', left: 10, bottom: 10 }} />
    </Pressy>
  );
}

function Compare({ latest }: { latest: string }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const [pos, setPos] = useState(50);
  const setFromX = (x: number) => { if (w > 0) setPos(Math.max(0, Math.min(100, Math.round((x / w) * 100)))); };
  // Horizontal drag moves the divider; a vertical drag still scrolls the page. Touch-down jumps the divider.
  const pan = Gesture.Pan().activeOffsetX([-6, 6]).failOffsetY([-14, 14]).runOnJS(true)
    .onBegin((e) => setFromX(e.x))
    .onUpdate((e) => setFromX(e.x))
    .onEnd(() => haptic.light());
  return (
    <Animated.View entering={fade()}>
      <GestureDetector gesture={pan}>
        <View collapsable={false} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessible accessibilityRole="adjustable" accessibilityLabel="Compare photos, drag to reveal"
          accessibilityValue={{ min: 0, max: 100, now: pos, text: `${pos}% of Sep 2 shown` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => setPos((p) => (e.nativeEvent.actionName === 'increment' ? Math.min(100, p + 5) : Math.max(0, p - 5)))}
          style={{ height: 440, borderRadius: 26, overflow: 'hidden', backgroundColor: c.surface, cursor: 'ew-resize' as any }}>
          <Image source={AFTER_PHOTO} resizeMode="cover" accessibilityIgnoresInvertColors style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pos}%`, overflow: 'hidden' }}>
            <Image source={BEFORE_PHOTO} resizeMode="cover" accessibilityIgnoresInvertColors style={{ width: w || 358, height: 440 }} />
          </View>
          <Tag label="Sep 2" bg={SCRIM} fg="#fff" style={{ position: 'absolute', left: 12, top: 12 }} />
          <Tag label={latest} bg={SCRIM} fg="#fff" style={{ position: 'absolute', right: 12, top: 12 }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronsLeftRight size={18} color="#0B0B0D" />
            </View>
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function Photos() {
  const { c } = useTheme();
  const { toast } = useOverlay();
  const ps = progressStore.use();
  const [zoom, setZoom] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  useProgressScenarios('Progress · Photos', [
    { label: 'Mode', options: ['Grid', 'Compare'], value: comparing ? 'Compare' : 'Grid', onPick: (v) => setComparing(v === 'Compare' && ps.photos.length >= 2) },
    { label: 'Photos', options: ['Two', 'One only'], value: ps.photos.length < 2 ? 'One only' : 'Two', onPick: (v) => { progressStore.set({ photos: v === 'Two' ? [{ d: 'Sep 2' }, { d: 'Sep 30' }] : [{ d: 'Sep 2' }] }); setComparing(false); } },
  ], [], [comparing, ps.photos.length]);

  const add = () => { progressStore.set({ photos: [...ps.photos, { d: 'Today', fresh: true }] }); haptic.success(); toast('Photo saved privately on this phone'); };
  const latest = ps.photos[ps.photos.length - 1]?.d ?? 'Sep 30';
  const rows: { d: string; i: number }[][] = [];
  ps.photos.forEach((p, i) => { if (i % 2 === 0) rows.push([]); rows[rows.length - 1].push({ d: p.d, i }); });

  return (
    <SubPage title="Photos" fallback="/progress" onBack={() => { if (comparing) { setComparing(false); return true; } return false; }}
      right={<View style={{ width: 64, alignItems: 'flex-end' }}><Tag label="Private" bg={c.surface2} fg={c.muted} /></View>}>
      <Row style={{ gap: 6, paddingHorizontal: 6 }}><Lock size={14} color={c.muted} /><Txt muted style={{ fontSize: 14, flex: 1 }}>Only you can see these. Your trainer can’t.</Txt></Row>
      {!comparing ? (
        <>
          {rows.map((r, ri) => (
            <Row key={ri} style={{ gap: 10 }}>
              {r.map((p) => (
                <Animated.View key={p.i} entering={ps.photos[p.i].fresh ? fade() : undefined} style={{ flex: 1 }}>
                  <PhotoTile d={p.d} i={p.i} zoomed={zoom === p.i} onDouble={() => setZoom((z) => (z === p.i ? null : p.i))} />
                </Animated.View>
              ))}
              {r.length === 1 && <View style={{ flex: 1 }} />}
            </Row>
          ))}
          <Hint style={{ fontSize: 12 }}>Double tap a photo to zoom</Hint>
          <Button kind="secondary" label="Add photo" icon={<Plus size={18} color={c.ink} />} onPress={add} />
          <Button label="Compare" disabled={ps.photos.length < 2} onPress={() => setComparing(true)} />
          {ps.photos.length < 2 && <Hint>Add one more photo to compare.</Hint>}
        </>
      ) : (
        <>
          <Compare latest={latest} />
          <Button kind="secondary" label="Done comparing" onPress={() => setComparing(false)} />
        </>
      )}
    </SubPage>
  );
}
