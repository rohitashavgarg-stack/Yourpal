import React, { useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Maximize2, Minimize2, Pause, Play } from '@/lib/icons';
import { Pressy } from '@/components/ui';
import { CLIPS, THUMBS } from './clips';
import { radii, fixed } from '@/design-system/tokens';

// The clips have a white background, so on a white stage the video reads as filling the whole screen.
export const STAGE_BG = fixed.white;

const IS_WEB = Platform.OS === 'web';

function Clip({ source, thumb, top: top0, bottom: bottom0, wide, setWide }: { source: number; thumb?: number; top: number; bottom: number; wide: boolean; setWide: (v: boolean) => void }) {
  // On the web the browser's full screen would leave the phone frame, so there the clip just grows to fill the screen inside it.
  const top = IS_WEB && wide ? 0 : top0;
  const bottom = IS_WEB && wide ? 0 : bottom0;
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  const view = useRef<VideoView>(null);
  // The player's own controls (with the exit-fullscreen button) are only on while the clip is full screen.
  const [full, setFull] = useState(false);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top, bottom, overflow: 'hidden' }}>
        <VideoView ref={view} player={player} nativeControls={full} contentFit="contain" allowsPictureInPicture={false} fullscreenOptions={{ enable: true, orientation: 'landscape' }} onFullscreenExit={() => setFull(false)} style={{ width: '100%', height: '100%' }} />
        {/* before the clip plays (or while it is paused) show its still frame */}
        {!isPlaying && !!thumb && <Image source={thumb} resizeMode="contain" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }} />}
      </View>
      {/* big play / pause in the middle of the part of the clip that is showing */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top, bottom, alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 5 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause the clip' : 'Play the clip'} onPress={() => (isPlaying ? player.pause() : player.play())} scaleTo={0.92}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center', opacity: isPlaying ? 0.55 : 1 }}>
          {isPlaying ? <Pause size={26} color={fixed.white} fill={fixed.white} /> : <Play size={26} color={fixed.white} fill={fixed.white} style={{ marginLeft: 3 }} />}
        </Pressy>
        {/* full screen: the clip in landscape */}
        <Pressy accessibilityRole="button" accessibilityLabel={IS_WEB && wide ? 'Exit full screen' : 'Full screen'} onPress={() => { player.play(); if (IS_WEB) { setWide(!wide); return; } setFull(true); setTimeout(() => view.current?.enterFullscreen(), 60); }} scaleTo={0.92}
          style={{ position: 'absolute', right: 14, bottom: 12, width: 44, height: 44, borderRadius: radii.lg, backgroundColor: fixed.white, borderWidth: 1, borderColor: '#C9D1DD', alignItems: 'center', justifyContent: 'center' }}>
          {IS_WEB && wide ? <Minimize2 size={19} color={fixed.dark} /> : <Maximize2 size={19} color={fixed.dark} />}
        </Pressy>
      </View>
    </>
  );
}

// Full-screen background for an exercise. top / bottom = the strips covered by the top bar and the sheet, so the clip sits in what is visible.
export function ClipStage({ id, top, bottom }: { id: string; top: number; bottom: number }) {
  const source = CLIPS[id];
  const [wide, setWide] = useState(false);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: STAGE_BG, zIndex: IS_WEB && wide ? 40 : 0 }}>
      {source ? <Clip key={id} source={source} thumb={THUMBS[id]} top={top} bottom={bottom} wide={wide} setWide={setWide} /> : null}
    </View>
  );
}
