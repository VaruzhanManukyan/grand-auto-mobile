/**
 * components/home/quick-actions.tsx
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "@/hooks/use-theme";

type Action = {
    key: 'history' | 'cars' | 'rate';
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
};

type Props = {
    onHistoryPress: () => void;
    onCarsPress: () => void;
    onRatePress: () => void;
};

export function QuickActions({ onHistoryPress, onCarsPress, onRatePress }: Props) {
    const theme = useTheme();

    const actions: Action[] = [
        { key: 'history', label: 'История', icon: 'time-outline', onPress: onHistoryPress },
        { key: 'cars', label: 'Мои авто', icon: 'car-outline', onPress: onCarsPress },
        { key: 'rate', label: 'Оценить', icon: 'star-outline', onPress: onRatePress },
    ];

    return (
        <View style={styles.row}>
            {actions.map((action) => (
                <Pressable
                    key={action.key}
                    onPress={action.onPress}
                    style={({ pressed }) => [
                        styles.action,
                        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
                    ]}
                >
                    <Ionicons name={action.icon} size={18} color={theme.textPrimary} />
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{action.label}</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
    action: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    label: { marginTop: 4, fontSize: 11 },
});