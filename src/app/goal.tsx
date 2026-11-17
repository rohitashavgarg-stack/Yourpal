import React, { useState } from 'react';
import { View } from 'react-native';
import { useLeaveIfPaused } from '@/lib/logGate';
import { Check, Star } from '@/lib/icons';
import { Button, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { goBack, SubPage } from '@/features/shell/parts';
import { goalLine, goalParts, useCoachGoals } from '@/features/shell/goals';
import { Chip } from '@/design-system/primitives/Chip';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { radii, round, fontSizes, fixed } from '@/design-system/tokens';

// The main goal screen: Coach Vikram creates the goals; here the member only picks which one is the primary goal.
// The primary goal is the one Today, Progress and the plan follow.
export default function Goal() {
  useLeaveIfPaused();
  const { c } = useTheme();
  const { toast } = useOverlay();
  const { primary, others, makePrimary } = useCoachGoals();
  const goals = [primary, ...others];
  const [sel, setSel] = useState(primary.id);
  const changed = sel !== primary.id;
  const save = () => {
    makePrimary(sel);
    haptic.success();
    goBack('/profile');
    const g = others.find((x) => x.id === sel);
    toast(`${g?.type ?? 'Goal'} is now your primary goal. Coach Vikram notified`);
  };
  return (
    <SubPage title="Primary goal" fallback="/profile" gap={16} floatingFooter footer={<Button kind="accent" label={changed ? `Make ${others.find((x) => x.id === sel)?.type ?? 'it'} primary` : 'Save primary goal'} disabled={!changed} onPress={save} />}>
      <View style={{ gap: 4, paddingHorizontal: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>Which goal comes first?</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>Today and your plan follow the goal you pick.</Txt>
      </View>
      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {goals.map((g) => {
          const on = g.id === sel;
          const isPrimary = g.id === primary.id;
          const { title, detail } = goalParts(g);
          return (
            <Pressy key={g.id} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${goalLine(g)}${isPrimary ? ', current primary goal' : ''}`} onPress={() => { haptic.tick(); setSel(g.id); }} scaleTo={0.985}
              style={{ minHeight: 76, borderRadius: radii.lg, backgroundColor: c.cardLift, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CardEdge radius={radii.lg} />
              {on ? <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radii.lg, borderWidth: 2, borderColor: c.accent }} /> : null}
              <View style={{ flex: 1, gap: 4 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{title}</Txt>
                {detail ? <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{detail}</Txt> : null}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isPrimary ? <Chip label="Primary" icon={<Star size={13} color={c.accentText} fill={c.accentText} />} /> : null}
                {/* the empty circle needs a line you can see on the dark card */}
                <View style={{ width: 24, height: 24, borderRadius: round(24), borderWidth: on ? 0 : 1.5, borderColor: c.muted, backgroundColor: on ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Check size={14} strokeWidth={3} color={fixed.white} /> : null}
                </View>
              </View>
            </Pressy>
          );
        })}
      </View>
    </SubPage>
  );
}
