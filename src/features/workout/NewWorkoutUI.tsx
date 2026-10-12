import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Ellipsis, Play, X } from '@/lib/icons';
import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle } from '@/components/bits';
import { Ex, ListItem } from '@/lib/data';
import { Session } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade } from '@/theme/motion';
import { mmss } from '@/lib/useNow';
import { ClipStage } from './ClipStage';
import { RestPanel } from './RestPanel';
import { GlassBackdrop } from '@/components/Glass';
import { VideoView, useVideoPlayer } from 'expo-video';
import { CLIPS, THUMBS } from './clips';

// The only clips we have are the main-lift ones, so a move gets a still only where it is the same movement; the rest show a plain tile.
const LIST_THUMB: Record<string, string> = { w2: 'dfs', c3: 'dbe' };
// Just the clip in a popup over a dim, with a close button.
function ClipPopup({ source, onClose }: { source: number; onClose: () => void }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  return (
    // Drawn inside the screen (not a Modal) so on the web it stays inside the phone frame.
    <Animated.View entering={fade()} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100, elevation: 100 }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Pressable accessibilityLabel="Close clip" onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ width: '100%', maxHeight: '75%', gap: 12, alignItems: 'flex-end' }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} scaleTo={0.92}
            style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
            <GlassBackdrop radius={22} tint="rgba(255,255,255,0.22)" />
            <X size={20} color="#fff" />
          </Pressy>
          <View style={{ width: '100%', aspectRatio: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            <VideoView player={player} nativeControls={false} contentFit="contain" allowsPictureInPicture={false} pointerEvents="none" style={{ width: '100%', height: '100%' }} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
// A still of the move with a play button. Tapping it opens the clip.
function MoveThumb({ id, onOpen }: { id: string; onOpen?: () => void }) {
  const { c } = useTheme();
  const key = LIST_THUMB[id];
  const still = key ? THUMBS[key] : undefined;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Watch the clip" disabled={!key} onPress={onOpen} scaleTo={0.94} style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', backgroundColor: still ? '#FFFFFF' : c.surface2, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
      {still ? <Image source={still} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} /> : null}
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center' }}>
        <Play size={12} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />
      </View>
    </Pressy>
  );
}

const INK = '#0B0E14'; // text drawn straight on the white clip stage

// Solid pill, top right, on every workout screen: Finish is easy to find.
function FinishPill({ onPress }: { onPress: () => void }) {
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Finish workout" onPress={onPress} scaleTo={0.94}
      style={{ height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C9D1DD', alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: INK }}>Finish</Txt>
    </Pressy>
  );
}

function RoundLight({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.92}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EC', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </Pressy>
  );
}

// ---------------------------------------------------------------------------------------------
// A main exercise: the clip fills the screen, the sets sit in a bottom sheet over it.
// ---------------------------------------------------------------------------------------------
export function NewExercise({ s, e, cur, elapsed, now, onMinimise, onFinish, onMenu, prevEx, nextEx, prevName, nextName, sets, note, onAdd30, onSkipRest }: {
  s: Session; e: Ex; cur: number; elapsed: string; now: number; onMinimise: () => void; onFinish: () => void; onMenu: () => void;
  prevEx: () => void; nextEx: () => void; prevName: string; nextName: string; sets: React.ReactNode; note: React.ReactNode; onAdd30: () => void; onSkipRest: () => void;
}) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const MIN = Math.round(H * 0.56), MAX = Math.round(H * 0.88);
  const h = useSharedValue(MIN);
  const from = useSharedValue(MIN);
  const pan = Gesture.Pan()
    .onStart(() => { from.value = h.value; })
    .onUpdate((g) => { h.value = Math.max(MIN, Math.min(MAX, from.value - g.translationY)); })
    .onEnd((g) => {
      const to = h.value - g.velocityY * 0.12 > (MIN + MAX) / 2 ? MAX : MIN;
      h.value = withTiming(to, { duration: 220, easing: Easing.out(Easing.cubic) });
    });
  const sheet = useAnimatedStyle(() => ({ height: h.value }));

  const done = e.sets.filter((x) => x.st === 'done').length;
  const marked = done > 0;
  const none = cur < 0 || marked;
  const left = e.sets.filter((x) => x.st === 'todo').length;
  const n = s.ex.length + 2, pos = s.exIdx + 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* the clip stays where it is: the sheet slides over it instead of pushing it */}
      <ClipStage id={e.id} top={insets.top + 92} bottom={MIN} />

      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 10, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: n }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= pos ? INK : '#D5DBE5' }} />)}
        </View>
        <Row style={{ gap: 10 }}>
          <RoundLight label="Minimise workout" onPress={onMinimise}><X size={20} color={INK} /></RoundLight>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22, color: INK }}>{e.name}</Txt>
            <Txt numberOfLines={1} style={{ fontSize: 12, lineHeight: 17, color: '#5B6577' }}>{elapsed}</Txt>
          </View>
          <FinishPill onPress={onFinish} />
        </Row>
      </View>

      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: c.line, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: isDark ? 0.5 : 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 18 }, sheet]}>
        <GestureDetector gesture={pan}>
          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 6 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: c.surface3 }} />
          </View>
        </GestureDetector>
        <Row style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.display, fontSize: 24, lineHeight: 31 }}>{e.name}</Txt>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Exercise options: swap, ask coach, form tips, skip" onPress={onMenu} scaleTo={0.92}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Ellipsis size={20} color={c.ink} />
          </Pressy>
        </Row>
        <View style={{ paddingHorizontal: 16, paddingBottom: 10, gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 1, color: c.muted }}>MUSCLES FOCUSED</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {e.muscles.split('·').map((m) => m.trim()).filter(Boolean).map((m) => <Chip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} />)}
          </Row>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {sets}
          {note}
        </ScrollView>
        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 8, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}>
          {s.rest && <RestPanel docked rest={s.rest} now={now} onAdd30={onAdd30} onSkip={onSkipRest} onDone={onSkipRest} />}
          {cur >= 0 && marked && <Txt v="caption" style={{ textAlign: 'center' }}>{left} set{left === 1 ? '' : 's'} not done · you can come back to them</Txt>}
          <Row style={{ gap: 10 }}>
            {s.exIdx > 0 && (
              <Pressy accessibilityRole="button" accessibilityLabel={`Back to ${prevName}`} onPress={prevEx} scaleTo={0.92}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={22} color={c.ink} />
              </Pressy>
            )}
            <Button kind={none ? 'accent' : 'secondary'} label={none ? `Next: ${nextName}` : `Skip to ${nextName}`} onPress={nextEx} style={{ flex: 1 }} />
          </Row>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Warm-up and cool-down: a simple list with a big plain timer. No clip on top, no back button.
