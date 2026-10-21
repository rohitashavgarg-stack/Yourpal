import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { ChevronRight } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { font, fontSizes, radii, shadows } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A list inside a white card. One component for the three lists that were called ListCard:
 *   rows       <ListCard rows={[{ l, v, sub, right, onPress, muted, warn }]} />   hairline rows with a left label, a right value and an optional chevron
 *   container  <ListCard>{rows}</ListCard>                                         the card shell only; you place the rows (Profile and Settings)
 *   titled     <ListCard dot title rows={[{ n, s }]} />                            a small coloured dot and title above a card of name and detail rows (workout plan warm-up and cool-down)
 * The variant follows the props: `title` means titled, `children` means container, otherwise rows.
 */
export type ListRow = { l: string; v?: string; sub?: string; right?: React.ReactNode; onPress?: () => void; muted?: boolean; warn?: boolean };
export type TitledRow = { n: string; s: string };
type RowsProps = { rows: ListRow[]; mono?: boolean; style?: StyleProp<ViewStyle>; children?: never; title?: never; dot?: never };
type ContainerProps = { children: React.ReactNode; style?: StyleProp<ViewStyle>; rows?: never; mono?: never; title?: never; dot?: never };
type TitledProps = { title: string; dot: string; rows: TitledRow[]; style?: never; mono?: never; children?: never };
export type ListCardProps = RowsProps | ContainerProps | TitledProps;

export function ListCard(props: ListCardProps) {
  if ('title' in props && props.title !== undefined) return <TitledList {...(props as TitledProps)} />;
  if ('children' in props && props.children !== undefined) return <ContainerList {...(props as ContainerProps)} />;
  return <RowsList {...(props as RowsProps)} />;
}

function RowsList({ rows, mono = true, style }: RowsProps) {
  const { c, isDark } = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: radii.xl, paddingVertical: 4, paddingHorizontal: 16 }, isDark ? {} : shadows.card, style]}>
      {rows.map((r, i) => {
        const inner = (
          <>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt style={{ fontFamily: r.muted ? font.regular : font.medium, color: r.warn ? c.warn : r.muted ? c.muted : c.ink }}>{r.l}</Txt>
              {r.sub ? <Txt v="caption">{r.sub}</Txt> : null}
            </View>
            {r.v != null && <Txt v={mono ? 'mono' : 'body'} style={{ fontSize: fontSizes.sm, color: r.muted ? c.ink : c.muted, textAlign: 'right', flexShrink: 1 }}>{r.v}</Txt>}
            {r.right}
            {r.onPress && <ChevronRight size={16} color={c.muted} />}
          </>
        );
        const st: ViewStyle = { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: c.line };
        return r.onPress
          ? <Pressy key={r.l + i} accessibilityRole="button" onPress={r.onPress} scaleTo={0.99} style={st}>{inner}</Pressy>
          : <View key={r.l + i} style={st}>{inner}</View>;
      })}
    </View>
  );
}

function ContainerList({ children, style }: ContainerProps) {
  const { c, isDark } = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: radii.xl, paddingHorizontal: 18, paddingVertical: 4 }, !isDark && shadows.card, style]}>
      {children}
    </View>
  );
}

function TitledList({ dot, title, rows }: TitledProps) {
  return (
    <View style={{ gap: 8 }}>
      <Row style={{ gap: 6, paddingHorizontal: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: dot }} />
        <Txt v="label">{title}</Txt>
      </Row>
      <Card style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
        {rows.map((w) => (
          <Row key={w.n} style={{ justifyContent: 'space-between', gap: 10, minHeight: 40 }}>
            <Txt style={{ fontFamily: font.medium, flexShrink: 1 }}>{w.n}</Txt>
            <Txt v="caption">{w.s}</Txt>
          </Row>
        ))}
      </Card>
    </View>
  );
}
