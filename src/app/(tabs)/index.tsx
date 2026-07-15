/**
 * app/(tabs)/index.tsx
 *
 * Loading strategy: cold start (isLoading, no cached loyaltyUser yet)
 * renders the skeleton layout from components/loading/skeleton-loader,
 * matching the real structure so nothing jumps once data arrives.
 * Warm refresh (pull-to-refresh, or a manual refresh() call once data
 * already exists) keeps the real content mounted and only shows the
 * native RefreshControl spinner — swapping to skeletons on every
 * refresh would flicker away data the user can already see.
 *
 * LoadingOverlay isn't used on this screen: it's a full-screen
 * blocking overlay, which fights with both states above (it'd either
 * cover the skeletons pointlessly, or blank out real content during
 * a routine refresh). It fits better on a blocking action — e.g.
 * submitting a rating or adding a car — wire it into one of those
 * flows if you want it used somewhere.
 */
import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import { useHomeStore } from '@/store/home.store';
import { LoyaltyCard } from '@/components/home/loyalty-card';
import { QuickActions } from '@/components/home/quick-actions';
import { ServiceCard } from '@/components/home/service-card';
import { MyCarsList } from '@/components/home/my-cars-list';
import { Car } from '@/types/cars.types';
import {
    SkeletonBlock,
    BonusBannerSkeleton,
    CarCardSkeleton,
    ServiceCardSkeleton,
} from '@/components/loading/skeleton-loader';
import {useTheme} from "@/hooks/use-theme";

export default function HomeScreen() {
    const theme = useTheme();
    const router = useRouter();

    const {
        cars,
        shop,
        loyaltyUser,
        loyaltyProgress,
        isLoading,
        fetch: fetchHome,
        refresh,
    } = useHomeStore();

    useEffect(() => {
        fetchHome();
    }, [fetchHome]);

    const greetingName = loyaltyUser?.fullName?.split(' ')[0] ?? '';
    const isInitialLoading = isLoading && !loyaltyUser;

    const handleOpenQr = useCallback(() => router.push('/qr'), [router]);
    const handleHistoryPress = useCallback(() => router.push('/history'), [router]);
    const handleCarsPress = useCallback(() => router.push('/cars'), [router]);
    const handleRatePress = useCallback(() => router.push('/rate'), [router]);
    const handleCarPress = useCallback((car: Car) => router.push(`/cars/${car.id}`), [router]);
    const handleAddCarPress = useCallback(() => router.push('/cars/new'), [router]);

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && !isInitialLoading}
                        onRefresh={refresh}
                        tintColor={theme.accent}
                    />
                }
            >
                {isInitialLoading ? (
                    <>
                        <View style={styles.header}>
                            <SkeletonBlock width={140} height={20} borderRadius={4} />
                        </View>

                        <BonusBannerSkeleton />

                        <View style={styles.skeletonRow}>
                            <SkeletonBlock width="30%" height={60} borderRadius={12} />
                            <SkeletonBlock width="30%" height={60} borderRadius={12} />
                            <SkeletonBlock width="30%" height={60} borderRadius={12} />
                        </View>

                        <ServiceCardSkeleton />

                        <View style={{ gap: 12 }}>
                            <SkeletonBlock width={120} height={16} borderRadius={4} />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <CarCardSkeleton />
                                <CarCardSkeleton />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.header}>
                            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
                                Привет, <Text style={{ color: theme.accent }}>{greetingName}</Text>
                            </Text>
                        </View>

                        <LoyaltyCard
                            bonusBalance={loyaltyUser?.currentBonusBalance ?? 0}
                            tierLabel={loyaltyProgress?.level.id}
                            onPress={handleOpenQr}
                        />

                        <QuickActions
                            onHistoryPress={handleHistoryPress}
                            onCarsPress={handleCarsPress}
                            onRatePress={handleRatePress}
                        />

                        {shop && <ServiceCard shop={shop} />}

                        <MyCarsList cars={cars} onCarPress={handleCarPress} onAddCarPress={handleAddCarPress} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 16,
        paddingBottom: 96,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 24 },
    greeting: { fontSize: 16, fontWeight: '500' },
    skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});