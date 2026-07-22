import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
    useServicesStore,
    useSelectedCenter,
    useFilteredCenters,
    useCityList,
} from '@/store/services.store';
import { useTheme } from '@/hooks/use-theme';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';

import { ServiceMap } from '@/components/services/service-map';
import { ServiceMiniCard } from '@/components/services/service-mini-card';
import { ServiceList } from '@/components/services/service-list';
import { CityPickerSheet } from '@/components/services/city-picker-sheet';
import { ServiceFilterSheet } from '@/components/services/service-filter-sheet';
import { NavigatePickerSheet } from '@/components/services/navigate-picker-sheet';

import { getAvailableNavigationApps, openWithApp, NavigationApp } from '@/utils/navigation-apps';
import { ServiceCenter } from '@/types/service.types';

export default function ServicesScreen() {
    const router = useRouter();
    const theme = useTheme();

    const {
        isLoading,
        fetch,
        selectCenter,
        selectedCenterId,
        selectedCity,
        selectCity,
        selectedServices,
        toggleService,
        resetServices,
    } = useServicesStore();
    const filteredCenters = useFilteredCenters();
    const cities = useCityList();
    const selectedCenter = useSelectedCenter();

    const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
    const [isServiceFilterOpen, setIsServiceFilterOpen] = useState(false);
    const [isNavPickerOpen, setIsNavPickerOpen] = useState(false);
    const [navApps, setNavApps] = useState<NavigationApp[]>([]);
    const [centerToNavigate, setCenterToNavigate] = useState<ServiceCenter | null>(null);

    useEffect(() => {
        fetch();
    }, []);

    const handleRoutePress = async (center: ServiceCenter) => {
        const apps = await getAvailableNavigationApps();
        if (apps.length === 1) {
            openWithApp(apps[0], center);
        } else {
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
            {/* Map component handles panning & marker presses */}
            <ServiceMap
                centers={filteredCenters}
                selectedCenterId={selectedCenterId}
                onMarkerPress={(center) => selectCenter(center.id)}
                onMapPress={() => selectCenter(null)}
            />

            {/* Overlays */}
            {selectedCenter ? (
                <View
                    style={[styles.miniCardDeck, { bottom: TAB_BAR_CLEARANCE }]}
                    pointerEvents="box-none"
                >
                    <ServiceMiniCard
                        visible={!!selectedCenter}
                        center={selectedCenter}
                        onPress={() => router.push(`/services/${selectedCenter.id}`)}
                        onRoutePress={() => handleRoutePress(selectedCenter)}
                        onClose={() => selectCenter(null)}
                    />
                </View>
            ) : (
                <ServiceList
                    centers={filteredCenters}
                    onSelect={selectCenter}
                    isVisible={selectedCenterId === null && !isCityPickerOpen && !isServiceFilterOpen}
                    selectedCity={selectedCity}
                    isCityPickerOpen={isCityPickerOpen}
                    setIsCityPickerOpen={setIsCityPickerOpen}
                    selectedServicesCount={selectedServices.length}
                    isServiceFilterOpen={isServiceFilterOpen}
                    setIsServiceFilterOpen={setIsServiceFilterOpen}
                />
            )}

            {/* Bottom Sheets */}
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

            <ServiceFilterSheet
                visible={isServiceFilterOpen}
                selected={selectedServices}
                onToggle={toggleService}
                onReset={resetServices}
                onClose={() => setIsServiceFilterOpen(false)}
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
    miniCardDeck: {
        position: 'absolute',
        width: '90%',
        alignSelf: 'center',
        zIndex: 10,
    },
});