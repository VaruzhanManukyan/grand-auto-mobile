import React from 'react';
import {
    ScrollView,
    Pressable,
    Text,
    View,
    StyleSheet,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';

interface CityFilterBarProps {
    cities: string[];
    selectedCity: string | null;
    onSelectCity: (city: string | null) => void;
}

const ALL_CITIES_LABEL = 'Все города';

export function CityFilterBar({
                                  cities,
                                  selectedCity,
                                  onSelectCity,
                              }: CityFilterBarProps) {
    const theme = useTheme();
    const scheme = useColorScheme();

    const options: (string | null)[] = [null, ...cities];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            {options.map((value) => {
                const label = value ?? ALL_CITIES_LABEL;
                const isActive = value === selectedCity;

                return (
                    <Pressable
                        key={label}
                        onPress={() => onSelectCity(value)}
                    >
                        {isActive ? (
                            <View
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: theme.accent,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        { color: '#fff' },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </View>
                        ) : (
                            <AdaptiveGlass
                                style={styles.chip}
                                colorScheme={scheme}
                                solidColor={theme.backgroundBar}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        {
                                            color: theme.text,
                                        },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </AdaptiveGlass>
                        )}
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
});