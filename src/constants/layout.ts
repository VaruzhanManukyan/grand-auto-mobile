import { Platform } from 'react-native';

// Matches the custom floating tab bar's own fixed geometry
// (AppTabs: bottom: 30 + height: 70 = 100), with a bit of extra
// clearance added on Android.
//
// That tab bar is drawn with hardcoded values and completely ignores
// safe-area insets — so anything else that needs to sit visually
// "above" it must anchor to this same fixed number, not to
// insets.bottom. insets.bottom doesn't reliably reflect this custom
// bar's real footprint, and was observed to diverge between a Pixel
// emulator and a real Samsung device.
export const TAB_BAR_CLEARANCE = Platform.OS === 'ios' ? 172 : 98;