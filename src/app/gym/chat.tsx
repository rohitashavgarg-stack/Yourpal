import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Ellipsis, X } from '@/lib/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { PersonAvatar } from '@/components/Brand';
import { coachStore, TOPICS } from '@/features/coach/coach';
import { fade } from '@/theme/motion';
import { Image } from 'react-native';
import { GlassBackdrop } from '@/components/Glass';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { AudioBubble } from '@/features/chat/AudioBubble';
import { Composer, Outgoing } from '@/features/chat/Composer';
import { RoundBtn, Tag } from '@/components/bits';
import { useOverlay, useToastLift } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { gymStore, useGymScenarios } from '@/features/gym/state';
import { ChatOptionsSheet } from '@/features/gym/sheets';
import { cardShadow } from '@/features/progress/parts';

const REPLY = "Got it. I'll check it before your session tomorrow.";
const REPLY_AUDIO = "Thanks for the voice note. I'll listen and reply before your session.";
const REPLY_PHOTO = 'Got the photo. I will have a look and tell you what I see.';

function Dot({ i }: { i: number }) {
  const { c } = useTheme();
  const o = useSharedValue(0.3);
  useEffect(() => { o.value = withDelay(i * 150, withRepeat(withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 650 })), -1, false)); }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.muted, marginHorizontal: 2 }, a]} />;
}

