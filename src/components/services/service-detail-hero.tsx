import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { ServiceCenter } from '@/types/service.types';

interface ServiceDetailHeroProps {
    center: ServiceCenter;
    scrollY: Animated.Value;
    heroHeight: number;
    onBack: () => void;
    onShare: () => void;
}

export function ServiceDetailHero({ center, scrollY, heroHeight, onBack, onShare }: ServiceDetailHeroProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const insets = useSafeAreaInsets();
    // Photo fades in once it's actually loaded instead of popping in,
    // and simply never animates when there's no photoUrl at all.
    const photoOpacity = useRef(new Animated.Value(0)).current;

    // Classic stretchy-header trick: pulling down past the top grows the
    // hero instead of showing whitespace, and it gets a subtle parallax
    // lag once the content scrolls up past it.
    const heroTranslate = scrollY.interpolate({
        inputRange: [-heroHeight, 0, heroHeight],
        outputRange: [-heroHeight / 3, 0, heroHeight * 0.4],
        extrapolateRight: 'clamp',
    });
    const heroScale = scrollY.interpolate({
        inputRange: [-heroHeight, 0],
        outputRange: [2.2, 1],
        extrapolateRight: 'clamp',
    });

    // The compact glass title bar only fades in once the hero has mostly
    // scrolled out of view, so it doesn't compete with the big title the
    // whole time.
    const titleBarOpacity = scrollY.interpolate({
        inputRange: [heroHeight - 90, heroHeight - 30],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={{ height: heroHeight }}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { transform: [{ translateY: heroTranslate }, { scale: heroScale }] },
                ]}
            >
                <LinearGradient
                    colors={[theme.accent, '#1a1a1a']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {center.photoUrl ? (
                    <Animated.Image
                        source={{ uri: center.photoUrl }}
                        resizeMode="cover"
                        style={[StyleSheet.absoluteFill, { opacity: photoOpacity }]}
                        onLoad={() =>
                            Animated.timing(photoOpacity, {
                                toValue: 1,
                                duration: 350,
                                useNativeDriver: true,
                            }).start()
                        }
                    />
                ) : (
                    <View style={styles.heroIconWrap}>
                        <Ionicons name="car-sport-sharp" size={96} color="rgba(255,255,255,0.35)" />
                    </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
            </Animated.View>

            <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                    {center.name}
                </Text>
                {center.rating != null && (
                    <View style={styles.ratingPill}>
                        <Ionicons name="star" size={13} color="#FFD60A" />
                        <Text style={styles.ratingText}>
                            {center.rating.toFixed(1)}
                            {center.ratingCount != null ? ` · ${center.ratingCount}` : ''}
                        </Text>
                    </View>
                )}
            </View>

            <Animated.View
                style={[styles.titleBar, { paddingTop: insets.top, opacity: titleBarOpacity }]}
                pointerEvents="none"
            >
                <AdaptiveGlass style={styles.titleBarGlass} colorScheme={scheme} solidColor={theme.backgroundBar}>
                    <Text style={[styles.titleBarText, { color: theme.text }]} numberOfLines={1}>
                        {center.name}
                    </Text>
                </AdaptiveGlass>
            </Animated.View>

            {/* Floating controls stay visible regardless of scroll position */}
            <View style={[styles.floatingRow, { top: insets.top + 8 }]}>
                <Pressable onPress={onBack}>
                    <AdaptiveGlass style={styles.circleButton} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </AdaptiveGlass>
                </Pressable>
                <Pressable onPress={onShare}>
                    <AdaptiveGlass style={styles.circleButton} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <Ionicons name="share-outline" size={22} color={theme.text} />
                    </AdaptiveGlass>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroIconWrap: {
        alignSelf: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    heroContent: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 20,
        gap: 8,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    ratingText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    titleBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    titleBarGlass: {
        marginHorizontal: 60,
        marginTop: 4,
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    titleBarText: { fontSize: 15, fontWeight: '700' },
    floatingRow: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});