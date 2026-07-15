/**
 * services/shop.service.ts
 *
 * NOTE: this assumes your current file only exports `fetchShopInfo`
 * with roughly this shape. If your real file already differs, keep
 * its top part as-is and just add the two new functions below —
 * don't blindly overwrite it.
 */
import { mockShopInfo, mockServiceCenters } from '@/mocks/service.mock';
import { ServiceCenter } from '@/types/service.types';
import { simulateLatency } from '@/utils/simulate-latency';

export async function fetchShopInfo(): Promise<ServiceCenter> {
    await simulateLatency();
    return mockShopInfo;
}

export async function fetchServiceCenters(): Promise<ServiceCenter[]> {
    await simulateLatency();
    return mockServiceCenters;
}

export async function fetchServiceCenterById(id: string): Promise<ServiceCenter | null> {
    await simulateLatency(400);
    return mockServiceCenters.find((c) => c.id === id) ?? null;
}