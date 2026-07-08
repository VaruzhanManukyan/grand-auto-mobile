/**
 * services/repairs.service.ts
 *
 * Тот же паттерн, что loyalty.service.ts — стор и UI никогда не знают,
 * что под капотом моки, а не api.get(...).
 */
import { mockActiveRepairs } from '@/mocks/repairs.mock';
import { RepairSession } from '@/types/repair.types';

const simulateLatency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const repairsService = {
    async getActiveRepairs(): Promise<RepairSession[]> {
        await simulateLatency();
        // TODO: return api.get<RepairSession[]>('/repairs/active');
        return mockActiveRepairs.map((r) => ({ ...r }));
    },
};