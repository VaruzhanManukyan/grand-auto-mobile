/**
 * store/loyalty.store.ts
 *
 * All loyalty screen state. Talks only to loyaltyService — never to
 * mocks directly. Same shape as store/auth.store.ts, so this file
 * doesn't change when you switch to a real backend either.
 */

import { create } from 'zustand';
import { loyaltyService } from '@/services/loyalty.service';
import { resolveLoyaltyLevel } from '@/utils/loyalty.levels';
import { LoyaltyUser, LoyaltyLevelProgress } from '@/types/loyalty.types';

type State = {
    user: LoyaltyUser | null;
    progress: LoyaltyLevelProgress | null;
    isLoading: boolean;
    error: string | null;
};

type Actions = {
    fetch(): Promise<void>;
    refresh(): Promise<void>;
};

export const useLoyaltyStore = create<State & Actions>((set) => ({
    user: null,
    progress: null,
    isLoading: false,
    error: null,

    fetch: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await loyaltyService.getCurrentUser();
            set({ user, progress: resolveLoyaltyLevel(user.totalBonusesEarned), isLoading: false });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    // Same as fetch(), but skips the loading flag — use after an action
    // that changes totalSpentAmount (e.g. a purchase) without a full-screen spinner.
    refresh: async () => {
        try {
            const user = await loyaltyService.getCurrentUser();
            set({ user, progress: resolveLoyaltyLevel(user.totalBonusesEarned) });
        } catch (e: any) {
            set({ error: e.message });
        }
    },
}));