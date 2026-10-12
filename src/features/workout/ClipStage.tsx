import React from 'react';
import { View } from 'react-native';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Pause, Play } from '@/lib/icons';
import { Pressy } from '@/components/ui';
import { CLIPS } from './clips';

// The clips have a white background, so on a white stage the video reads as filling the whole screen.
export const STAGE_BG = '#FFFFFF';

function Clip({ source, bottom }: { source: number; bottom: number }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play(); });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom, overflow: 'hidden' }}>
        <VideoView player={player} nativeControls={false} contentFit="contain" allowsPictureInPicture={false} style={{ width: '100%', height: '100%' }} />
      </View>
      {/* big play / pause in the middle of the part of the clip that is showing */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom, alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 5 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause the clip' : 'Play the clip'} onPress={() => (isPlaying ? player.pause() : player.play())} scaleTo={0.92}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,14,20,0.72)', alignItems: 'center', justifyContent: 'center', opacity: isPlaying ? 0.55 : 1 }}>
          {isPlaying ? <Pause size={26} color="#fff" fill="#fff" /> : <Play size={26} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />}
        </Pressy>
      </View>
    </>
  );
}

// Full-screen background for an exercise. bottom = height covered by the sheet, so the clip stays centred in what is visible.
export function ClipStage({ id, bottom }: { id: string; bottom: number }) {
  const source = CLIPS[id];
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: STAGE_BG }}>
      {source ? <Clip key={id} source={source} bottom={bottom} /> : null}
    </View>
  );
}
