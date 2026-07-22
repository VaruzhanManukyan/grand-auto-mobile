// components/services/navigate-picker-sheet.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, StyleSheet, PanResponder } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { NavigationApp } from '@/utils/navigation-apps';
import { useColorScheme } from "@/hooks/use-color-scheme";

interface NavigatePickerSheetProps {
    visible: boolean;
    apps: NavigationApp[];
    onSelect: (app: NavigationApp) => void;
    onClose: () => void;
}

export function NavigatePickerSheet({ visible, apps, onSelect, onClose }: NavigatePickerSheetProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const { t } = useTranslation();
    const [rendered, setRendered] = useState(visible);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(320)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    sheetTranslateY.setValue(gesture.dy);
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 100 || gesture.vy > 0.5) {
                    Animated.parallel([
                        Animated.timing(backdropOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
                        Animated.timing(sheetTranslateY, { toValue: 320, duration: 180, useNativeDriver: true }),
                    ]).start(({ finished }) => {
                        if (finished) onClose();
                    });
                } else {
                    Animated.spring(sheetTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 65,
                        friction: 11,
                    }).start();
                }
            },
        })
    ).current;

    const leftRotate = sheetTranslateY.interpolate({
        inputRange: [0, 60],
        outputRange: ['15deg', '0deg'],
        extrapolate: 'clamp',
    });

    const rightRotate = sheetTranslateY.interpolate({
        inputRange: [0, 60],
        outputRange: ['-15deg', '0deg'],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        if (visible) {
            setRendered(true);
            sheetTranslateY.setValue(320);
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

                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.sheetWrap, { transform: [{ translateY: sheetTranslateY }] }]}
                >
                    <AdaptiveGlass style={styles.sheet} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <View style={styles.handleContainer}>
                            <View style={styles.handleInner}>
                                <Animated.View
                                    style={[
                                        styles.handleStick,
                                        styles.handleStickLeft,
                                        { backgroundColor: theme.textSecondary, transform: [{ rotate: leftRotate }] },
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        styles.handleStick,
                                        styles.handleStickRight,
                                        { backgroundColor: theme.textSecondary, transform: [{ rotate: rightRotate }] },
                                    ]}
                                />
                            </View>
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>{t('services.navigatePicker.title')}</Text>
                        {apps.map((app, index) => (
                            <Pressable
                                key={app.id}
                                style={[styles.row, index === 0 && styles.rowFirst]}
                                onPress={() => onSelect(app)}
                            >
                                <Text style={[styles.rowText, { color: theme.text }]}>{t(app.labelKey)}</Text>
                            </Pressable>
                        ))}
                        <Pressable style={styles.cancelRow} onPress={onClose}>
                            <Text style={[styles.cancelText, { color: theme.accent }]}>{t('services.common.cancel')}</Text>
                        </Pressable>
                    </AdaptiveGlass>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
    sheetWrap: { position: 'absolute', left: 12, right: 12, bottom: 22 },
    sheet: { borderRadius: 35, paddingTop: 12, paddingBottom: 8 },
    handleContainer: { width: '100%', paddingTop: 4, paddingBottom: 8, alignItems: 'center', justifyContent: 'center' },
    handleInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    handleStick: { width: 16, height: 4, opacity: 1 },
    handleStickLeft: { borderTopLeftRadius: 2, borderBottomLeftRadius: 2, marginRight: -1 },
    handleStickRight: { borderTopRightRadius: 2, borderBottomRightRadius: 2 },
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