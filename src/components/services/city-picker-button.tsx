import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

export const SELECTED_CITY_COLOR = '#FF3B30';

interface CityPickerButtonProps {
    selectedCity: string | null;
    isOpen: boolean;
    onPress: () => void;
}

export function CityPickerButton({ selectedCity, isOpen, onPress }: CityPickerButtonProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const labelFade = useRef(new Animated.Value(1)).current;
    const scheme = useColorScheme();
    const theme = useTheme();
    const { t } = useTranslation();
    const label = selectedCity ?? t('services.cityPicker.allCities');
    const hasCity = selectedCity !== null;

    useEffect(() => {
        Animated.spring(rotation, {
            toValue: isOpen ? 1 : 0,
            useNativeDriver: true,
            tension: 60,
            friction: 9,
        }).start();
    }, [isOpen]);

    useEffect(() => {
        labelFade.setValue(0);
        Animated.timing(labelFade, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
        }).start();
    }, [label]);

    const labelTranslateY = labelFade.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

    return (
        <Pressable onPress={onPress}>
            <AdaptiveGlass style={styles.button} colorScheme={scheme} solidColor={theme.backgroundBar}>
                <Animated.View
                    style={[
                        styles.contentWrapper,
                        {
                            opacity: labelFade,
                            transform: [{ translateY: labelTranslateY }]
                        }
                    ]}
                >
                    <Ionicons
                        name={hasCity ? 'location' : 'location-outline'}
                        size={15}
                        color={SELECTED_CITY_COLOR}
                    />
                    <Text style={[styles.label, { color: SELECTED_CITY_COLOR }]} numberOfLines={1}>
                        {label}
                    </Text>
                </Animated.View>
            </AdaptiveGlass>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: 150,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 150,

        gap: 6,
    },
    label: { fontSize: 13, fontWeight: '700', maxWidth: 105,
    },
});