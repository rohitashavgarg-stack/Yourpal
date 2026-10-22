import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';

/**
 * Text inputs. Field is the one-line field (56 px, optional prefix), NoteField the multi-line note with a character count.
 * Both draw a 1 px line that becomes a 1.5 px accent line on focus and a 1.5 px amber line when `error` is set.
 */
export const Field = React.forwardRef<TextInput, TextInputProps & { error?: boolean; prefix?: string }>(function Field({ error, prefix, style, ...rest }, ref) {
  const { c } = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: radii.xl, borderWidth: focus || error ? 1.5 : 1, borderColor: error ? c.warn : focus ? c.accent : c.line, backgroundColor: c.surface, paddingHorizontal: 18, gap: 10 }}>
      {prefix ? <Text style={{ fontFamily: font.medium, fontSize: fontSizes.basePlus, lineHeight: 21, color: c.muted }}>{prefix}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.muted}
        {...rest}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.basePlus, color: c.ink, height: '100%' as any, outlineStyle: 'none' as any }, style]}
      />
    </View>
  );
});

export function NoteField({ value, onChangeText, placeholder, accessibilityLabel, autoFocus, error, maxLength = 500, minHeight = 112 }: {
  value: string; onChangeText: (t: string) => void; placeholder?: string; accessibilityLabel?: string; autoFocus?: boolean; error?: boolean; maxLength?: number; minHeight?: number;
}) {
  const { c } = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <View>
      <View style={{ minHeight, borderRadius: radii.lg, borderWidth: focus || error ? 1.5 : 1, borderColor: error ? c.warn : focus ? c.accent : c.line, backgroundColor: c.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          accessibilityLabel={accessibilityLabel}
          autoFocus={autoFocus}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ minHeight: minHeight - 34, maxHeight: 220, fontFamily: font.medium, fontSize: fontSizes.basePlus, lineHeight: 23, color: c.ink, padding: 0, outlineStyle: 'none' as any }}
        />
      </View>
      <Text style={{ alignSelf: 'flex-end', marginTop: 4, marginRight: 8, fontFamily: font.regular, fontSize: fontSizes.xs, lineHeight: 17, color: c.muted }}>{value.length}/{maxLength}</Text>
    </View>
  );
}
