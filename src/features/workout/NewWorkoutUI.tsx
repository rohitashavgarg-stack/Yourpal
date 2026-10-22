import React, { useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { useEvent } from 'expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronLeft, ChevronUp, Ellipsis, Maximize2, Play, X } from '@/lib/icons';
import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { CheckCircle, RoundBtn } from '@/components/bits';
import { Ex, ListItem } from '@/lib/data';
import { Session } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { mmss } from '@/lib/useNow';
import { RestPanel } from './RestPanel';
import { GlassBackdrop } from '@/components/Glass';
import { VideoView, useVideoPlayer } from 'expo-video';
import { CLIPS, THUMBS } from './clips';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { IconButton } from '@/design-system/primitives/Button';
import { FadeIn } from '@/design-system/primitives/FadeIn';

// The only clips we have are the main-lift ones, so a move gets a still only where it is the same movement; the rest show a plain tile.
const LIST_THUMB: Record<string, string> = { w2: 'dfs', c3: 'dbe' };
// Just the clip in a popup over a dim, with a close button.
function ClipPopup({ source, onClose }: { source: number; onClose: () => void }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  return (
    // Drawn inside the screen (not a Modal) so on the web it stays inside the phone frame.
    <FadeIn style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100, elevation: 100 }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Pressable accessibilityLabel="Close clip" onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ width: '100%', maxHeight: '75%', gap: 12, alignItems: 'flex-end' }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} scaleTo={0.92}
            style={{ width: 44, height: 44, borderRadius: radii.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <GlassBackdrop radius={22} tint="rgba(255,255,255,0.3)" />
            {/* in a View so on the web it is drawn above the glass layer */}
            <View><X size={20} color={fixed.white} /></View>
          </Pressy>
          <View style={{ width: '100%', aspectRatio: 1, borderRadius: radii.card, overflow: 'hidden', backgroundColor: fixed.white }}>
            <VideoView player={player} nativeControls={false} contentFit="contain" allowsPictureInPicture={false} pointerEvents="none" style={{ width: '100%', height: '100%' }} />
          </View>
        </View>
      </View>
    </FadeIn>
  );
}
// A still of the move with a play button. Tapping it opens the clip.
function MoveThumb({ id, onOpen }: { id: string; onOpen?: () => void }) {
  const { c } = useTheme();
  const key = LIST_THUMB[id];
  const still = key ? THUMBS[key] : undefined;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Watch the clip" disabled={!key} onPress={onOpen} scaleTo={0.94} style={{ width: 64, height: 64, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: still ? fixed.white : c.surface2, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
      {still ? <Image source={still} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} /> : null}
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center' }}>
        <Play size={12} color={fixed.white} fill={fixed.white} style={{ marginLeft: 1 }} />
      </View>
    </Pressy>
  );
}

const INK = fixed.dark; // text drawn straight on the white clip stage

// Solid pill, top right, on every workout screen: Finish is easy to find.
function FinishPill({ onPress }: { onPress: () => void }) {
  return (
    <Button kind="whiteLine" size="small" label="Finish" accessibilityLabel="Finish workout" onPress={onPress} scaleTo={0.94} />
  );
}

// ---------------------------------------------------------------------------------------------
// A main exercise: a normal page. The name, a small clip card (a still with a play button, so the clip only plays when you ask), the muscles,
// then the sets with their steppers, and Next at the bottom. Nothing plays on its own and nothing sits over the sets.
// ---------------------------------------------------------------------------------------------
function ClipCardInner({ source, thumb, onFull, onHide }: { source: number; thumb?: number; onFull: () => void; onHide?: () => void }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; });
  const view = useRef<VideoView>(null);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const [full, setFull] = useState(false);
  const toggle = () => (isPlaying ? player.pause() : player.play());
  const goFull = () => {
    if (Platform.OS === 'web') { onFull(); return; } // the browser's full screen would leave the phone frame
    player.play(); setFull(true); setTimeout(() => view.current?.enterFullscreen(), 60);
  };
  return (
    <View style={{ height: 212, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: fixed.white }}>
      <VideoView ref={view} player={player} nativeControls={full} contentFit="contain" allowsPictureInPicture={false} fullscreenOptions={{ enable: true, orientation: 'landscape' }} onFullscreenExit={() => setFull(false)} pointerEvents="none" style={{ width: '100%', height: '100%' }} />
      {!isPlaying && !!thumb && <Image source={thumb} resizeMode="contain" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }} />}
      <Pressy accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause the clip' : 'Play the clip'} onPress={toggle} scaleTo={1} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {!isPlaying && (
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={26} color={fixed.white} fill={fixed.white} style={{ marginLeft: 3 }} />
          </View>
        )}
      </Pressy>
      {onHide && (
        <Button kind="whiteLine" size="xs" weight="medium" label="Hide" accessibilityLabel="Hide the clip" icon={<ChevronUp size={15} color={INK} />} onPress={onHide} scaleTo={0.94} style={{ position: 'absolute', left: 10, top: 10 }} />
      )}
      <IconButton label="Full screen" onPress={goFull} scaleTo={0.92} size={40} radius={20} bg={fixed.white} borderWidth={1} borderColor="#C9D1DD" style={{ position: 'absolute', right: 10, bottom: 10 }}>
        <Maximize2 size={18} color={INK} />
      </IconButton>
    </View>
  );
}

