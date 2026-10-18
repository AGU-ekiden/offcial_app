import { SymbolView } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// アプリで使うアイコン（iOS は SF Symbols、Android・Web は Material Symbols）
const ICONS = {
  home: { ios: 'house', android: 'home', web: 'home' },
  news: { ios: 'newspaper', android: 'newspaper', web: 'newspaper' },
  races: { ios: 'flag.checkered', android: 'sports_score', web: 'sports_score' },
  team: { ios: 'person.3', android: 'groups', web: 'groups' },
  video: { ios: 'play.rectangle', android: 'smart_display', web: 'smart_display' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  bellFill: { ios: 'bell.fill', android: 'notifications_active', web: 'notifications_active' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  external: { ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  trophy: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  wifiOff: { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return <SymbolView name={ICONS[name]} size={size} tintColor={color ?? theme.text} style={style} />;
}
