/* eslint-disable react-hooks/immutability -- reanimated shared values are written from the swipe gesture */
import React from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { ArrowRightLeft, MoreHorizontal } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';
import type { FoodType } from '@/lib/data';
import { CheckCircle } from '../primitives/CheckCircle';
import { FoodMark } from '../primitives/FoodMark';
import { IconButton } from '../primitives/Button';
import { Tag } from '../primitives/Tag';

/**
 * One food as its own card.
 *   todo     a dashed card with the amount control, the calories and the macros, and the check on the right
 *   eaten    a solid card: the amount as plain text, the calories on the right, the macros in a darker strip (with a menu button if `onMenu` is set)
 *   skipped  the same card faded, name struck through
 * `pick` is for a list the member ticks and then saves (the meal log sheet): a solid card with the tick circle on the right in both states, no dashed line and no macros strip.
 * Swipe left on a todo card (when `onSwap` and `onSkip` are set) to reveal Swap and Skip, 44 px each. Hold the card for the food page (`onHold`).
 */
export type FoodCardState = 'todo' | 'eaten' | 'skipped';

export type FoodCardProps = {
  state: FoodCardState;
  /** A list that is ticked and then saved: solid card, tick circle on the right, no dashed line. */
  pick?: boolean;
  name: string;
  /** The veg, egg or non-veg mark. Left out, no mark. */
  type?: FoodType;
  /** The amount control on a todo card (the stepper). */
  amount?: React.ReactNode;
  /** The amount as plain text, shown on an eaten card ("1 plate"). */
  amountText?: string;
  /** "140 kcal". */
  kcal?: string;
  /** "P 4 · C 26 · F 1 g". On an eaten card it fills the darker strip. */
  macros?: string;
  /** A small tag after the name ("Yours"). */
  tag?: string;
  /** The line under a skipped name. */
  note?: string;
  /** Tap the card (a pick list uses it to toggle). The diet page leaves it out: only the check and the menu respond. */
  onPress?: () => void;
  /** Tap the check circle. */
  onCheck?: () => void;
  /** The three-dot button of an eaten card. */
  onMenu?: () => void;
  /** Hold the card: the food page. */
  onHold?: () => void;
  onSwap?: () => void;
  onSkip?: () => void;
  /** The second swipe button: "Skip", or "Delete" for a food the member added. */
  skipLabel?: string;
  checkLabel?: string;
  /** Spoken label of the whole card. */
  label?: string;
};

const ACTION = 44;                      // the Swap and Skip buttons are 44 px
const SKIP_W = 64;
const GAP = 8;
const REVEAL = ACTION + SKIP_W + GAP * 3;

