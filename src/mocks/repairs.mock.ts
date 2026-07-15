/**
 * mocks/repairs.mock.ts
 *
 * carId values match mocks/cars.mock.ts exactly (car_001 / car_002).
 * locationId values now match mocks/shop.mock.ts's real center ids
 * (shop_001 / shop_002) instead of the old placeholder 'loc_1' —
 * that's what lets utils/service-relations.ts join a repair to the
 * center it's actually happening at.
 */
import { RepairSession } from '@/types/repair.types';

export const mockActiveRepairs: RepairSession[] = [
    {
        id: 'rep_1001',
        carId: 'car_001',
        carLabel: 'Nissan X-Trail',
        locationId: 'shop_001',
        locationLabel: 'Grand Auto — Армавир',
        mechanicName: 'Ашот',
        stage: 'inProgress',
        serviceLabel: 'Замена тормозных колодок',
        progress: 0.65,
        etaMinutes: 40,
    },
    {
        id: 'rep_1002',
        carId: 'car_002',
        carLabel: 'Toyota Camry',
        locationId: 'shop_002',
        locationLabel: 'Grand Auto — Ереван Центр',
        mechanicName: 'Гарик',
        stage: 'diagnostics',
        serviceLabel: 'Плановое ТО',
        progress: 0.3,
        etaMinutes: 120,
    },
];