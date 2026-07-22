import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { ServiceCenter } from '@/types/service.types';

const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

interface ServiceDetailMapProps {
    center: ServiceCenter;
    onPress: () => void;
}

export function ServiceDetailMap({ center, onPress }: ServiceDetailMapProps) {
    const theme = useTheme();

    return (
        <Pressable style={styles.wrap} onPress={onPress}>
            <MapView
                style={StyleSheet.absoluteFill}
                provider={MAP_PROVIDER}
                pointerEvents="none"
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                initialRegion={{
                    latitude: center.latitude,
                    longitude: center.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                <Marker coordinate={{ latitude: center.latitude, longitude: center.longitude }}>
                    <View style={[styles.pin, { borderColor: theme.accent, backgroundColor: theme.accent }]}>
                        <View style={[styles.pinDot, { backgroundColor: theme.background }]} />
                    </View>
                </Marker>
            </MapView>

            <View style={[styles.routeBadge, { backgroundColor: theme.accent }]}>
                <Ionicons name="navigate" size={14} color="#fff" />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrap: {
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 4,
    },
    pin: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinDot: { width: 7, height: 7, borderRadius: 4 },
    routeBadge: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
});