// The clip, once it has been seen: a single quiet row. Tap it to bring the card back.
function ClipRow({ thumb, onOpen }: { thumb?: number; onOpen: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Show the clip" onPress={onOpen} scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderRadius: 20, backgroundColor: c.surface }}>
      <View style={{ width: 44, height: 44, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: fixed.white, alignItems: 'center', justifyContent: 'center' }}>
        {!!thumb && <Image source={thumb} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} />}
        <View style={{ width: 22, height: 22, borderRadius: radii.sm, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center' }}><Play size={10} color={fixed.white} fill={fixed.white} style={{ marginLeft: 1 }} /></View>
      </View>
      <Txt style={{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21 }}>Watch form</Txt>
      <ChevronDown size={18} color={c.muted} />
    </Pressy>
  );
}

export function NewExercise({ s, e, cur, elapsed, now, onMinimise, onFinish, onMenu, prevEx, nextEx, prevName, nextName, sets, note, onAdd30, onSkipRest }: {
  s: Session; e: Ex; cur: number; elapsed: string; now: number; onMinimise: () => void; onFinish: () => void; onMenu: () => void;
  prevEx: () => void; nextEx: () => void; prevName: string; nextName: string; sets: React.ReactNode; note: React.ReactNode; onAdd30: () => void; onSkipRest: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [pop, setPop] = useState(false);
  const [shown, setShown] = useState<boolean | null>(null); // null = follow the sets: the clip is there until a set is ticked, then it shrinks
  const source = CLIPS[e.id];
  const done = e.sets.filter((x) => x.st === 'done').length;
  const marked = done > 0;
  const clipOpen = shown ?? !marked;
  const none = cur < 0 || marked;
  const left = e.sets.filter((x) => x.st === 'todo').length;
  const n = s.ex.length + 2, pos = s.exIdx + 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {pop && source != null && <ClipPopup source={source} onClose={() => setPop(false)} />}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: n }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: radii.xs, backgroundColor: i <= pos ? c.accent : c.surface3 }} />)}
        </View>
        <Row style={{ gap: 10 }}>
          <RoundBtn label="Minimise workout" onPress={onMinimise} glass><X size={20} color={c.ink} /></RoundBtn>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt accessibilityLabel={`Workout time ${elapsed}`} style={{ fontFamily: font.monoBold, fontSize: fontSizes.xl, lineHeight: 28 }}>{elapsed}</Txt>
          </View>
          <FinishPill onPress={onFinish} />
        </Row>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Row style={{ gap: 8, alignItems: 'flex-start' }}>
          <Txt accessibilityRole="header" style={{ flex: 1, fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.8 }}>{e.name}</Txt>
          <IconButton label="Exercise options: swap, ask coach, form tips, skip" onPress={onMenu} scaleTo={0.92} style={{ marginTop: 2 }}>
            <Ellipsis size={20} color={c.ink} />
          </IconButton>
        </Row>
        {source != null && (clipOpen
          ? <ClipCardInner key={e.id} source={source} thumb={THUMBS[e.id]} onFull={() => setPop(true)} onHide={marked ? () => setShown(false) : undefined} />
          : <ClipRow thumb={THUMBS[e.id]} onOpen={() => setShown(true)} />)}
        <View style={{ gap: 8 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 16, letterSpacing: 1.2, color: c.muted }}>MUSCLES FOCUSED</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {e.muscles.split('·').map((m) => m.trim()).filter(Boolean).map((m) => <Chip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} />)}
          </Row>
        </View>
        {sets}
        {note}
      </ScrollView>

      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 8, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}>
        {s.rest && <RestPanel docked rest={s.rest} now={now} onAdd30={onAdd30} onSkip={onSkipRest} onDone={onSkipRest} />}
        {cur >= 0 && marked && <Txt v="caption" style={{ textAlign: 'center' }}>{left} set{left === 1 ? '' : 's'} not done · you can come back to them</Txt>}
        <Row style={{ gap: 10 }}>
          {s.exIdx > 0 && (
            <IconButton label={`Back to ${prevName}`} onPress={prevEx} scaleTo={0.92} size={56} radius={radii.xl} bg={c.surface} borderWidth={1} borderColor={c.line}>
              <ChevronLeft size={22} color={c.ink} />
            </IconButton>
          )}
          <Button kind={none ? 'accent' : 'secondary'} label={none ? `Next: ${nextName}` : `Skip to ${nextName}`} onPress={nextEx} style={{ flex: 1 }} />
        </Row>
      </View>
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
        <RoundBtn label="Minimise workout" onPress={onMinimise} glass><X size={20} color={c.ink} /></RoundBtn>
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
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21, color: c.ink, opacity: 0.7 }}>Skip warm-up</Txt>
          </Pressy>
        )}
      </View>
      </View>
    </View>
  );
}
