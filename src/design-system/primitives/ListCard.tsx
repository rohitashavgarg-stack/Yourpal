import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Check, ChevronRight } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
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
type RowsProps = { rows: ListRow[]; mono?: boolean; style?: StyleProp<ViewStyle>; children?: never; title?: never; icon?: never };
type ContainerProps = { children: React.ReactNode; style?: StyleProp<ViewStyle>; rows?: never; mono?: never; title?: never; icon?: never };
type TitledProps = { title: string; icon: React.ReactNode; done?: boolean; rows: TitledRow[]; style?: never; mono?: never; children?: never };
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

// Warm-up and cool-down: a title with how many moves, then numbered rows: the name on the left and the amount as its own small block on the right.
// No extra note lines under the names. On a logged day (`done`) the numbers go and a green check sits at the right end of each row.
function TitledList({ icon, title, rows, done }: TitledProps) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <SectionLabel variant="section" icon={icon} right={<Txt v="caption">{rows.length} moves</Txt>}>{title}</SectionLabel>
      <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
        {rows.map((w, i) => {
          return (
            <Row key={w.n} style={{ gap: 12, minHeight: 52, paddingVertical: 8, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              {!done && (
                <View style={{ width: 24, height: 24, borderRadius: radii.pill, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: c.muted }}>{i + 1}</Txt>
                </View>
              )}
              <Txt style={{ flex: 1, minWidth: 0, fontFamily: font.medium }}>{w.n}</Txt>
              <View style={{ maxWidth: '42%', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: c.surface2 }}>
                <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, textAlign: 'center' }}>{w.s}</Txt>
              </View>
              {done && (
                <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.pill, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={13} color={c.bg} strokeWidth={3} />
                </View>
              )}
            </Row>
          );
        })}
      </Card>
    </View>
  );
}
