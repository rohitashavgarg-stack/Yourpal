import { createAudioPlayer } from 'expo-audio';

// The short two-beep tone for when a timer ends. To change the sound, replace assets/sounds/timer-end.wav.
// It follows the phone's silent switch (on silent there is no sound, the vibration still happens) and mixes with any music playing.
// Every call is wrapped, so a missing or failing sound can never break a screen.
type Player = ReturnType<typeof createAudioPlayer>;
let player: Player | null = null;

export async function playTimerEnd() {
  try {
    if (!player) player = createAudioPlayer(require('../../assets/sounds/timer-end.wav'));
    await player.seekTo(0);
    player.play();
  } catch {}
}
