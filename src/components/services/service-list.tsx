// components/services/service-list.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { ServiceCenter } from '@/types/service.types';
import { useTheme } from '@/hooks/use-theme';
import {AdaptiveGlass} from "@/components/ui/adaptive-glass";
import {useColorScheme} from "@/hooks/use-color-scheme";

interface ServiceListProps {
    centers: ServiceCenter[];
    onSelect: (id: string) => void;
    isVisible: boolean;
}

// components/services/service-list.tsx
// ... Keep imports and Props the same ...

export function ServiceList({ centers, onSelect, isVisible }: ServiceListProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: isVisible ? 0 : 300,
            useNativeDriver: true,
            tension: 40,
            friction: 9,
        }).start();
    }, [isVisible]);

    if (!isVisible) return null; // Unmount when not needed to save screen space

    return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateY }] }]}>
            <AdaptiveGlass style={styles.blur} colorScheme={scheme} solidColor={theme.background}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Сервисные центры</Text>
                </View>
                <FlatList
                    data={centers}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AdaptiveGlass style={styles.blurCard} colorScheme={scheme} solidColor={theme.background}>
                            <Pressable
                                style={[styles.card]}
                                onPress={() => onSelect(item.id)}
                            >
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.cardAddress, { color: theme.text }]} numberOfLines={1}>
                                    {item.address}
                                </Text>
                            </Pressable>
                        </AdaptiveGlass>
                    )}
                />
            </AdaptiveGlass>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        width: '100%',
    },
    blur: {
        borderRadius: 30,
        overflow: 'hidden'
    },
    blurCard: {
        borderRadius: 30,
    },
    glassContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    card: {
        width: 220,
        padding: 16,
        borderRadius: 16,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },

    cardAddress: {
        fontSize: 13,
    },
});