import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolateColor,
} from 'react-native-reanimated';
import { Colors } from "@/constants/theme";

interface SkeletonBlockProps {
    width?: number | `${number}%`;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonBlock({
                                  width = '100%',
                                  height = 16,
                                  borderRadius = 6,
                                  style,
                              }: SkeletonBlockProps) {
    const scheme = useColorScheme();
    const currentTheme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;
    const colors = Colors[currentTheme];

    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            shimmer.value,
            [0, 1],
            [colors.skeletonBase, colors.skeletonHighlight]
        ),
        opacity: 0.6 + shimmer.value * 0.4,
    }));

    return (
        <Animated.View
            style={[{ width, height, borderRadius }, shimmerStyle, style]}
        />
    );
}

export function ServiceCardSkeleton() {
    const scheme = useColorScheme();
    const currentTheme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;
    const colors = Colors[currentTheme];

    return (
        <View style={[
            styles.serviceCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }
        ]}>
            <SkeletonBlock width={52} height={52} borderRadius={12} />
            <View style={styles.serviceCardText}>
                <SkeletonBlock width="60%" height={14} />
                <SkeletonBlock width="40%" height={11} style={{ marginTop: 8 }} />
            </View>
            <SkeletonBlock width={56} height={28} borderRadius={8} />
        </View>
    );
}

export function CarCardSkeleton() {
    const scheme = useColorScheme();
    const currentTheme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;
    const colors = Colors[currentTheme];

    return (
        <View style={[
            styles.carCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }
        ]}>
            <SkeletonBlock height={120} borderRadius={12} />
            <View style={{ padding: 12, gap: 8 }}>
                <SkeletonBlock width="70%" height={15} />
                <SkeletonBlock width="45%" height={11} />
                <View style={styles.carCardRow}>
                    <SkeletonBlock width={64} height={24} borderRadius={6} />
                    <SkeletonBlock width={64} height={24} borderRadius={6} />
                </View>
            </View>
        </View>
    );
}

export function ProfileSkeleton() {
    return (
        <View style={styles.profile}>
            <SkeletonBlock width={80} height={80} borderRadius={40} />
            <View style={styles.profileText}>
                <SkeletonBlock width={160} height={18} />
                <SkeletonBlock width={100} height={12} style={{ marginTop: 8 }} />
            </View>
            <View style={styles.profileStats}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={styles.profileStat}>
                        <SkeletonBlock width={40} height={22} borderRadius={4} />
                        <SkeletonBlock width={52} height={10} style={{ marginTop: 6 }} />
                    </View>
                ))}
            </View>
        </View>
    );
}

export function BonusBannerSkeleton() {
    const scheme = useColorScheme();
    const currentTheme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;
    const colors = Colors[currentTheme];

    return (
        <View style={[
            styles.bonusBanner,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }
        ]}>
            <View style={{ gap: 8, flex: 1 }}>
                <SkeletonBlock width="50%" height={12} />
                <SkeletonBlock width="35%" height={28} />
                <SkeletonBlock width="65%" height={10} style={{ marginTop: 4 }} />
            </View>
            <SkeletonBlock width={56} height={56} borderRadius={28} />
        </View>
    );
}

export function ServicesListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <View style={{ gap: 12 }}>
            {Array.from({ length: count }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 14,
        gap: 12,
        borderWidth: 1,
    },
    serviceCardText: {
        flex: 1,
        gap: 0,
    },
    carCard: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
    },
    carCardRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    profile: {
        alignItems: 'center',
        gap: 16,
        paddingVertical: 24,
    },
    profileText: {
        alignItems: 'center',
        gap: 0,
    },
    profileStats: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 8,
    },
    profileStat: {
        alignItems: 'center',
    },
    bonusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        gap: 16,
    },
});