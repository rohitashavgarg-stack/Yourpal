import React, { useState } from 'react';
import { Image, ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp, Text, View } from 'react-native';
import { Crown } from '@/lib/icons';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Drop your real files into assets/brand/ (same names) and they replace the fallbacks below:
//   wulf-logo.webp (gym) · trainer.jpg (Coach Vikram). The member shows initials unless they add their own photo in My details.
// The placeholders that ship in the repo are 2x2 px, which is how we know nothing was supplied yet.
const LOGO = require('../../assets/brand/wulf-logo.webp');
const COACH = require('../../assets/brand/trainer.jpg');

// The supplied photos are real files now, so the image is always drawn (the fallback sits behind it and shows only if loading fails).
// Not waiting on a load event means the photo can never stay hidden after a remount, e.g. when switching programme or tab.
function Photo({ src, style, fallback, resizeMode }: { src: ImageSourcePropType; style: StyleProp<ImageStyle>; fallback: React.ReactNode; resizeMode?: ImageResizeMode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image source={src} onError={() => setFailed(true)} resizeMode={resizeMode} accessibilityIgnoresInvertColors style={style} />;
}

// Gym logo: the supplied poster is tall (722 x 960) with lettering, so in a small round badge we show just the wolf.
export function GymLogoMark({ size = 40 }: { size?: number }) {
  const iw = size * 1.72, ih = size * 2.29;
  return (
    <View accessibilityLabel="Wulf Fitness" style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#17120E', flexShrink: 0 }}>
      <Photo src={LOGO} style={{ position: 'absolute', width: iw, height: ih, left: -size * 0.36, top: -size * 0.2 }}
        fallback={<View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#E8C89A', fontFamily: font.bold, fontSize: Math.round(size * 0.46), lineHeight: Math.round(size * 0.6) }}>W</Text></View>} />
    </View>
  );
}

// Gold "PT" crown for members with a personal trainer.
export function PremiumBadge({ size = 18 }: { size?: number }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Premium, personal training member" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F5B301', borderWidth: 2, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Crown size={Math.round(size * 0.55)} color="#3A2A00" strokeWidth={2.4} />
    </View>
  );
}

export function PersonAvatar({ who = 'me', size = 44, ring, square, photo }: { who?: 'me' | 'coach'; size?: number; ring?: boolean; square?: boolean; photo?: string | null }) {
  const { c } = useTheme();
  const { state } = useStore();
  const src = COACH;
  const initials = (state.profile.name || 'You').trim().split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'Y';
  const box = { width: size, height: size, borderRadius: square ? Math.round(size * 0.28) : size / 2, flexShrink: 0 } as const;
  const border = ring ? { borderWidth: 2, borderColor: c.surface } : null;
  const premium = who === 'me' && state.sc.member === 'PT member' && size >= 36;
  const fallback = (
    <View accessibilityLabel={who === 'coach' ? 'Coach Vikram' : 'You'} style={[box, { backgroundColor: who === 'coach' ? c.accentSoft : c.accent, alignItems: 'center', justifyContent: 'center' }, border]}>
      <Text style={{ fontFamily: font.semibold, fontSize: Math.round(size * (who === 'coach' ? 0.4 : 0.36)), lineHeight: Math.round(size * 0.5), color: who === 'coach' ? c.accentText : '#fff' }}>{who === 'coach' ? 'V' : initials}</Text>
    </View>
  );
  const custom = who === 'me' ? (photo !== undefined ? photo : state.profile.photo) : undefined;
  const face = custom
    ? <Image source={{ uri: custom }} accessibilityLabel="Your photo" accessibilityIgnoresInvertColors style={[box, { backgroundColor: c.surface3 }, border as any]} />
    : who === 'me' ? fallback
    : <Photo src={src} style={[box, { backgroundColor: c.surface3 }, border as any]} fallback={fallback} />;
  if (!premium) return face;
  const b = Math.max(16, Math.round(size * 0.34));
  return <View style={{ width: size, height: size }}>{face}<View style={{ position: 'absolute', right: -3, bottom: -3 }}><PremiumBadge size={b} /></View></View>;
}
