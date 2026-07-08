import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
    Dimensions,
    StyleProp,
    ViewStyle,
    Platform,
    Pressable
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    interpolate,
    Extrapolation,
    withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useLanguage } from "@/hooks/use-language";
import { Colors } from '@/constants/theme';
import { useRepairsStore } from '@/store/repairs.store';
import { CircularProgress } from './circular-progress';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { RepairDetailsSheet } from './repair-details-sheet';

const SPRING_CONFIG = {
    damping: 18,
    stiffness: 120,
    mass: 0.6,
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const WRAPPER_MARGIN = 16;
const CONTAINER_WIDTH = SCREEN_WIDTH - WRAPPER_MARGIN;
const PEEK = 11;
const GAP = 4;
const ITEM_WIDTH = CONTAINER_WIDTH - PEEK * 2;
const ITEM_EXTENT = ITEM_WIDTH + GAP;

type RepairCardProps = {
    session: any;
    index: number;
    translateX: Animated.SharedValue<number>;
    colors: typeof Colors['light' | 'dark'];
    scheme: 'light' | 'dark';
    onExpand: () => void;
};

const RepairCard = React.memo(function RepairCard({ session, index, translateX, colors, scheme, onExpand }: RepairCardProps) {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const cardStyle = useAnimatedStyle(() => {
        const pos = index * ITEM_EXTENT + translateX.value - PEEK;
        const distance = Math.abs(pos) / ITEM_EXTENT;
        const opacity = interpolate(distance, [0, 0.5, 1], [1, 1, 0.5], Extrapolation.CLAMP);
        const scale = interpolate(distance, [0, 0.5, 1], [1, 1, 0.94], Extrapolation.CLAMP);
        return { opacity, transform: [{ scale }] };
    });

    return (
        <Animated.View style={[{ width: ITEM_WIDTH, overflow: 'hidden', borderRadius: 50,  }, cardStyle]}>
            <Pressable onPress={onExpand}>
                <AdaptiveGlass
                    style={[
                        styles.card,
                        { borderColor: colors.border },
                        Platform.OS === 'ios' && { shadowOpacity: -500 } // Completely removes iOS shadows
                    ]}
                    colorScheme={scheme}
                    solidColor={colors.backgroundBar}
                >
                    <CircularProgress progress={session.progress} trackColor={colors.border} progressColor={colors.accent} />
                    <View style={styles.textBlock}>
                        <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
                            {session.carLabel}
                        </Text>
                        <Text numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {session.serviceLabel} · {t('repairs.miniPlayerEta', { count: session.etaMinutes, lng: currentLanguage })}
                        </Text>
                    </View>
                </AdaptiveGlass>
            </Pressable>
        </Animated.View>
    );
});

type Props = {
    isMoreTab: boolean;
    style?: StyleProp<ViewStyle>;
};

function RepairMiniPlayerInner({ isMoreTab, style }: Props) {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const sessions = useRepairsStore((s) => s.sessions);
    const currentIndex = useRepairsStore((s) => s.currentIndex);
    const setCurrentIndex = useRepairsStore((s) => s.setCurrentIndex);

    const sheetRef = useRef<BottomSheetModal>(null);
    const isSheetOpen = useRef(false);

    useEffect(() => {
        if (isMoreTab && isSheetOpen.current) {
            sheetRef.current?.dismiss();
            isSheetOpen.current = false;
        }
    }, [isMoreTab]);

    const handleExpand = useCallback(() => {
        requestAnimationFrame(() => {
            sheetRef.current?.present();
            isSheetOpen.current = true;
        });
    }, []);

    const handleDismiss = useCallback(() => {
        isSheetOpen.current = false;
    }, []);

    const translateX = useSharedValue(PEEK - currentIndex * ITEM_EXTENT);
    const startX = useSharedValue(0);
    const isGesturing = useSharedValue(false);

    useEffect(() => {
        if (!isGesturing.value) {
            translateX.value = withSpring(PEEK - currentIndex * ITEM_EXTENT, SPRING_CONFIG);
        }
    }, [currentIndex, sessions.length]);

    const panGesture = useMemo(() =>
            Gesture.Pan()
                .minDistance(10)
                .onStart(() => {
                    isGesturing.value = true;
                    startX.value = translateX.value;
                })
                .onUpdate((e) => {
                    translateX.value = startX.value + e.translationX;
                })
                .onEnd((e) => {
                    const distance = e.translationX;
                    const velocity = e.velocityX;

                    const rawIndex = currentIndex - distance / ITEM_EXTENT;
                    let nextIndex = Math.round(rawIndex);

                    if (Math.abs(velocity) > 500) {
                        if (velocity > 0 && currentIndex > 0) {
                            nextIndex = currentIndex - 1;
                        } else if (velocity < 0 && currentIndex < sessions.length - 1) {
                            nextIndex = currentIndex + 1;
                        }
                    }

                    nextIndex = Math.min(Math.max(nextIndex, 0), sessions.length - 1);

                    translateX.value = withSpring(PEEK - nextIndex * ITEM_EXTENT, SPRING_CONFIG, () => {
                        isGesturing.value = false;
                    });

                    if (nextIndex !== currentIndex) {
                        runOnJS(setCurrentIndex)(nextIndex);
                    }
                }),
        [currentIndex, sessions.length, setCurrentIndex]
    );

    const rowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    if (!sessions.length) return null;

    return (
        <>
            <RepairDetailsSheet ref={sheetRef} onDismiss={handleDismiss} />
            <GestureDetector gesture={panGesture}>
                <View style={[{ width: CONTAINER_WIDTH }, style]}>
                    <View style={styles.viewport}>
                        <Animated.View style={[styles.row, rowStyle]}>
                            {sessions.map((session, i) => (
                                <RepairCard
                                    key={session.id}
                                    session={session}
                                    index={i}
                                    translateX={translateX}
                                    colors={colors}
                                    scheme={scheme}
                                    onExpand={handleExpand}
                                />
                            ))}
                        </Animated.View>
                    </View>
                </View>
            </GestureDetector>
        </>
    );
}

export const RepairMiniPlayer = React.memo(RepairMiniPlayerInner);

const styles = StyleSheet.create({
    viewport: { overflow: 'hidden', width: '100%' },
    row: { flexDirection: 'row', gap: GAP },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 50,
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    textBlock: { flex: 1, minWidth: 0 },
    title: { fontSize: 13, fontWeight: '500' },
    subtitle: { fontSize: 12, marginTop: 2 },
});