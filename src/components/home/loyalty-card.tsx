/**
 * components/home/loyalty-card.tsx
 *
 * Pure presentational — no isLoading branch here. The screen shows
 * components/loading/skeleton-loader's BonusBannerSkeleton instead
 * of this component entirely while cold-loading, so this file never
 * needs to know about loading state.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "@/hooks/use-theme";

type Props = {
    bonusBalance: number;
    tierLabel?: string;
    onPress: () => void;
};

export function LoyaltyCard({ bonusBalance, tierLabel, onPress }: Props) {
    const theme = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
            ]}
        >
            <View>
                <Text style={[styles.balance, { color: theme.textPrimary }]}>
                    {bonusBalance.toLocaleString('ru-RU')}
                </Text>
                <View style={styles.subtitleRow}>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>бонусов доступно</Text>
                    {tierLabel ? (
                        <View style={[styles.tierPill, { backgroundColor: theme.accentSoft }]}>
                            <Text style={[styles.tierText, { color: theme.accent }]}>{tierLabel}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
            <View style={[styles.qrBadge, { backgroundColor: theme.qrBackground }]}>
                <Ionicons name="qr-code-outline" size={28} color={theme.qrForeground} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
    },
    balance: { fontSize: 24, fontWeight: '500' },
    subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    subtitle: { fontSize: 12 },
    tierPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    tierText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    qrBadge: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});