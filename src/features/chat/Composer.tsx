import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, ScrollView, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ArrowUp, Camera, Image as ImageIcon, Mic, Plus, Send, Smile, Trash2, X } from '@/lib/icons';
import * as ImagePicker from 'expo-image-picker';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Pressy, Txt } from '@/components/ui';
import { GlassBackdrop } from '@/components/Glass';
import { useOverlay } from '@/components/Overlay';
import { fade, fadeOut } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { EMOJI_GROUPS } from './emoji';

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function Pulse() {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withSequence(withTiming(0.25, { duration: 600 }), withTiming(1, { duration: 600 })), -1, false);
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4F' }, a]} />;
}

function EmojiPanel({ onPick }: { onPick: (e: string) => void }) {
  const { c } = useTheme();
  const [g, setG] = useState(0);
  return (
    <Animated.View entering={fade()} exiting={fadeOut()} style={{ height: 232, borderTopWidth: 1, borderTopColor: c.line }}>
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingTop: 8 }}>
        {EMOJI_GROUPS.map((x, i) => (
          <Pressy key={x.key} accessibilityRole="button" accessibilityLabel={`${x.key} emoji`} onPress={() => setG(i)} scaleTo={0.9}
            style={{ width: 44, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: g === i ? c.accentSoft : 'transparent' }}>
            <Txt style={{ fontSize: 22, lineHeight: 30 }}>{x.icon}</Txt>
          </Pressy>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 6 }}>
        {EMOJI_GROUPS[g].list.map((e) => (
          <Pressy key={e} accessibilityRole="button" accessibilityLabel={e} onPress={() => { haptic.tick(); onPick(e); }} scaleTo={0.8}
            style={{ width: '12.5%', height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontSize: 26, lineHeight: 34 }}>{e}</Txt>
          </Pressy>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function AttachSheet({ onPick }: { onPick: (src: 'library' | 'camera') => void }) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const opt = (label: string, icon: React.ReactNode, src: 'library' | 'camera') => (
    <Pressy key={src} accessibilityRole="button" onPress={() => closeSheet(() => onPick(src))} scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.surface2 }}>
      {icon}
      <Txt style={{ fontFamily: font.semibold }}>{label}</Txt>
    </Pressy>
  );
  return (
    <View style={{ gap: 10, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: 20, lineHeight: 27 }}>Send a photo</Txt>
      {opt('Choose from gallery', <ImageIcon size={22} color={c.accentText} />, 'library')}
      {opt('Take a photo', <Camera size={22} color={c.accentText} />, 'camera')}
    </View>
  );
}

export type Outgoing = { text?: string; img?: string; audio?: { uri: string; dur: number } };

// Message box: attach a photo, emoji panel, growing text field, and a mic that turns into send once there is something to send.
export function Composer({ draft, setDraft, onSend, bottomInset, disabled }: { draft: string; setDraft: (t: string) => void; onSend: (m: Outgoing) => void; bottomInset: number; disabled?: boolean }) {
  const { c } = useTheme();
  const { openSheet, toast } = useOverlay();
  const [img, setImg] = useState<string | undefined>();
  const [emoji, setEmoji] = useState(false);
  const [rec, setRec] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const input = useRef<TextInput>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rs = useAudioRecorderState(recorder, 200);

  const canSend = !!draft.trim() || !!img;
  const send = () => {
    if (!canSend) return;
    onSend({ text: draft.trim() || undefined, img });
    setImg(undefined);
    setEmoji(false);
    haptic.light();
  };

  const pick = async (src: 'library' | 'camera') => {
    try {
      const perm = src === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted && Platform.OS !== 'web') {
        toast(src === 'camera' ? 'Camera is off. Allow it in Settings to take a photo.' : 'Photos are off. Allow access in Settings.');
        return;
      }
      const r = src === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setImg(r.assets[0].uri);
        setEmoji(false);
        haptic.mark();
      }
    } catch {
      toast(src === 'camera' ? 'Camera is not available here' : 'Could not open your photos');
    }
  };

  const startRec = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) { setMicOff(true); haptic.error(); return; }
      setMicOff(false);
      setEmoji(false);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRec(true);
      haptic.mark();
    } catch {
      setMicOff(true);
      haptic.error();
    }
  };
  const endRec = async (keep: boolean) => {
    const ms = rs.durationMillis || 0;
    try { await recorder.stop(); } catch {}
    setRec(false);
    try { await setAudioModeAsync({ allowsRecording: false }); } catch {}
    const uri = recorder.uri;
    if (!keep || !uri) return;
    if (ms < 1000) { toast('Record a little longer to send a voice message'); return; }
    onSend({ audio: { uri, dur: Math.round(ms / 1000) } });
    haptic.light();
  };

  const lift = { shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;
  const inner = { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 4 } as const;
  const circle = { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' } as const;

  return (
    <View style={{ backgroundColor: c.bg }}>
      {micOff && (
        <View accessibilityRole="alert" style={{ marginHorizontal: 16, marginTop: 10, padding: 10, borderRadius: 14, backgroundColor: c.warnSoft }}>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: c.warn }}>Microphone is off. Allow it in Settings to send voice messages.</Txt>
        </View>
      )}
      <View style={{ paddingTop: 10, paddingHorizontal: 12, paddingBottom: emoji ? 6 : bottomInset + 10 }}>
        {rec ? (
          <Animated.View entering={fade()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, paddingHorizontal: 6, borderRadius: 28, backgroundColor: c.surface }}>
            <Pressy accessibilityRole="button" accessibilityLabel="Discard recording" onPress={() => { haptic.warn(); endRec(false); }} scaleTo={0.9} style={circle}>
              <Trash2 size={20} color={c.warn} />
            </Pressy>
            <Pulse />
            <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>
              {fmt(rs.durationMillis || 0)}
              <Txt muted style={{ fontSize: 14 }}>{'  Recording…'}</Txt>
            </Txt>
            <Pressy accessibilityRole="button" accessibilityLabel="Send voice message" onPress={() => endRec(true)} scaleTo={0.9} style={[circle, { backgroundColor: c.accent }]}>
              <ArrowUp size={20} strokeWidth={2.4} color="#fff" />
            </Pressy>
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <Pressy accessibilityRole="button" accessibilityLabel="Attach a photo" onPress={() => openSheet(<AttachSheet onPick={pick} />, { label: 'Send a photo' })} scaleTo={0.9} style={[circle, { width: 46, height: 46, borderRadius: 23, overflow: 'hidden' }, lift]}>
              <GlassBackdrop radius={23} />
              <View style={{ zIndex: 2 }}><Plus size={22} color={c.ink} /></View>
            </Pressy>
          <View style={[{ flex: 1, borderRadius: 24, overflow: 'hidden' }, lift]}>
            <GlassBackdrop radius={24} />
            {img && (
              <Animated.View entering={fade()} exiting={fadeOut()} style={{ padding: 10, paddingBottom: 0, flexDirection: 'row', zIndex: 2 }}>
                <View>
                  <Image source={{ uri: img }} accessibilityIgnoresInvertColors style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: c.surface3 }} />
                  <Pressy accessibilityRole="button" accessibilityLabel="Remove photo" onPress={() => setImg(undefined)} scaleTo={0.9} hitSlop={10}
                    style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} color={c.bg} strokeWidth={2.6} />
                  </Pressy>
                </View>
              </Animated.View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingLeft: 12, paddingRight: 4, zIndex: 2 }}>
              <TextInput
                ref={input}
                value={draft}
                onChangeText={setDraft}
                onFocus={() => setEmoji(false)}
                placeholder={img ? 'Add a caption' : 'Message'}
                placeholderTextColor={c.muted}
                accessibilityLabel="Message"
                multiline
                numberOfLines={1}
                editable={!disabled}
                blurOnSubmit={false}
                style={{ flex: 1, minHeight: 46, maxHeight: 112, paddingTop: Platform.OS === 'ios' ? 12 : 11, paddingBottom: 11, paddingHorizontal: 4, fontFamily: font.medium, fontSize: 16, lineHeight: 22, color: c.ink, outlineStyle: 'none' as any, outlineWidth: 0 as any, borderWidth: 0 }}
              />
              <Pressy accessibilityRole="button" accessibilityLabel={emoji ? 'Show keyboard' : 'Emoji'}
                onPress={() => { haptic.tick(); if (emoji) { setEmoji(false); input.current?.focus(); } else { input.current?.blur(); setEmoji(true); } }} scaleTo={0.9} style={inner}>
                <Smile size={22} color={emoji ? c.accent : c.muted} />
              </Pressy>
              {canSend ? (
                <Pressy accessibilityRole="button" accessibilityLabel="Send" onPress={send} scaleTo={0.9} style={[inner, { overflow: 'hidden' }]}>
                  <GlassBackdrop radius={19} tint={`${c.accent}CC`} />
                  <View style={{ zIndex: 2 }}><Send size={19} color="#fff" style={{ marginLeft: -1 }} /></View>
                </Pressy>
              ) : (
                <Pressy accessibilityRole="button" accessibilityLabel="Record a voice message" onPress={startRec} scaleTo={0.9} style={[inner, { overflow: 'hidden' }]}>
                  <GlassBackdrop radius={19} tint={`${c.accent}26`} />
                  <View style={{ zIndex: 2 }}><Mic size={20} color={c.accentText} /></View>
                </Pressy>
              )}
            </View>
          </View>
          </View>
        )}
      </View>
      {emoji && !rec && <EmojiPanel onPick={(e) => setDraft(draft + e)} />}
      {emoji && !rec && <View style={{ height: bottomInset }} />}
    </View>
  );
}
