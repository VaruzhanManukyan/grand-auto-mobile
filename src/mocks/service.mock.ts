import { ServiceCenter } from '@/types/service.types';
/**
 * Kept exactly where it was — components/home/service-card.tsx and
 * store/home.store.ts read this single center. Coordinates were
 * added since ServiceCenter now requires them; `city` is new, for
 * the city filter on the services tab.
 */
export const mockShopInfo: ServiceCenter = {
    id: 'shop_001',
    name: 'Grand Auto',
    address: 'Армавир, ул. Гарегина Нжде 12',
    city: 'Армавир',
    workHours: 'Пн–Сб, 09:00–19:00',
    phone: '+374 00 000000',
    latitude: 40.1450,
    longitude: 44.0450,
    rating: 4.8,
};
/** Full list of centers, for the map/list services tab. */
export const mockServiceCenters: ServiceCenter[] = [
    mockShopInfo,
    {
        id: 'shop_002',
        name: 'Grand Auto — Ереван Центр',
        address: 'Ереван, пр. Маштоца 45',
        city: 'Ереван',
        workHours: 'Ежедневно, 09:00–21:00',
        phone: '+374 10 555 111',
        latitude: 40.1792,
        longitude: 44.4991,
        rating: 4.6,
    },
    {
        id: 'shop_003',
        name: 'Grand Auto — Аван',
        address: 'Ереван, Аван, ул. Исаакяна 8',
        city: 'Ереван',
        workHours: 'Пн–Сб, 10:00–20:00',
        phone: '+374 10 555 222',
        latitude: 40.2050,
        longitude: 44.5390,
        rating: 4.4,
    },
];