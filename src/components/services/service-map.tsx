import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceCenter } from '@/types/service.types';
import { useTheme } from '@/hooks/use-theme';
import { getRegionForCenters } from '@/utils/map-regions';

const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

interface ServiceMapProps {
    centers: ServiceCenter[];
    selectedCenterId: string | null;
    onMarkerPress: (center: ServiceCenter) => void;
    onMapPress: () => void;
}

const DEFAULT_REGION: Region = {
    latitude: 40.1792,
    longitude: 44.4991,
    latitudeDelta: 0.35,
    longitudeDelta: 0.35,
};

export function ServiceMap({
                               centers = [],
                               selectedCenterId,
                               onMarkerPress,
                               onMapPress
                           }: ServiceMapProps) {
    const theme = useTheme();
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();

    // Высота нижней плашки (ServiceList/ServiceMiniCard). Если карточка
    // вырастет/уменьшится, поправь константу 120 или замени на измерение
    // через onLayout родительского контейнера.

    useEffect(() => {
        const selected = selectedCenterId ? centers.find((c) => c.id === selectedCenterId) : null;
        if (selected) {
            mapRef.current?.animateToRegion(
                {
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                },
                350,
            );
            return;
        }
        const region = getRegionForCenters(centers);
        if (region) {
            mapRef.current?.animateToRegion(region, 400);
        }
    }, [selectedCenterId, centers]);

    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={MAP_PROVIDER}
            initialRegion={DEFAULT_REGION}
            onPress={onMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}>
            {centers.map((center) => {
                const isSelected = center.id === selectedCenterId;
                return (
                    <Marker
                        key={center.id}
                        coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                        onPress={(e) => {
                            e.stopPropagation();
                            onMarkerPress(center);
                        }}
                        tracksViewChanges={isSelected}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View
                            collapsable={false} // Android: stops the view from being flattened/optimized away before react-native-maps snapshots it for the marker bitmap
                            style={[
                                styles.pin,
                                {
                                    borderColor: theme.accent,
                                    backgroundColor: isSelected ? theme.accent : theme.background,
                                    transform: [{ scale: isSelected ? 1.15 : 1 }],
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.pinDot,
                                    { backgroundColor: isSelected ? theme.background : theme.accent },
                                ]}
                            />
                        </View>
                    </Marker>
                );
            })}
        </MapView>
    );
}

const styles = StyleSheet.create({
    pin: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    pinDot: {
        width: 8,
        height: 8,
        borderRadius: 50,
    },
});