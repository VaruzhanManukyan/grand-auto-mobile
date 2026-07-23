import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export const SELECTED_SERVICE_COLOR = '#FF3B30';

interface ServiceFilterButtonProps {
    selectedCount: number;
    isOpen: boolean;
    onPress: () => void;
}

export function ServiceFilterButton({ selectedCount, isOpen, onPress }: ServiceFilterButtonProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const scheme = useColorScheme();
    const theme = useTheme();
    const { t } = useTranslation();
    const hasFilter = selectedCount > 0;

    useEffect(() => {
        Animated.spring(rotation, {
            toValue: isOpen ? 1 : 0,
            useNativeDriver: true,
            tension: 60,
            friction: 9,
        }).start();
    }, [isOpen]);

    const label = hasFilter
        ? t('services.filter.buttonLabelWithCount', { count: selectedCount })
        : t('services.filter.buttonLabel');

    return (
        <Pressable onPress={onPress}>
            <AdaptiveGlass style={styles.button} colorScheme={scheme} solidColor={theme.backgroundBar}>
                <Ionicons
                    name={hasFilter ? 'funnel' : 'funnel-outline'}
                    size={15}
                    color={SELECTED_SERVICE_COLOR}
                />
                <Text style={[styles.label, { color: SELECTED_SERVICE_COLOR }]} numberOfLines={1}>
                    {label}
                </Text>
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
    label: { fontSize: 13, fontWeight: '700' },
});