// components/services/navigate-picker-sheet.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { NavigationApp } from '@/utils/navigation-apps';
import {useColorScheme} from "@/hooks/use-color-scheme";

interface NavigatePickerSheetProps {
    visible: boolean;
    apps: NavigationApp[];
    onSelect: (app: NavigationApp) => void;
    onClose: () => void;
}

export function NavigatePickerSheet({ visible, apps, onSelect, onClose }: NavigatePickerSheetProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    // Same custom animation as CityPickerSheet — backdrop fades on its
    // own timeline, sheet slides up on a spring — so the two pickers
    // in the app read as one family instead of two different feels.
    const [rendered, setRendered] = useState(visible);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(320)).current;

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(sheetTranslateY, { toValue: 320, duration: 200, useNativeDriver: true }),
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
                        <Text style={[styles.title, { color: theme.text }]}>Открыть маршрут в…</Text>
                        {apps.map((app, index) => (
                            <Pressable
                                key={app.id}
                                style={[styles.row, index === 0 && styles.rowFirst]}
                                onPress={() => onSelect(app)}
                            >
                                <Text style={[styles.rowText, { color: theme.text }]}>{app.label}</Text>
                            </Pressable>
                        ))}
                        <Pressable style={styles.cancelRow} onPress={onClose}>
                            <Text style={[styles.cancelText, { color: theme.accent }]}>Отмена</Text>
                        </Pressable>
                    </AdaptiveGlass>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
    sheetWrap: { position: 'absolute', left: 12, right: 12, bottom: 12 },
    sheet: { borderRadius: 24, paddingTop: 16, paddingBottom: 8 },
    title: { fontSize: 13, fontWeight: '600', textAlign: 'center', opacity: 0.6, marginBottom: 4 },
    row: {
        paddingVertical: 14,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(128,128,128,0.25)',
    },
    rowFirst: { borderTopWidth: 0 },
    rowText: { fontSize: 16, fontWeight: '600' },
    cancelRow: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelText: { fontSize: 16, fontWeight: '700' },
});