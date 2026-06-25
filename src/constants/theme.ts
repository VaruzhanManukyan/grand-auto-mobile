/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    icon: "#000000",
    iconSelected: '#ff0000',
    text: '#000000',
    textSelected: '#ff0000',
    opacityContrast: 'rgb(255 0 0 / 0.76)',
    background: '#ffffff',
    backgroundBar: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    skeletonBase: '#E0E0E0',
    skeletonHighlight: '#F5F5F5',
    cardBackground: '#FFFFFF',
    cardBorder: '#C8102E18',
  },
  dark: {
    icon: "#ffffff",
    iconSelected: '#ff0000',
    text: '#ffffff',
    textSelected: '#ff0000',
    opacityContrast: 'rgb(255 0 0 / 0.76)',
    background: '#000000',
    backgroundBar: '#1c1c1e',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    skeletonBase: '#1E1E1E',
    skeletonHighlight: '#2C2C2C',
    cardBackground: '#161616',
    cardBorder: '#C8102E18',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
