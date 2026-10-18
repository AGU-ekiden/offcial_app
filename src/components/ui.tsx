// 画面で共通に使う部品

import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';

// ── 文字 ──────────────────────────────────────────────
const variants = StyleSheet.create({
  largeTitle: { fontSize: 30, fontWeight: '800', letterSpacing: 0.2 },
  title: { fontSize: 21, fontWeight: '700' },
  headline: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 23 },
  callout: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
});

type Variant = keyof typeof variants;
type Tone = 'primary' | 'secondary' | 'tertiary' | 'tint' | 'onTint';

export function Text({
  variant = 'body',
  tone = 'primary',
  numeric,
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; numeric?: boolean }) {
  const t = useTheme();
  const color = {
    primary: t.text,
    secondary: t.textSecondary,
    tertiary: t.textTertiary,
    tint: t.tint,
    onTint: t.onTint,
  }[tone];
  return (
    <RNText
      style={[variants[variant], { color }, numeric && styles.numeric, style]}
      maxFontSizeMultiplier={1.6}
      {...rest}
    />
  );
}

// Web 版ではタブが画面の上に出るので、その分を空ける
const WEB_TAB_BAR = Platform.OS === 'web' ? 72 : 0;

// ── 画面の枠（大きな見出し・引っぱって更新・エラー表示） ──
export function Screen({
  title,
  eyebrow,
  right,
  children,
  refreshable = true,
  contentStyle,
}: {
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  children: ReactNode;
  refreshable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { refresh, refreshing } = useAppData();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.screenContent,
        { paddingTop: title ? insets.top + Spacing.md + WEB_TAB_BAR : Spacing.lg, paddingBottom: insets.bottom + 96 },
        contentStyle,
      ]}
      refreshControl={
        refreshable ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.tint} /> : undefined
      }>
      {title ? (
        <View style={styles.screenHeader}>
          <View style={{ flex: 1 }}>
            {eyebrow ? (
              <Text variant="overline" tone="tint">
                {eyebrow}
              </Text>
            ) : null}
            <Text
              variant="largeTitle"
              accessibilityRole="header"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {title}
            </Text>
          </View>
          {right}
        </View>
      ) : null}
      <StatusNotice />
      {children}
    </ScrollView>
  );
}

/** 読み込みに失敗したときのお知らせ（前回のデータは表示したまま） */
function StatusNotice() {
  const t = useTheme();
  const { error, data, isSample } = useAppData();
  if (isSample) {
    return (
      <View style={[styles.notice, { backgroundColor: t.surfaceMuted }]}>
        <Icon name="info" size={16} color={t.textSecondary} />
        <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
          サンプルデータを表示しています（人名・記録は架空です）
        </Text>
      </View>
    );
  }
  if (!error || !data) return null;
  return (
    <View style={[styles.notice, { backgroundColor: t.surfaceMuted }]}>
      <Icon name="wifiOff" size={16} color={t.textSecondary} />
      <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
        {error}
      </Text>
    </View>
  );
}

// ── カード ────────────────────────────────────────────
export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }, padded && styles.cardPadded, style]}>
      {children}
    </View>
  );
}

/** 押せるもの（押している間だけ少し沈む） */
export function Tap({
  style,
  children,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [style, pressed && { opacity: 0.72, transform: [{ scale: 0.985 }] }]}
      {...rest}>
      {children}
    </Pressable>
  );
}

