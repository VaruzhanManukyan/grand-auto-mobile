/**
 * store/repairs.store.ts
 */
import { create } from 'zustand';
import { repairsService } from '@/services/repairs.service';
import { RepairSession } from '@/types/repair.types';

type State = {
    sessions: RepairSession[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;
};

type Actions = {
    fetch(): Promise<void>;
    refresh(): Promise<void>;
    setCurrentIndex(index: number): void;
    next(): void;
    prev(): void;
};

export const useRepairsStore = create<State & Actions>((set, get) => ({
    sessions: [],
    currentIndex: 0,
    isLoading: false,
    error: null,

    fetch: async () => {
        set({ isLoading: true, error: null });
        try {
            const sessions = await repairsService.getActiveRepairs();
            set({ sessions, isLoading: false, currentIndex: 0 });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    refresh: async () => {
        try {
            const sessions = await repairsService.getActiveRepairs();
            const { currentIndex } = get();
            set({ sessions, currentIndex: Math.min(currentIndex, Math.max(sessions.length - 1, 0)) });
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    setCurrentIndex: (index) => set({ currentIndex: index }),
    next: () => set((s) => ({ currentIndex: s.sessions.length ? (s.currentIndex + 1) % s.sessions.length : 0 })),
    prev: () => set((s) => ({ currentIndex: s.sessions.length ? (s.currentIndex - 1 + s.sessions.length) % s.sessions.length : 0 })),
}));