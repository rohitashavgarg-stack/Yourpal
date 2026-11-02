import React, { useState } from 'react';
import { View } from 'react-native';
import { Star } from '@/lib/icons';
import { Button, NoteField, Pill, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { FEEDBACK_TAGS, LATER_DAYS, RATING_WORDS } from '@/features/feedback/feedback';

// "How is your gym going?" A star rating, what it is about, and an optional note. The answer goes to the gym's admin.
export function FeedbackSheet({ fromCard }: { fromCard?: boolean }) {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { closeSheet, toast } = useOverlay();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const fb = state.profile.feedback;
  const send = () => {
    if (!rating) return;
    haptic.success();
    closeSheet(() => {
      setProfile({ feedback: { since: fb?.since ?? new Date().toISOString(), lastAt: new Date().toISOString(), last: { rating, tags, note: note.trim() } } });
      toast('Thanks for the feedback');
    });
  };
  const later = () => closeSheet(() => setProfile({ feedback: { since: fb?.since ?? new Date().toISOString(), ...fb, snoozeUntil: new Date(Date.now() + LATER_DAYS * 86400000).toISOString() } }));
  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>How is your gym going?</Txt>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Row style={{ gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressy key={n} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} accessibilityState={{ selected: rating >= n }} onPress={() => { setRating(n); haptic.tick(); }} scaleTo={0.85}
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Star size={36} strokeWidth={1.8} color={rating >= n ? c.warn : c.chipLine} fill={rating >= n ? c.warn : 'transparent'} />
            </Pressy>
          ))}
        </Row>
        <Txt style={{ fontFamily: font.semibold, minHeight: 22, color: c.ink }}>{RATING_WORDS[rating] || ' '}</Txt>
      </View>
      {rating > 0 && (
        <>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {FEEDBACK_TAGS.map((t) => <Pill key={t} label={t} on={tags.includes(t)} onPress={() => setTags((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]))} />)}
          </Row>
          <NoteField value={note} onChangeText={setNote} placeholder="Anything you would like to add? (optional)" accessibilityLabel="Feedback note" minHeight={88} />
        </>
      )}
      <Button kind="accent" label="Send feedback" disabled={!rating} onPress={send} />
      {fromCard && <Button kind="secondary" label="Maybe later" onPress={later} />}
    </View>
  );
}
