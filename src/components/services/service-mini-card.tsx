// components/services/service-mini-card.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceCenter } from '@/types/service.types';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { getAvailableNavigationApps, openWithApp, NavigationApp } from '@/utils/navigation-apps';
import { NavigatePickerSheet } from '@/components/services/navigate-picker-sheet';
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ServiceMiniCardProps {
    center: ServiceCenter;
    onPress: () => void;
    onClose: () => void;
}

export function ServiceMiniCard({ center, onPress, onClose }: ServiceMiniCardProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const translateY = useRef(new Animated.Value(150)).current;
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerApps, setPickerApps] = useState<NavigationApp[]>([]);

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    }, [center.id]);

    const handleNavigate = async (e: GestureResponderEvent) => {
        e.stopPropagation();
        const apps = await getAvailableNavigationApps();

        // If it only finds 1 app, it skips the menu.
        // Once we fix app.json below, it will find Yandex + Google and show the menu!
        if (apps.length === 1) {
            openWithApp(apps[0], center);
        } else {
            setPickerApps(apps);
            setPickerVisible(true);
        }
    };

    const handlePickApp = (app: NavigationApp) => {
        setPickerVisible(false);
        openWithApp(app, center);
    };

    return (
        <>
            <Animated.View style={[styles.cardWrapper, { transform: [{ translateY }] }]}>
                <AdaptiveGlass style={styles.blur} colorScheme={scheme} solidColor={theme.backgroundBar}>
                    <Pressable style={styles.content} onPress={onPress}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                                {center.name}
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.text }]} numberOfLines={1}>
                                {center.address}
                            </Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="time-outline" size={14} color={theme.text} />
                                <Text style={[styles.metaText, { color: theme.text }]}>
                                    {center.workHours}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.actionsRow}>
                            <Pressable
                                onPress={handleNavigate}
                                hitSlop={8}
                                style={[styles.iconButton, { backgroundColor: theme.accent + '1A' }]}
                            >
                                <Ionicons name="navigate-outline" size={18} color={theme.accent} />
                            </Pressable>
                            <View style={[styles.iconButton, { backgroundColor: theme.accent + '1A' }]}>
                                <Ionicons name="chevron-forward" size={20} color={theme.accent} />
                            </View>
                        </View>
                    </Pressable>
                </AdaptiveGlass>
            </Animated.View>

            <NavigatePickerSheet
                visible={pickerVisible}
                apps={pickerApps}
                onSelect={handlePickApp}
                onClose={() => setPickerVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        width: '100%',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 8,
    },
    blur: {
        borderRadius: 30,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});