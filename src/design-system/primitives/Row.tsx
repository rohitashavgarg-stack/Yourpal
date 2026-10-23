import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

/** A horizontal row with the children centred on the cross axis. */
export function Row({ style, children, ...rest }: { style?: StyleProp<ViewStyle>; children: React.ReactNode; collapsable?: boolean }) {
  return <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}
