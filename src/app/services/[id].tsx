import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useServicesStore } from '@/store/services.store';
import { ServiceDetailHero } from '@/components/services/service-detail-hero';
import { ServiceDetailServicesGrid } from '@/components/services/service-detail-services-grid';
import { ServiceDetailMap } from '@/components/services/service-detail-map';
import { ServiceRatingInput } from '@/components/services/service-rating-input';
import { NavigatePickerSheet } from '@/components/services/navigate-picker-sheet';
import { LoadingOverlay } from '@/components/loading/loading-overlay'; // Import your custom overlay
import { getAvailableNavigationApps, openWithApp, NavigationApp } from '@/utils/navigation-apps';

const HERO_HEIGHT = 300;

export default function ServiceDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const scheme = useColorScheme();
    const { t } = useTranslation();

    const paramId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { centers, isLoading, fetch, userRatings, rateCenter } = useServicesStore();

    const center = centers.find((c) => String(c.id) === String(paramId)) ?? null;
    const myRating = center ? userRatings?.[center.id] ?? null : null;

    const [isNavPickerOpen, setIsNavPickerOpen] = useState(false);
    const [navApps, setNavApps] = useState<NavigationApp[]>([]);

    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (centers.length === 0) fetch();
    }, [centers.length, fetch]);

    const handleRoutePress = async () => {
        if (!center) return;
        const apps = await getAvailableNavigationApps();
        if (apps.length === 1) {
            openWithApp(apps[0], center);
        } else {
            setNavApps(apps);
            setIsNavPickerOpen(true);
        }
    };

    const handleCallPress = () => {
        if (!center?.phone) return;
        Linking.openURL(`tel:${center.phone.replace(/\s/g, '')}`);
    };

    const handleSharePress = () => {
        if (!center) return;
        Share.share({ message: `${center.name}\n${center.address}\n${center.phone || ''}` });
    };

    const isFetchingInitial = isLoading || (centers.length === 0 && !center);

    if (isFetchingInitial) {
        return <LoadingOverlay visible={true} mode="full" />;
    }

    if (!center) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor: theme.background }]}>
                <Ionicons name="alert-circle-outline" size={40} color={theme.text} style={{ opacity: 0.4 }} />
                <Text style={[styles.notFoundText, { color: theme.text }]}>
                    {t('services.detail.notFound')}
                </Text>
                <Pressable style={[styles.notFoundButton, { backgroundColor: theme.accent }]} onPress={() => router.back()}>
                    <Text style={styles.notFoundButtonText}>{t('common.back')}</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.ScrollView
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ServiceDetailHero
                    center={center}
                    scrollY={scrollY}
                    heroHeight={HERO_HEIGHT}
                    onBack={() => router.back()}
                    onShare={handleSharePress}
                />

                <View style={styles.body}>
                    <AdaptiveGlass style={styles.infoCard} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <InfoRow icon="location-outline" label={center.address} theme={theme} first />
                        <InfoRow icon="time-outline" label={center.workHours} theme={theme} />
                        {center.phone ? (
                            <InfoRow icon="call-outline" label={center.phone} theme={theme} onPress={handleCallPress} />
                        ) : null}
                    </AdaptiveGlass>

                    {center.services?.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {t('services.detail.services')}
                            </Text>
                            <ServiceDetailServicesGrid services={center.services} />
                        </>
                    )}

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('services.detail.rateService')}
                    </Text>
                    <AdaptiveGlass style={styles.ratingCard} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <ServiceRatingInput value={myRating} onRate={(rating) => rateCenter(center.id, rating)} />
                    </AdaptiveGlass>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('services.detail.onMap')}
                    </Text>
                    <ServiceDetailMap center={center} onPress={handleRoutePress} />
                </View>
            </Animated.ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.actionBarWrap} pointerEvents="box-none">
                <AdaptiveGlass style={styles.actionBarInner} colorScheme={scheme} solidColor={theme.backgroundBar}>
                    <Pressable
                        style={[styles.actionButton, styles.actionButtonGhost, { borderColor: theme.accent }]}
                        onPress={handleCallPress}
                    >
                        <Ionicons name="call" size={18} color={theme.accent} />
                        <Text style={[styles.actionButtonGhostText, { color: theme.accent }]}>
                            {t('services.detail.call')}
                        </Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={handleRoutePress}>
                        <Ionicons name="navigate" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>
                            {t('services.detail.route')}
                        </Text>
                    </Pressable>
                </AdaptiveGlass>
            </SafeAreaView>

            <NavigatePickerSheet
                visible={isNavPickerOpen}
                apps={navApps}
                onSelect={(app) => {
                    setIsNavPickerOpen(false);
                    openWithApp(app, center);
                }}
                onClose={() => setIsNavPickerOpen(false)}
            />
        </View>
    );
}

function InfoRow({
                     icon,
                     label,
                     theme,
                     onPress,
                     first,
                 }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    theme: any;
    onPress?: () => void;
    first?: boolean;
}) {
    const Wrapper = onPress ? Pressable : View;
    return (
        <Wrapper style={[styles.infoRow, !first && styles.infoRowBorder]} onPress={onPress}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '1A' }]}>
                <Ionicons name={icon} size={16} color={theme.accent} />
            </View>
            <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={2}>
                {label}
            </Text>
            {onPress && <Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />}
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
    notFoundText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    notFoundButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 },
    notFoundButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    scrollContent: { paddingBottom: 140 },
    body: { paddingHorizontal: 20, paddingTop: 20, gap: 8 },
    infoCard: {
        borderRadius: 20,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    ratingCard: {
        borderRadius: 20,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
    },
    infoRowBorder: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(128,128,128,0.15)',
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: { fontSize: 15, flex: 1, fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 12 },
    actionBarWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    actionBarInner: {
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 8,
        borderRadius: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 18,
    },
    actionButtonGhost: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },
    actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    actionButtonGhostText: { fontWeight: '700', fontSize: 13 },
});