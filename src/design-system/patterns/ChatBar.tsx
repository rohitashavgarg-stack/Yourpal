import React from 'react';
import { TextInput, View, Platform, type TextInputProps } from 'react-native';
import { ArrowUp, Camera, Mic } from '@/lib/icons';
import { Pressy } from '@/components/ui';
import { GlassBackdrop } from '@/components/Glass';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii, fixed, round } from '@/design-system/tokens';

/**
 * The message bar of a chat: a glass round button on the left (an action of the chat: the food library, the attach button), a glass pill with the text field, and at the
 * right end of the pill a small camera and a glass round mic that turns into a send button once there is something to send. It is the same bar as the Coach Vikram chat,
 * so every chat in the app looks and feels the same: same sizes, same glass, same spacing.
 */
export function ChatBar({
  value, onChangeText, placeholder, leftIcon, leftLabel, onLeft, onCamera, onMic, onSend, onFocus, autoFocus, bottomInset = 0, readOnlyField, onSheet,
}: {
  value: string; onChangeText: (t: string) => void; placeholder: string;
  leftIcon: React.ReactNode; leftLabel: string; onLeft: () => void;
  /** The camera inside the pill. Left out, there is none. */
  onCamera?: () => void;
  onMic: () => void; onSend: () => void; onFocus?: () => void; autoFocus?: boolean;
  /** Space under the bar (the keyboard or the home indicator). */
  bottomInset?: number;
  readOnlyField?: boolean;
  /** The bar sits inside a bottom sheet: no page-colour strip behind it, so only the glass shows. */
  onSheet?: boolean;
}) {
  const { c } = useTheme();
  const canSend = !!value.trim();
  const lift = { shadowColor: fixed.shadow, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;
  const inner = { width: 38, height: 38, borderRadius: round(38), alignItems: 'center', justifyContent: 'center', marginBottom: 4 } as const;
  const props: TextInputProps = { value, onChangeText, placeholder, placeholderTextColor: c.muted, accessibilityLabel: placeholder, returnKeyType: 'send', onSubmitEditing: onSend, onFocus, autoFocus };
  return (
    <View style={{ paddingTop: 10, paddingHorizontal: 12, paddingBottom: bottomInset + 10, backgroundColor: onSheet ? 'transparent' : c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel={leftLabel} onPress={onLeft} scaleTo={0.9} style={[{ width: 46, height: 46, borderRadius: round(46), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, lift]}>
          <GlassBackdrop radius={23} />
          <View style={{ zIndex: 2 }}>{leftIcon}</View>
        </Pressy>
        <View style={[{ flex: 1, minWidth: 0, borderRadius: radii.card, overflow: 'hidden' }, lift]}>
          <GlassBackdrop radius={24} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingLeft: 16, paddingRight: 4, zIndex: 2 }}>
            <TextInput
              {...props}
              editable={!readOnlyField}
              style={{ flex: 1, minWidth: 0, minHeight: 46, paddingTop: Platform.OS === 'ios' ? 12 : 11, paddingBottom: 11, paddingHorizontal: 4, fontFamily: font.medium, fontSize: fontSizes.basePlus, lineHeight: 22, color: c.ink, outlineStyle: 'none' } as never}
            />
            {onCamera ? (
              <Pressy accessibilityRole="button" accessibilityLabel="Choose a photo" onPress={onCamera} scaleTo={0.9} style={inner}>
                <Camera size={22} color={c.muted} />
              </Pressy>
            ) : null}
            {canSend ? (
              <Pressy accessibilityRole="button" accessibilityLabel="Send" onPress={onSend} scaleTo={0.9} style={[inner, { overflow: 'hidden' }]}>
                <GlassBackdrop radius={19} tint={`${c.accent}CC`} />
                <View style={{ zIndex: 2 }}><ArrowUp size={20} strokeWidth={2.4} color={fixed.white} /></View>
              </Pressy>
            ) : (
              <Pressy accessibilityRole="button" accessibilityLabel="Dictate" onPress={onMic} scaleTo={0.9} style={[inner, { overflow: 'hidden' }]}>
                <GlassBackdrop radius={19} tint={`${c.accent}26`} />
                <View style={{ zIndex: 2 }}><Mic size={20} color={c.accentText} /></View>
              </Pressy>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
