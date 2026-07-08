import React, { forwardRef, useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/use-language';
import { Colors } from '@/constants/theme';
import { useRepairsStore } from '@/store/repairs.store';
import { REPAIR_STAGES } from '@/types/repair.types';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
    onDismiss?: () => void;
};

export const RepairDetailsSheet = forwardRef<BottomSheetModal, Props>(({ onDismiss }, ref) => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    const sessions = useRepairsStore((s) => s.sessions);
    const currentIndex = useRepairsStore((s) => s.currentIndex);
    const setCurrentIndex = useRepairsStore((s) => s.setCurrentIndex);

    const flatListRef = useRef<FlatList>(null);
    const internalIndexRef = useRef(currentIndex);
    const [localIndex, setLocalIndex] = useState(currentIndex);

    // snapPoints больше не нужны — высота считается по контенту через enableDynamicSizing

    // Synchronize FlatList when index changes externally
    useEffect(() => {
        setLocalIndex(currentIndex);
        if (sessions.length > 0 && currentIndex !== internalIndexRef.current) {
            internalIndexRef.current = currentIndex;

            requestAnimationFrame(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: currentIndex,
                        animated: true,
                    });
                }
            });
        }
    }, [currentIndex, sessions.length]);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const calculatedIndex = Math.round(offset / SCREEN_WIDTH);

        if (calculatedIndex >= 0 && calculatedIndex < sessions.length) {
            setLocalIndex(calculatedIndex);
        }
    }, [sessions.length]);

    const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const finalIndex = Math.round(offset / SCREEN_WIDTH);

        if (finalIndex >= 0 && finalIndex < sessions.length) {
            internalIndexRef.current = finalIndex;
            setCurrentIndex(finalIndex);
        }
    }, [sessions.length, setCurrentIndex]);

    const handleDotPress = useCallback((index: number) => {
        setCurrentIndex(index);
    }, [setCurrentIndex]);

    if (!sessions.length) return null;

    return (
        <BottomSheetModal
            ref={ref}
            enableDynamicSizing
            enablePanDownToClose
            enableContentPanningGesture
            enableOverDrag={false}
            onDismiss={onDismiss}
            backgroundStyle={{ backgroundColor: colors.background }}
            handleIndicatorStyle={{ backgroundColor: colors.text, width: 70 }}
            style={{ zIndex: 999, elevation: 999 }}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
            )}
        >
            <BottomSheetView style={styles.container}>
                <View style={styles.header}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {t('repairs.headerTitle', { lng: currentLanguage })}
                    </Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={sessions}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    decelerationRate="fast"
                    initialScrollIndex={currentIndex}
                    keyExtractor={(item) => item.id.toString()}
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                    renderItem={({ item: session }) => {
                        return (
                            <View style={styles.slidePage}>
                                <Text style={[styles.carName, { color: colors.textPrimary }]}>
                                    {session.carLabel}
                                </Text>
                                <Text style={[styles.place, { color: colors.textSecondary }]}>
                                    {session.locationLabel} · {t('repairs.mechanicLabel', { name: session.mechanicName, lng: currentLanguage })}
                                </Text>

                                <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement }]}>
                                    <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
                                        {session.serviceLabel}
                                    </Text>
                                    <Text style={[styles.infoSub, { color: colors.textSecondary }]}>
                                        {t('repairs.etaLeft', { count: session.etaMinutes, lng: currentLanguage })}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />

                {sessions.length > 1 && (
                    <View style={styles.dots}>
                        {sessions.map((_, i) => (
                            <Pressable key={i} onPress={() => handleDotPress(i)} hitSlop={8}>
                                <View
                                    style={[styles.dot, { backgroundColor: i === localIndex ? colors.textPrimary : colors.border }]}
                                />
                            </Pressable>
                        ))}
                    </View>
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

RepairDetailsSheet.displayName = 'RepairDetailsSheet';

const styles = StyleSheet.create({
    container: { flex: 1, paddingBottom: 16 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
        paddingTop: 8
    },
    slidePage: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 20
    },
    carName: { fontSize: 22, fontWeight: '500', marginBottom: 4 },
    place: { fontSize: 13, marginBottom: 24 },
    steps: { flexDirection: 'row', marginBottom: 20 },
    step: { flex: 1, alignItems: 'center' },
    stepDot: { width: 9, height: 9, borderRadius: 4.5, marginBottom: 6 },
    stepLabel: { fontSize: 10 },
    infoCard: { borderRadius: 12, padding: 14, marginBottom: 16 },
    infoTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
    infoSub: { fontSize: 13 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
    dot: { width: 6, height: 6, borderRadius: 3 },
});