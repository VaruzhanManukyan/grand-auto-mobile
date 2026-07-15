import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ALL_CITIES_LABEL } from './city-picker-button';

interface CityPickerSheetProps {
    visible: boolean;
    cities: string[];
    selectedCity: string | null;
    onSelect: (city: string | null) => void;
    onClose: () => void;
}

export function CityPickerSheet({ visible, cities, selectedCity, onSelect, onClose }: CityPickerSheetProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const [rendered, setRendered] = useState(visible);

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                // Liquid/bouncy spring for the glassy sheet
                Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true }),
            ]).start(({ finished }) => finished && setRendered(false));
        }
    }, [visible]);

    if (!rendered) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onClose}>
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: sheetTranslateY }] }]}>
                    <AdaptiveGlass style={styles.sheet} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <Text style={[styles.title, { color: theme.text }]}>Выберите город</Text>

                        {/* "All Cities" Option */}
                        <Pressable
                            style={[styles.row, styles.rowFirst, selectedCity === null && styles.rowSelected]}
                            onPress={() => onSelect(null)}
                        >
                            <Text style={[styles.rowText, { color: selectedCity === null ? theme.accent : theme.text }]}>
                                {ALL_CITIES_LABEL}
                            </Text>
                        </Pressable>

                        {/* City List */}
                        {cities.map((city) => (
                            <Pressable
                                key={city}
                                style={[styles.row, selectedCity === city && styles.rowSelected]}
                                onPress={() => onSelect(city)}
                            >
                                <Text style={[styles.rowText, { color: selectedCity === city ? theme.accent : theme.text }]}>
                                    {city}
                                </Text>
                            </Pressable>
                        ))}
                    </AdaptiveGlass>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetWrap: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        paddingBottom: 32,
    },
    sheet: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 16,
        opacity: 0.6,
    },
    row: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(150,150,150,0.2)',
    },
    rowFirst: {
        borderTopWidth: 0,
    },
    rowSelected: {
        backgroundColor: 'rgba(150,150,150,0.1)',
    },
    rowText: {
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
    },
});