import React, { useState } from 'react';
import { Image, ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown } from '@/lib/icons';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fixed, onDark } from '@/design-system/tokens';
import { CardEdge } from '@/design-system/primitives/CardEdge';

// Drop your real files into assets/brand/ (same names) and they replace the fallbacks below:
//   wulf-logo.jpg (gym) · trainer.jpg (Coach Vikram). The member shows a silhouette unless they add their own photo in My details.
// The placeholders that ship in the repo are 2x2 px, which is how we know nothing was supplied yet.
const LOGO = require('../../../assets/brand/wulf-logo.jpg');
const COACH = require('../../../assets/brand/trainer.jpg');

// The supplied photos are real files now, so the image is always drawn (the fallback sits behind it and shows only if loading fails).
// Not waiting on a load event means the photo can never stay hidden after a remount, e.g. when switching programme or tab.
function Photo({ src, style, fallback, resizeMode }: { src: ImageSourcePropType; style: StyleProp<ImageStyle>; fallback: React.ReactNode; resizeMode?: ImageResizeMode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image source={src} onError={() => setFailed(true)} resizeMode={resizeMode} accessibilityIgnoresInvertColors style={style} />;
}

// Gym logo: the wolf on black (1064 x 1064), shown in a rounded square (corner 28% of the size). Zoomed a little so the wolf fills the badge.
export function GymLogoMark({ size = 40 }: { size?: number }) {
  const iw = size * 1.35, ih = size * 1.35;
  return (
    <View accessibilityLabel="Wulf Fitness" style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), borderWidth: 1, borderColor: 'rgba(240,170,60,0.5)', overflow: 'hidden', backgroundColor: fixed.black, flexShrink: 0 }}>
      <Photo src={LOGO} style={{ position: 'absolute', width: iw, height: ih, left: -size * 0.155, top: -size * 0.128 }}
        fallback={<View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: onDark.sand, fontFamily: font.bold, fontSize: Math.round(size * 0.46), lineHeight: Math.round(size * 0.6) }}>W</Text></View>} />
    </View>
  );
}

// Gold "PT" crown for members with a personal trainer: a soft gold gradient disc, a ring in the page colour, a thin light edge and a fine outline crown.
export function PremiumBadge({ size = 18 }: { size?: number }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Premium, personal training member" accessible style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: c.bg, overflow: 'hidden' }}>
      <LinearGradient colors={[onDark.goldLight, onDark.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Crown size={Math.round(size * 0.5)} color={onDark.goldInk} strokeWidth={2} />
      </LinearGradient>
      <CardEdge radius={size / 2} from={fixed.white} to={onDark.gold} />
    </View>
  );
}

// The member with no photo: their initials in white on a soft blue gradient, with a thin light ring.
function Initials({ name, size, box, border }: { name: string; size: number; box: object; border: object | null }) {
  const { c } = useTheme();
  const letters = name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || 'Y';
  return (
    <LinearGradient accessibilityLabel="You" colors={[c.heroFrom, c.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[box, { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, border]}>
      <Text style={{ fontFamily: font.semibold, fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.5), letterSpacing: 0.5, color: fixed.white }}>{letters}</Text>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: size / 2, borderWidth: 1, borderColor: fixed.white, opacity: 0.28 }} />
    </LinearGradient>
  );
}

export function PersonAvatar({ who = 'me', size = 44, ring, square, photo }: { who?: 'me' | 'coach'; size?: number; ring?: boolean; square?: boolean; photo?: string | null }) {
  const { c } = useTheme();
  const { state } = useStore();
  const src = COACH;
  const box = { width: size, height: size, borderRadius: square ? Math.round(size * 0.28) : size / 2, flexShrink: 0 } as const;
  const border = ring ? { borderWidth: 2, borderColor: c.surface } : null;
  const premium = who === 'me' && state.sc.member === 'PT member' && size >= 36;
  // The member with no photo gets their initials on a soft blue gradient. The coach keeps the letter V.
  const fallback = who === 'coach' ? (
    <View accessibilityLabel="Coach Vikram" style={[box, { backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }, border]}>
      <Text style={{ fontFamily: font.semibold, fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.5), color: c.accentText }}>V</Text>
    </View>
  ) : (
    <Initials name={state.profile.name} size={size} box={box} border={border} />
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
