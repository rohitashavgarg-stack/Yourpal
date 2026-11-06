import React, { useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Images, Library, Mic, X } from '@/lib/icons';
import { Button, Field, Pressy, Row, Txt } from '@/components/ui';
import { IconButton } from '@/design-system/primitives/Button';
import { useOverlay } from '@/components/Overlay';
import type { MealId } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fixed, fontSizes, radii, round } from '@/design-system/tokens';

/**
 * "Ate something else", the small first step: the camera, a photo from the phone, a box to type in and a button for the food library. Typing, or sending a photo,
 * opens the full page (`/log-chat`) where the log works like a chat. The library opens the food catalogue.
 */
export function AteSomethingElse({ mealId, backTo }: { mealId: MealId; backTo?: () => void }) {
  const { c } = useTheme();
  const { closeSheet, toast } = useOverlay();
  const [perm, askPerm] = useCameraPermissions();
  const [cam, setCam] = useState<CameraView | null>(null);
  const [text, setText] = useState('');

  // go to the full page: the chat takes over from the sheet
  const toChat = (params: Record<string, string>) => closeSheet(() => router.push({ pathname: '/log-chat', params: { mealId, ...params } }));

  const shoot = async () => {
    if (!perm?.granted) { const r = await askPerm(); if (!r.granted) haptic.error(); return; }
    try {
      const p = await cam?.takePictureAsync({ quality: 0.6, skipProcessing: true });
      haptic.light();
      toChat(p?.uri ? { photo: p.uri } : { photo: 'plate' });
    } catch { toChat({ photo: 'plate' }); }
  };
  const choose = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!r.canceled && r.assets?.[0]?.uri) toChat({ photo: r.assets[0].uri });
    } catch { toast('Could not open your photos'); }
  };
  const library = () => closeSheet(() => router.push({ pathname: '/food-library', params: { mealId } }));

  return (
    <>
      {/* no heading: just a cross at the top right */}
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton label="Close" onPress={() => closeSheet()} size={40} radius={round(40)} bg={c.surface2}><X size={18} color={c.ink} /></IconButton>
      </Row>
      <Row style={{ gap: 10, alignItems: 'stretch' }}>
        {/* the camera: the shutter takes the photo and opens the chat, which reads the plate */}
        <View style={{ flex: 1.1, height: 168, borderRadius: radii.card, overflow: 'hidden', backgroundColor: fixed.dark, alignItems: 'center', justifyContent: 'center' }}>
          {perm?.granted ? <CameraView ref={setCam} facing="back" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} /> : (
            <View style={{ alignItems: 'center', gap: 10, padding: 12 }}>
              <Camera size={24} color={fixed.white} />
              <Button kind="white" small label={perm && !perm.canAskAgain ? 'Camera is off' : 'Allow camera'} disabled={!!perm && !perm.canAskAgain} onPress={() => askPerm()} />
            </View>
          )}
          <Pressy accessibilityRole="button" accessibilityLabel="Take a photo of your plate" onPress={shoot} disabled={!perm?.granted} scaleTo={0.92}
            style={{ position: 'absolute', bottom: 12, width: 56, height: 56, borderRadius: round(56), backgroundColor: fixed.white, borderWidth: 4, borderColor: 'rgba(255,255,255,0.45)', opacity: perm?.granted ? 1 : 0.3 }}>
            <View />
          </Pressy>
        </View>
        {/* a photo from the phone */}
        <Pressy accessibilityRole="button" accessibilityLabel="Choose a photo from your phone" onPress={choose} scaleTo={0.97}
          style={{ flex: 1, height: 168, borderRadius: radii.card, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Images size={26} color={c.ink} />
          <Txt style={{ fontFamily: font.semibold }}>Photo gallery</Txt>
          <View style={{ borderRadius: radii.pill, backgroundColor: c.surface2, paddingHorizontal: 14, height: 32, justifyContent: 'center' }}><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19 }}>Choose</Txt></View>
        </Pressy>
      </Row>
      {/* the typing box and the library button beside it: typing opens the chat */}
      <Row style={{ gap: 8 }}>
        <IconButton label="Open the food library" onPress={library} size={56} radius={round(56)} bg={c.cardLift} edge>
          <Library size={22} color={c.ink} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <Field accessibilityLabel="Describe what to log" value={text} onChangeText={setText} placeholder="Describe what to log" returnKeyType="send"
            onFocus={() => toChat({})} onSubmitEditing={() => text.trim() && toChat({ text: text.trim() })}
            trailing={<Pressy accessibilityRole="button" accessibilityLabel="Dictate" onPress={() => toChat({})} hitSlop={8}><Mic size={22} color={c.muted} /></Pressy>} />
        </View>
      </Row>
    </>
  );
}