export default function CoachChat() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { state } = useStore();
  const { openSheet } = useOverlay();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const params = useLocalSearchParams<{ ctx?: string; draft?: string }>();
  const coach = coachStore.use();
  const [draft, setDraft] = useState(params.draft ?? '');
  const [ctx, setCtx] = useState<string | undefined>(params.ctx);
  useEffect(() => { coachStore.set({ unread: false }); }, []);
  const scroll = useRef<ScrollView>(null);
  const { isDark } = useTheme();
  useToastLift(insets.bottom + 96);
  const back = () => { if (router.canGoBack()) router.back(); else router.replace('/gym'); };
  useGymScenarios('Gym · Coach chat', [
    { label: 'Chat blocked', options: ['No', 'Yes'], value: g.blocked ? 'Yes' : 'No', onPick: (v) => gymStore.set({ blocked: v === 'Yes' }) },
  ], [], [g.blocked]);
  useEffect(() => { const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60); return () => clearTimeout(t); }, [d.chat.length, g.typing]);

  const deliver = (text: string, kind: 'text' | 'audio' | 'photo' = 'text') => {
    setTimeout(() => set((s) => {
      const l = s.chat.slice();
      for (let i = l.length - 1; i >= 0; i--) if (l[i].me && l[i].t === text && l[i].meta === 'Sending…') { l[i] = { ...l[i], meta: 'Just now · Delivered', failed: false }; break; }
      return { chat: l };
    }), 600);
    if (isPT) {
      setTimeout(() => {
        gymStore.set({ typing: true });
        setTimeout(() => { gymStore.set({ typing: false }); set((s) => ({ chat: [...s.chat, { me: false, t: kind === 'audio' ? REPLY_AUDIO : kind === 'photo' ? REPLY_PHOTO : REPLY, meta: 'Just now' }] })); haptic.light(); }, 1800);
      }, 900);
    }
  };
  const send = (m: Outgoing) => {
    const label = m.text ?? (m.audio ? 'Voice message' : 'Photo');
    const offline = d.offline;
    set((s) => ({ chat: [...s.chat, { me: true, t: label, ...(m.img ? { img: m.img } : {}), ...(m.audio ? { audio: m.audio } : {}), ...(ctx ? { ctx } : {}), meta: offline ? 'Not sent · tap to retry when online' : 'Sending…', failed: offline }] }));
    setDraft(''); setCtx(undefined);
    if (offline) { haptic.error(); return; }
    deliver(label, m.audio ? 'audio' : m.img ? 'photo' : 'text');
  };
  const retry = (idx: number) => {
    if (d.offline) { haptic.error(); return; }
    const m = d.chat[idx];
    set((s) => { const l = s.chat.slice(); l[idx] = { ...l[idx], meta: 'Sending…', failed: false }; return { chat: l }; });
    deliver(m.t);
  };

  const lastMine = d.chat.length > 0 && d.chat[d.chat.length - 1].me;
  const footer = g.blocked ? (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: insets.bottom + 16, gap: 8 }}>
      <Txt muted style={{ textAlign: 'center', fontSize: 14 }}>You blocked this chat. Coach Vikram can’t message you.</Txt>
      <Button kind="secondary" label="Unblock" onPress={() => gymStore.set({ blocked: false })} style={{ height: 48, borderRadius: 24 }} />
    </View>
  ) : (
    <View>
      {ctx ? (
        <Pressy accessibilityRole="button" accessibilityLabel={`About ${ctx}. Remove`} onPress={() => setCtx(undefined)} style={{ alignSelf: 'flex-start', marginLeft: 16, marginTop: 10, height: 32, paddingLeft: 12, paddingRight: 8, borderRadius: 16, backgroundColor: c.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 12, color: c.accentText }}>About: {ctx}</Txt><X size={14} color={c.accentText} />
        </Pressy>
      ) : null}
      <Composer draft={draft} setDraft={setDraft} onSend={send} bottomInset={insets.bottom} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, alignItems: 'center' }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Coach Vikram. View profile" onPress={() => router.push('/coach')} scaleTo={0.97} style={{ alignItems: 'center' }}>
          <PersonAvatar who="coach" size={58} />
          <View style={[{ marginTop: -12, height: 30, paddingLeft: 12, paddingRight: 8, borderRadius: 15, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 2 }, cardShadow(isDark)]}>
            <GlassBackdrop radius={15} />
            <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, zIndex: 2 }}>Coach Vikram</Txt>
            <View style={{ zIndex: 2 }}><ChevronRight size={14} color={c.muted} /></View>
          </View>
        </Pressy>
        <View style={{ position: 'absolute', left: 16, top: insets.top + 8 }}>
          <RoundBtn label="Back" onPress={back} glass style={cardShadow(isDark)}><ChevronLeft size={20} color={c.ink} /></RoundBtn>
        </View>
        <View style={{ position: 'absolute', right: 16, top: insets.top + 8 }}>
          <RoundBtn label="Chat options" glass style={cardShadow(isDark)} onPress={() => openSheet(<ChatOptionsSheet />, { label: 'Chat options' })}><Ellipsis size={20} color={c.ink} /></RoundBtn>
        </View>
      </View>
      <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
        {coach.away && (
          <View accessibilityRole="alert" style={{ padding: 12, borderRadius: 16, backgroundColor: c.warnSoft }}>
            <Txt style={{ fontSize: 13, color: c.warn }}>Coach Vikram is away until Mon 10:00 am, so replies will be slower. Something urgent? Ask the front desk.</Txt>
          </View>
        )}
        {d.chat.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 20 }}>
            <Txt muted style={{ textAlign: 'center' }}>Start the conversation. Ask Coach Vikram about form, your plan or the gym.</Txt>
            <Row style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
              {TOPICS.map((t) => <Pressy key={t.l} accessibilityRole="button" onPress={() => { setDraft(t.draft); setCtx(t.ctx); }} scaleTo={0.95} style={{ height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: c.chipLine, justifyContent: 'center' }}><Txt style={{ fontFamily: font.medium, fontSize: 14 }}>{t.l}</Txt></Pressy>)}
            </Row>
          </View>
        )}
        {d.chat.map((m, i) => {
          const bubble = (
            <View style={{ flexShrink: 1, paddingVertical: m.img ? 6 : 10, paddingHorizontal: m.img ? 6 : 14, borderRadius: 20, backgroundColor: m.me ? c.accent : c.surface }}>
              {m.audio ? <AudioBubble uri={m.audio.uri} dur={m.audio.dur} me={m.me} /> : (
                <View style={{ gap: m.img && m.t !== 'Photo' ? 6 : 0 }}>
                  {m.img ? <Image source={{ uri: m.img }} accessibilityLabel="Photo" accessibilityIgnoresInvertColors style={{ width: 220, height: 220, borderRadius: 14, backgroundColor: c.surface3 }} /> : null}
                  {m.img && m.t === 'Photo' ? null : <Txt style={{ color: m.me ? '#fff' : c.ink }}>{m.t}</Txt>}
                </View>
              )}
            </View>
          );
          return (
            <Animated.View key={`${i}-${m.t}`} entering={fade()} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '86%', gap: 3, alignItems: m.me ? 'flex-end' : 'flex-start' }}>
              {m.ctx ? <Tag label={`from ${m.ctx}`} bg={c.surface2} fg={c.muted} /> : null}
              {m.failed
                ? <Pressy accessibilityRole="button" accessibilityLabel={`${m.t}. Not sent. Tap to retry`} onPress={() => retry(i)}>{bubble}</Pressy>
                : m.me ? bubble : <Row style={{ gap: 8, alignItems: 'flex-end' }}><PersonAvatar who="coach" size={28} />{bubble}</Row>}
              <Txt style={{ fontSize: 11, lineHeight: 15, color: m.failed ? c.warn : c.muted }}>{m.meta}</Txt>
            </Animated.View>
          );
        })}
        {g.typing && (
          <Animated.View entering={fade()} accessible accessibilityLabel="Coach Vikram is typing" style={{ alignSelf: 'flex-start', flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 20, backgroundColor: c.surface }}>
            <Dot i={0} /><Dot i={1} /><Dot i={2} />
          </Animated.View>
        )}
        {!isPT && lastMine && !g.typing && <Txt v="caption" style={{ textAlign: 'center' }}>Coach Vikram will reply here.</Txt>}
        {d.offline && <Txt v="caption" style={{ textAlign: 'center', color: c.warn, fontFamily: font.medium }}>You’re offline · tap a message that didn’t send to retry once you’re back</Txt>}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}
