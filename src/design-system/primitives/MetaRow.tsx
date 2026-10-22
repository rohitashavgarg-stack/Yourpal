import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Txt } from '@/components/ui';
import { fontSizes } from '@/design-system/tokens';

export type MetaItem = {
  /** A small icon, drawn by the caller in `color`. */
  icon: React.ReactNode;
  text: string;
};

export type MetaRowProps = {
  items: MetaItem[];
  /** Text colour. Default is the muted text colour of the theme. */
  color: string;
  /** The thin line between two items. */
  dividerColor: string;
  style?: StyleProp<ViewStyle>;
};

/** Facts about something in one quiet line: an icon and a few words each, a thin vertical line between them. It replaces rows of outline chips. */
export function MetaRow({ items, color, dividerColor, style }: MetaRowProps) {
  return (
    <View accessible accessibilityLabel={items.map((i) => i.text).join(', ')} style={[{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', rowGap: 6 }, style]}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={{ width: 1, height: 14, marginHorizontal: 8, backgroundColor: dividerColor }} />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {it.icon}
            <Txt style={{ fontSize: fontSizes.xs, lineHeight: 18, color }}>{it.text}</Txt>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}
