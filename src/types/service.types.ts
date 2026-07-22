import { Ionicons } from '@expo/vector-icons';

export type ServiceType =
    | 'washing'
    | 'diagnostics'
    | 'oil_change'
    | 'engine_repair'
    | 'tire_service'
    | 'body_repair';

/** Stable ordering used everywhere the list of service types is rendered. */
export const SERVICE_TYPES: ServiceType[] = [
    'washing',
    'diagnostics',
    'oil_change',
    'engine_repair',
    'tire_service',
    'body_repair',
];

/** Maps ServiceType enum values to i18n translation keys */
export const SERVICE_TYPE_KEYS: Record<ServiceType, string> = {
    washing: 'washing',
    diagnostics: 'diagnostics',
    oil_change: 'oilChange',
    engine_repair: 'engineRepair',
    tire_service: 'tireService',
    body_repair: 'bodyRepair',
};

export const SERVICE_TYPE_ICONS: Record<ServiceType, keyof typeof Ionicons.glyphMap> = {
    washing: 'water-outline',
    diagnostics: 'pulse-outline',
    oil_change: 'flask-outline',
    engine_repair: 'construct-outline',
    tire_service: 'disc-outline',
    body_repair: 'hammer-outline',
};

export interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    city: string;
    workHours: string;
    phone: string;
    latitude: number;
    longitude: number;
    rating?: number;
    ratingCount?: number;
    photoUrl?: string;
    services: ServiceType[];
}