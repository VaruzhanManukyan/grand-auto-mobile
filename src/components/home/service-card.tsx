/**
 * components/home/service-card.tsx
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceCenter } from '@/types/service.types';
import {useTheme} from "@/hooks/use-theme";

type Props = { shop: ServiceCenter };

export function ServiceCard({ shop }: Props) {
    const theme = useTheme();

    return (
        <View>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Ваш сервис</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{shop.name}</Text>
                    <Text style={[styles.hours, { color: theme.textSecondary }]}>{shop.workHours}</Text>
                </View>
                <Pressable
                    onPress={() => Linking.openURL(`tel:${shop.phone}`)}
                    hitSlop={8}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                    <Ionicons name="call-outline" size={18} color={theme.accent} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionLabel: { fontSize: 12, marginBottom: 8 },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
    },
    name: { fontSize: 14, fontWeight: '500' },
    hours: { marginTop: 4, fontSize: 11 },
});