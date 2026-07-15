/**
 * store/home.store.ts
 *
 * All home screen state. Only cars + shop + loyalty — repairs were
 * removed on purpose: store/repairs.store.ts already owns that
 * domain (the mini-player reads it directly), so fetching it a
 * second time here was both redundant and, as written before, was
 * calling a method (`getActive`) that doesn't exist on
 * repairsService (the real method is `getActiveRepairs`). If the
 * home screen ever needs repair status again, read it from
 * useRepairsStore directly instead of re-fetching it here.
 */
import { create } from 'zustand';
import { carsService } from '@/services/cars.service';
import { serviceService } from '@/services/service.service';
import { loyaltyService } from '@/services/loyalty.service';
import { resolveLoyaltyLevel } from '@/utils/loyalty.levels';
import { Car } from '@/types/cars.types';
import { ShopInfo } from '@/types/service.types';
import { LoyaltyUser, LoyaltyLevelProgress } from '@/types/loyalty.types';

type State = {
    cars: Car[];
    shop: ShopInfo | null;
    loyaltyUser: LoyaltyUser | null;
    loyaltyProgress: LoyaltyLevelProgress | null;
    isLoading: boolean;
    error: string | null;
};

type Actions = {
    fetch(): Promise<void>;
    refresh(): Promise<void>;
};

async function loadAll() {
    const [cars, shop, loyaltyUser] = await Promise.all([
        carsService.getUserCars(),
        serviceService.getInfo(),
        loyaltyService.getCurrentUser(),
    ]);
    return {
        cars,
        shop,
        loyaltyUser,
        loyaltyProgress: resolveLoyaltyLevel(loyaltyUser.totalBonusesEarned),
    };
}

export const useHomeStore = create<State & Actions>((set) => ({
    cars: [],
    shop: null,
    loyaltyUser: null,
    loyaltyProgress: null,
    isLoading: false,
    error: null,
    fetch: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await loadAll();
            set({ ...data, isLoading: false });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },
    // Same as fetch(), but skips the loading flag — use for pull-to-refresh.
    refresh: async () => {
        try {
            const data = await loadAll();
            set({ ...data });
        } catch (e: any) {
            set({ error: e.message });
        }
    },
}));