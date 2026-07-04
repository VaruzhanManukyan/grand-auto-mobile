/**
 * services/loyalty.service.ts
 *
 * Everything above this file (store, UI) only ever talks to loyaltyService.
 * Right now it resolves from mocks; later, each method's body becomes
 * an `api.get(...)` call and nothing else in the app has to change.
 */

import { mockLoyaltyUser, LOYALTY_LEVELS } from '@/mocks/loyalty.mock';
import { LoyaltyUser, LoyaltyLevelConfig } from '@/types/loyalty.types';

// Simulated latency so loading states behave the same way they will
// once this hits a real network call.
const simulateLatency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const loyaltyService = {
    async getCurrentUser(): Promise<LoyaltyUser> {
        await simulateLatency();
        // TODO: return api.get<LoyaltyUser>('/loyalty/me');
        return { ...mockLoyaltyUser };
    },

    async getLevels(): Promise<LoyaltyLevelConfig[]> {
        await simulateLatency(150);
        // TODO: return api.get<LoyaltyLevelConfig[]>('/loyalty/levels');
        return LOYALTY_LEVELS;
    },
};