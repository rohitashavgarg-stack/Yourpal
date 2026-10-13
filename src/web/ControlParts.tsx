import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '@/theme/tokens';

// Building blocks of the structured "Demo controls" panel: cards with a titled header, segmented switches, chips and a screen list.
export const P = { ink: '#12151C', muted: '#5C6370', line: '#E8ECF3', tint: '#F1F3F9', accent: '#2F4FD6', accentSoft: '#E6EBFF' };

type IconC = React.ComponentType<{ size?: number; color?: string }>;

export function PanelCard({ icon: Icon, title, pill, children }: { icon: IconC; title: string; pill?: { label: string; tone?: 'good' | 'info' }; children: React.ReactNode }) {
  const tone = pill?.tone === 'good' ? { bg: '#E3F6EC', fg: '#0F8A5F' } : { bg: P.accentSoft, fg: P.accent };
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: P.line, padding: 14, gap: 12, shadowColor: '#101828', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: P.accentSoft }}>
          <Icon size={14} color={P.accent} />
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5, lineHeight: 17, color: P.accent }}>{title}</Text>
        </View>
        {pill ? <View style={{ height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: tone.bg, justifyContent: 'center' }}><Text style={{ fontFamily: font.semibold, fontSize: 11.5, lineHeight: 16, color: tone.fg }}>{pill.label}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

export const FieldLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 0.6, color: P.muted, textTransform: 'uppercase' }}>{children}</Text>
);

// Two or three options: one tinted track with a white thumb under the chosen one. More options wrap into chips.
export function Choice({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  const seg = options.length <= 3;
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      {seg ? (
        <View style={{ flexDirection: 'row', padding: 3, borderRadius: 14, backgroundColor: P.tint, gap: 2 }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={[{ flex: 1, minHeight: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }, on && { backgroundColor: '#fff', shadowColor: '#101828', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }]}>
                <Text numberOfLines={1} style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 12.5, lineHeight: 17, color: on ? P.accent : P.muted }}>{o}</Text>
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
                style={{ minHeight: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: on ? P.accentSoft : P.tint, borderWidth: 1, borderColor: on ? P.accent : 'transparent', justifyContent: 'center' }}>
                <Text style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 12.5, lineHeight: 17, color: on ? P.accent : P.ink }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// A row of one-off actions (Redo ...): tapping runs it, nothing stays selected.
export function Actions({ label, options, onPick }: { label: string; options: string[]; onPick: (v: string) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => (
          <Pressable key={o} accessibilityRole="button" onPress={() => onPick(o)} style={{ minHeight: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: P.tint, justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 17, color: P.ink }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// The big time and the day-colour track.
export function TrackBar({ pct }: { pct: number }) {
  return (
    <View pointerEvents="none" style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
      <LinearGradient colors={['#3B3F9E', '#F6B58B', '#BFD9F4', '#6C7BD6', '#3B3F9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8 }} />
      <View style={{ position: 'absolute', left: `${pct}%`, right: 0, top: 0, bottom: 0, backgroundColor: 'transparent' }} />
    </View>
  );
}

export function QuickTime({ icon: Icon, label, time, onPress }: { icon: IconC; label: string; time: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Jump to ${label}, ${time}`} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16, backgroundColor: P.tint }}>
      <Icon size={20} color={P.muted} />
      <View>
        <Text style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 18, color: P.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: 15, color: P.muted }}>{time}</Text>
      </View>
    </Pressable>
  );
}

export function ScreenItem({ icon: Icon, label, on, onPress }: { icon: IconC; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 10, borderRadius: 12, backgroundColor: on ? P.accentSoft : 'transparent' }}>
      <Icon size={17} color={on ? P.accent : P.muted} />
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: on ? font.semibold : font.medium, fontSize: 13, lineHeight: 18, color: on ? P.accent : P.ink }}>{label}</Text>
      {on ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: P.accent }} /> : null}
    </Pressable>
  );
}
