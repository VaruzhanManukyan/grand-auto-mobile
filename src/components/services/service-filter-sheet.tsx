import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, StyleSheet, PanResponder, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ServiceType, SERVICE_TYPES, SERVICE_TYPE_KEYS, SERVICE_TYPE_ICONS } from '@/types/service.types';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';

interface ServiceFilterSheetProps {
    visible: boolean;
    selected: ServiceType[];
    onToggle: (service: ServiceType) => void;
    onReset: () => void;
    onClose: () => void;
}

export function ServiceFilterSheet({ visible, selected, onToggle, onReset, onClose }: ServiceFilterSheetProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const { t } = useTranslation();
    const [rendered, setRendered] = useState(visible);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const dragY = useRef(new Animated.Value(0)).current;

    const REST_GAP = Platform.OS === 'ios' ? 82 : 12;
    const restOffset = Platform.OS === 'ios' ? -(TAB_BAR_CLEARANCE - REST_GAP) : -(TAB_BAR_CLEARANCE + REST_GAP);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    dragY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const shouldClose = gestureState.dy > 80 || gestureState.vy > 0.8;
                if (shouldClose) {
                    onClose();
                } else {
                    Animated.spring(dragY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 65,
                        friction: 11,
                    }).start();
                }
            },
        })
    ).current;

    const leftRotate = dragY.interpolate({
        inputRange: [0, 60],
        outputRange: ['15deg', '0deg'],
        extrapolate: 'clamp',
    });

    const rightRotate = dragY.interpolate({
        inputRange: [0, 60],
        outputRange: ['-15deg', '0deg'],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        if (visible) {
            setRendered(true);
            dragY.setValue(0);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(sheetTranslateY, { toValue: restOffset, useNativeDriver: true, tension: 65, friction: 11 }),
            ]).start();
        } else if (rendered) {
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true }),
            ]).start(() => {
                setRendered(false);
            });
        }
    }, [visible, restOffset]);

    if (!rendered) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onClose}>
            <View style={StyleSheet.absoluteFill}>
                <Animated.View
                    style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
                    pointerEvents="none"
                />

                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.sheetWrap,
                        { transform: [{ translateY: Animated.add(sheetTranslateY, dragY) }] },
                    ]}
                    pointerEvents="box-none"
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                    <View style={styles.cardWrapper}>
                        <AdaptiveGlass style={styles.sheet} colorScheme={scheme} solidColor={theme.backgroundBar}>
                            <View {...panResponder.panHandlers} style={styles.handleContainer}>
                                <View style={styles.handleInner}>
                                    <Animated.View style={[styles.handleStick, styles.handleStickLeft, { backgroundColor: theme.textSecondary, transform: [{ rotate: leftRotate }] }]} />
                                    <Animated.View style={[styles.handleStick, styles.handleStickRight, { backgroundColor: theme.textSecondary, transform: [{ rotate: rightRotate }] }]} />
                                </View>
                            </View>

                            <View style={styles.titleRow}>
                                <Text style={[styles.title, { color: theme.text }]}>{t('services.filter.title')}</Text>
                                {selected.length > 0 && (
                                    <Pressable onPress={onReset} hitSlop={8}>
                                        <Text style={[styles.resetText, { color: theme.accent }]}>{t('services.common.reset')}</Text>
                                    </Pressable>
                                )}
                            </View>

                            <View style={styles.list}>
                                {SERVICE_TYPES.map((service, index) => {
                                    const isSelected = selected.includes(service);
                                    const translationKey = SERVICE_TYPE_KEYS[service];

                                    return (
                                        <Pressable
                                            key={service}
                                            style={[styles.row, index === 0 && styles.rowFirst]}
                                            onPress={() => onToggle(service)}
                                        >
                                            <Ionicons
                                                name={SERVICE_TYPE_ICONS[service]}
                                                size={20}
                                                color={isSelected ? theme.accent : theme.text}
                                            />
                                            <Text
                                                style={[
                                                    styles.rowText,
                                                    { color: isSelected ? theme.accent : theme.text },
                                                ]}
                                            >
                                                {t(`services.serviceTypes.${translationKey}`)}
                                            </Text>
                                            <Ionicons
                                                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                                                size={20}
                                                color={isSelected ? theme.accent : theme.border}
                                            />
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <Pressable style={styles.doneRow} onPress={onClose}>
                                <Text style={[styles.doneText, { color: theme.accent }]}>{t('services.common.done')}</Text>
                            </Pressable>
                        </AdaptiveGlass>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0)' },
    sheetWrap: { justifyContent: 'flex-end' },
    cardWrapper: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    sheet: {
        borderRadius: 24,
        paddingBottom: 20,
        overflow: 'hidden',
    },
    handleContainer: { width: '100%', height: 24, alignItems: 'center', justifyContent: 'center' },
    handleInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    handleStick: { width: 18, height: 5, opacity: 1 },
    handleStickLeft: { borderTopLeftRadius: 3, borderBottomLeftRadius: 3, marginRight: -2 },
    handleStickRight: { borderTopRightRadius: 3, borderBottomRightRadius: 3 },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    title: { fontSize: 20, fontWeight: '600' },
    resetText: { fontSize: 14, fontWeight: '600' },
    list: { paddingHorizontal: 16 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(128,128,128,0.15)',
    },
    rowFirst: { borderTopWidth: 0 },
    rowText: { fontSize: 16, flex: 1 },
    doneRow: { paddingVertical: 8, alignItems: 'center', marginTop: 4 },
    doneText: { fontSize: 16, fontWeight: '700' },
});