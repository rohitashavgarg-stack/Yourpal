import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { font, light } from '@/theme/tokens';

// Building blocks of the demo-controls panels, in the same language as the app: white cards with a hairline, outline chips that turn black
// when chosen, a tinted track with a black thumb for two or three options, small black icon tiles. The panel always uses the light palette.
export const P = { ink: light.ink, muted: light.muted, line: light.line, chip: light.chipLine, tint: light.surface2, track: light.surface3, bg: light.bg };

type IconC = React.ComponentType<{ size?: number; color?: string }>;

export function PanelCard({ icon: Icon, title, pill, children }: { icon: IconC; title: string; pill?: { label: string; tone?: 'good' | 'info' }; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: P.line, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Icon size={16} color={P.ink} />
          <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: P.ink }}>{title}</Text>
        </View>
        {pill ? <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, borderWidth: 1, borderColor: P.chip, justifyContent: 'center' }}><Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 17, color: P.ink }}>{pill.label}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

export const FieldLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 0.6, color: P.muted, textTransform: 'uppercase' }}>{children}</Text>
);

// Two or three options: a tinted track with a black thumb under the chosen one (like the app's Segmented). More options wrap into outline chips.
export function Choice({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  const seg = options.length <= 3;
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      {seg ? (
        <View style={{ flexDirection: 'row', padding: 3, borderRadius: 20, backgroundColor: P.tint }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={{ flex: 1, minHeight: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: on ? P.ink : 'transparent' }}>
                <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: on ? '#fff' : P.muted }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: on ? '#fff' : P.ink }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// One-off actions (Redo ...): tapping runs it, nothing stays selected.
export function Actions({ label, options, onPick }: { label: string; options: string[]; onPick: (v: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => (
          <Pressable key={o} accessibilityRole="button" onPress={() => onPick(o)} style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, borderColor: P.chip, justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: P.ink }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function QuickTime({ icon: Icon, label, time, onPress }: { icon: IconC; label: string; time: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Jump to ${label}, ${time}`} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: P.line, backgroundColor: P.bg }}>
      <Icon size={18} color={P.ink} />
      <View>
        <Text style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 18, color: P.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 16, color: P.muted }}>{time}</Text>
      </View>
    </Pressable>
  );
}

export function ScreenItem({ icon: Icon, label, on, onPress }: { icon: IconC; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 12, borderRadius: 20, backgroundColor: on ? P.ink : 'transparent' }}>
      <Icon size={17} color={on ? '#fff' : P.muted} />
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: on ? font.semibold : font.medium, fontSize: 13.5, lineHeight: 18, color: on ? '#fff' : P.ink }}>{label}</Text>
    </Pressable>
  );
}