export function FoodCard({ state, pick, name, type, amount, amountText, kcal, macros, tag, note, onPress, onCheck, onMenu, onHold, onSwap, onSkip, skipLabel = 'Skip', checkLabel, label }: FoodCardProps) {
  const { c } = useTheme();
  const tx = useSharedValue(0);
  const base = useSharedValue(0);
  const eaten = state === 'eaten';
  const skipped = state === 'skipped';
  const canSwipe = state === 'todo' && !!onSwap && !!onSkip;

  const close = () => { tx.value = withTiming(0, { duration: 200 }); base.value = 0; };
  const tick = () => { haptic.light(); };
  const pan = Gesture.Pan().enabled(canSwipe).activeOffsetX([-12, 12]).failOffsetY([-10, 10])
    .onUpdate((e) => { tx.value = Math.max(-REVEAL, Math.min(0, base.value + e.translationX)); })
    .onEnd(() => {
      const open = tx.value < -REVEAL / 2;
      tx.value = withTiming(open ? -REVEAL : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
      if (open && base.value === 0) scheduleOnRN(tick);
      base.value = open ? -REVEAL : 0;
    });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const actions = [
    ...(canSwipe ? [{ name: 'swap', label: 'Swap' }, { name: 'skip', label: skipLabel }] : []),
    ...(onHold ? [{ name: 'details', label: 'Open details' }] : []),
  ];
  const onAction = (n: string) => { if (n === 'swap') onSwap?.(); else if (n === 'skip') onSkip?.(); else if (n === 'details') onHold?.(); };
  const spoken = label ?? `${name}${amountText ? `, ${amountText}` : ''}${skipped ? ', skipped' : kcal ? `, ${kcal}` : ''}`;

  const title = (
    <Row style={{ gap: 8 }}>
      {type ? <FoodMark type={type} size={13} /> : null}
      <Txt numberOfLines={2} style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21, textDecorationLine: skipped ? 'line-through' : 'none' }}>{name}</Txt>
      {tag ? <Tag label={tag} bg={c.accentSoft} fg={c.accentText} /> : null}
    </Row>
  );
  const common = { accessibilityRole: 'button' as const, accessibilityLabel: spoken, accessibilityActions: actions, onAccessibilityAction: (e: { nativeEvent: { actionName: string } }) => onAction(e.nativeEvent.actionName),
    onPress, onLongPress: onHold, delayLongPress: 480, scaleTo: 0.99, haptics: false };

  if (pick) {
    return (
      <Pressy {...common} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 64, paddingVertical: 12, paddingLeft: 14, paddingRight: 6, borderRadius: radii.md, backgroundColor: eaten ? c.goodSoft : c.surface2 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          {title}
          {(amount || amountText || kcal) ? (
            <Row style={{ gap: 10, flexWrap: 'wrap' }}>
              {eaten ? (amountText ? <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>{amountText}</Txt> : null) : (amount ?? (amountText ? <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>{amountText}</Txt> : null))}
              {kcal ? <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{kcal}</Txt> : null}
            </Row>
          ) : null}
          {!eaten && macros ? <Txt v="caption">{macros}</Txt> : null}
        </View>
        <CheckCircle on={eaten} size={40} tone="good" label={checkLabel ?? `${eaten ? 'Unmark' : 'Mark'} ${name}`} onPress={onCheck ?? onPress ?? (() => {})} />
      </Pressy>
    );
  }

  if (eaten) {
    return (
      <Pressy {...common} style={{ borderRadius: radii.md, overflow: 'hidden', backgroundColor: c.surface2 }}>
        <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, gap: 10 }}>
          {title}
          {(amountText || kcal) ? (
            <Row style={{ justifyContent: 'space-between' }}>
              {amountText ? <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20 }}>{amountText}</Txt> : <View />}
              {kcal ? <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{kcal}</Txt> : null}
            </Row>
          ) : null}
        </View>
        {(macros || onMenu) ? (
          <Row style={{ justifyContent: 'space-between', backgroundColor: c.surface3, paddingLeft: 14, paddingRight: 8, paddingVertical: 8, minHeight: 52 }}>
            <Txt v="caption" style={{ flexShrink: 1 }}>{macros}</Txt>
            {onMenu ? (
              <IconButton label={`More for ${name}`} onPress={onMenu} size={36} radius={radii.pill} borderWidth={1.5} borderColor={c.chipLine} hitSlop={4}>
                <MoreHorizontal size={18} color={c.ink} />
              </IconButton>
            ) : null}
          </Row>
        ) : null}
      </Pressy>
    );
  }

  return (
    <View style={{ borderRadius: radii.md, overflow: 'hidden' }}>
      {canSwipe && (
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: REVEAL, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: GAP }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Swap" onPress={() => { close(); onSwap?.(); }} scaleTo={0.94}
            style={{ width: ACTION, height: ACTION, borderRadius: radii.tile, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={20} color={c.bg} />
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel={skipLabel} onPress={() => { close(); onSkip?.(); }} scaleTo={0.94}
            style={{ minWidth: SKIP_W, height: ACTION, paddingHorizontal: 12, borderRadius: radii.tile, backgroundColor: c.surface3, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: skipLabel === 'Delete' ? c.warn : c.ink }}>{skipLabel}</Txt>
          </Pressy>
        </View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View collapsable={false} style={[{ borderRadius: radii.md, backgroundColor: c.surface }, slide]}>
          <Pressy {...common}
            style={{ borderRadius: radii.md, borderWidth: 1.5, borderStyle: skipped ? 'solid' : 'dashed', borderColor: skipped ? 'transparent' : c.chipLine, backgroundColor: skipped ? c.surface2 : 'transparent',
              paddingVertical: 12, paddingLeft: 14, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: skipped ? 0.55 : 1 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
              {title}
              {skipped ? (note ? <Txt v="caption">{note}</Txt> : null) : (
                <>
                  {(amount || kcal) ? (
                    <Row style={{ gap: 10, flexWrap: 'wrap' }}>
                      {amount}
                      {kcal ? <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{kcal}</Txt> : null}
                    </Row>
                  ) : null}
                  {macros ? <Txt v="caption">{macros}</Txt> : null}
                </>
              )}
            </View>
            {onCheck ? <CheckCircle on={false} size={34} tone="good" label={checkLabel ?? `Mark ${name}`} onPress={onCheck} /> : null}
          </Pressy>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
