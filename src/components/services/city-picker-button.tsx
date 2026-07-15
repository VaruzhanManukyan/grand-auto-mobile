// components/services/city-picker-button.tsx
import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useTheme} from "@/hooks/use-theme";

export const SELECTED_CITY_COLOR = '#FF3B30';
export const ALL_CITIES_LABEL = 'Все города';

interface CityPickerButtonProps {
    selectedCity: string | null;
    isOpen: boolean;
    onPress: () => void;
}

export function CityPickerButton({ selectedCity, isOpen, onPress }: CityPickerButtonProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const labelFade = useRef(new Animated.Value(1)).current;
    const label = selectedCity ?? ALL_CITIES_LABEL;
    const scheme = useColorScheme();
    const theme = useTheme();

    useEffect(() => {
        Animated.spring(rotation, {
            toValue: isOpen ? 1 : 0,
            useNativeDriver: true,
            tension: 60,
            friction: 9,
        }).start();
    }, [isOpen]);

    // label pops in with a fade + slight rise whenever the city changes
    useEffect(() => {
        labelFade.setValue(0);
        Animated.timing(labelFade, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
        }).start();
    }, [label]);

    const arrowRotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const labelTranslateY = labelFade.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

    return (
        <Pressable onPress={onPress}>
            <AdaptiveGlass style={styles.button} colorScheme={scheme}  solidColor={theme.backgroundBar}>
                <Animated.Text
                    style={[
                        styles.label,
                        { color: SELECTED_CITY_COLOR, opacity: labelFade, transform: [{ translateY: labelTranslateY }] },
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
                <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
                    <Ionicons name="chevron-down" size={16} color={SELECTED_CITY_COLOR} />
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
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    label: { fontSize: 15, fontWeight: '700' },
});