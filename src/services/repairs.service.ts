/**
 * services/repairs.service.types.ts
 *
 * Same pattern as cars/shop/loyalty. Backs store/repairs.store.ts,
 * which the mini-player reads from directly — home.store.ts does
 * NOT also fetch this (see home.store.ts for why).
 */
import { simulateLatency } from '@/utils/simulate-latency';
import { mockActiveRepairs } from '@/mocks/repairs.mock';
import { RepairSession } from '@/types/repair.types';

export const repairsService = {
    async getActiveRepairs(): Promise<RepairSession[]> {
        await simulateLatency();
        // TODO: return api.get<RepairSession[]>('/repairs/active');
        return mockActiveRepairs.map((r) => ({ ...r }));
    },
};