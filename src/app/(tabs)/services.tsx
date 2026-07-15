import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useServicesStore,
    useSelectedCenter,
    useFilteredCenters,
    useCityList,
} from '@/store/services.store';
import { useTheme } from '@/hooks/use-theme';
import { useRepairsStore } from '@/store/repairs.store';

// Components
import { ServiceMap } from '@/components/services/service-map';
import { ServiceMiniCard } from '@/components/services/service-mini-card';
import { ServiceList } from '@/components/services/service-list';
import { CityPickerButton } from '@/components/services/city-picker-button';
import { CityPickerSheet } from '@/components/services/city-picker-sheet';
import { NavigatePickerSheet } from '@/components/services/navigate-picker-sheet';

// Utils
import { getAvailableNavigationApps, openWithApp, NavigationApp } from '@/utils/navigation-apps';
import { ServiceCenter } from '@/types/service.types';

export default function ServicesScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const { isLoading, fetch, selectCenter, selectedCenterId, selectedCity, selectCity } = useServicesStore();
    const filteredCenters = useFilteredCenters();
    const cities = useCityList();
    const selectedCenter = useSelectedCenter();
    const sessions = useRepairsStore((s) => s.sessions);

    // UI States
    const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);

    // Navigation States
    const [isNavPickerOpen, setIsNavPickerOpen] = useState(false);
    const [navApps, setNavApps] = useState<NavigationApp[]>([]);
    const [centerToNavigate, setCenterToNavigate] = useState<ServiceCenter | null>(null);

    useEffect(() => {
        fetch();
    }, []);

    // 1. Triggers the smart navigation flow
    const handleRoutePress = async (center: ServiceCenter) => {
        const apps = await getAvailableNavigationApps();
        if (apps.length === 1) {
            // If they only have one maps app (or just the browser fallback), skip the menu and open it immediately
            openWithApp(apps[0], center);
        } else {
            // Otherwise, store the available apps and open the selection sheet
            setNavApps(apps);
            setCenterToNavigate(center);
            setIsNavPickerOpen(true);
        }
    };

    if (isLoading && filteredCenters.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Layer 1: The Canvas */}
            <ServiceMap
                centers={filteredCenters}
                selectedCenterId={selectedCenterId}
                onMarkerPress={(center) => selectCenter(center.id)}
                onMapPress={() => selectCenter(null)}
            />

            {/* Layer 2: Floating City Button */}
            <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
                <View style={styles.headerRow}>
                    <CityPickerButton
                        selectedCity={selectedCity}
                        isOpen={isCityPickerOpen}
                        onPress={() => setIsCityPickerOpen(true)}
                    />
                </View>
            </SafeAreaView>

            {/* Layer 3: Bottom Deck */}
            <View style={[styles.bottomDeck, { bottom: insets.bottom + (sessions.length === 0 ? 10 : 70) }]}>
                {selectedCenter ? (
                    <ServiceMiniCard
                        center={selectedCenter}
                        onPress={() => router.push(`/services/${selectedCenter.id}`)}
                        onRoutePress={() => handleRoutePress(selectedCenter)} // <-- Pass the routing handler down!
                        onClose={() => selectCenter(null)}
                    />
                ) : (
                    <ServiceList
                        centers={filteredCenters}
                        onSelect={selectCenter}
                        isVisible={selectedCenterId === null}
                    />
                )}
            </View>

            {/* Modals: They only render fully when visible */}
            <CityPickerSheet
                visible={isCityPickerOpen}
                cities={cities}
                selectedCity={selectedCity}
                onSelect={(city) => {
                    selectCity(city);
                    setIsCityPickerOpen(false);
                }}
                onClose={() => setIsCityPickerOpen(false)}
            />

            <NavigatePickerSheet
                visible={isNavPickerOpen}
                apps={navApps}
                onSelect={(app) => {
                    setIsNavPickerOpen(false);
                    if (centerToNavigate) openWithApp(app, centerToNavigate);
                }}
                onClose={() => setIsNavPickerOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    bottomDeck: {
        position: 'absolute',
        width: '90%',
        alignSelf: 'center',
        zIndex: 10,
    },
});