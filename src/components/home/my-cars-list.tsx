/**
 * components/home/my-cars-list.tsx
 */
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '@/types/cars.types';
import {useTheme} from "@/hooks/use-theme";

type Props = {
    cars: Car[];
    onCarPress: (car: Car) => void;
    onAddCarPress: () => void;
};

export function MyCarsList({ cars, onCarPress, onAddCarPress }: Props) {
    const theme = useTheme();

    return (
        <View>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Мои автомобили</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {cars.map((car) => (
                    <Pressable
                        key={car.id}
                        onPress={() => onCarPress(car)}
                        style={({ pressed }) => [
                            styles.card,
                            { backgroundColor: theme.cardBackground, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                        ]}
                    >
                        <Ionicons
                            name="car-outline"
                            size={20}
                            color={car.status === 'in_service' ? theme.accent : theme.textPrimary}
                        />
                        <Text style={[styles.carName, { color: theme.textPrimary }]}>
                            {car.brand} {car.model}
                        </Text>
                        <Text style={[styles.carStatus, { color: theme.textSecondary }]}>
                            {car.status === 'in_service' ? 'В ремонте' : 'Всё в порядке'}
                        </Text>
                    </Pressable>
                ))}
                <Pressable
                    onPress={onAddCarPress}
                    style={({ pressed }) => [
                        styles.addCard,
                        { backgroundColor: theme.cardBackground, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                >
                    <Ionicons name="add" size={20} color={theme.textSecondary} />
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionLabel: { fontSize: 12, marginBottom: 8 },
    row: { gap: 10 },
    card: { minWidth: 130, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
    carName: { marginTop: 8, fontSize: 13, fontWeight: '500' },
    carStatus: { marginTop: 2, fontSize: 11 },
    addCard: {
        width: 70,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
});