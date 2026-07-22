import React, { useRef, useState } from 'react';
import { TextInput, Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';

interface AnimatedSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    theme: ReturnType<typeof useTheme>;
    style?: any;
}

export function AnimatedSearchBar({ value, onChangeText, placeholder, theme, style }: AnimatedSearchBarProps) {
    const { t } = useTranslation();
    const resolvedPlaceholder = placeholder ?? t('services:common.search');
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const clearAnim = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;

    const setFocus = (isFocused: boolean) => {
        setFocused(isFocused);
        Animated.spring(focusAnim, { toValue: isFocused ? 1 : 0, useNativeDriver: false, tension: 90, friction: 12 }).start();
    };

    const handleChangeText = (text: string) => {
        onChangeText(text);
        Animated.spring(clearAnim, { toValue: text.length > 0 ? 1 : 0, useNativeDriver: true, tension: 140, friction: 11 }).start();
    };

    const handleClear = () => {
        onChangeText('');
        Animated.spring(clearAnim, { toValue: 0, useNativeDriver: true, tension: 140, friction: 11 }).start();
    };

    const borderColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(150,150,150,0.22)', theme.accent] });
    const backgroundColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.text + '0D', theme.text + '14'] });
    const scale = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <Animated.View style={[styles.inner, { borderColor, backgroundColor }]}>
                <Ionicons name="search" size={18} color={focused ? theme.accent : theme.text} style={{ opacity: focused ? 1 : 0.55 }} />
                <TextInput
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    placeholder={resolvedPlaceholder}
                    placeholderTextColor={theme.text + '80'}
                    style={[styles.input, { color: theme.text }]}
                    returnKeyType="search"
                />
                <Animated.View
                    pointerEvents={value.length > 0 ? 'auto' : 'none'}
                    style={{ opacity: clearAnim, transform: [{ scale: clearAnim }] }}
                >
                    <Pressable onPress={handleClear} hitSlop={10} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color={theme.text} style={{ opacity: 0.5 }} />
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        borderWidth: 1.5,
        borderRadius: 16,
    },
    input: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 2 },
    clearButton: { padding: 2 },
});