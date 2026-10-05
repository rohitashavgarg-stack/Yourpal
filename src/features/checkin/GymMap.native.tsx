import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';

export const hasRealMap = true;

// Wulf Fitness, Vaishali Nagar (sample coordinates for the prototype).
export const GYM = { latitude: 26.9122, longitude: 75.729 };
export const CHECKIN_RADIUS_M = 20;

// Where the member is, as a metre offset east / north of the gym door. Driven by the Check-in edge case.
const OFFSET: Record<'inside' | 'near' | 'far', [number, number]> = { inside: [4, 6], near: [25, 0], far: [100, -98] };
const metres = (e: number, n: number) => ({
  latitude: GYM.latitude + n / 111320,
  longitude: GYM.longitude + e / (111320 * Math.cos((GYM.latitude * Math.PI) / 180)),
});

export function GymMap({ where, off }: { where: 'inside' | 'near' | 'far'; off: boolean }) {
  const { c, isDark } = useTheme();
  const me = useMemo(() => metres(...OFFSET[where]), [where]);
  // Frame the gym and the member together; a fixed span keeps it steady and close.
  const span = where === 'far' ? 0.0042 : 0.0022;
  const region = { latitude: (GYM.latitude + me.latitude) / 2, longitude: (GYM.longitude + me.longitude) / 2, latitudeDelta: span, longitudeDelta: span };
  return (
    <MapView
      key={where}
      style={{ flex: 1 }}
      // Google Maps on Android. iOS uses Apple Maps unless a Google key is built in (see README).
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      initialRegion={region}
      showsCompass={false}
      showsPointsOfInterests={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      <Circle center={GYM} radius={CHECKIN_RADIUS_M} strokeColor={c.accent} strokeWidth={2} fillColor={`${c.accent}33`} />
      <Marker coordinate={GYM} title="Wulf Fitness" description="20 m check-in area" anchor={{ x: 0.5, y: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
            <MapPin size={18} color="#fff" />
          </View>
        </View>
      </Marker>
      {!off && (
        <Marker coordinate={me} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(52,120,246,0.22)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#3478F6', borderWidth: 3, borderColor: '#fff' }} />
          </View>
        </Marker>
      )}
    </MapView>
  );
}