// ---------------------------------------------------------------------------------------------
const TOTAL_SEC = 240;
export function NewList({ s, list, now, cool, onToggle, onMain, onFinishNow, onMinimise }: {
  s: Session; list: ListItem[]; now: number; cool: boolean; onToggle: (id: string, on: boolean) => void; onMain: () => void; onFinishNow: () => void; onMinimise: () => void;
}) {
  const { c } = useTheme();
  const [clip, setClip] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const [t0] = useState(() => Date.now());
  const left = Math.max(0, TOTAL_SEC - (now - t0) / 1000);
  const allDone = list.every((it) => !!s.listDone[it.id]);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {clip != null && <ClipPopup source={clip} onClose={() => setClip(null)} />}
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 10, justifyContent: 'flex-start' }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Minimise workout" onPress={onMinimise} scaleTo={0.92} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} color={c.ink} />
        </Pressy>
      </Row>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 270, gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 48, lineHeight: 56, letterSpacing: -1.6 }}>{cool ? 'Cool-down' : 'Warm-up'}</Txt>
          <Txt muted style={{ fontSize: 16, lineHeight: 23 }}>{list.length} {cool ? 'stretches' : 'moves'} · {cool ? 'slow and easy' : 'no weights'}</Txt>
        </View>
        <Card style={{ paddingVertical: 4, paddingHorizontal: 12 }}>
          {list.map((it, i) => {
            const on = !!s.listDone[it.id];
            return (
              <Pressy key={it.id} accessibilityRole="button" accessibilityLabel={`${on ? 'Undo' : 'Done'}: ${it.n}`} onPress={() => onToggle(it.id, !on)} scaleTo={0.98}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 80, paddingVertical: 8, paddingHorizontal: 2, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <MoveThumb id={it.id} onOpen={() => { const k = LIST_THUMB[it.id]; if (k) setClip(CLIPS[k]); }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={{ fontFamily: font.medium, color: on ? c.muted : c.ink, textDecorationLine: on ? 'line-through' : 'none' }}>{it.n}</Txt>
                </View>
                <View pointerEvents="none"><CheckCircle on={on} label="" /></View>
              </Pressy>
            );
          })}
        </Card>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.bg }}>
        <Row style={{ justifyContent: 'center', gap: 8, paddingVertical: 8 }}>
          <Txt accessibilityLabel={`Total time left ${mmss(left)}`} style={{ fontFamily: font.monoBold, fontSize: 34, lineHeight: 44 }}>{mmss(left).padStart(5, '0')}</Txt>
        </Row>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 4, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button kind={allDone || cool ? 'accent' : 'primary'} label={cool ? 'Finish workout' : 'Start main workout'} onPress={cool ? onFinishNow : onMain} />
        {!cool && (
          <Pressy accessibilityRole="button" onPress={onMain} scaleTo={0.96} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, color: c.ink, opacity: 0.7 }}>Skip warm-up</Txt>
          </Pressy>
        )}
      </View>
      </View>
    </View>
  );
}
