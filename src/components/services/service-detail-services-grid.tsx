import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { ServiceType, SERVICE_TYPE_ICONS } from '@/types/service.types';

interface ServiceDetailServicesGridProps {
    services?: ServiceType[];
}

export function ServiceDetailServicesGrid({ services = [] }: ServiceDetailServicesGridProps) {
    const theme = useTheme();
    const { t } = useTranslation();

    if (!services || services.length === 0) {
        return (
            <Text style={[styles.emptyText, { color: theme.text }]}>
                {t('services.detail.servicesEmpty')}
            </Text>
        );
    }

    return (
        <View style={styles.grid}>
            {services.map((service) => (
                <View
                    key={service}
                    style={[styles.chip, { backgroundColor: theme.accent + '14', borderColor: theme.accent + '33' }]}
                >
                    <View style={[styles.chipIcon, { backgroundColor: theme.accent }]}>
                        <Ionicons name={SERVICE_TYPE_ICONS?.[service] ?? 'construct-outline'} size={16} color="#fff" />
                    </View>
                    <Text style={[styles.chipText, { color: theme.text }]} numberOfLines={1}>
                        {t(`services.serviceTypes.${service}`, {
                            defaultValue: service,
                        })}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        flexBasis: '47%',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    chipIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
    emptyText: { fontSize: 14, opacity: 0.6 },
});