// ── 見出し ────────────────────────────────────────────
export function Section({
  title,
  action,
  onAction,
  children,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <Text variant="title" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </Text>
        {action && onAction ? (
          <Tap onPress={onAction} hitSlop={8} accessibilityLabel={`${title}：${action}`}>
            <Text variant="callout" tone="tint" style={{ fontWeight: '600' }}>
              {action}
            </Text>
          </Tap>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// ── 小さなラベル ──────────────────────────────────────
export function Pill({
  label,
  color,
  solid,
  style,
}: {
  label: string;
  color?: string;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const c = color ?? t.tint;
  return (
    <View
      style={[
        styles.pill,
        solid
          ? { backgroundColor: c }
          : { backgroundColor: 'transparent', borderColor: c, borderWidth: StyleSheet.hairlineWidth * 2 },
        style,
      ]}>
      <Text variant="caption" style={{ color: solid ? '#fff' : c, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

export function genderColor(t: ReturnType<typeof useTheme>, gender: string) {
  if (gender === '男子') return t.men;
  if (gender === '女子') return t.women;
  return t.mid;
}

// ── 部員の写真（無ければ頭文字） ──────────────────────
export function Avatar({
  uri,
  name,
  size = 56,
  radius = Radius.md,
}: {
  uri?: string;
  name: string;
  size?: number;
  radius?: number;
}) {
  const t = useTheme();
  const box = { width: size, height: size * 1.25, borderRadius: radius };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[box, { backgroundColor: t.surfaceMuted }]}
        contentFit="cover"
        contentPosition="top"
        transition={200}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View style={[box, styles.center, { backgroundColor: t.tintSoft }]}>
      <Text style={{ color: t.tint, fontSize: size * 0.36, fontWeight: '700' }}>{name.slice(0, 1)}</Text>
    </View>
  );
}

// ── 一覧の1行 ─────────────────────────────────────────
export function Row({
  icon,
  title,
  subtitle,
  right,
  onPress,
  showChevron = !!onPress,
  style,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const body = (
    <View style={[styles.row, style]}>
      {icon ? <Icon name={icon} size={20} color={t.tint} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" style={{ fontWeight: '600' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron ? <Icon name="chevron" size={14} color={t.textTertiary} /> : null}
    </View>
  );
  return onPress ? <Tap onPress={onPress}>{body}</Tap> : body;
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginLeft: inset }} />;
}

// ── 公式サイトへの案内 ────────────────────────────────
export function openExternal(url: string) {
  if (!url) return;
  WebBrowser.openBrowserAsync(url).catch(() => {});
}

export function SiteLink({ label, url, style }: { label: string; url: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  if (!url) return null;
  return (
    <Tap onPress={() => openExternal(url)} accessibilityRole="link" style={style}>
      <View style={[styles.siteLink, { borderColor: t.border, backgroundColor: t.surface }]}>
        <Text variant="callout" tone="tint" style={{ flex: 1, fontWeight: '600' }}>
          {label}
        </Text>
        <Icon name="external" size={16} color={t.tint} />
      </View>
    </Tap>
  );
}

// ── 空・読み込み中 ────────────────────────────────────
export function EmptyState({ icon = 'info', title, message }: { icon?: IconName; title: string; message?: string }) {
  const t = useTheme();
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={32} color={t.textTertiary} />
      <Text variant="headline" tone="secondary" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text variant="callout" tone="tertiary" style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

/** 初回の読み込み中・失敗時（保存データもないとき） */
export function DataGate({ children }: { children: ReactNode }) {
  const { data, status, error, refresh } = useAppData();
  const t = useTheme();
  if (data) return <>{children}</>;
  if (status === 'loading') {
    return (
      <View style={{ gap: Spacing.md }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.skeleton, { backgroundColor: t.surfaceMuted }]} />
        ))}
      </View>
    );
  }
  return (
    <View style={{ gap: Spacing.lg, alignItems: 'center' }}>
      <EmptyState icon="wifiOff" title="読み込めませんでした" message={error ?? undefined} />
      <Tap onPress={refresh}>
        <View style={[styles.button, { backgroundColor: t.tint }]}>
          <Text variant="callout" tone="onTint" style={{ fontWeight: '700' }}>
            もう一度読み込む
          </Text>
        </View>
      </Tap>
    </View>
  );
}

// ── ボタン ────────────────────────────────────────────
export function Button({
  label,
  icon,
  onPress,
  kind = 'primary',
  style,
  accessibilityLabel,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  kind?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const primary = kind === 'primary';
  return (
    <Tap onPress={onPress} style={style} accessibilityLabel={accessibilityLabel ?? label}>
      <View style={[styles.button, primary ? { backgroundColor: t.tint } : { backgroundColor: t.tintSoft }]}>
        {icon ? <Icon name={icon} size={18} color={primary ? t.onTint : t.tint} /> : null}
        <Text variant="callout" style={{ fontWeight: '700', color: primary ? t.onTint : t.tint }}>
          {label}
        </Text>
      </View>
    </Tap>
  );
}

// ── 切り替え（予定／結果 など） ───────────────────────
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: t.surfaceMuted }, style]} accessibilityRole="tablist">
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && [styles.segmentActive, { backgroundColor: t.surface }]]}>
            <Text
              variant="callout"
              style={{ fontWeight: active ? '700' : '500', color: active ? t.text : t.textSecondary }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const numericStyle: TextStyle = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
  screenContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  screenHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, marginBottom: -Spacing.sm },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  cardPadded: { padding: Spacing.lg },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, minHeight: 48 },
  siteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  skeleton: { height: 96, borderRadius: Radius.lg },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.pill,
    minHeight: 48,
  },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: Radius.md },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md - 3 },
  segmentActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
