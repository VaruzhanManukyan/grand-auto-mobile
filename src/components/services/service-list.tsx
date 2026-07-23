import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Animated,
    Platform,
    LayoutAnimation,
    Keyboard,
} from 'react-native';
import {useIsFocused} from 'expo-router/react-navigation';
import {useTranslation} from 'react-i18next';
import {ServiceCenter} from '@/types/service.types';
import {useTheme} from '@/hooks/use-theme';
import {AdaptiveGlass} from "@/components/ui/adaptive-glass";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {AnimatedSearchBar} from '@/components/ui/animated-search-bar';
import {CityPickerButton} from "@/components/services/city-picker-button";
import {ServiceFilterButton} from "@/components/services/service-filter-button";
import {TAB_BAR_CLEARANCE} from '@/constants/layout';

interface ServiceListProps {
    centers: ServiceCenter[];
    onSelect: (id: string) => void;
    isVisible: boolean;
    selectedCity: any;
    isCityPickerOpen: boolean;
    setIsCityPickerOpen: (val: boolean) => void;
    selectedServicesCount: number;
    isServiceFilterOpen: boolean;
    setIsServiceFilterOpen: (val: boolean) => void;
}

export function ServiceList({
                                centers = [],
                                onSelect,
                                isVisible,
                                selectedCity,
                                isCityPickerOpen,
                                setIsCityPickerOpen,
                                selectedServicesCount,
                                isServiceFilterOpen,
                                setIsServiceFilterOpen
                            }: ServiceListProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const {t} = useTranslation();
    const isFocused = useIsFocused();

    const shouldShow = isVisible && isFocused;
    const [rendered, setRendered] = useState(shouldShow);
    const [search, setSearch] = useState('');

    const REST_GAP = Platform.OS === 'ios' ? 82 : 12;
    const restOffset = Platform.OS === 'ios'
        ? -(TAB_BAR_CLEARANCE - REST_GAP)
        : -(TAB_BAR_CLEARANCE + REST_GAP);

    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const keyboardOffset = useRef(new Animated.Value(0)).current;

    // Keyboard layout animation handling
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            const existingBottomSpace = 80;
            const pushAmount = e.endCoordinates.height - existingBottomSpace;
            const animDuration = e?.duration && e.duration > 200 ? e.duration - 200 : 250;

            Animated.timing(keyboardOffset, {
                toValue: -pushAmount,
                duration: animDuration,
                useNativeDriver: true,
            }).start();
        });

        const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
            Animated.timing(keyboardOffset, {
                toValue: 0,
                duration: e?.duration || 250,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [keyboardOffset]);

    // Sheet entrance/exit spring animations
    useEffect(() => {
        if (shouldShow) {
            setRendered(true);
            Animated.spring(sheetTranslateY, {
                toValue: restOffset,
                useNativeDriver: true,
                tension: 32,
                friction: 8,
            }).start();
        } else {
            Animated.timing(sheetTranslateY, {
                toValue: 400,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setRendered(false);
            });
        }
    }, [shouldShow, restOffset]);

    const query = search.trim().toLowerCase();
    const filteredCenters = useMemo(() => {
        if (!query) return centers;
        return centers.filter(
            (c) => c.name.toLowerCase().includes(query) || c.address.toLowerCase().includes(query)
        );
    }, [centers, query]);

    const handleSearchChange = (text: string) => {
        LayoutAnimation.configureNext(
            LayoutAnimation.create(180, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
        );
        setSearch(text);
    };

    if (!rendered) return null;

    return (
        /* 1. Backdrop: box-none so taps/gestures over empty space (i.e. the map)
              pass straight through to whatever is underneath. Only the card
              itself (and its children) should ever claim a touch. */
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.sheetWrap,
                    {transform: [{translateY: Animated.add(sheetTranslateY, keyboardOffset)}]},
                ]}
                pointerEvents="box-none"
            >
                {/* 2. Card Container Pressable: Catches taps on empty card areas */}
                <Pressable style={styles.cardWrapper} onPress={Keyboard.dismiss}>
                    <AdaptiveGlass style={styles.blur} colorScheme={scheme} solidColor={theme.backgroundBar}>
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, {color: theme.text}]}>
                                {t('services.list.headerTitle')}
                            </Text>
                        </View>

                        <View style={styles.headerRow}>
                            <CityPickerButton
                                selectedCity={selectedCity}
                                isOpen={isCityPickerOpen}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setIsCityPickerOpen(true);
                                }}
                            />
                            <ServiceFilterButton
                                selectedCount={selectedServicesCount}
                                isOpen={isServiceFilterOpen}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setIsServiceFilterOpen(true);
                                }}
                            />
                        </View>

                        {/* 3. Stops propagation so tapping the active search bar doesn't instantly close keyboard */}
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <AnimatedSearchBar
                                value={search}
                                onChangeText={handleSearchChange}
                                placeholder={t('services.list.searchPlaceholder')}
                                theme={theme}
                                style={styles.searchBar}
                            />
                        </Pressable>

                        {filteredCenters.length === 0 ? (
                            <Text style={[styles.emptyText, {color: theme.text}]}>
                                {t('services.list.empty')}
                            </Text>
                        ) : (
                            <FlatList
                                data={filteredCenters}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.listContent}
                                renderItem={({item}) => (
                                    <AdaptiveGlass
                                        style={[styles.blurCard, {borderColor: theme.border}]}
                                        colorScheme={scheme}
                                        solidColor={theme.backgroundBar}
                                    >
                                        <Pressable
                                            style={styles.card}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                onSelect(item.id);
                                            }}
                                        >
                                            <Text style={[styles.cardTitle, {color: theme.text}]} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text style={[styles.cardAddress, {color: theme.textSecondary}]} numberOfLines={1}>
                                                {item.address}
                                            </Text>
                                        </Pressable>
                                    </AdaptiveGlass>
                                )}
                            />
                        )}
                    </AdaptiveGlass>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    sheetWrap: {
        justifyContent: 'flex-end',
        zIndex: 9999,
    },
    cardWrapper: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 24,
        shadowColor: '#000',
    },
    blur: {
        borderRadius: 24,
        overflow: 'hidden'
    },
    blurCard: {
        borderRadius: 18,
        borderWidth: 1
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        alignSelf: 'center'
    },
    searchBar: {
        marginHorizontal: 16,
        marginBottom: 12
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 20,
        opacity: 0.6,
        fontSize: 14
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12
    },
    card: {
        width: 220,
        padding: 16,
        borderRadius: 16
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4
    },
    cardAddress: {
        fontSize: 13
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 8
    },
});