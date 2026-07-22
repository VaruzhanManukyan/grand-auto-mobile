import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Single source of truth for the floating tab bar's geometry.
// Both the tab bar itself and any screen that needs to reserve
// space above it must read from here — never hardcode these numbers
// in more than one place again.
export const TAB_BAR_HEIGHT = 70;
export const TAB_BAR_MARGIN = -50; // visual gap between bar and system nav/home indicator

export function useTabBarMetrics() {
    const insets = useSafeAreaInsets();
    const bottomOffset = insets.bottom + TAB_BAR_MARGIN; // distance from screen bottom to the bar's bottom edge
    const totalHeight = TAB_BAR_HEIGHT + bottomOffset;   // distance from screen bottom to the bar's TOP edge

    return { bottomOffset, totalHeight, barHeight: TAB_BAR_HEIGHT };
}