import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    Animated,
    StyleSheet,
    Platform,
    LayoutAnimation,
    UIManager,
    Keyboard,
    PanResponder,
    ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnimatedSearchBar } from '@/components/ui/animated-search-bar';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CityPickerSheetProps {
    visible: boolean;
    cities: string[];
    selectedCity: string | null;
    onSelect: (city: string | null) => void;
    onClose: () => void;
}

export function CityPickerSheet({ visible, cities, selectedCity, onSelect, onClose }: CityPickerSheetProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const { t } = useTranslation();
    const [rendered, setRendered] = useState(visible);
    const [search, setSearch] = useState('');
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    const REST_GAP = Platform.OS === "ios" ? 82 : 12;
    const restOffset = Platform.OS === "ios" ? -(TAB_BAR_CLEARANCE - REST_GAP) : -(TAB_BAR_CLEARANCE + REST_GAP);

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const dragY = useRef(new Animated.Value(0)).current;

    const allCitiesLabel = t('services.cityPicker.allCities');

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

    const configureKeyboardLayoutAnimation = (duration: number) => {
        LayoutAnimation.configureNext({
            duration: duration > 0 ? 200 : 250,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
            },
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
            },
        });
    };

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            // Безопасное резервное значение длительности для Android, где e.duration отсутствует
            const animDuration = e?.duration && e.duration > 200 ? e.duration - 200 : 250;

            configureKeyboardLayoutAnimation(e?.duration || 250);
            setIsKeyboardOpen(true);

            const existingBottomSpace = 80;
            const pushAmount = e.endCoordinates.height - existingBottomSpace;

            Animated.timing(keyboardOffset, {
                toValue: -pushAmount,
                duration: animDuration, // Исправлено: гарантированное числовое значение
                useNativeDriver: true,
            }).start();
        });

        const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
            const animDuration = e?.duration || 250;

            configureKeyboardLayoutAnimation(animDuration);
            setIsKeyboardOpen(false);

            Animated.timing(keyboardOffset, {
                toValue: 0,
                duration: animDuration,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [keyboardOffset]);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            dragY.setValue(0);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(sheetTranslateY, { toValue: restOffset, useNativeDriver: true, tension: 65, friction: 11 }),
            ]).start();
        } else {
            backdropOpacity.setValue(0);
            sheetTranslateY.setValue(400);
            setSearch('');
            setIsKeyboardOpen(false);
            setRendered(false);
        }
    }, [visible, restOffset]);

    if (!rendered) return null;

    const query = search.trim().toLowerCase();
    const filteredCities = query ? cities.filter((c) => c.toLowerCase().includes(query)) : cities;
    const showAllOption = !query || allCitiesLabel.toLowerCase().includes(query);

    const handleFilterChange = (text: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.create(180, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
        setSearch(text);
    };

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
                    { transform: [{ translateY: Animated.add(Animated.add(sheetTranslateY, keyboardOffset), dragY) }] },
                ]}
                pointerEvents="box-none"
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        Keyboard.dismiss();
                        onClose();
                    }}
                />

                {/* NEW: Dedicated Wrapper for the Shadow */}
                <View style={[styles.cardWrapper, isKeyboardOpen && { maxHeight: '48%' }]}>
                    <AdaptiveGlass
                        style={styles.sheet}
                        colorScheme={scheme}
                        solidColor={theme.backgroundBar}
                    >
                        <View {...panResponder.panHandlers} style={styles.handleContainer}>
                            <View style={styles.handleInner}>
                                <Animated.View style={[styles.handleStick, styles.handleStickLeft, { backgroundColor: theme.textSecondary, transform: [{ rotate: leftRotate }] }]} />
                                <Animated.View style={[styles.handleStick, styles.handleStickRight, { backgroundColor: theme.textSecondary, transform: [{ rotate: rightRotate }] }]} />
                            </View>
                        </View>

                        <Pressable onPress={() => Keyboard.dismiss()}>
                            <Text style={[styles.title, { color: theme.text }]}>{t('services.cityPicker.title')}</Text>
                            <AnimatedSearchBar
                                value={search}
                                onChangeText={handleFilterChange}
                                placeholder={t('services.cityPicker.searchPlaceholder')}
                                theme={theme}
                                style={styles.searchBar}
                            />
                        </Pressable>

                        <ScrollView
                            style={[
                                styles.scrollArea,
                                isKeyboardOpen && { maxHeight: 130 }
                            ]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {showAllOption && (
                                <Pressable
                                    style={[styles.row, styles.rowFirst, selectedCity === null && styles.rowSelected]}
                                    onPress={() => onSelect(null)}
                                >
                                    <Text style={[styles.rowText, { color: selectedCity === null ? theme.accent : theme.text }]}>
                                        {allCitiesLabel}
                                    </Text>
                                </Pressable>
                            )}

                            {filteredCities.map((city, index) => (
                                <Pressable
                                    key={city}
                                    style={[
                                        styles.row,
                                        !showAllOption && index === 0 && styles.rowFirst,
                                        selectedCity === city && styles.rowSelected,
                                    ]}
                                    onPress={() => onSelect(city)}
                                >
                                    <Text style={[styles.rowText, { color: selectedCity === city ? theme.accent : theme.text }]}>
                                        {city}
                                    </Text>
                                </Pressable>
                            ))}

                            {filteredCities.length === 0 && !showAllOption && (
                                <Text style={[styles.emptyText, { color: theme.text }]}>{t('services.cityPicker.notFound')}</Text>
                            )}
                        </ScrollView>
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
    // NEW: Moved the width, alignSelf, and added shadow properties here
    cardWrapper: {
        width: "90%",
        alignSelf: "center",
        maxHeight: '80%',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    // CHANGED: Removed width/alignSelf, added overflow hidden for the glass blur
    sheet: {
        borderRadius: 24,
        paddingBottom: 20,
        overflow: 'hidden'
    },
    handleContainer: { width: '100%', height: 24, alignItems: 'center', justifyContent: 'center' },
    handleInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10},
    handleStick: { width: 18, height: 5, opacity: 1 },
    handleStickLeft: { borderTopLeftRadius: 3, borderBottomLeftRadius: 3, marginRight: -2 },
    handleStickRight: { borderTopRightRadius: 3, borderBottomRightRadius: 3 },
    title: { fontSize: 20, fontWeight: '600', paddingHorizontal: 16, marginVertical: 8 },
    searchBar: { marginHorizontal: 16, marginBottom: 12 },
    scrollArea: { maxHeight: 300, paddingHorizontal: 16 },
    row: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
    rowFirst: { borderTopWidth: 0 },
    rowSelected: { opacity: 0.8 },
    rowText: { fontSize: 16 },
    emptyText: { textAlign: 'center', paddingVertical: 20, fontSize: 15, opacity: 0.6 },
});