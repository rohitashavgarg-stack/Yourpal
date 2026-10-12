import React, { useRef } from 'react';
import { Image, View } from 'react-native';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Maximize2, Pause, Play } from '@/lib/icons';
import { Pressy } from '@/components/ui';
import { CLIPS, THUMBS } from './clips';

// The clips have a white background, so on a white stage the video reads as filling the whole screen.
export const STAGE_BG = '#FFFFFF';

function Clip({ source, thumb, top, bottom }: { source: number; thumb?: number; top: number; bottom: number }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  const view = useRef<VideoView>(null);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top, bottom, overflow: 'hidden' }}>
        <VideoView ref={view} player={player} nativeControls={false} contentFit="contain" allowsPictureInPicture={false} fullscreenOptions={{ enable: true, orientation: 'landscape' }} style={{ width: '100%', height: '100%' }} />
        {/* before the clip plays (or while it is paused) show its still frame */}
        {!isPlaying && !!thumb && <Image source={thumb} resizeMode="contain" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }} />}
      </View>
      {/* big play / pause in the middle of the part of the clip that is showing */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top, bottom, alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 5 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause the clip' : 'Play the clip'} onPress={() => (isPlaying ? player.pause() : player.play())} scaleTo={0.92}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center', opacity: isPlaying ? 0.55 : 1 }}>
          {isPlaying ? <Pause size={26} color="#fff" fill="#fff" /> : <Play size={26} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />}
        </Pressy>
        {/* full screen: the clip in landscape */}
        <Pressy accessibilityRole="button" accessibilityLabel="Full screen" onPress={() => { player.play(); view.current?.enterFullscreen(); }} scaleTo={0.92}
          style={{ position: 'absolute', right: 14, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C9D1DD', alignItems: 'center', justifyContent: 'center' }}>
          <Maximize2 size={19} color="#0B0E14" />
        </Pressy>
      </View>
    </>
  );
}

// Full-screen background for an exercise. top / bottom = the strips covered by the top bar and the sheet, so the clip sits in what is visible.
export function ClipStage({ id, top, bottom }: { id: string; top: number; bottom: number }) {
  const source = CLIPS[id];
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: STAGE_BG }}>
      {source ? <Clip key={id} source={source} thumb={THUMBS[id]} top={top} bottom={bottom} /> : null}
    </View>
  );
}
