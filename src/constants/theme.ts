// 色・余白・文字の大きさ。色は公式サイトと同じ青学グリーンを基準にする。

import { Platform } from 'react-native';

const brand = {
  deep: '#00403E',
  green: '#005C59',
  mid: '#007B78',
  bright: '#00A59F',
};

export const Colors = {
  light: {
    ...brand,
    text: '#0E1A19',
    textSecondary: '#5A6967',
    textTertiary: '#8A9896',
    background: '#F4F7F6',
    surface: '#FFFFFF',
    surfaceMuted: '#EAF1F0',
    border: '#DCE5E3',
    tint: brand.green,
    tintSoft: '#E0F1EF',
    onTint: '#FFFFFF',
    men: '#1F5FAF',
    women: '#B03A72',
    gold: '#B8860B',
    danger: '#B42318',
  },
  dark: {
    ...brand,
    text: '#EEF5F4',
    textSecondary: '#A7B6B4',
    textTertiary: '#73827F',
    background: '#0A1110',
    surface: '#141D1C',
    surfaceMuted: '#1C2827',
    border: '#26332F',
    tint: '#3CC1B9',
    tintSoft: '#123331',
    onTint: '#04201E',
    men: '#7FB0F0',
    women: '#F08DBB',
    gold: '#E2B44A',
    danger: '#F97066',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const Fonts = {
  // 数字（記録・日付）は等幅数字で揃える
  numeric: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  rounded: Platform.select({ ios: 'ui-rounded', default: undefined }),
};

export const MaxContentWidth = 720;
