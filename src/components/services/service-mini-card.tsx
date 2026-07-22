import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Animated,
    Pressable,
    GestureResponderEvent,
    PanResponder,
    Text,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceCenter } from '@/types/service.types';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { getAvailableNavigationApps, openWithApp, NavigationApp } from '@/utils/navigation-apps';
import { NavigatePickerSheet } from '@/components/services/navigate-picker-sheet';
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TAB_BAR_CLEARANCE } from '@/constants/layout';

interface ServiceMiniCardProps {
    visible: boolean;
    center: ServiceCenter | null;
    onPress: () => void;
    onRoutePress?: () => void;
    onClose: () => void;
}

export function ServiceMiniCard({ visible, center, onPress, onClose }: ServiceMiniCardProps) {
    const theme = useTheme();
    const scheme = useColorScheme();

    const [rendered, setRendered] = useState(visible);
    const [localCenter, setLocalCenter] = useState<ServiceCenter | null>(center);

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerApps, setPickerApps] = useState<NavigationApp[]>([]);

    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const dragY = useRef(new Animated.Value(0)).current;

    const REST_GAP = Platform.OS === "ios" ? 82 : 12;
    const restOffset = Platform.OS === "ios" ? -(TAB_BAR_CLEARANCE - REST_GAP) : -(TAB_BAR_CLEARANCE + REST_GAP);

    useEffect(() => {
        if (center) setLocalCenter(center);
    }, [center]);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            dragY.setValue(0);
            Animated.spring(sheetTranslateY, {
                toValue: restOffset,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(sheetTranslateY, {
                toValue: 400,
                duration: 200,
                useNativeDriver: true,
            }).start(({ finished }) => finished && setRendered(false));
        }
    }, [visible, restOffset, sheetTranslateY, dragY]);

    // Fix: this responder now lives ONLY on the handle bar (see handleContainer below),
    // not on the whole card. Previously it wrapped the two Pressables (text row + nav
    // button), which meant Pressable claimed the touch on press-in before the drag's
    // onMoveShouldSetPanResponder ever got a chance to fire — so dragging only worked
    // from a tiny sliver of dead space above the handle.
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Prevent pulling up past 0 while dragging
                dragY.setValue(Math.max(0, gestureState.dy));
            },
            onPanResponderRelease: (_, gestureState) => {
                const shouldClose = gestureState.dy > 80 || gestureState.vy > 0.8;
                if (shouldClose) {
                    // Smoothly animate off-screen down before triggering onClose state update
                    Animated.timing(dragY, {
                        toValue: 400,
                        duration: 180,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose();
                    });
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

    const handleNavigate = async (e?: GestureResponderEvent) => {
        if (e) e.stopPropagation();
        if (!localCenter) return;

        try {
            const apps = await getAvailableNavigationApps();
            if (apps.length === 1) {
                openWithApp(apps[0], localCenter);
            } else if (apps.length > 1) {
                setPickerApps(apps);
                setPickerVisible(true);
            } else {
                openWithApp({ id: 'apple-maps', name: 'Maps' } as NavigationApp, localCenter);
            }
        } catch (err) {
            console.error('Failed to get navigation apps:', err);
        }
    };

    const handlePickApp = (app: NavigationApp) => {
        setPickerVisible(false);
        if (localCenter) openWithApp(app, localCenter);
    };

    const handleCardPress = () => {
        onClose();
        onPress();
    };

    if (!rendered || !localCenter) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onClose}>
            <View style={StyleSheet.absoluteFill}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.sheetWrap,
                        { transform: [{ translateY: Animated.add(sheetTranslateY, dragY) }] },
                    ]}
                    pointerEvents="box-none"
                >
                    <View style={styles.cardWrapper}>
                        <AdaptiveGlass style={styles.blur} colorScheme={scheme} solidColor={theme.backgroundBar}>

                            <View
                                style={styles.handleContainer}
                                {...panResponder.panHandlers}
                                hitSlop={{ top: 12, bottom: 12, left: 40, right: 40 }}
                            >
                                <View style={styles.handleInner}>
                                    <Animated.View style={[styles.handleStick, styles.handleStickLeft, { backgroundColor: theme.textSecondary, transform: [{ rotate: leftRotate }] }]} />
                                    <Animated.View style={[styles.handleStick, styles.handleStickRight, { backgroundColor: theme.textSecondary, transform: [{ rotate: rightRotate }] }]} />
                                </View>
                            </View>

                            <View style={styles.content}>
                                <Pressable style={styles.textContainer} onPress={handleCardPress}>
                                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{localCenter.name}</Text>
                                    <Text style={[styles.subtitle, { color: theme.text }]} numberOfLines={1}>{localCenter.address}</Text>
                                    <View style={styles.metaRow}>
                                        <Ionicons name="time-outline" size={14} color={theme.text} />
                                        <Text style={[styles.metaText, { color: theme.text }]}>{localCenter.workHours}</Text>
                                    </View>
                                </Pressable>

                                <View style={styles.actionsRow}>
                                    <Pressable
                                        onPress={handleNavigate}
                                        style={[styles.iconButton, { backgroundColor: theme.accent + '1A' }]}
                                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                    >
                                        <Ionicons name="navigate-outline" size={18} color={theme.accent} />
                                    </Pressable>
                                </View>
                            </View>
                        </AdaptiveGlass>
                    </View>
                </Animated.View>

                <NavigatePickerSheet
                    visible={pickerVisible}
                    apps={pickerApps}
                    onSelect={handlePickApp}
                    onClose={() => setPickerVisible(false)}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheetWrap: {
        justifyContent: 'flex-end',
    },
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
    blur: { borderRadius: 24, overflow: 'hidden' },
    handleContainer: { width: '100%', paddingTop: 14, paddingBottom: 6, alignItems: 'center', justifyContent: 'center' },
    handleInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    handleStick: { width: 16, height: 4, opacity: 1 },
    handleStickLeft: { borderTopLeftRadius: 2, borderBottomLeftRadius: 2, marginRight: -1 },
    handleStickRight: { borderTopRightRadius: 2, borderBottomRightRadius: 2 },
    content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 22, paddingTop: 4 },
    textContainer: { flex: 1, marginRight: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginBottom: 8, opacity: 0.8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, fontWeight: '500', opacity: 0.9 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});